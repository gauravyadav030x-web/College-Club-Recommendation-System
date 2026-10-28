from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.security import get_current_user
from app.routers.clubs import serialize_club

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.post("/{club_id}", status_code=status.HTTP_201_CREATED)
def add_favorite(
    club_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a club to student favorites."""
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    existing = db.query(models.FavoriteClub).filter(
        models.FavoriteClub.user_id == current_user.id,
        models.FavoriteClub.club_id == club_id
    ).first()

    if not existing:
        fav = models.FavoriteClub(user_id=current_user.id, club_id=club_id)
        db.add(fav)
        db.commit()

    return {"message": "Club saved to favorites", "club_id": club_id, "is_favorited": True}

@router.delete("/{club_id}", status_code=status.HTTP_200_OK)
def remove_favorite(
    club_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a club from student favorites."""
    fav = db.query(models.FavoriteClub).filter(
        models.FavoriteClub.user_id == current_user.id,
        models.FavoriteClub.club_id == club_id
    ).first()

    if fav:
        db.delete(fav)
        db.commit()

    return {"message": "Club removed from favorites", "club_id": club_id, "is_favorited": False}

@router.get("", response_model=List[schemas.ClubResponse])
def get_favorites(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all favorited clubs for the logged-in student."""
    favs = db.query(models.FavoriteClub).filter(models.FavoriteClub.user_id == current_user.id).all()
    results = []
    for f in favs:
        club = db.query(models.Club).filter(models.Club.id == f.club_id).first()
        if club and club.is_active:
            results.append(serialize_club(club, user=current_user, db=db))
    return results
