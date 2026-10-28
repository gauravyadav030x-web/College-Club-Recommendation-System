from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=schemas.FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback_in: schemas.FeedbackCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit student rating and feedback on a recommended club."""
    club = db.query(models.Club).filter(models.Club.id == feedback_in.club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    feedback = models.RecommendationFeedback(
        user_id=current_user.id,
        club_id=feedback_in.club_id,
        rating=feedback_in.rating,
        feedback_type=feedback_in.feedback_type,
        comment=feedback_in.comment or ""
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return schemas.FeedbackResponse.from_orm(feedback)

@router.get("/me", response_model=List[schemas.FeedbackResponse])
def get_my_feedback(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all feedback submissions by the current user."""
    feedbacks = (
        db.query(models.RecommendationFeedback)
        .filter(models.RecommendationFeedback.user_id == current_user.id)
        .order_by(models.RecommendationFeedback.created_at.desc())
        .all()
    )
    return [schemas.FeedbackResponse.from_orm(f) for f in feedbacks]
