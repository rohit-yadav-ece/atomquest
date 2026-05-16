"""
Run this once to seed demo users:
  python seed.py
"""
from app.core.database import SessionLocal, engine
from app.models.models import Base, User, GoalCycle, RoleEnum
from app.core.auth import get_password_hash
from datetime import datetime

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create demo users
admin = User(name="Admin User", email="admin@atomquest.com",
             hashed_password=get_password_hash("admin123"),
             role=RoleEnum.admin, department="HR")
db.add(admin)
db.flush()

manager = User(name="Manager One", email="manager@atomquest.com",
               hashed_password=get_password_hash("manager123"),
               role=RoleEnum.manager, department="Engineering",
               manager_id=admin.id)
db.add(manager)
db.flush()

emp1 = User(name="Employee One", email="emp1@atomquest.com",
            hashed_password=get_password_hash("emp123"),
            role=RoleEnum.employee, department="Engineering",
            manager_id=manager.id)
emp2 = User(name="Employee Two", email="emp2@atomquest.com",
            hashed_password=get_password_hash("emp123"),
            role=RoleEnum.employee, department="Engineering",
            manager_id=manager.id)
db.add_all([emp1, emp2])
db.flush()

# Create a goal cycle
cycle = GoalCycle(
    name="FY 2025-26",
    start_date=datetime(2025, 4, 1),
    end_date=datetime(2026, 3, 31),
    is_active=True
)
db.add(cycle)
db.commit()

print("✅ Seed complete!")
print("  Admin:    admin@atomquest.com / admin123")
print("  Manager:  manager@atomquest.com / manager123")
print("  Employee: emp1@atomquest.com / emp123")
print("  Employee: emp2@atomquest.com / emp123")
