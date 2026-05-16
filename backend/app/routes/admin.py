from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.core.auth import get_current_user, require_role
from app.models.models import User, GoalCycle, AuditLog, GoalSheet, GoalStatusEnum, RoleEnum

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class CycleCreate(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime


class CycleOut(BaseModel):
    id: int
    name: str
    start_date: datetime
    end_date: datetime
    is_active: bool
    class Config:
        from_attributes = True


class AuditOut(BaseModel):
    id: int
    user_id: int
    action: str
    entity_type: str
    entity_id: int
    detail: Optional[str]
    timestamp: datetime
    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str]
    manager_id: Optional[int]
    is_active: bool
    class Config:
        from_attributes = True


# ── Goal Cycles ───────────────────────────────────────────────────────────────

@router.post("/cycles", response_model=CycleOut)
def create_cycle(
    payload: CycleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.admin))
):
    cycle = GoalCycle(**payload.dict())
    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    return cycle


@router.get("/cycles", response_model=List[CycleOut])
def list_cycles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(GoalCycle).all()


@router.patch("/cycles/{cycle_id}/toggle")
def toggle_cycle(
    cycle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.admin))
):
    cycle = db.query(GoalCycle).filter(GoalCycle.id == cycle_id).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    cycle.is_active = not cycle.is_active
    db.commit()
    return {"is_active": cycle.is_active}


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.admin, RoleEnum.manager))
):
    return db.query(User).filter(User.is_active == True).all()


@router.patch("/users/{user_id}/unlock-sheet")
def unlock_sheet(
    user_id: int,
    cycle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.admin))
):
    """Admin can reopen an approved sheet for editing."""
    sheet = db.query(GoalSheet).filter(
        GoalSheet.employee_id == user_id,
        GoalSheet.cycle_id == cycle_id
    ).first()
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
    sheet.status = GoalStatusEnum.returned
    sheet.manager_comment = "Unlocked by admin for re-editing"
    db.add(AuditLog(
        user_id=current_user.id,
        action="admin_unlock_sheet",
        entity_type="GoalSheet",
        entity_id=sheet.id,
        detail=f"Unlocked by {current_user.email}"
    ))
    db.commit()
    return {"message": "Sheet unlocked for editing"}


# ── Audit Logs ────────────────────────────────────────────────────────────────

@router.get("/audit", response_model=List[AuditOut])
def audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.admin))
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(500).all()
