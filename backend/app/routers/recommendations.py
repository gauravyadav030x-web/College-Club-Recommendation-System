from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db
from app import models, schemas
from app.security import get_current_user, oauth2_scheme, decode_token
from app.services.recommender import recommender
from app.services.ranking import parse_json_list

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

def get_optional_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[models.User]:
    if not token:
        return None
    try:
        token_data = decode_token(token)
        return db.query(models.User).filter(models.User.email == token_data.sub).first()
    except Exception:
        return None

@router.post("", response_model=schemas.RecommendationResponse)
def get_recommendations(
    req: schemas.RecommendationRequest,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(get_optional_user)
):
    """
    Generate personalized club recommendations.
    Uses student profile data or explicit query interests/skills.
    """
    interests: List[str] = []
    skills: List[str] = []
    activities: List[str] = []
    department: Optional[str] = None

    # Load from student profile if user is authenticated and body didn't fully specify
    if user:
        profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == user.id).first()
        if profile:
            department = profile.department
            if req.interests is None:
                interests = [i.name for i in profile.interests]
            if req.skills is None:
                skills = parse_json_list(profile.skills)
            if req.preferred_activities is None:
                activities = parse_json_list(profile.preferred_activities)

    # Use explicit request values if provided
    if req.interests is not None:
        interests = req.interests
    if req.skills is not None:
        skills = req.skills
    if req.preferred_activities is not None:
        activities = req.preferred_activities

    # Fetch active clubs with interests relation
    all_clubs = db.query(models.Club).filter(models.Club.is_active == True).all()

    # Run ML and DSA recommendation engine
    recommendation_results = recommender.recommend(
        clubs=all_clubs,
        student_interests=interests,
        student_skills=skills,
        student_activities=activities,
        department=department,
        top_k=req.top_k or 10,
        category_filter=req.category_filter
    )

    # Annotate with user-specific favorites and memberships
    favorite_club_ids = set()
    membership_dict = {}
    if user:
        favs = db.query(models.FavoriteClub.club_id).filter(models.FavoriteClub.user_id == user.id).all()
        favorite_club_ids = {f[0] for f in favs}

        mems = db.query(models.MembershipRequest).filter(models.MembershipRequest.student_id == user.id).all()
        for m in mems:
            membership_dict[m.club_id] = m.status

        # Save recommendation history
        history_entry = models.RecommendationHistory(
            user_id=user.id,
            top_clubs_json=json.dumps([
                {"club_id": r["club_id"], "club_name": r["club_name"], "score": r["score"]}
                for r in recommendation_results["recommendations"][:5]
            ]),
            student_interests_snapshot=json.dumps(interests)
        )
        db.add(history_entry)
        db.commit()

    # Update dynamic states
    for item in recommendation_results["recommendations"]:
        item["is_favorited"] = item["club_id"] in favorite_club_ids
        item["membership_status"] = membership_dict.get(item["club_id"])

    return schemas.RecommendationResponse(
        total_found=recommendation_results["total_found"],
        query_interests=interests,
        query_skills=skills,
        recommendations=recommendation_results["recommendations"],
        graph_insights=recommendation_results["graph_insights"]
    )

@router.get("/history")
def get_recommendation_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve user's recommendation history logs."""
    history = (
        db.query(models.RecommendationHistory)
        .filter(models.RecommendationHistory.user_id == current_user.id)
        .order_by(models.RecommendationHistory.created_at.desc())
        .limit(20)
        .all()
    )

    results = []
    for h in history:
        try:
            clubs_data = json.loads(h.top_clubs_json)
        except Exception:
            clubs_data = []

        try:
            interests_data = json.loads(h.student_interests_snapshot)
        except Exception:
            interests_data = []

        results.append({
            "id": h.id,
            "created_at": h.created_at,
            "top_clubs": clubs_data,
            "interests_snapshot": interests_data
        })

    return results
