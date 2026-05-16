from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.models.models import (
    User, Goal, GoalSheet, CheckIn,
    GoalStatusEnum, UoMEnum, RoleEnum, AuditLog
)

router = APIRouter(prefix="/api/checkins", tags=["Check-ins"])

VALID_QUARTERS = ["Q1", "Q2", "Q3", "Q4"]


class CheckInCreate(BaseModel):
    goal_id: int
    quarter: str
    actual_value: float
    employee_comment: Optional[str] = None


class ManagerCheckIn(BaseModel):
    manager_comment: str


class CheckInOut(BaseModel):
    id: int
    goal_id: int
    quarter: str
    actual_value: Optional[float]
    score: Optional[float]
    employee_comment: Optional[str]
    manager_comment: Optional[str]
    is_completed: bool
    class Config:
        from_attributes = True


def compute_score(goal: Goal, actual: float, quarter: str) -> float:
    """Auto-compute achievement score based on UoM type."""
    target_map = {"Q1": goal.target_q1, "Q2": goal.target_q2,
                  "Q3": goal.target_q3, "Q4": goal.target_q4}
    target = target_map.get(quarter) or goal.annual_target

    if goal.uom == UoMEnum.zero_based:
        if actual == 0:
            return 100.0
        else:
            return round(max(100 - (actual * 10), 0), 2)

    if target == 0:
        return 0.0

    if goal.uom in [UoMEnum.numeric, UoMEnum.percentage]:
        return round(min((actual / target) * 100, 150), 2)

    elif goal.uom == UoMEnum.timeline:
        if actual <= target:
            return round(min((target / actual) * 100, 120), 2)
        else:
            return round(max((target / actual) * 100, 0), 2)

    return 0.0


@router.post("/", response_model=CheckInOut)
def create_checkin(
    payload: CheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload.quarter not in VALID_QUARTERS:
        raise HTTPException(status_code=400, detail=f"Quarter must be one of {VALID_QUARTERS}")

    goal = db.query(Goal).filter(Goal.id == payload.goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    sheet = db.query(GoalSheet).filter(GoalSheet.id == goal.sheet_id).first()
    if sheet.status != GoalStatusEnum.approved:
        raise HTTPException(status_code=400, detail="Goal sheet must be approved before check-ins")
    if sheet.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    existing = db.query(CheckIn).filter(
        CheckIn.goal_id == payload.goal_id,
        CheckIn.quarter == payload.quarter
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Check-in for {payload.quarter} already exists")

    score = compute_score(goal, payload.actual_value, payload.quarter)

    checkin = CheckIn(
        goal_id=payload.goal_id,
        quarter=payload.quarter,
        actual_value=payload.actual_value,
        score=score,
        employee_comment=payload.employee_comment,
        is_completed=False
    )
    db.add(checkin)
    db.add(AuditLog(
        user_id=current_user.id,
        action="create_checkin",
        entity_type="CheckIn",
        entity_id=0,
        detail=f"Goal {payload.goal_id}, {payload.quarter}, score={score}"
    ))
    db.commit()
    db.refresh(checkin)
    return checkin


@router.get("/goal/{goal_id}", response_model=List[CheckInOut])
def get_checkins_for_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(CheckIn).filter(CheckIn.goal_id == goal_id).all()


@router.post("/{checkin_id}/manager-review")
def manager_review(
    checkin_id: int,
    payload: ManagerCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.manager, RoleEnum.admin))
):
    checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    checkin.manager_comment = payload.manager_comment
    checkin.is_completed = True
    db.commit()
    return {"message": "Manager review saved"}
