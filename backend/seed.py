from datetime import datetime, timezone
from app.core.database import engine, SessionLocal, Base
from app.models.models import (
    User, GoalCycle, GoalSheet, Goal, CheckIn, SharedGoal, AuditLog,
    RoleEnum, GoalStatusEnum, UoMEnum
)
from app.core.auth import get_password_hash


def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Delete in reverse FK order to avoid constraint errors
        db.query(AuditLog).delete()
        db.query(CheckIn).delete()
        db.query(Goal).delete()
        db.query(GoalSheet).delete()
        db.query(SharedGoal).delete()
        db.query(GoalCycle).delete()
        db.query(User).delete()
        db.commit()

        # ── USERS ──────────────────────────────────────────────
        admin = User(
            email="admin@atomquest.com",
            hashed_password=get_password_hash("admin123"),
            role=RoleEnum.admin,
            name="Admin User",
            department="Management"
        )
        manager = User(
            email="manager@atomquest.com",
            hashed_password=get_password_hash("manager123"),
            role=RoleEnum.manager,
            name="Rajesh Kumar",
            department="Sales"
        )
        emp1 = User(
            email="emp1@atomquest.com",
            hashed_password=get_password_hash("emp123"),
            role=RoleEnum.employee,
            name="Priya Sharma",
            department="Sales"
        )
        emp2 = User(
            email="emp2@atomquest.com",
            hashed_password=get_password_hash("emp123"),
            role=RoleEnum.employee,
            name="Amit Singh",
            department="Operations"
        )

        db.add_all([admin, manager, emp1, emp2])
        db.commit()
        db.refresh(admin)
        db.refresh(manager)
        db.refresh(emp1)
        db.refresh(emp2)

        # Set manager relationships
        emp1.manager_id = manager.id
        emp2.manager_id = manager.id
        db.commit()

        # ── GOAL CYCLE ─────────────────────────────────────────
        cycle = GoalCycle(
            name="FY 2025-26",
            start_date=datetime(2025, 4, 1, tzinfo=timezone.utc),
            end_date=datetime(2026, 3, 31, tzinfo=timezone.utc),
            is_active=True
        )
        db.add(cycle)
        db.commit()
        db.refresh(cycle)

        # ── GOAL SHEET 1 — Priya (approved, with check-ins) ───
        sheet1 = GoalSheet(
            employee_id=emp1.id,
            cycle_id=cycle.id,
            status=GoalStatusEnum.approved,
            submitted_at=datetime(2025, 4, 5, tzinfo=timezone.utc),
            approved_at=datetime(2025, 4, 8, tzinfo=timezone.utc),
        )
        db.add(sheet1)
        db.commit()
        db.refresh(sheet1)

        goals1 = [
            Goal(
                sheet_id=sheet1.id,
                thrust_area="Revenue Growth",
                title="Increase Monthly Sales Revenue",
                description="Drive revenue growth through new client acquisition and upselling",
                uom=UoMEnum.numeric,
                annual_target=1200000,
                target_q1=280000,
                target_q2=300000,
                target_q3=300000,
                target_q4=320000,
                weightage=30
            ),
            Goal(
                sheet_id=sheet1.id,
                thrust_area="Customer Experience",
                title="Improve Customer Satisfaction Score (CSAT)",
                description="Achieve higher CSAT through better support and follow-ups",
                uom=UoMEnum.percentage,
                annual_target=90,
                target_q1=85,
                target_q2=87,
                target_q3=89,
                target_q4=90,
                weightage=25
            ),
            Goal(
                sheet_id=sheet1.id,
                thrust_area="Capability Building",
                title="Complete Product & Sales Training Hours",
                description="Mandatory training to improve product knowledge and sales skills",
                uom=UoMEnum.numeric,
                annual_target=40,
                target_q1=10,
                target_q2=10,
                target_q3=10,
                target_q4=10,
                weightage=20
            ),
            Goal(
                sheet_id=sheet1.id,
                thrust_area="Quality",
                title="Reduce Customer Complaints",
                description="Minimize escalations through proactive issue resolution",
                uom=UoMEnum.numeric,
                annual_target=8,
                target_q1=12,
                target_q2=10,
                target_q3=9,
                target_q4=8,
                weightage=25
            ),
        ]
        db.add_all(goals1)
        db.commit()
        for g in goals1:
            db.refresh(g)

        # Check-ins for Priya — Q1 & Q2 completed
        checkins1 = [
            CheckIn(goal_id=goals1[0].id, quarter="Q1", actual_value=295000, score=87,  is_completed=True, employee_comment="Strong Q1 — closed 3 new enterprise accounts"),
            CheckIn(goal_id=goals1[0].id, quarter="Q2", actual_value=318000, score=94,  is_completed=True, employee_comment="Exceeded Q2 target through upsell campaign"),
            CheckIn(goal_id=goals1[1].id, quarter="Q1", actual_value=86,     score=85,  is_completed=True, employee_comment="Improved response time, positive feedback"),
            CheckIn(goal_id=goals1[1].id, quarter="Q2", actual_value=89,     score=91,  is_completed=True, employee_comment="Launched feedback loop, scores improving"),
            CheckIn(goal_id=goals1[2].id, quarter="Q1", actual_value=11,     score=100, is_completed=True, employee_comment="Completed all assigned modules ahead of time"),
            CheckIn(goal_id=goals1[2].id, quarter="Q2", actual_value=10,     score=100, is_completed=True, employee_comment="Attended 2 external workshops"),
            CheckIn(goal_id=goals1[3].id, quarter="Q1", actual_value=9,      score=100, is_completed=True, employee_comment="Reduced escalations by improving first-call resolution"),
            CheckIn(goal_id=goals1[3].id, quarter="Q2", actual_value=7,      score=100, is_completed=True, employee_comment="Below target — proactive outreach working well"),
        ]
        db.add_all(checkins1)
        db.commit()

        # ── GOAL SHEET 2 — Amit (submitted, pending approval) ─
        sheet2 = GoalSheet(
            employee_id=emp2.id,
            cycle_id=cycle.id,
            status=GoalStatusEnum.submitted,
            submitted_at=datetime(2025, 4, 6, tzinfo=timezone.utc),
        )
        db.add(sheet2)
        db.commit()
        db.refresh(sheet2)

        goals2 = [
            Goal(
                sheet_id=sheet2.id,
                thrust_area="Operational Efficiency",
                title="Reduce Delivery Turnaround Time",
                description="Streamline dispatch and delivery processes",
                uom=UoMEnum.numeric,
                annual_target=2,
                target_q1=3.5,
                target_q2=2.5,
                target_q3=2.2,
                target_q4=2.0,
                weightage=35
            ),
            Goal(
                sheet_id=sheet2.id,
                thrust_area="Quality Assurance",
                title="Achieve Zero Defect Rate in Shipments",
                description="Ensure 99%+ defect-free product deliveries",
                uom=UoMEnum.percentage,
                annual_target=99,
                target_q1=97,
                target_q2=98,
                target_q3=98,
                target_q4=99,
                weightage=35
            ),
            Goal(
                sheet_id=sheet2.id,
                thrust_area="Capability Building",
                title="Complete Cross-functional Training",
                description="Attend cross-functional workshops across departments",
                uom=UoMEnum.timeline,
                annual_target=1,
                target_q1=None,
                target_q2=1,
                target_q3=None,
                target_q4=None,
                weightage=30
            ),
        ]
        db.add_all(goals2)
        db.commit()

        # ── SHARED GOALS (pushed by admin) ────────────────────
        shared_goals = [
            SharedGoal(
                cycle_id=cycle.id,
                thrust_area="People & Culture",
                title="Achieve 95% Employee Satisfaction Score",
                description="Company-wide initiative to improve workplace satisfaction",
                uom=UoMEnum.percentage,
                annual_target=95,
                created_by=admin.id
            ),
            SharedGoal(
                cycle_id=cycle.id,
                thrust_area="Sustainability",
                title="Reduce Carbon Footprint by 20%",
                description="Operations to lead sustainability drive across all units",
                uom=UoMEnum.percentage,
                annual_target=20,
                department="Operations",
                created_by=admin.id
            ),
            SharedGoal(
                cycle_id=cycle.id,
                thrust_area="Revenue",
                title="Contribute to ₹50 Cr Annual Revenue Target",
                description="All sales employees to align individual targets to company goal",
                uom=UoMEnum.numeric,
                annual_target=50000000,
                department="Sales",
                created_by=admin.id
            ),
        ]
        db.add_all(shared_goals)
        db.commit()

        # ── AUDIT LOGS ─────────────────────────────────────────
        logs = [
            AuditLog(user_id=emp1.id,    action="SUBMIT",   entity_type="GoalSheet", entity_id=sheet1.id, detail="Priya submitted goal sheet for FY 2025-26"),
            AuditLog(user_id=manager.id, action="APPROVE",  entity_type="GoalSheet", entity_id=sheet1.id, detail="Rajesh approved Priya's goal sheet"),
            AuditLog(user_id=emp2.id,    action="SUBMIT",   entity_type="GoalSheet", entity_id=sheet2.id, detail="Amit submitted goal sheet for FY 2025-26"),
            AuditLog(user_id=admin.id,   action="PUSH_KPI", entity_type="SharedGoal", entity_id=1,        detail="Admin pushed 3 shared KPIs to teams"),
        ]
        db.add_all(logs)
        db.commit()

        print("✅ Seeded successfully with full demo data!")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
