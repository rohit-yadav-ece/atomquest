from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.models.models import (
    User, GoalSheet, Goal, GoalCycle,
    GoalStatusEnum, UoMEnum, RoleEnum, AuditLog
)

router = APIRouter(prefix="/api/goals", tags=["Goals"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class GoalCreate(BaseModel):
    thrust_area: str
    title: str
    description: Optional[str] = None
    uom: UoMEnum
    target_q1: Optional[float] = None
    target_q2: Optional[float] = None
    target_q3: Optional[float] = None
    target_q4: Optional[float] = None
    annual_target: float
    weightage: float


class GoalOut(GoalCreate):
    id: int
    sheet_id: int
    is_shared: bool
    class Config:
        from_attributes = True


class GoalSheetCreate(BaseModel):
    cycle_id: int
    goals: List[GoalCreate]

    @validator("goals")
    def validate_goals(cls, goals):
        if not goals:
            raise ValueError("At least one goal is required")
        if len(goals) > 8:
            raise ValueError("Maximum 8 goals allowed per sheet")
        total_weight = sum(g.weightage for g in goals)
        if abs(total_weight - 100.0) > 0.01:
            raise ValueError(f"Total weightage must be 100%. Currently: {total_weight}%")
        for g in goals:
            if g.weightage < 10:
                raise ValueError(f"Each goal must have at least 10% weightage. '{g.title}' has {g.weightage}%")
        return goals


class GoalSheetOut(BaseModel):
    id: int
    employee_id: int
    cycle_id: int
    status: str
    manager_comment: Optional[str]
    submitted_at: Optional[datetime]
    approved_at: Optional[datetime]
    created_at: datetime
    goals: List[GoalOut]
    class Config:
        from_attributes = True


class ReviewPayload(BaseModel):
    action: str   # "approve" or "return"
    comment: Optional[str] = None


# ── Helper ────────────────────────────────────────────────────────────────────

def log_action(db, user_id, action, entity_type, entity_id, detail=None):
    db.add(AuditLog(user_id=user_id, action=action,
                    entity_type=entity_type, entity_id=entity_id, detail=detail))


# ── Employee: Create Goal Sheet ───────────────────────────────────────────────

@router.post("/sheet", response_model=GoalSheetOut)
def create_goal_sheet(
    payload: GoalSheetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check no active draft/submitted sheet for same cycle
    existing = db.query(GoalSheet).filter(
        GoalSheet.employee_id == current_user.id,
        GoalSheet.cycle_id == payload.cycle_id,
        GoalSheet.status.in_([GoalStatusEnum.draft, GoalStatusEnum.submitted, GoalStatusEnum.approved])
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="A goal sheet already exists for this cycle")

    sheet = GoalSheet(employee_id=current_user.id, cycle_id=payload.cycle_id, status=GoalStatusEnum.draft)
    db.add(sheet)
    db.flush()

    for g in payload.goals:
        db.add(Goal(sheet_id=sheet.id, **g.dict()))

    log_action(db, current_user.id, "create_sheet", "GoalSheet", sheet.id)
    db.commit()
    db.refresh(sheet)
    return sheet


@router.get("/sheet/my", response_model=List[GoalSheetOut])
def my_sheets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(GoalSheet).filter(GoalSheet.employee_id == current_user.id).all()


@router.get("/sheet/{sheet_id}", response_model=GoalSheetOut)
def get_sheet(sheet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sheet = db.query(GoalSheet).filter(GoalSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    if current_user.role == RoleEnum.employee and sheet.employee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return sheet


@router.post("/sheet/{sheet_id}/submit")
def submit_sheet(sheet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sheet = db.query(GoalSheet).filter(
        GoalSheet.id == sheet_id, GoalSheet.employee_id == current_user.id
    ).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    if sheet.status not in [GoalStatusEnum.draft, GoalStatusEnum.returned]:
        raise HTTPException(status_code=400, detail="Only draft or returned sheets can be submitted")
    sheet.status = GoalStatusEnum.submitted
    sheet.submitted_at = datetime.utcnow()
    log_action(db, current_user.id, "submit_sheet", "GoalSheet", sheet.id)
    db.commit()
    return {"message": "Sheet submitted for approval"}


# ── Manager: Review Sheets ────────────────────────────────────────────────────

@router.get("/sheet/team/pending", response_model=List[GoalSheetOut])
def pending_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.manager, RoleEnum.admin))
):
    reportee_ids = [u.id for u in current_user.reportees]
    return db.query(GoalSheet).filter(
        GoalSheet.employee_id.in_(reportee_ids),
        GoalSheet.status == GoalStatusEnum.submitted
    ).all()


@router.post("/sheet/{sheet_id}/review")
def review_sheet(
    sheet_id: int,
    payload: ReviewPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.manager, RoleEnum.admin))
):
    sheet = db.query(GoalSheet).filter(GoalSheet.id == sheet_id).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    if sheet.status != GoalStatusEnum.submitted:
        raise HTTPException(status_code=400, detail="Sheet is not in submitted state")

    if payload.action == "approve":
        sheet.status = GoalStatusEnum.approved
        sheet.approved_at = datetime.utcnow()
        # Lock all goals
        for goal in sheet.goals:
            pass  # locked via sheet status
    elif payload.action == "return":
        sheet.status = GoalStatusEnum.returned
    else:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'return'")

    sheet.manager_comment = payload.comment
    log_action(db, current_user.id, f"{payload.action}_sheet", "GoalSheet", sheet.id, payload.comment)
    db.commit()
    return {"message": f"Sheet {payload.action}d successfully"}


# ── Admin: All sheets ─────────────────────────────────────────────────────────

@router.get("/sheet/admin/all", response_model=List[GoalSheetOut])
def all_sheets(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.admin))
):
    return db.query(GoalSheet).all()
