from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.models.models import (
    User, GoalSheet, Goal, SharedGoal, GoalCycle,
    RoleEnum, GoalStatusEnum, UoMEnum, AuditLog
)

router = APIRouter(prefix="/api/shared-goals", tags=["Shared Goals"])


class SharedGoalCreate(BaseModel):
    cycle_id: int
    thrust_area: str
    title: str
    description: Optional[str] = None
    uom: UoMEnum
    annual_target: float
    department: Optional[str] = None  # None = push to ALL employees


class SharedGoalOut(BaseModel):
    id: int
    cycle_id: int
    thrust_area: str
    title: str
    description: Optional[str]
    uom: str
    annual_target: float
    department: Optional[str]
    created_by: int
    pushed_to: int  # number of employees it was pushed to

    class Config:
        from_attributes = True


@router.post("/push")
def push_shared_goal(
    payload: SharedGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))
):
    """Admin/Manager pushes a shared KPI goal to all matching employees."""
    # Save the shared goal template
    shared = SharedGoal(
        cycle_id=payload.cycle_id,
        thrust_area=payload.thrust_area,
        title=payload.title,
        description=payload.description,
        uom=payload.uom,
        annual_target=payload.annual_target,
        department=payload.department,
        created_by=current_user.id
    )
    db.add(shared)
    db.flush()

    # Find target employees
    query = db.query(User).filter(User.role == RoleEnum.employee, User.is_active == True)
    if payload.department:
        query = query.filter(User.department == payload.department)
    employees = query.all()

    pushed_count = 0
    for emp in employees:
        # Find their approved sheet for this cycle
        sheet = db.query(GoalSheet).filter(
            GoalSheet.employee_id == emp.id,
            GoalSheet.cycle_id == payload.cycle_id,
            GoalSheet.status == GoalStatusEnum.approved
        ).first()

        if not sheet:
            continue

        # Check they don't already have 8 goals
        if len(sheet.goals) >= 8:
            continue

        # Add goal to their sheet
        goal = Goal(
            sheet_id=sheet.id,
            thrust_area=payload.thrust_area,
            title=payload.title,
            description=payload.description,
            uom=payload.uom,
            annual_target=payload.annual_target,
            weightage=10.0,  # Default weightage — employee can adjust
            is_shared=True
        )
        db.add(goal)
        pushed_count += 1

    db.add(AuditLog(
        user_id=current_user.id,
        action="push_shared_goal",
        entity_type="SharedGoal",
        entity_id=shared.id,
        detail=f"Pushed to {pushed_count} employees. Dept: {payload.department or 'All'}"
    ))

    db.commit()
    return {
        "message": f"Shared goal pushed to {pushed_count} employee(s)",
        "shared_goal_id": shared.id,
        "pushed_to": pushed_count
    }


@router.get("/", response_model=List[dict])
def list_shared_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))
):
    """List all shared goals ever created."""
    goals = db.query(SharedGoal).all()
    result = []
    for g in goals:
        creator = db.query(User).filter(User.id == g.created_by).first()
        result.append({
            "id": g.id,
            "title": g.title,
            "thrust_area": g.thrust_area,
            "uom": g.uom.value,
            "annual_target": g.annual_target,
            "department": g.department or "All",
            "created_by": creator.name if creator else f"#{g.created_by}",
            "cycle_id": g.cycle_id
        })
    return result
