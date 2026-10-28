# CampusConnect Architecture & Design Document

## 1. System Architecture Overview

```mermaid
flowchart TD
    subgraph Client ["Frontend Layer (React 19 + Vite + Tailwind)"]
        UI["Student & Admin Dashboard"]
        State["Auth Context & Router State"]
        API_Client["API Client (Fetch + JWT Auth)"]
        UI --> State
        State --> API_Client
    end

    subgraph Server ["Backend Layer (FastAPI + Python 3.14)"]
        Router["FastAPI Router Controllers"]
        AuthMid["OAuth2 & RBAC Middleware"]
        RecommenderSvc["Hybrid Recommender Service"]
        GraphEngine["NetworkX Graph BFS Traversal"]
        RankingSvc["DSA Ranking & Tiebreaker"]
        
        API_Client -->|REST API over HTTP/JSON| Router
        Router --> AuthMid
        Router --> RecommenderSvc
        RecommenderSvc --> GraphEngine
        RecommenderSvc --> RankingSvc
    end

    subgraph Storage ["Data Persistence Layer"]
        ORM["SQLAlchemy ORM 2.0"]
        DB[("PostgreSQL / SQLite Database")]
        Router --> ORM
        ORM --> DB
    end
```

## 2. Recommendation Engine Architecture

```mermaid
flowchart LR
    subgraph Inputs
        S_Int["Student Interests (Set)"]
        S_Skills["Student Skills"]
        S_Act["Preferred Activities"]
        C_Corpus["Club Mission & Tags Corpus"]
    end

    subgraph Processing
        direction TB
        TFIDF["TF-IDF Vectorization & Cosine Sim (50%)"]
        Jaccard["Set Theory Overlap & Jaccard (35%)"]
        BFS["NetworkX BFS 1-2 Hop Proximity (15%)"]
    end

    subgraph Assembly
        Composite["Multi-Factor Scoring (0-100%)"]
        Tiebreak["Deterministic Tuple Tie-breaker"]
        TopK["Top-K Candidate Delivery"]
    end

    S_Int & S_Skills & C_Corpus --> TFIDF
    S_Int --> Jaccard
    S_Int --> BFS
    TFIDF & Jaccard & BFS --> Composite
    Composite --> Tiebreak --> TopK
```

## 3. Security & Role-Based Access Control (RBAC)

1. **Authentication Flow**:
   - Passwords hashed with `bcrypt` (salted work factor 12).
   - Session authenticated using JSON Web Tokens (JWT) signed with HMAC-SHA256.
   - Tokens contain user ID, subject email, and user role (`student` or `admin`).

2. **Role Enforcements**:
   - Ordinary students can only query public clubs, request memberships, and view/edit their own profiles and favorites.
   - Admin routes (`/api/admin/*`) strictly verify `current_user.role == 'admin'`, returning HTTP 403 Forbidden on violation.
