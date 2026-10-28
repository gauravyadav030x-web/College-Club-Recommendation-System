from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# ================= USER SCHEMAS =================
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    department: Optional[str] = "Computer Science"
    year: Optional[str] = "1st Year"
    interests: Optional[List[str]] = []
    skills: Optional[List[str]] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

# ================= INTEREST SCHEMAS =================
class InterestBase(BaseModel):
    name: str
    category: str = "General"
    description: Optional[str] = ""

class InterestCreate(InterestBase):
    pass

class InterestResponse(InterestBase):
    id: int
    slug: str

    class Config:
        from_attributes = True

# ================= STUDENT PROFILE SCHEMAS =================
class StudentProfileBase(BaseModel):
    department: str = "Computer Science"
    year: str = "1st Year"
    bio: Optional[str] = ""
    skills: List[str] = []
    preferred_activities: List[str] = []

class StudentProfileUpdate(BaseModel):
    department: Optional[str] = None
    year: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    preferred_activities: Optional[List[str]] = None
    interest_ids: Optional[List[int]] = None
    interest_names: Optional[List[str]] = None

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    user: UserResponse
    interests: List[InterestResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ================= CLUB SCHEMAS =================
class ClubBase(BaseModel):
    name: str
    description: str
    category: str
    meeting_info: Optional[str] = "Every Wednesday at 5:00 PM"
    location: Optional[str] = "Student Center, Hall A"
    schedule: Optional[str] = "Bi-weekly workshops and monthly tournaments"
    contact_email: Optional[str] = "club@university.edu"
    leader_name: Optional[str] = "Faculty Advisor / Club President"
    banner_image: Optional[str] = ""
    is_active: Optional[bool] = True
    skills_required: Optional[List[str]] = []
    preferred_activities: Optional[List[str]] = []

class ClubCreate(ClubBase):
    interest_ids: Optional[List[int]] = []
    interest_names: Optional[List[str]] = []

class ClubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    meeting_info: Optional[str] = None
    location: Optional[str] = None
    schedule: Optional[str] = None
    contact_email: Optional[str] = None
    leader_name: Optional[str] = None
    banner_image: Optional[str] = None
    is_active: Optional[bool] = None
    skills_required: Optional[List[str]] = None
    preferred_activities: Optional[List[str]] = None
    interest_ids: Optional[List[int]] = None
    interest_names: Optional[List[str]] = None

class ClubResponse(ClubBase):
    id: int
    slug: str
    interests: List[InterestResponse] = []
    member_count: Optional[int] = 0
    is_favorited: Optional[bool] = False
    membership_status: Optional[str] = None  # None, pending, approved, rejected
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ================= RECOMMENDATION SCHEMAS =================
class RecommendationRequest(BaseModel):
    interests: Optional[List[str]] = None  # override or specific query
    skills: Optional[List[str]] = None
    preferred_activities: Optional[List[str]] = None
    top_k: Optional[int] = 10
    category_filter: Optional[str] = None

class RecommendationItem(BaseModel):
    club_id: int
    club_name: str
    slug: str
    category: str
    description: str
    score: float  # 0 to 100 relevance score
    tfidf_score: float
    overlap_score: float
    graph_score: float
    matched_interests: List[str]
    matched_skills: List[str]
    matched_activities: List[str]
    reason: str
    meeting_info: str
    location: str
    contact_email: str
    is_favorited: bool = False
    membership_status: Optional[str] = None

class RecommendationResponse(BaseModel):
    total_found: int
    query_interests: List[str]
    query_skills: List[str]
    recommendations: List[RecommendationItem]
    graph_insights: Dict[str, Any] = {}

# ================= MEMBERSHIP SCHEMAS =================
class MembershipRequestCreate(BaseModel):
    club_id: int
    message: Optional[str] = ""

class MembershipRequestUpdate(BaseModel):
    status: str  # approved, rejected

class MembershipResponse(BaseModel):
    id: int
    student_id: int
    club_id: int
    status: str
    message: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    club: Optional[ClubResponse] = None
    student: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# ================= FAVORITE SCHEMAS =================
class FavoriteResponse(BaseModel):
    id: int
    club_id: int
    user_id: int
    created_at: datetime
    club: ClubResponse

    class Config:
        from_attributes = True

# ================= FEEDBACK SCHEMAS =================
class FeedbackCreate(BaseModel):
    club_id: int
    rating: int = Field(..., ge=1, le=5)
    feedback_type: str = "helpful"  # helpful, not_helpful, irrelevant, already_member
    comment: Optional[str] = ""

class FeedbackResponse(BaseModel):
    id: int
    club_id: int
    user_id: int
    rating: int
    feedback_type: str
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True

# ================= ADMIN ANALYTICS =================
class AdminDashboardStats(BaseModel):
    total_students: int
    total_clubs: int
    active_clubs: int
    total_memberships: int
    pending_requests: int
    approved_memberships: int
    popular_interests: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    recent_feedbacks: List[Dict[str, Any]]
    graph_metrics: Dict[str, Any]
