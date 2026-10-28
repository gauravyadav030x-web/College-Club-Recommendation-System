from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from app.database import get_db
from app import models, schemas
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new student account and create their initial profile."""
    existing_user = db.query(models.User).filter(models.User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    # Create user
    user = models.User(
        email=user_in.email.lower(),
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role="student",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create student profile
    profile = models.StudentProfile(
        user_id=user.id,
        department=user_in.department or "Computer Science",
        year=user_in.year or "1st Year",
        skills=json.dumps(user_in.skills or []),
        preferred_activities=json.dumps([])
    )

    # Attach interests if provided
    if user_in.interests:
        for interest_name in user_in.interests:
            interest = db.query(models.Interest).filter(models.Interest.name.ilike(interest_name.strip())).first()
            if not interest:
                slug = interest_name.lower().replace(" ", "-")
                interest = models.Interest(name=interest_name.strip(), slug=slug, category="General")
                db.add(interest)
                db.commit()
                db.refresh(interest)
            profile.interests.append(interest)

    db.add(profile)
    db.commit()

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return schemas.Token(
        access_token=token,
        token_type="bearer",
        user=schemas.UserResponse.from_orm(user)
    )

@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate student or admin and issue JWT token."""
    user = db.query(models.User).filter(models.User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )

    token = create_access_token(data={"sub": user.email, "role": user.role})
    return schemas.Token(
        access_token=token,
        token_type="bearer",
        user=schemas.UserResponse.from_orm(user)
    )

@router.get("/me", response_model=schemas.StudentProfileResponse)
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch profile data of authenticated user."""
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    skills_list = []
    if profile.skills:
        try:
            skills_list = json.loads(profile.skills)
        except Exception:
            skills_list = [s.strip() for s in profile.skills.split(",") if s.strip()]

    activities_list = []
    if profile.preferred_activities:
        try:
            activities_list = json.loads(profile.preferred_activities)
        except Exception:
            activities_list = [a.strip() for a in profile.preferred_activities.split(",") if a.strip()]

    return schemas.StudentProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        department=profile.department or "General",
        year=profile.year or "1st Year",
        bio=profile.bio or "",
        skills=skills_list,
        preferred_activities=activities_list,
        interests=[schemas.InterestResponse.from_orm(i) for i in profile.interests],
        user=schemas.UserResponse.from_orm(current_user),
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )

@router.put("/profile", response_model=schemas.StudentProfileResponse)
def update_profile(
    profile_in: schemas.StudentProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile preferences, department, year, skills, and interests."""
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.StudentProfile(user_id=current_user.id)
        db.add(profile)

    if profile_in.department is not None:
        profile.department = profile_in.department
    if profile_in.year is not None:
        profile.year = profile_in.year
    if profile_in.bio is not None:
        profile.bio = profile_in.bio
    if profile_in.skills is not None:
        profile.skills = json.dumps(profile_in.skills)
    if profile_in.preferred_activities is not None:
        profile.preferred_activities = json.dumps(profile_in.preferred_activities)

    # Update interests if provided
    if profile_in.interest_names is not None:
        profile.interests.clear()
        for name in profile_in.interest_names:
            clean_name = name.strip()
            if not clean_name:
                continue
            interest = db.query(models.Interest).filter(models.Interest.name.ilike(clean_name)).first()
            if not interest:
                slug = clean_name.lower().replace(" ", "-")
                interest = models.Interest(name=clean_name, slug=slug, category="General")
                db.add(interest)
                db.commit()
                db.refresh(interest)
            profile.interests.append(interest)
    elif profile_in.interest_ids is not None:
        profile.interests.clear()
        for i_id in profile_in.interest_ids:
            interest = db.query(models.Interest).filter(models.Interest.id == i_id).first()
            if interest:
                profile.interests.append(interest)

    db.commit()
    db.refresh(profile)

    skills_list = []
    if profile.skills:
        try:
            skills_list = json.loads(profile.skills)
        except Exception:
            skills_list = []

    activities_list = []
    if profile.preferred_activities:
        try:
            activities_list = json.loads(profile.preferred_activities)
        except Exception:
            activities_list = []

    return schemas.StudentProfileResponse(
        id=profile.id,
        user_id=current_user.id,
        department=profile.department or "General",
        year=profile.year or "1st Year",
        bio=profile.bio or "",
        skills=skills_list,
        preferred_activities=activities_list,
        interests=[schemas.InterestResponse.from_orm(i) for i in profile.interests],
        user=schemas.UserResponse.from_orm(current_user),
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )
