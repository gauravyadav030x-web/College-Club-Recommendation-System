# CampusConnect REST API Documentation

CampusConnect exposes a modern, performant, documented REST API built with FastAPI, Pydantic validation, and SQLAlchemy ORM.

Interactive Swagger UI is available at `/docs` and ReDoc at `/redoc`.

---

## Base URLs
- **Local Development**: `http://127.0.0.1:8000/api`
- **Docker Production**: `http://localhost:8000/api`

---

## Authentication & Headers
Protected endpoints require a standard Bearer token in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a student account, student profile, and issues a JWT token.
- **Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "Password123!",
  "full_name": "Alex Rivera",
  "department": "Computer Science & Engineering",
  "year": "2nd Year",
  "interests": ["Artificial Intelligence", "Coding", "Robotics"],
  "skills": ["Python", "React"]
}
```
- **Response**: `201 Created`
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "student@university.edu",
    "full_name": "Alex Rivera",
    "role": "student",
    "is_active": true,
    "created_at": "2026-10-27T12:00:00"
  }
}
```

### `POST /api/auth/login`
Authenticates student or admin.
- **Request Body**:
```json
{
  "email": "student@university.edu",
  "password": "Password123!"
}
```
- **Response**: `200 OK` (Returns access token and user metadata)

### `GET /api/auth/me`
Retrieves current user's profile and selected interests.
- **Requires**: Bearer Token
- **Response**: `200 OK`

### `PUT /api/auth/profile`
Updates student department, year, bio, skills, and interest list.
- **Requires**: Bearer Token

---

## 2. Clubs Endpoints

### `GET /api/clubs`
Lists active clubs with optional keyword search, category filter, and pagination.
- **Query Parameters**:
  - `search` (optional): Filter by name or description.
  - `category` (optional): Filter by category name.
  - `interest` (optional): Filter by interest tag.
  - `skip` (default: 0)
  - `limit` (default: 50)
- **Response**: `200 OK` (Array of ClubResponse objects)

### `GET /api/clubs/{club_id}`
Returns full details, schedule, location, contact, and membership status for a specific club.

### `GET /api/clubs/categories/list`
Returns distinct club categories and active club counts.

### `GET /api/clubs/interests/list`
Returns all registered interest tags.

---

## 3. Recommendation Engine Endpoints

### `POST /api/recommendations`
Generates personalized club recommendations using the hybrid content-based & graph engine.
- **Request Body**:
```json
{
  "interests": ["Artificial Intelligence", "Robotics"],
  "skills": ["Python"],
  "preferred_activities": ["Hackathons"],
  "top_k": 10,
  "category_filter": null
}
```
*(If fields are omitted and user is authenticated, defaults to user's saved profile)*
- **Response**: `200 OK`
```json
{
  "total_found": 18,
  "query_interests": ["Artificial Intelligence", "Robotics"],
  "query_skills": ["Python"],
  "recommendations": [
    {
      "club_id": 1,
      "club_name": "Artificial Intelligence & Robotics Society (AIRS)",
      "slug": "airs",
      "category": "Technology",
      "score": 92.5,
      "tfidf_score": 85.0,
      "overlap_score": 100.0,
      "graph_score": 100.0,
      "matched_interests": ["Artificial Intelligence", "Robotics"],
      "matched_skills": ["Python"],
      "reason": "Strongly matches your interests in Artificial Intelligence and Robotics; Aligns with your skill in Python.",
      "meeting_info": "Every Tuesday & Thursday at 6:00 PM",
      "location": "Turing Tech Wing, Lab 304"
    }
  ],
  "graph_insights": {
    "total_nodes": 45,
    "total_edges": 82,
    "density": 0.082
  }
}
```

### `GET /api/recommendations/history`
Returns past recommendation queries executed by the student.

---

## 4. Memberships & Applications

### `POST /api/memberships`
Submits an application to join a club.
- **Request Body**:
```json
{
  "club_id": 1,
  "message": "Interested in participating in the rover robotics project."
}
```
- **Response**: `201 Created`

### `GET /api/memberships/me`
Lists all membership requests submitted by the logged-in student.

### `DELETE /api/memberships/{membership_id}`
Cancels a pending membership application.

---

## 5. Favorites & Bookmarks

### `POST /api/favorites/{club_id}`
Saves a club to the student's favorites list.

### `DELETE /api/favorites/{club_id}`
Removes a club from favorites.

### `GET /api/favorites`
Lists all favorited clubs for the student.

---

## 6. Feedback

### `POST /api/feedback`
Submits student feedback (1-5 star rating and comment) for a recommendation.
- **Request Body**:
```json
{
  "club_id": 1,
  "rating": 5,
  "feedback_type": "helpful",
  "comment": "Accurate recommendation matching my hardware ambitions."
}
```

---

## 7. Admin Dashboard Endpoints (Protected: Admin Only)

### `GET /api/admin/stats`
Returns system analytics: total students, clubs, pending requests, popular interests distribution, category breakdown, and graph metrics.

### `GET /api/admin/students`
Lists registered students with profiles and interest counts.

### `POST /api/admin/clubs`
Adds a new club to the university catalog.

### `PATCH /api/admin/clubs/{club_id}`
Edits club information or toggles activation state.

### `DELETE /api/admin/clubs/{club_id}`
Safely deactivates or permanently removes a club.

### `GET /api/admin/memberships`
Returns all membership requests submitted across all clubs.

### `PATCH /api/admin/memberships/{membership_id}`
Approves or rejects a student membership application.
- **Request Body**: `{"status": "approved"}` or `{"status": "rejected"}`
