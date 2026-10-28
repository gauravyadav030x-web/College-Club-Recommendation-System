🎓 CampusConnect — College Club Recommendation System

<p align="center">
<img src="docs/assets/campusconnect-logo.svg" alt="CampusConnect Logo" width="180"/>
</p>

<h3 align="center">Discover Your Passion. Connect With Your Campus.</h3>

<p align="center">
An intelligent, personalized college club recommendation platform powered by Machine Learning, Graph Algorithms, and Data Structures.
</p>

<p align="center">
<img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
<img src="https://img.shields.io/badge/Machine_Learning-TF--IDF-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="Machine Learning"/>
</p>

<p align="center">
<img src="https://img.shields.io/badge/NetworkX-Graph_Algorithms-2563EB?style=flat-square" alt="NetworkX"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-3.4%2B-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
<img src="https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="Database"/>
<img src="https://img.shields.io/badge/Tests-12_Passed-brightgreen?style=flat-square&logo=pytest&logoColor=white" alt="Pytest"/>
</p>

📌 About the Project

CampusConnect is a College Club Recommendation System designed to help university students discover extracurricular clubs based on their interests, skills, academic background, and preferred activities.

The platform combines content-based machine learning with Data Structures and Algorithms (DSA) to generate personalized, explainable club recommendations.

✨ What Makes CampusConnect Special?
🎯 Personalized Recommendations: Matches students with relevant clubs using a hybrid ranking algorithm.
🧠 Machine Learning: Uses TF-IDF vectorization and cosine similarity.
🕸️ Knowledge Graph: Uses NetworkX and Breadth-First Search to discover related interests.
⚡ Efficient Retrieval: Uses inverted-index dictionaries and set operations.
🔐 Secure Authentication: JWT-based authentication and role-based access control.
❤️ Favorites & Memberships: Save clubs, apply for membership, and track application status.
📊 Admin Analytics: Monitor student interests, clubs, memberships, and graph statistics.
💬 Explainable Results: Understand why each club matches your profile.
🏗️ System Architecture & Technology Stack
Architecture Diagram
mermaid
flowchart TD
    A["🎓 Student / Administrator"] --> B["React 19 Frontend"]
    B --> C["Auth Context & Router"]
    C --> D["Fetch API Client"]
    D --> E["FastAPI REST API"]

    E --> F["JWT Authentication & RBAC"]
    E --> G["Recommendation Engine"]
    E --> H["SQLAlchemy ORM"]

    subgraph ML["🧠 Machine Learning & DSA Engine"]
        G --> I["TF-IDF Vectorization"]
        I --> J["Cosine Similarity"]
        G --> K["NetworkX Graph & BFS"]
        G --> L["HashMap Inverted Index"]
        G --> M["Set Intersection & Jaccard"]
        J --> N["Composite Ranking"]
        K --> N
        L --> N
        M --> N
    end

    H --> O[("SQLite / PostgreSQL")]
    N --> P["Personalized Recommendations"]
    P --> B

    style A fill:#7C3AED,color:#fff,stroke:#6D28D9
    style B fill:#0891B2,color:#fff,stroke:#0E7490
    style E fill:#059669,color:#fff,stroke:#047857
    style N fill:#EA580C,color:#fff,stroke:#C2410C
    style O fill:#2563EB,color:#fff,stroke:#1D4ED8

Technology Stack
Layer	Technologies	Purpose
Frontend	React 19, Vite	Interactive student and admin dashboards
Styling	Tailwind CSS 3.4+	Responsive, modern user interface
Backend	FastAPI, Python	REST API and application business logic
Authentication	JWT, bcrypt	Secure authentication and access control
Machine Learning	Scikit-Learn	TF-IDF vectorization and cosine similarity
Graph Algorithms	NetworkX	Knowledge graph construction and BFS traversal
Data Structures	Dictionaries, Sets	Fast candidate retrieval and interest matching
ORM	SQLAlchemy	Database models and query management
Development Database	SQLite	Local development and testing
Production Database	PostgreSQL	Production-oriented relational storage
Testing	Pytest	Unit and API integration tests
Deployment	Docker Compose, Nginx	Containerized application deployment
🎓 Core Features
Student Portal
Feature	Description
🔐 Authentication	Register, log in, refresh sessions, and log out
👤 Student Profile	Manage department, graduation year, bio, and skills
🎯 Interest Selection	Select multiple extracurricular interests
🤖 Recommendations	View personalized club suggestions and relevance scores
🔎 Club Explorer	Search clubs and filter by category
📖 Club Details	View descriptions, schedules, locations, and contact information
❤️ Favorites	Bookmark clubs for later
📝 Membership Applications	Apply to clubs and track application status
⭐ Feedback	Rate recommendation quality and submit comments
Administrator Portal
Feature	Description
📊 Intelligence Hub	View campus and recommendation analytics
🏢 Club Management	Create, edit, and deactivate clubs
👥 Membership Management	Approve or decline student applications
📈 Interest Analytics	Analyze popular student interests and club categories
🕸️ Graph Analytics	Monitor graph nodes, edges, density, and connected components
🔐 Role-Based Access	Restrict administrative actions to authorized administrators
🎓 Student Directory	Review registered student accounts
🧠 Machine Learning & DSA Engine
Component	Technical Implementation	Algorithmic Role & Complexity
Content-Based ML	Scikit-Learn TfidfVectorizer + Cosine Similarity	Converts club descriptions, categories, skills, and activities into sparse numerical vectors. Calculates cosine similarity against the student profile vector. Weight: 50%
Graph BFS	NetworkX Graph + Breadth-First Search	Connects clubs, interest tags, categories, and skills. Explores direct and two-hop semantic relationships, such as AI ↔ ML. BFS complexity: O(V + E). Weight: 15%
HashMaps	Inverted Index Dictionaries	Maps normalized interest and skill names to candidate club ID sets. Average dictionary lookup: O(1); retrieving all candidates also depends on the number of matches.
Set Theory	Python Set Intersection + Jaccard Index	Finds matching interests and calculates Jaccard similarity. Expected intersection complexity depends on set sizes and hashing; a common bound is **O(min(
Tie-Breaking	Multi-attribute sorting tuple	Sorts by descending relevance score, descending number of matched interests, and alphabetical club name. Sorting complexity: O(K log K).
Explainability	Natural Language Reason Generator	Generates human-readable explanations based on matching interests and skills.
Recommendation Formula

The system combines three signals into a single relevance score:

Score
=
100
×
(
0.50
𝑇
+
0.35
𝐽
+
0.15
𝐺
)

Where:

T: TF-IDF cosine similarity.
J: Interest-overlap score.
G: Graph BFS proximity score.
TF-IDF Cosine Similarity
CosSim
⁡
(
𝑠
,
𝑐
)
=
𝑠
⋅
𝑐
∥
𝑠
∥
2
∥
𝑐
∥
2
Jaccard Similarity
𝐽
(
𝑆
,
𝐶
)
=
∣
𝑆
∩
𝐶
∣
∣
𝑆
∪
𝐶
∣
Explainable Recommendation Example
Strongly matches your interests in Artificial Intelligence and Coding; aligns with your skill in Python.

The ranking is deterministic: ties are resolved using matched-interest count and then club name.

📂 Project Structure
text
college-club-recommendation-system/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── admin.py
│   │   │   ├── auth.py
│   │   │   ├── clubs.py
│   │   │   ├── favorites.py
│   │   │   ├── feedback.py
│   │   │   ├── memberships.py
│   │   │   └── recommendations.py
│   │   ├── services/
│   │   │   ├── graph_engine.py
│   │   │   ├── ranking.py
│   │   │   └── recommender.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── security.py
│   ├── scripts/
│   │   ├── create_admin.py
│   │   └── seed.py
│   ├── tests/
│   │   ├── test_api.py
│   │   ├── test_graph.py
│   │   └── test_recommender.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── database/
│   └── schema.sql
├── docs/
│   ├── assets/
│   │   └── campusconnect-logo.svg
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   └── ML_AND_DSA_EXPLANATION.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── start.bat
├── start.sh
└── README.md

⚙️ Installation & Setup
Prerequisites
Python 3.10+
Node.js 18+
npm
Git (optional)
Docker and Docker Compose (optional)
Option 1: Windows — One-Click Launch

Run the startup script from the project root:

powershell
.\start.bat


The script is intended to prepare dependencies, seed demo data, and start the backend and frontend services.

Option 2: macOS / Linux
bash
chmod +x start.sh
./start.sh

Option 3: Manual Setup

Step 1 — Start the backend

bash
cd backend
python -m venv venv


Windows:

powershell
.\venv\Scripts\activate


macOS / Linux:

bash
source venv/bin/activate


Install dependencies and seed the database:

bash
python -m pip install -r requirements.txt
python scripts/seed.py


Start FastAPI:

bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload


Step 2 — Start the frontend in a separate terminal

bash
cd frontend
npm install
npm run dev

Option 4: Docker Compose

Run from the project root:

bash
docker-compose up --build

Application URLs
Service	URL
Frontend	http://localhost:5173
FastAPI API	http://127.0.0.1:8000
Interactive API Docs	http://127.0.0.1:8000/docs
PostgreSQL	localhost:5432
🔑 Demo Credentials
Role	Email	Password	Access
🎓 Student	student@university.edu	Student@College2026	Recommendations, club exploration, favorites, membership applications, and feedback
👑 Admin	admin@university.edu	Admin@College2026	Admin dashboard, club management, membership reviews, and analytics

Quick-login buttons are also available on the login page.

Security note: These credentials are for local demonstration only. Change demo passwords and use environment-based secrets before deployment.

Create an Administrator Securely
bash
cd backend
python scripts/create_admin.py --email admin@mycollege.edu --name "Campus Dean"


Follow the interactive prompts to set a secure password.

🧪 Testing & Quality Assurance
Backend Automated Tests

Run from the backend/ directory:

bash
python -m pytest -v


The supplied project verification report records 12 passing tests, covering:

API health and authentication.
Recommendation and club endpoints.
Admin role-based access control.
Graph construction and BFS traversal.
Graph analytics.
Text normalization and interest overlap.
Deterministic ranking and filtering.
Empty-interest fallback behavior.
Frontend Production Build

Run from frontend/:

bash
npm run build


The supplied verification report records a successful Vite production build with 1,982 modules transformed.

Note: These are the previously supplied verification results. Run the commands in your current environment to confirm the latest status.

🚀 Deployment

The project includes Docker configuration for containerized deployment.

bash
docker-compose up --build -d


The intended deployment stack includes:

FastAPI backend.
PostgreSQL database.
Nginx-served React frontend.

Configure production secrets, database credentials, CORS, HTTPS, and network exposure appropriately before deploying publicly.

🛠️ Troubleshooting

Port 8000 or 5173 is already in use

Update the relevant backend configuration or frontend/vite.config.js.

Missing Python modules

bash
python -m pip install -r backend/requirements.txt


Reset the SQLite database

Stop the backend, back up any important data, remove backend/college_clubs.db, and reseed:

bash
python backend/scripts/seed.py


Frontend dependencies or build errors

bash
cd frontend
npm install
npm run build

🔒 Security Considerations
Store JWT signing secrets in environment variables.
Never commit .env files or production credentials.
Use strong, unique passwords.
Keep authorization checks on the backend.
Use HTTPS and appropriately configured CORS in production.
Restrict database ports and administrative endpoints.
Replace demo credentials before public deployment.
📚 Documentation
Architecture: docs/ARCHITECTURE.md
API Reference: docs/API_DOCUMENTATION.md
ML & DSA Explanation: docs/ML_AND_DSA_EXPLANATION.md
Database Schema: database/schema.sql
🎯 Project Goals

CampusConnect demonstrates the practical integration of:

Machine Learning and information retrieval.
Graph traversal and semantic relationships.
Hash-based indexing and set theory.
REST API development and database modeling.
Authentication and role-based authorization.
Modern frontend development and containerization.
📄 License

This project is released under the MIT License for academic and demonstration purposes.

<p align="center">
<strong>🎓 CampusConnect</strong>
<br/>
Discover Your Passion. Connect With Your Campus.
<br/><br/>
Built with ❤️ using React, FastAPI, Python, and Machine Learning.
</p>
