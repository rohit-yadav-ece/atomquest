from app.core.database import engine, SessionLocal, Base
from app.models.models import User
from app.core.auth import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).first()
        if existing:
            print("DB already seeded. Skipping.")
            return

        users = [
            User(email="admin@atomquest.com",    hashed_password=get_password_hash("admin123"),   role="admin",    name="Admin User"),
            User(email="manager@atomquest.com",  hashed_password=get_password_hash("manager123"), role="manager",  name="Manager User"),
            User(email="emp1@atomquest.com",     hashed_password=get_password_hash("emp123"),     role="employee", name="Employee One"),
            User(email="emp2@atomquest.com",     hashed_password=get_password_hash("emp123"),     role="employee", name="Employee Two"),
        ]
        db.add_all(users)
        db.commit()
        print("✅ Seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
