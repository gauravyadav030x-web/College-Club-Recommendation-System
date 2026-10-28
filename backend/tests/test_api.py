import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app import models

TEST_DB_PATH = "./test_college_clubs.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        from app.security import hash_password
        admin = models.User(
            email="admin@test.edu",
            hashed_password=hash_password("adminpass123"),
            full_name="Admin Tester",
            role="admin",
            is_active=True
        )
        db.add(admin)

        student = models.User(
            email="student@test.edu",
            hashed_password=hash_password("studentpass123"),
            full_name="Student Tester",
            role="student",
            is_active=True
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        profile = models.StudentProfile(
            user_id=student.id,
            department="Computer Science",
            year="1st Year"
        )
        db.add(profile)

        ai_int = models.Interest(name="Artificial Intelligence", slug="artificial-intelligence", category="Technology")
        db.add(ai_int)
        profile.interests.append(ai_int)

        club = models.Club(
            name="Robotics and AI Club",
            slug="robotics-and-ai-club",
            category="Technology",
            description="Autonomous drones, computer vision, and machine learning models.",
            meeting_info="Every Mon 5pm",
            is_active=True
        )
        club.interests.append(ai_int)
        db.add(club)
        db.commit()
    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_login_and_token(client):
    res = client.post("/api/auth/login", json={
        "email": "student@test.edu",
        "password": "studentpass123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"

def test_recommendation_endpoint(client):
    # Test recommendations without auth
    res = client.post("/api/recommendations", json={
        "interests": ["Artificial Intelligence"],
        "top_k": 5
    })
    assert res.status_code == 200
    data = res.json()
    assert data["total_found"] > 0
    assert len(data["recommendations"]) > 0
    top = data["recommendations"][0]
    assert "Robotics and AI Club" in top["club_name"]

def test_clubs_endpoint(client):
    res = client.get("/api/clubs")
    assert res.status_code == 200
    clubs = res.json()
    assert len(clubs) > 0
    assert clubs[0]["name"] == "Robotics and AI Club"

def test_admin_rbac_protection(client):
    # 1. Login as student
    stud_login = client.post("/api/auth/login", json={
        "email": "student@test.edu",
        "password": "studentpass123"
    }).json()
    stud_token = stud_login["access_token"]

    # Student trying to access admin stats should get 403 Forbidden
    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {stud_token}"})
    assert res.status_code == 403

    # 2. Login as admin
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@test.edu",
        "password": "adminpass123"
    }).json()
    admin_token = admin_login["access_token"]

    # Admin should get 200 OK
    admin_res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_res.status_code == 200
    stats = admin_res.json()
    assert "total_clubs" in stats
    assert stats["total_clubs"] >= 1
