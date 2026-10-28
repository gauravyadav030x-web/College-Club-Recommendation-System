from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.security import get_current_user
from app.routers.clubs import serialize_club

router = APIRouter(prefix="/memberships", tags=["Memberships"])

@router.post("", response_model=schemas.MembershipResponse, status_code=status.HTTP_201_CREATED)
def request_membership(
    req: schemas.MembershipRequestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a membership application to join a college club."""
    club = db.query(models.Club).filter(models.Club.id == req.club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    existing = db.query(models.MembershipRequest).filter(
        models.MembershipRequest.club_id == req.club_id,
        models.MembershipRequest.student_id == current_user.id
    ).first()

    if existing:
        if existing.status == "approved":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are already an approved member of this club")
        elif existing.status == "pending":
            existing.message = req.message or existing.message
            db.commit()
            db.refresh(existing)
            return schemas.MembershipResponse(
                id=existing.id,
                student_id=existing.student_id,
                club_id=existing.club_id,
                status=existing.status,
                message=existing.message,
                created_at=existing.created_at,
                reviewed_at=existing.reviewed_at,
                club=serialize_club(club, user=current_user, db=db),
                student=schemas.UserResponse.from_orm(current_user)
            )
        else:
            # If rejected, allow re-applying by updating status to pending
            existing.status = "pending"
            existing.message = req.message or ""
            db.commit()
            db.refresh(existing)
            return schemas.MembershipResponse(
                id=existing.id,
                student_id=existing.student_id,
                club_id=existing.club_id,
                status=existing.status,
                message=existing.message,
                created_at=existing.created_at,
                reviewed_at=existing.reviewed_at,
                club=serialize_club(club, user=current_user, db=db),
                student=schemas.UserResponse.from_orm(current_user)
            )

    new_req = models.MembershipRequest(
        student_id=current_user.id,
        club_id=req.club_id,
        status="pending",
        message=req.message or ""
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    return schemas.MembershipResponse(
        id=new_req.id,
        student_id=new_req.student_id,
        club_id=new_req.club_id,
        status=new_req.status,
        message=new_req.message,
        created_at=new_req.created_at,
        reviewed_at=new_req.reviewed_at,
        club=serialize_club(club, user=current_user, db=db),
        student=schemas.UserResponse.from_orm(current_user)
    )

@router.get("/me", response_model=List[schemas.MembershipResponse])
def get_my_memberships(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all membership requests submitted by the logged-in student."""
    requests = (
        db.query(models.MembershipRequest)
        .filter(models.MembershipRequest.student_id == current_user.id)
        .order_by(models.MembershipRequest.created_at.desc())
        .all()
    )

    results = []
    for r in requests:
        club = db.query(models.Club).filter(models.Club.id == r.club_id).first()
        results.append(schemas.MembershipResponse(
            id=r.id,
            student_id=r.student_id,
            club_id=r.club_id,
            status=r.status,
            message=r.message,
            created_at=r.created_at,
            reviewed_at=r.reviewed_at,
            club=serialize_club(club, user=current_user, db=db) if club else None,
            student=schemas.UserResponse.from_orm(current_user)
        ))
    return results

@router.delete("/{membership_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_membership_request(
    membership_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a pending membership request."""
    req = db.query(models.MembershipRequest).filter(
        models.MembershipRequest.id == membership_id,
        models.MembershipRequest.student_id == current_user.id
    ).first()

    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership request not found")

    db.delete(req)
    db.commit()
    return None
