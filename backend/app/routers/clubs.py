from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
import json

from app.database import get_db
from app import models, schemas
from app.security import oauth2_scheme, decode_token
from app.services.ranking import parse_json_list

router = APIRouter(prefix="/clubs", tags=["Clubs"])

def get_optional_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[models.User]:
    """Helper to extract user if token is provided, without failing when anonymous."""
    if not token:
        return None
    try:
        token_data = decode_token(token)
        return db.query(models.User).filter(models.User.email == token_data.sub).first()
    except Exception:
        return None

def serialize_club(club: models.Club, user: Optional[models.User] = None, db: Optional[Session] = None) -> schemas.ClubResponse:
    skills = parse_json_list(club.skills_required)
    activities = parse_json_list(club.preferred_activities)

    is_fav = False
    mem_status = None
    member_count = 0

    if db:
        # Count approved members
        member_count = db.query(models.MembershipRequest).filter(
            models.MembershipRequest.club_id == club.id,
            models.MembershipRequest.status == "approved"
        ).count()

        if user:
            # Check favorite
            fav = db.query(models.FavoriteClub).filter(
                models.FavoriteClub.club_id == club.id,
                models.FavoriteClub.user_id == user.id
            ).first()
            is_fav = fav is not None

            # Check membership
            mem = db.query(models.MembershipRequest).filter(
                models.MembershipRequest.club_id == club.id,
                models.MembershipRequest.student_id == user.id
            ).first()
            if mem:
                mem_status = mem.status

    return schemas.ClubResponse(
        id=club.id,
        name=club.name,
        slug=club.slug,
        description=club.description,
        category=club.category,
        meeting_info=club.meeting_info or "Weekly",
        location=club.location or "Campus Center",
        schedule=club.schedule or "Regular",
        contact_email=club.contact_email or "club@university.edu",
        leader_name=club.leader_name or "Faculty Advisor",
        banner_image=club.banner_image or "",
        is_active=club.is_active,
        skills_required=skills,
        preferred_activities=activities,
        interests=[schemas.InterestResponse.from_orm(i) for i in club.interests],
        member_count=member_count,
        is_favorited=is_fav,
        membership_status=mem_status,
        created_at=club.created_at,
        updated_at=club.updated_at
    )

@router.get("", response_model=List[schemas.ClubResponse])
def get_clubs(
    search: Optional[str] = Query(None, description="Search by club name or keyword"),
    category: Optional[str] = Query(None, description="Filter by category"),
    interest: Optional[str] = Query(None, description="Filter by interest name"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """Retrieve list of active clubs with optional search and category filters."""
    query = db.query(models.Club).filter(models.Club.is_active == True)

    if category and category.lower() != "all":
        query = query.filter(models.Club.category.ilike(category.strip()))

    if interest:
        query = query.join(models.Club.interests).filter(models.Interest.name.ilike(f"%{interest.strip()}%"))

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Club.name.ilike(search_term),
                models.Club.description.ilike(search_term),
                models.Club.category.ilike(search_term)
            )
        )

    clubs = query.offset(skip).limit(limit).all()
    return [serialize_club(c, user=user, db=db) for c in clubs]

@router.get("/categories/list")
def get_categories(db: Session = Depends(get_db)):
    """Fetch distinct club categories with active club counts."""
    results = (
        db.query(models.Club.category, func.count(models.Club.id))
        .filter(models.Club.is_active == True)
        .group_by(models.Club.category)
        .all()
    )
    return [{"category": r[0], "count": r[1]} for r in results]

@router.get("/interests/list", response_model=List[schemas.InterestResponse])
def get_all_interests(db: Session = Depends(get_db)):
    """Fetch all interest tags available in the university catalog."""
    interests = db.query(models.Interest).order_by(models.Interest.name.asc()).all()
    return [schemas.InterestResponse.from_orm(i) for i in interests]

@router.get("/{club_id}", response_model=schemas.ClubResponse)
def get_club_by_id(
    club_id: int,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """Fetch details of a specific club."""
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    return serialize_club(club, user=user, db=db)
