import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import require_role
from app.models.models import (
    User, GoalSheet, Goal, CheckIn, GoalCycle,
    RoleEnum, GoalStatusEnum
)

router = APIRouter(prefix="/api/report", tags=["Reporting"])


@router.get("/csv")
def export_achievement_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))
):
    """Export full achievement report as CSV."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Employee Name", "Email", "Department",
        "Cycle", "Sheet Status",
        "Goal Title", "Thrust Area", "UoM",
        "Annual Target", "Weightage (%)",
        "Q1 Target", "Q1 Actual", "Q1 Score",
        "Q2 Target", "Q2 Actual", "Q2 Score",
        "Q3 Target", "Q3 Actual", "Q3 Score",
        "Q4 Target", "Q4 Actual", "Q4 Score",
        "Avg Score"
    ])

    sheets = db.query(GoalSheet).all()

    for sheet in sheets:
        emp = db.query(User).filter(User.id == sheet.employee_id).first()
        cycle = db.query(GoalCycle).filter(GoalCycle.id == sheet.cycle_id).first()

        for goal in sheet.goals:
            checkins = db.query(CheckIn).filter(CheckIn.goal_id == goal.id).all()
            ci_map = {ci.quarter: ci for ci in checkins}

            scores = []
            row_data = []
            for q in ["Q1", "Q2", "Q3", "Q4"]:
                target = getattr(goal, f"target_{q.lower()}", None)
                ci = ci_map.get(q)
                actual = ci.actual_value if ci else None
                score = ci.score if ci else None
                if score is not None:
                    scores.append(score)
                row_data += [target or "", actual or "", score or ""]

            avg_score = round(sum(scores) / len(scores), 2) if scores else ""

            writer.writerow([
                emp.name if emp else "",
                emp.email if emp else "",
                emp.department if emp else "",
                cycle.name if cycle else "",
                sheet.status.value,
                goal.title,
                goal.thrust_area,
                goal.uom.value,
                goal.annual_target,
                goal.weightage,
                *row_data,
                avg_score
            ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=achievement_report.csv"}
    )


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))
):
    """Return summary stats for dashboard charts."""
    sheets = db.query(GoalSheet).all()

    # Status distribution
    status_counts = {}
    for sheet in sheets:
        s = sheet.status.value
        status_counts[s] = status_counts.get(s, 0) + 1

    # Avg score per department
    dept_scores = {}
    dept_counts = {}
    for sheet in sheets:
        emp = db.query(User).filter(User.id == sheet.employee_id).first()
        dept = emp.department if emp and emp.department else "Unknown"
        for goal in sheet.goals:
            checkins = db.query(CheckIn).filter(CheckIn.goal_id == goal.id).all()
            for ci in checkins:
                if ci.score is not None:
                    dept_scores[dept] = dept_scores.get(dept, 0) + ci.score
                    dept_counts[dept] = dept_counts.get(dept, 0) + 1

    dept_avg = {
        dept: round(dept_scores[dept] / dept_counts[dept], 1)
        for dept in dept_scores
    }

    # QoQ scores across all employees
    qoq = {}
    for q in ["Q1", "Q2", "Q3", "Q4"]:
        scores = db.query(CheckIn).filter(CheckIn.quarter == q).all()
        vals = [ci.score for ci in scores if ci.score is not None]
        qoq[q] = round(sum(vals) / len(vals), 1) if vals else 0

    # Completion rate
    total = len(sheets)
    completed = sum(1 for s in sheets if s.status == GoalStatusEnum.approved)
    completion_rate = round((completed / total * 100), 1) if total > 0 else 0

    return {
        "status_distribution": [
            {"name": k.capitalize(), "value": v}
            for k, v in status_counts.items()
        ],
        "dept_avg_scores": [
            {"dept": k, "avg_score": v}
            for k, v in dept_avg.items()
        ],
        "qoq_trends": [
            {"quarter": q, "avg_score": qoq[q]}
            for q in ["Q1", "Q2", "Q3", "Q4"]
        ],
        "total_sheets": total,
        "completed_sheets": completed,
        "completion_rate": completion_rate
    }
