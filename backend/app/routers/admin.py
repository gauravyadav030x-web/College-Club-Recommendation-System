import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional

from app.database import get_db
from app import models, schemas
from app.security import get_current_admin
from app.routers.clubs import serialize_club
from app.services.graph_engine import ClubGraphEngine
from app.services.ranking import parse_json_list

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats", response_model=schemas.AdminDashboardStats)
def get_admin_stats(
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve comprehensive platform metrics, membership stats, and recommendation analytics."""
    total_students = db.query(models.User).filter(models.User.role == "student").count()
    total_clubs = db.query(models.Club).count()
    active_clubs = db.query(models.Club).filter(models.Club.is_active == True).count()
    total_memberships = db.query(models.MembershipRequest).count()
    pending_requests = db.query(models.MembershipRequest).filter(models.MembershipRequest.status == "pending").count()
    approved_memberships = db.query(models.MembershipRequest).filter(models.MembershipRequest.status == "approved").count()

    # Popular interests among students
    popular_interests_query = (
        db.query(models.Interest.name, func.count(models.student_interests.c.profile_id))
        .join(models.student_interests, models.Interest.id == models.student_interests.c.interest_id)
        .group_by(models.Interest.name)
        .order_by(func.count(models.student_interests.c.profile_id).desc())
        .limit(8)
        .all()
    )
    popular_interests = [{"interest": name, "count": count} for name, count in popular_interests_query]

    # Category distribution
    cat_query = (
        db.query(models.Club.category, func.count(models.Club.id))
        .group_by(models.Club.category)
        .all()
    )
    category_distribution = [{"category": cat, "count": count} for cat, count in cat_query]

    # Recent feedback
    recent_feedbacks_db = (
        db.query(models.RecommendationFeedback)
        .order_by(models.RecommendationFeedback.created_at.desc())
        .limit(6)
        .all()
    )
    recent_feedbacks = []
    for f in recent_feedbacks_db:
        club = db.query(models.Club).filter(models.Club.id == f.club_id).first()
        user = db.query(models.User).filter(models.User.id == f.user_id).first()
        recent_feedbacks.append({
            "id": f.id,
            "club_name": club.name if club else "Unknown Club",
            "student_name": user.full_name if user else "Anonymous",
            "rating": f.rating,
            "feedback_type": f.feedback_type,
            "comment": f.comment,
            "created_at": f.created_at.isoformat()
        })

    # Graph Network Metrics
    all_clubs = db.query(models.Club).all()
    graph_engine = ClubGraphEngine()
    graph_engine.build_graph(all_clubs)
    graph_metrics = graph_engine.get_graph_analytics()

    return schemas.AdminDashboardStats(
        total_students=total_students,
        total_clubs=total_clubs,
        active_clubs=active_clubs,
        total_memberships=total_memberships,
        pending_requests=pending_requests,
        approved_memberships=approved_memberships,
        popular_interests=popular_interests,
        category_distribution=category_distribution,
        recent_feedbacks=recent_feedbacks,
        graph_metrics=graph_metrics
    )

@router.get("/students")
def get_registered_students(
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all registered students with profile details and interest selections."""
    students = db.query(models.User).filter(models.User.role == "student").all()
    results = []
    for s in students:
        profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == s.id).first()
        interests = [i.name for i in profile.interests] if profile else []
        skills = parse_json_list(profile.skills) if profile else []
        results.append({
            "id": s.id,
            "full_name": s.full_name,
            "email": s.email,
            "department": profile.department if profile else "N/A",
            "year": profile.year if profile else "N/A",
            "interests": interests,
            "skills": skills,
            "is_active": s.is_active,
            "created_at": s.created_at
        })
    return results

@router.post("/clubs", response_model=schemas.ClubResponse, status_code=status.HTTP_201_CREATED)
def create_club(
    club_in: schemas.ClubCreate,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new college club."""
    existing = db.query(models.Club).filter(models.Club.name.ilike(club_in.name.strip())).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A club with this name already exists")

    slug = club_in.name.lower().replace(" ", "-").replace("&", "and")
    new_club = models.Club(
        name=club_in.name.strip(),
        slug=slug,
        description=club_in.description,
        category=club_in.category,
        meeting_info=club_in.meeting_info or "Every Wednesday at 5:00 PM",
        location=club_in.location or "Student Center, Hall A",
        schedule=club_in.schedule or "Weekly",
        contact_email=club_in.contact_email or "club@university.edu",
        leader_name=club_in.leader_name or "Faculty Advisor",
        banner_image=club_in.banner_image or "",
        is_active=club_in.is_active if club_in.is_active is not None else True,
        skills_required=json.dumps(club_in.skills_required or []),
        preferred_activities=json.dumps(club_in.preferred_activities or [])
    )

    # Attach interests
    if club_in.interest_names:
        for int_name in club_in.interest_names:
            clean = int_name.strip()
            if not clean:
                continue
            interest = db.query(models.Interest).filter(models.Interest.name.ilike(clean)).first()
            if not interest:
                int_slug = clean.lower().replace(" ", "-")
                interest = models.Interest(name=clean, slug=int_slug, category=club_in.category)
                db.add(interest)
                db.commit()
                db.refresh(interest)
            new_club.interests.append(interest)
    elif club_in.interest_ids:
        for i_id in club_in.interest_ids:
            interest = db.query(models.Interest).filter(models.Interest.id == i_id).first()
            if interest:
                new_club.interests.append(interest)

    db.add(new_club)
    db.commit()
    db.refresh(new_club)

    return serialize_club(new_club, user=admin, db=db)

@router.patch("/clubs/{club_id}", response_model=schemas.ClubResponse)
def update_club(
    club_id: int,
    club_in: schemas.ClubUpdate,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Edit club details, tags, schedule, or activation status."""
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    if club_in.name is not None:
        club.name = club_in.name
        club.slug = club_in.name.lower().replace(" ", "-").replace("&", "and")
    if club_in.description is not None:
        club.description = club_in.description
    if club_in.category is not None:
        club.category = club_in.category
    if club_in.meeting_info is not None:
        club.meeting_info = club_in.meeting_info
    if club_in.location is not None:
        club.location = club_in.location
    if club_in.schedule is not None:
        club.schedule = club_in.schedule
    if club_in.contact_email is not None:
        club.contact_email = club_in.contact_email
    if club_in.leader_name is not None:
        club.leader_name = club_in.leader_name
    if club_in.banner_image is not None:
        club.banner_image = club_in.banner_image
    if club_in.is_active is not None:
        club.is_active = club_in.is_active
    if club_in.skills_required is not None:
        club.skills_required = json.dumps(club_in.skills_required)
    if club_in.preferred_activities is not None:
        club.preferred_activities = json.dumps(club_in.preferred_activities)

    if club_in.interest_names is not None:
        club.interests.clear()
        for int_name in club_in.interest_names:
            clean = int_name.strip()
            if not clean:
                continue
            interest = db.query(models.Interest).filter(models.Interest.name.ilike(clean)).first()
            if not interest:
                int_slug = clean.lower().replace(" ", "-")
                interest = models.Interest(name=clean, slug=int_slug, category=club.category)
                db.add(interest)
                db.commit()
                db.refresh(interest)
            club.interests.append(interest)
    elif club_in.interest_ids is not None:
        club.interests.clear()
        for i_id in club_in.interest_ids:
            interest = db.query(models.Interest).filter(models.Interest.id == i_id).first()
            if interest:
                club.interests.append(interest)

    db.commit()
    db.refresh(club)

    return serialize_club(club, user=admin, db=db)

@router.delete("/clubs/{club_id}")
def delete_club(
    club_id: int,
    hard_delete: bool = False,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Safely deactivate or delete a club."""
    club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")

    if hard_delete:
        db.delete(club)
        db.commit()
        return {"message": "Club permanently deleted", "club_id": club_id}
    else:
        club.is_active = False
        db.commit()
        return {"message": "Club safely deactivated", "club_id": club_id}

@router.get("/memberships", response_model=List[schemas.MembershipResponse])
def get_all_memberships(
    status_filter: Optional[str] = None,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """View all student membership requests across all campus clubs."""
    query = db.query(models.MembershipRequest).order_by(models.MembershipRequest.created_at.desc())
    if status_filter:
        query = query.filter(models.MembershipRequest.status == status_filter)

    requests = query.all()
    results = []
    for r in requests:
        club = db.query(models.Club).filter(models.Club.id == r.club_id).first()
        student = db.query(models.User).filter(models.User.id == r.student_id).first()
        results.append(schemas.MembershipResponse(
            id=r.id,
            student_id=r.student_id,
            club_id=r.club_id,
            status=r.status,
            message=r.message,
            created_at=r.created_at,
            reviewed_at=r.reviewed_at,
            club=serialize_club(club, user=admin, db=db) if club else None,
            student=schemas.UserResponse.from_orm(student) if student else None
        ))
    return results

@router.patch("/memberships/{membership_id}", response_model=schemas.MembershipResponse)
def review_membership(
    membership_id: int,
    review_in: schemas.MembershipRequestUpdate,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Approve or reject a student membership application."""
    req = db.query(models.MembershipRequest).filter(models.MembershipRequest.id == membership_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership request not found")

    if review_in.status not in ["approved", "rejected", "pending"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be approved, rejected, or pending")

    req.status = review_in.status
    req.reviewed_at = datetime.datetime.utcnow()
    req.reviewed_by = admin.id
    db.commit()
    db.refresh(req)

    club = db.query(models.Club).filter(models.Club.id == req.club_id).first()
    student = db.query(models.User).filter(models.User.id == req.student_id).first()

    return schemas.MembershipResponse(
        id=req.id,
        student_id=req.student_id,
        club_id=req.club_id,
        status=req.status,
        message=req.message,
        created_at=req.created_at,
        reviewed_at=req.reviewed_at,
        club=serialize_club(club, user=admin, db=db) if club else None,
        student=schemas.UserResponse.from_orm(student) if student else None
    )

@router.post("/interests", response_model=schemas.InterestResponse, status_code=status.HTTP_201_CREATED)
def create_interest(
    interest_in: schemas.InterestCreate,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new interest tag to the university catalogue."""
    existing = db.query(models.Interest).filter(models.Interest.name.ilike(interest_in.name.strip())).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Interest already exists")

    slug = interest_in.name.lower().replace(" ", "-")
    interest = models.Interest(
        name=interest_in.name.strip(),
        slug=slug,
        category=interest_in.category or "General",
        description=interest_in.description or ""
    )
    db.add(interest)
    db.commit()
    db.refresh(interest)
    return schemas.InterestResponse.from_orm(interest)

@router.delete("/interests/{interest_id}")
def delete_interest(
    interest_id: int,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete an interest tag from the catalog."""
    interest = db.query(models.Interest).filter(models.Interest.id == interest_id).first()
    if not interest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interest not found")
    db.delete(interest)
    db.commit()
    return {"message": "Interest tag deleted", "interest_id": interest_id}
