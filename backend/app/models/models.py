from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class RoleEnum(str, enum.Enum):
    employee = "employee"
    manager = "manager"
    admin = "admin"


class GoalStatusEnum(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    approved = "approved"
    returned = "returned"
    locked = "locked"


class UoMEnum(str, enum.Enum):
    numeric = "numeric"
    percentage = "percentage"
    timeline = "timeline"
    zero_based = "zero_based"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.employee, nullable=False)
    department = Column(String(100))
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    manager = relationship("User", remote_side=[id], backref="reportees")
    goal_sheets = relationship("GoalSheet", back_populates="employee", foreign_keys="GoalSheet.employee_id")
    audit_logs = relationship("AuditLog", back_populates="user")


class GoalCycle(Base):
    __tablename__ = "goal_cycles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)       # e.g. "FY 2025-26"
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    goal_sheets = relationship("GoalSheet", back_populates="cycle")


class GoalSheet(Base):
    __tablename__ = "goal_sheets"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cycle_id = Column(Integer, ForeignKey("goal_cycles.id"), nullable=False)
    status = Column(Enum(GoalStatusEnum), default=GoalStatusEnum.draft)
    manager_comment = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    employee = relationship("User", back_populates="goal_sheets", foreign_keys=[employee_id])
    cycle = relationship("GoalCycle", back_populates="goal_sheets")
    goals = relationship("Goal", back_populates="sheet", cascade="all, delete-orphan")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    sheet_id = Column(Integer, ForeignKey("goal_sheets.id"), nullable=False)
    thrust_area = Column(String(150), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    uom = Column(Enum(UoMEnum), nullable=False)
    target_q1 = Column(Float, nullable=True)
    target_q2 = Column(Float, nullable=True)
    target_q3 = Column(Float, nullable=True)
    target_q4 = Column(Float, nullable=True)
    annual_target = Column(Float, nullable=False)
    weightage = Column(Float, nullable=False)   # must total 100 across sheet
    is_shared = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sheet = relationship("GoalSheet", back_populates="goals")
    checkins = relationship("CheckIn", back_populates="goal", cascade="all, delete-orphan")


class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    quarter = Column(String(10), nullable=False)    # Q1, Q2, Q3, Q4
    actual_value = Column(Float, nullable=True)
    score = Column(Float, nullable=True)            # auto-computed
    employee_comment = Column(Text, nullable=True)
    manager_comment = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    goal = relationship("Goal", back_populates="checkins")


class SharedGoal(Base):
    __tablename__ = "shared_goals"

    id = Column(Integer, primary_key=True, index=True)
    cycle_id = Column(Integer, ForeignKey("goal_cycles.id"), nullable=False)
    thrust_area = Column(String(150), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    uom = Column(Enum(UoMEnum), nullable=False)
    annual_target = Column(Float, nullable=False)
    department = Column(String(100), nullable=True)  # null = all departments
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    detail = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")
