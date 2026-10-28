-- ============================================================================
-- College Club Recommendation System - Database Schema (PostgreSQL & SQLite)
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student' NOT NULL, -- 'student' or 'admin'
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(100) DEFAULT 'Computer Science',
    year VARCHAR(50) DEFAULT '1st Year',
    bio TEXT DEFAULT '',
    skills TEXT DEFAULT '[]', -- JSON string of skill names
    preferred_activities TEXT DEFAULT '[]', -- JSON string of activities
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Interests Catalog
CREATE TABLE IF NOT EXISTS interests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) DEFAULT 'General' NOT NULL,
    description TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_interests_name ON interests(name);
CREATE INDEX IF NOT EXISTS idx_interests_category ON interests(category);

-- 4. Clubs Table
CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    meeting_info VARCHAR(255) DEFAULT 'Every Wednesday at 5:00 PM',
    location VARCHAR(255) DEFAULT 'Student Center, Hall A',
    schedule VARCHAR(255) DEFAULT 'Bi-weekly workshops',
    contact_email VARCHAR(255) DEFAULT 'club@university.edu',
    leader_name VARCHAR(255) DEFAULT 'Faculty Advisor',
    banner_image VARCHAR(500) DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    skills_required TEXT DEFAULT '[]',
    preferred_activities TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clubs_category ON clubs(category);
CREATE INDEX IF NOT EXISTS idx_clubs_active ON clubs(is_active);

-- 5. Club <-> Interest Association (Many-to-Many)
CREATE TABLE IF NOT EXISTS club_interests (
    club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    interest_id INTEGER NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    weight FLOAT DEFAULT 1.0,
    PRIMARY KEY (club_id, interest_id)
);

-- 6. StudentProfile <-> Interest Association (Many-to-Many)
CREATE TABLE IF NOT EXISTS student_interests (
    profile_id INTEGER NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    interest_id INTEGER NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, interest_id)
);

-- 7. Membership Applications
CREATE TABLE IF NOT EXISTS membership_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'approved', 'rejected'
    message TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_membership_student_club ON membership_requests(student_id, club_id);

-- 8. Favorite Clubs (Bookmarks)
CREATE TABLE IF NOT EXISTS favorite_clubs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_club_favorite UNIQUE(user_id, club_id)
);

-- 9. Recommendation Feedback
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_type VARCHAR(50) DEFAULT 'helpful',
    comment TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. Recommendation History Snapshot
CREATE TABLE IF NOT EXISTS recommendation_histories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    top_clubs_json TEXT NOT NULL,
    student_interests_snapshot TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
