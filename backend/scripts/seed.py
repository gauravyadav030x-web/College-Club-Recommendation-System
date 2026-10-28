import sys
import os
import json

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app.database import SessionLocal, Base, engine
from app import models
from app.security import hash_password

def seed_database():
    print("🌱 Initializing Database Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(models.Club).count() >= 15:
            print("✅ Database is already seeded with clubs!")
            return

        print("✨ Seeding Interests Catalog...")
        interests_data = [
            ("Artificial Intelligence", "Technology", "Deep learning, neural networks, computer vision, and NLP applications."),
            ("Machine Learning", "Technology", "Predictive modeling, regression, classification, and statistical ML."),
            ("Coding", "Technology", "Software development, algorithms, competitive programming, and languages."),
            ("Web Development", "Technology", "Frontend, backend, fullstack development with modern web frameworks."),
            ("Robotics", "Technology", "Autonomous bots, Arduino, Raspberry Pi, mechatronics, and ROS."),
            ("Data Science", "Technology", "Big data, data visualization, exploratory analysis, and pandas/numpy."),
            ("Cybersecurity", "Technology", "Ethical hacking, cryptography, network security, and CTF challenges."),
            ("Photography", "Arts", "Digital photography, studio lighting, photojournalism, and post-processing."),
            ("Music", "Arts", "Vocal performance, instrumental bands, songwriting, audio engineering, and concerts."),
            ("Dance", "Arts", "Choreography, hip hop, contemporary, classical, and stage performances."),
            ("Design", "Arts", "UI/UX, visual design, typography, Figma, and brand identity."),
            ("Film Making", "Arts", "Cinematography, scriptwriting, editing, and short film production."),
            ("Sports", "Sports", "Athletics, competitive tournaments, intramural leagues, and fitness."),
            ("Gaming", "Sports", "Esports, game design, multiplayer tournaments, and competitive gaming."),
            ("Debate", "Communication", "Parliamentary debate, policy arguments, critical reasoning, and tournaments."),
            ("Public Speaking", "Communication", "Toastmasters style speeches, eloquence, presentation skills, and confidence."),
            ("Entrepreneurship", "Business", "Startup pitching, venture creation, product management, and angel funding."),
            ("Finance & Trading", "Business", "Stock markets, valuation, personal finance, and algorithmic trading."),
            ("Environmental Action", "Culture & Community", "Sustainability initiatives, campus tree plantation, and clean-up drives."),
            ("Creative Writing", "Culture & Community", "Poetry, fiction, campus literary magazine, and storytelling workshops.")
        ]

        interest_map = {}
        for name, cat, desc in interests_data:
            slug = name.lower().replace(" ", "-").replace("&", "and")
            interest = db.query(models.Interest).filter(models.Interest.name == name).first()
            if not interest:
                interest = models.Interest(name=name, slug=slug, category=cat, description=desc)
                db.add(interest)
                db.commit()
                db.refresh(interest)
            interest_map[name] = interest

        print("✨ Seeding 18 Diverse College Clubs...")
        sample_clubs = [
            {
                "name": "Artificial Intelligence & Robotics Society (AIRS)",
                "category": "Technology",
                "description": "A premier research and development club for undergraduates passionate about Machine Learning, Computer Vision, Autonomous Systems, and humanoid robotics. We organize annual hackathons, publish campus research, and build real-world robots.",
                "meeting_info": "Every Tuesday & Thursday at 6:00 PM",
                "location": "Turing Tech Wing, Lab 304",
                "schedule": "Bi-weekly coding bootcamps and hands-on hardware builds",
                "contact_email": "airs@university.edu",
                "leader_name": "Dr. Sarah Chen & Alex Kumar",
                "banner_image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Python", "PyTorch", "ROS", "C++", "TensorFlow"],
                "activities": ["Robotics Builds", "Hackathons", "Paper Reading Groups", "Guest Lectures"],
                "interests": ["Artificial Intelligence", "Machine Learning", "Robotics", "Coding", "Data Science"]
            },
            {
                "name": "Campus Full-Stack Web Builders",
                "category": "Technology",
                "description": "Learn to ship real production web applications from scratch. We build software for student campus groups, collaborate on open-source repositories, and conduct end-to-end fullstack workshops covering React, FastAPI, Node, and cloud deployments.",
                "meeting_info": "Every Wednesday at 5:30 PM",
                "location": "Innovation Hub, Room 102",
                "schedule": "Weekly live coding demos and collaborative open source sprints",
                "contact_email": "webbuilders@university.edu",
                "leader_name": "Maya Patel",
                "banner_image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
                "skills": ["React", "JavaScript", "Python", "TailwindCSS", "SQL", "Git"],
                "activities": ["Open Source Sprints", "Website Teardowns", "Hackathons"],
                "interests": ["Web Development", "Coding", "Design"]
            },
            {
                "name": "Data Science & Predictive Analytics Guild",
                "category": "Technology",
                "description": "Unlock actionable insights from large datasets. We compete in Kaggle competitions, develop data visualizations for campus administration, and explore generative models, time series forecasting, and statistical inference.",
                "meeting_info": "Mondays at 5:00 PM",
                "location": "Mathematics Department, Room 210",
                "schedule": "Kaggle sprint nights every second Friday",
                "contact_email": "datascience@university.edu",
                "leader_name": "Rohan Gupta",
                "banner_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Python", "Pandas", "Scikit-Learn", "SQL", "Tableau"],
                "activities": ["Kaggle Competitions", "Data Visualizations", "Industry Seminars"],
                "interests": ["Data Science", "Machine Learning", "Coding"]
            },
            {
                "name": "Cyber Defense & Ethical Hacking Club",
                "category": "Technology",
                "description": "Train in cyber defense, vulnerability scanning, reverse engineering, and digital forensics. Participate in regional Capture The Flag (CTF) tournaments and learn offensive & defensive security tactics in our sandbox lab.",
                "meeting_info": "Fridays at 6:30 PM",
                "location": "Cybersecurity Sandboxed Lab 402",
                "schedule": "Weekly CTF challenges and security audit walkthroughs",
                "contact_email": "cyberclub@university.edu",
                "leader_name": "James Mitchell",
                "banner_image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Linux", "Wireshark", "Bash", "Python", "Cryptography"],
                "activities": ["CTF Competitions", "Penetration Testing Demos", "Security Audits"],
                "interests": ["Cybersecurity", "Coding"]
            },
            {
                "name": "Algorithmic Competitive Coders",
                "category": "Technology",
                "description": "Sharpen your data structures and algorithms mastery. We prepare students for ICPC, LeetCode contests, and technical engineering interviews through mock rounds, whiteboarding practice, and algorithmic deep dives.",
                "meeting_info": "Saturdays at 11:00 AM",
                "location": "CS Building, Lecture Hall B",
                "schedule": "Weekly 2-hour virtual timed contest and live code debriefs",
                "contact_email": "algocoders@university.edu",
                "leader_name": "Aditi Sharma",
                "banner_image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
                "skills": ["C++", "Java", "Python", "Graph Theory", "Dynamic Programming"],
                "activities": ["Timed Contests", "Whiteboarding", "Interview Prep"],
                "interests": ["Coding", "Data Science"]
            },
            {
                "name": "Aperture Photography & Visual Storytelling",
                "category": "Arts",
                "description": "Explore the visual medium through photo walks, studio lighting experiments, and darkroom post-processing techniques. Members showcase their work in annual university exhibitions and cover major campus festivals.",
                "meeting_info": "Thursdays at 5:00 PM",
                "location": "Fine Arts Pavilion, Studio 3",
                "schedule": "Weekend outdoor campus photo walks and monthly critique salons",
                "contact_email": "aperture@university.edu",
                "leader_name": "Elena Rostova",
                "banner_image": "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Camera Operations", "Adobe Lightroom", "Photoshop", "Composition"],
                "activities": ["Photo Walks", "Studio Shoots", "Annual Gallery Show"],
                "interests": ["Photography", "Design", "Arts"]
            },
            {
                "name": "Cadence Campus Music Band Collective",
                "category": "Arts",
                "description": "A collaborative community of vocalists, instrumentalists, songwriters, and audio producers across rock, jazz, acoustic, and electronic music. We maintain soundproof jam rooms and perform at semester showcase concerts.",
                "meeting_info": "Tuesdays & Sundays at 7:00 PM",
                "location": "Music Building, Studio B",
                "schedule": "Jam sessions twice weekly and live acoustic lounge nights",
                "contact_email": "cadencemusic@university.edu",
                "leader_name": "Marcus Lee",
                "banner_image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Vocal Performance", "Guitar", "Keyboard", "Drums", "Ableton Live"],
                "activities": ["Jam Sessions", "Concerts", "Original Songwriting"],
                "interests": ["Music", "Arts"]
            },
            {
                "name": "Synergy Urban Dance Troupe",
                "category": "Arts",
                "description": "High-energy dance crew specializing in hip-hop, contemporary, waacking, and fusion styles. Open to all skill levels from beginners seeking fitness to advanced dancers competing in inter-collegiate dance fests.",
                "meeting_info": "Mondays & Thursdays at 6:30 PM",
                "location": "Recreation Complex, Dance Studio 1",
                "schedule": "Routine choreography drills and performance rehearsals",
                "contact_email": "synergydance@university.edu",
                "leader_name": "Chloe Dupont",
                "banner_image": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Choreography", "Rhythm", "Stage Presence", "Team Coordination"],
                "activities": ["Dance Battles", "Stage Performances", "Choreography Workshops"],
                "interests": ["Dance", "Music", "Sports"]
            },
            {
                "name": "DesignCraft UI/UX & Creative Media",
                "category": "Arts",
                "description": "Master user-centric design, digital prototyping, wireframing, and visual aesthetics. We collaborate with developer teams on hackathons, redesign real-world mobile apps, and host Figma design jams.",
                "meeting_info": "Wednesdays at 6:00 PM",
                "location": "Design Lab, Room 204",
                "schedule": "Weekly Figma workshops and design portfolio feedback sessions",
                "contact_email": "designcraft@university.edu",
                "leader_name": "Kavita Rao",
                "banner_image": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Figma", "UI/UX", "Typography", "User Research", "Wireframing"],
                "activities": ["Design Sprints", "Portfolio Reviews", "UI Teardowns"],
                "interests": ["Design", "Web Development", "Photography"]
            },
            {
                "name": "Silver Screen Cinema & Filmmakers Club",
                "category": "Arts",
                "description": "For aspiring directors, screenwriters, actors, sound designers, and editors. We produce student short films each semester, host cult film screenings, and study cinematography masterpieces.",
                "meeting_info": "Fridays at 7:00 PM",
                "location": "Media Arts Auditorium",
                "schedule": "Script table-reads and weekend short film shoots",
                "contact_email": "filmmakers@university.edu",
                "leader_name": "Lucas Alvarez",
                "banner_image": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Video Editing", "Premiere Pro", "Cinematography", "Screenwriting"],
                "activities": ["Short Film Production", "Screenings", "Film Festivals"],
                "interests": ["Film Making", "Arts", "Design"]
            },
            {
                "name": "Intramural Varsity Sports & Athletics Association",
                "category": "Sports",
                "description": "Promotes active student lifestyle through competitive and recreational leagues in basketball, soccer, volleyball, badminton, and track. Welcoming casual athletes and competitive tournament contenders.",
                "meeting_info": "Daily training slots from 5:00 PM - 8:00 PM",
                "location": "Main University Sports Complex & Field",
                "schedule": "Weekend intramural tournament matches and conditioning drills",
                "contact_email": "varsitysports@university.edu",
                "leader_name": "Coach Daniel Vance",
                "banner_image": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Athleticism", "Team Strategy", "Endurance", "Sportsmanship"],
                "activities": ["Intramural Leagues", "Fitness Bootcamps", "Tournament Matches"],
                "interests": ["Sports"]
            },
            {
                "name": "Pixel Knights Esports & Game Dev Guild",
                "category": "Sports",
                "description": "The collegiate hub for competitive esports and indie game development. We field varsity rosters in Valorant, League of Legends, and Rocket League, while indie devs craft original games using Unity and Godot.",
                "meeting_info": "Thursdays at 6:00 PM & Weekends",
                "location": "Student Union, Esports Lounge 108",
                "schedule": "Inter-collegiate tournament streams and monthly game jams",
                "contact_email": "esportsguild@university.edu",
                "leader_name": "Zackary Taylor",
                "banner_image": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Unity", "C#", "Team Communication", "Micro Strategy", "Streaming"],
                "activities": ["Esports Tournaments", "48-Hour Game Jams", "LAN Parties"],
                "interests": ["Gaming", "Coding", "Sports", "Design"]
            },
            {
                "name": "University Parliamentary Debate Society",
                "category": "Communication",
                "description": "Engage in parliamentary debates, model United Nations conferences, and spontaneous rebuttal formats. Members cultivate razor-sharp critical thinking, geopolitical analysis, and persuasive argumentation.",
                "meeting_info": "Wednesdays at 6:30 PM",
                "location": "Law School Hall, Room 105",
                "schedule": "Weekly mock parliamentary rounds and adjudicator clinics",
                "contact_email": "debatesociety@university.edu",
                "leader_name": "Amira Al-Mansoor",
                "banner_image": "https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Critical Reasoning", "Rebuttal", "Policy Analysis", "Persuasion"],
                "activities": ["Mock Debates", "Inter-Varsity Tournaments", "Adjudication Clinics"],
                "interests": ["Debate", "Public Speaking"]
            },
            {
                "name": "Toastmasters & Oratory Leaders Club",
                "category": "Communication",
                "description": "Overcome stage fright and command an audience with charisma. Master impromptu speaking (Table Topics), storytelling, TED-style keynote speeches, and executive meeting moderation.",
                "meeting_info": "Every Saturday at 10:00 AM",
                "location": "Student Center, Conference Room C",
                "schedule": "Weekly structured speech evaluations and impromptu rounds",
                "contact_email": "toastmasters@university.edu",
                "leader_name": "Harrison Wells",
                "banner_image": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Public Speaking", "Storytelling", "Body Language", "Speech Delivery"],
                "activities": ["Keynote Speeches", "Impromptu Drills", "Speech Contests"],
                "interests": ["Public Speaking", "Debate", "Entrepreneurship"]
            },
            {
                "name": "VentureLaunch Student Startup Incubator",
                "category": "Entrepreneurship",
                "description": "Turn your ideas into thriving startups. We provide mentorship from venture capitalists, pitch deck workshops, legal incorporation clinics, and seed micro-grants for student-led businesses.",
                "meeting_info": "Every Tuesday at 6:00 PM",
                "location": "Venture Accelerator Suite, 4th Floor",
                "schedule": "Bi-weekly pitch nights and founder fireside chats",
                "contact_email": "venturelaunch@university.edu",
                "leader_name": "Vikram Sethi & Lisa Morales",
                "banner_image": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Pitching", "Financial Modeling", "Product Validation", "Fundraising"],
                "activities": ["Demo Day", "Pitch Competitions", "Founder Fireside Chats"],
                "interests": ["Entrepreneurship", "Finance & Trading", "Public Speaking"]
            },
            {
                "name": "Wall Street Quantitative Finance & Trading Club",
                "category": "Entrepreneurship",
                "description": "Analyze capital markets, equity valuation, options trading strategies, and algorithmic quantitative models. We run an annual virtual paper-trading competition with live market simulations.",
                "meeting_info": "Thursdays at 5:30 PM",
                "location": "Business School, Bloomberg Terminal Lab",
                "schedule": "Weekly market roundup presentations and python algo trading sessions",
                "contact_email": "quanttrading@university.edu",
                "leader_name": "Jonathan Burke",
                "banner_image": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Financial Modeling", "Python", "Algorithmic Trading", "DCF Valuation"],
                "activities": ["Paper Trading Competitions", "Valuation Sprints", "Market Roundups"],
                "interests": ["Finance & Trading", "Data Science", "Entrepreneurship"]
            },
            {
                "name": "EcoVanguard Campus Sustainability Coalition",
                "category": "Culture & Community",
                "description": "Champions environmental sustainability, organic urban gardening, e-waste recycling drives, and carbon-footprint reduction policies across campus dorms and dining halls.",
                "meeting_info": "Wednesdays at 4:30 PM",
                "location": "Student Union Green Terrace",
                "schedule": "Bi-weekly garden work parties and environmental policy roundtables",
                "contact_email": "ecovanguard@university.edu",
                "leader_name": "Nadia O'Connor",
                "banner_image": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Community Organizing", "Sustainability Audits", "Urban Farming"],
                "activities": ["Tree Plantation", "Recycling Drives", "Green Hackathons"],
                "interests": ["Environmental Action"]
            },
            {
                "name": "Ink & Quill Creative Writers Workshop",
                "category": "Culture & Community",
                "description": "A haven for poets, essayists, novelists, and short story writers. We critique student manuscripts in small supportive circles and publish 'The Quill', our award-winning semester literary journal.",
                "meeting_info": "Sundays at 3:00 PM",
                "location": "University Library, Rare Books Reading Room",
                "schedule": "Weekly writing prompt sprints and peer manuscript critique circles",
                "contact_email": "inkandquill@university.edu",
                "leader_name": "Samuel Thorne",
                "banner_image": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
                "skills": ["Creative Writing", "Manuscript Editing", "Poetry", "Story Structure"],
                "activities": ["Poetry Slams", "Writing Prompts", "Literary Magazine Publication"],
                "interests": ["Creative Writing", "Public Speaking", "Arts"]
            }
        ]

        for club_data in sample_clubs:
            slug = club_data["name"].lower().replace(" ", "-").replace("&", "and").replace("(", "").replace(")", "").replace(",", "")
            club = models.Club(
                name=club_data["name"],
                slug=slug,
                category=club_data["category"],
                description=club_data["description"],
                meeting_info=club_data["meeting_info"],
                location=club_data["location"],
                schedule=club_data["schedule"],
                contact_email=club_data["contact_email"],
                leader_name=club_data["leader_name"],
                banner_image=club_data["banner_image"],
                is_active=True,
                skills_required=json.dumps(club_data["skills"]),
                preferred_activities=json.dumps(club_data["activities"])
            )

            # Associate interests
            for int_name in club_data["interests"]:
                if int_name in interest_map:
                    club.interests.append(interest_map[int_name])

            db.add(club)

        db.commit()
        print("✅ Added 18 Clubs with detailed descriptions and interest associations!")

        print("✨ Seeding Demo Student & Admin Accounts...")
        # Create Demo Admin
        admin_email = "admin@university.edu"
        admin_user = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin_user:
            admin_user = models.User(
                email=admin_email,
                hashed_password=hash_password("Admin@College2026"),
                full_name="Dean Elizabeth Walker",
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("👤 Created Demo Admin: admin@university.edu (Password: Admin@College2026)")

        # Create Demo Student 1: Tech enthusiast
        student_email = "student@university.edu"
        student_user = db.query(models.User).filter(models.User.email == student_email).first()
        if not student_user:
            student_user = models.User(
                email=student_email,
                hashed_password=hash_password("Student@College2026"),
                full_name="Alex Rivera",
                role="student",
                is_active=True
            )
            db.add(student_user)
            db.commit()
            db.refresh(student_user)

            student_profile = models.StudentProfile(
                user_id=student_user.id,
                department="Computer Science & Engineering",
                year="2nd Year",
                bio="Passionate sophomore keen on AI, web development, and robotics. Always looking to build fun hackathon projects and join a technical club.",
                skills=json.dumps(["Python", "React", "JavaScript", "PyTorch"]),
                preferred_activities=json.dumps(["Hackathons", "Robotics Builds", "Open Source Sprints"])
            )
            # Add sample interests
            for int_name in ["Artificial Intelligence", "Machine Learning", "Coding", "Web Development", "Robotics"]:
                if int_name in interest_map:
                    student_profile.interests.append(interest_map[int_name])

            db.add(student_profile)
            db.commit()
            print("🎓 Created Demo Student: student@university.edu (Password: Student@College2026)")

            # Seed a sample membership request and favorite
            air_club = db.query(models.Club).filter(models.Club.name.ilike("%Robotics%")).first()
            if air_club:
                fav = models.FavoriteClub(user_id=student_user.id, club_id=air_club.id)
                db.add(fav)
                req = models.MembershipRequest(
                    student_id=student_user.id,
                    club_id=air_club.id,
                    status="approved",
                    message="Excited to join the hardware team and build autonomous rover models!"
                )
                db.add(req)
                db.commit()

        print("🎉 Database seeding completed successfully!")

    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
