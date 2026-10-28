import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table, Float, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from app.database import Base

# Association table: Club <-> Interest (Many-to-Many)
club_interests = Table(
    "club_interests",
    Base.metadata,
    Column("club_id", Integer, ForeignKey("clubs.id", ondelete="CASCADE"), primary_key=True),
    Column("interest_id", Integer, ForeignKey("interests.id", ondelete="CASCADE"), primary_key=True),
    Column("weight", Float, default=1.0)
)

# Association table: StudentProfile <-> Interest (Many-to-Many)
student_interests = Table(
    "student_interests",
    Base.metadata,
    Column("profile_id", Integer, ForeignKey("student_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("interest_id", Integer, ForeignKey("interests.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # "student" or "admin"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    favorites = relationship("FavoriteClub", back_populates="user", cascade="all, delete-orphan")
    membership_requests = relationship("MembershipRequest", foreign_keys="MembershipRequest.student_id", back_populates="student")
    feedbacks = relationship("RecommendationFeedback", back_populates="user", cascade="all, delete-orphan")
    recommendation_histories = relationship("RecommendationHistory", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    department = Column(String(100), default="Computer Science")
    year = Column(String(50), default="1st Year")
    bio = Column(Text, default="")
    skills = Column(Text, default="[]")  # JSON encoded list of strings
    preferred_activities = Column(Text, default="[]")  # JSON encoded list of strings
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")
    interests = relationship("Interest", secondary=student_interests, back_populates="students")

    def __repr__(self):
        return f"<StudentProfile user_id={self.user_id} dept={self.department}>"


class Interest(Base):
    __tablename__ = "interests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), default="General", index=True, nullable=False)
    description = Column(Text, default="")

    # Relationships
    clubs = relationship("Club", secondary=club_interests, back_populates="interests")
    students = relationship("StudentProfile", secondary=student_interests, back_populates="interests")

    def __repr__(self):
        return f"<Interest {self.name}>"


class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, index=True, nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # Technology, Arts, Sports, Entrepreneurship, Debate, Gaming, etc.
    meeting_info = Column(String(255), default="Every Wednesday at 5:00 PM")
    location = Column(String(255), default="Student Center, Hall A")
    schedule = Column(String(255), default="Bi-weekly workshops and monthly tournaments")
    contact_email = Column(String(255), default="club@university.edu")
    leader_name = Column(String(255), default="Faculty Advisor / Club President")
    banner_image = Column(String(500), default="")
    is_active = Column(Boolean, default=True, index=True, nullable=False)
    skills_required = Column(Text, default="[]")  # JSON string
    preferred_activities = Column(Text, default="[]")  # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    interests = relationship("Interest", secondary=club_interests, back_populates="clubs")
    membership_requests = relationship("MembershipRequest", back_populates="club", cascade="all, delete-orphan")
    favorites = relationship("FavoriteClub", back_populates="club", cascade="all, delete-orphan")
    feedbacks = relationship("RecommendationFeedback", back_populates="club", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Club {self.name} ({self.category})>"


class MembershipRequest(Base):
    __tablename__ = "membership_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected
    message = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    student = relationship("User", foreign_keys=[student_id], back_populates="membership_requests")
    club = relationship("Club", back_populates="membership_requests")
    reviewer = relationship("User", foreign_keys=[reviewed_by])

    __table_args__ = (
        Index("idx_student_club_request", "student_id", "club_id"),
    )


class FavoriteClub(Base):
    __tablename__ = "favorite_clubs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="favorites")
    club = relationship("Club", back_populates="favorites")

    __table_args__ = (
        UniqueConstraint("user_id", "club_id", name="uq_user_club_favorite"),
    )


class RecommendationFeedback(Base):
    __tablename__ = "recommendation_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, default=5, nullable=False)  # 1 to 5
    feedback_type = Column(String(50), default="helpful")  # helpful, not_helpful, irrelevant, already_member
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="feedbacks")
    club = relationship("Club", back_populates="feedbacks")


class RecommendationHistory(Base):
    __tablename__ = "recommendation_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    top_clubs_json = Column(Text, nullable=False)  # JSON representation of top recommendations
    student_interests_snapshot = Column(Text, default="[]")  # JSON snapshot of interests at recommendation time
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="recommendation_histories")
