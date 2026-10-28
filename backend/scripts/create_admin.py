import sys
import os
import argparse
import getpass

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

def create_admin(email: str, password: str, full_name: str):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.email == email.lower()).first()
        if existing:
            if existing.role == "admin":
                print(f"⚠️ User '{email}' is already an administrator.")
                return
            existing.role = "admin"
            db.commit()
            print(f"✅ User '{email}' elevated to administrator role!")
            return

        admin = models.User(
            email=email.lower(),
            hashed_password=hash_password(password),
            full_name=full_name,
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print(f"🎉 Administrator account created successfully: {email}")
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Securely create or promote an administrator account.")
    parser.add_argument("--email", type=str, help="Admin email address", default=None)
    parser.add_argument("--name", type=str, help="Admin full name", default="System Administrator")
    parser.add_argument("--password", type=str, help="Admin password (optional; prompted securely if omitted)", default=None)

    args = parser.parse_args()

    email = args.email
    if not email:
        email = input("Enter Admin Email: ").strip()

    name = args.name
    if not args.name or args.name == "System Administrator":
        entered_name = input(f"Enter Full Name [{name}]: ").strip()
        if entered_name:
            name = entered_name

    password = args.password
    if not password:
        password = getpass.getpass("Enter Admin Password: ").strip()
        confirm = getpass.getpass("Confirm Admin Password: ").strip()
        if password != confirm:
            print("❌ Passwords do not match!")
            sys.exit(1)

    if len(password) < 6:
        print("❌ Password must be at least 6 characters!")
        sys.exit(1)

    create_admin(email, password, name)
