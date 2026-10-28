import pytest
from app.services.recommender import ContentBasedRecommender
from app.services.ranking import (
    calculate_set_overlap,
    rank_and_tiebreak,
    normalize_text,
    generate_recommendation_reason
)

class MockClub:
    def __init__(self, id, name, category, description, interests=None, skills=None, activities=None, is_active=True):
        self.id = id
        self.name = name
        self.slug = name.lower().replace(" ", "-")
        self.category = category
        self.description = description
        self.interests = [MockInterest(i) for i in (interests or [])]
        self.skills_required = skills or []
        self.preferred_activities = activities or []
        self.is_active = is_active
        self.meeting_info = "Wed 5 PM"
        self.location = "Hall A"
        self.schedule = "Weekly"
        self.contact_email = "test@uni.edu"

class MockInterest:
    def __init__(self, name):
        self.name = name

@pytest.fixture
def sample_clubs():
    return [
        MockClub(
            1, "AI and Robotics Society", "Technology",
            "Deep learning, neural networks, robotics and autonomous hardware.",
            interests=["Artificial Intelligence", "Robotics", "Coding"],
            skills=["Python", "C++"],
            activities=["Hackathons", "Robotics Builds"]
        ),
        MockClub(
            2, "Full Stack Web Builders", "Technology",
            "Modern web development, React, JavaScript, APIs and fullstack cloud apps.",
            interests=["Web Development", "Coding", "Design"],
            skills=["React", "JavaScript", "Python"],
            activities=["Hackathons", "Open Source"]
        ),
        MockClub(
            3, "Aperture Photography Club", "Arts",
            "Visual aesthetics, studio lighting, camera techniques and photo walks.",
            interests=["Photography", "Design"],
            skills=["Photoshop", "Lightroom"],
            activities=["Photo Walks", "Exhibitions"]
        ),
        MockClub(
            4, "Inactive Club", "Technology",
            "Old coding club that is currently dormant.",
            interests=["Coding"],
            is_active=False
        )
    ]

def test_text_normalization():
    raw = "  Artificial  Intelligence! & Machine Learning...  "
    clean = normalize_text(raw)
    assert clean == "artificial intelligence machine learning"

def test_set_overlap_calculation():
    student_set = {"coding", "artificial intelligence", "python"}
    club_set = {"coding", "web development"}
    score, matched = calculate_set_overlap(student_set, club_set)
    assert "coding" in matched
    assert score > 0.0

def test_deterministic_tie_breaking():
    items = [
        {"club_name": "Beta Club", "score": 85.0, "matched_interests": ["AI"]},
        {"club_name": "Alpha Club", "score": 85.0, "matched_interests": ["AI", "ML"]},
        {"club_name": "Gamma Club", "score": 90.0, "matched_interests": ["AI"]},
        {"club_name": "Zeta Club", "score": 85.0, "matched_interests": ["AI"]}
    ]
    ranked = rank_and_tiebreak(items)
    # Highest score first
    assert ranked[0]["club_name"] == "Gamma Club"
    # Tied score (85.0): Alpha Club has 2 matched interests vs 1
    assert ranked[1]["club_name"] == "Alpha Club"
    # Tied score (85.0) and same match count: Beta comes before Zeta alphabetically
    assert ranked[2]["club_name"] == "Beta Club"
    assert ranked[3]["club_name"] == "Zeta Club"

def test_recommendation_engine_filtering_and_ranking(sample_clubs):
    recommender = ContentBasedRecommender()
    result = recommender.recommend(
        clubs=sample_clubs,
        student_interests=["Artificial Intelligence", "Robotics"],
        student_skills=["Python"],
        top_k=5
    )

    # Inactive club must not be recommended
    rec_ids = [r["club_id"] for r in result["recommendations"]]
    assert 4 not in rec_ids

    # Top recommendation should be AI and Robotics Society
    assert len(result["recommendations"]) > 0
    top = result["recommendations"][0]
    assert top["club_id"] == 1
    assert "Artificial Intelligence" in top["matched_interests"] or "Robotics" in top["matched_interests"]
    assert top["score"] > 50.0

def test_empty_interests_fallback(sample_clubs):
    recommender = ContentBasedRecommender()
    result = recommender.recommend(
        clubs=sample_clubs,
        student_interests=[],
        top_k=3
    )
    # Should safely return active clubs without crash
    assert len(result["recommendations"]) <= 3
    for r in result["recommendations"]:
        assert r["club_id"] != 4  # No inactive club
        assert r["score"] >= 0.0
