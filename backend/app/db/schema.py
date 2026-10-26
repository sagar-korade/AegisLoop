"""SQLAlchemy schema models and table definitions for AegisLoop.

Conforms strictly to docs/DATA_MODEL.md.
"""
from typing import List, Optional
from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base declarative class for SQLite persistence."""
    pass


class RunModel(Base):
    """Persisted workflow run record."""

    __tablename__ = "runs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    scenario_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    scenario_version: Mapped[str] = mapped_column(String(32), nullable=False)
    mode: Mapped[str] = mapped_column(String(32), nullable=False, default="simulation")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="created", index=True)
    created_at: Mapped[str] = mapped_column(String(64), nullable=False)
    updated_at: Mapped[str] = mapped_column(String(64), nullable=False)
    applied_mitigation_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    verification_passed: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    verification_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reset_of_run_id: Mapped[Optional[str]] = mapped_column(
        String(64), ForeignKey("runs.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    events: Mapped[List["RunEventModel"]] = relationship(
        "RunEventModel",
        back_populates="run",
        cascade="all, delete-orphan",
        order_by="RunEventModel.sequence",
    )
    verification_results: Mapped[List["VerificationResultModel"]] = relationship(
        "VerificationResultModel",
        back_populates="run",
        cascade="all, delete-orphan",
        order_by="VerificationResultModel.evaluated_at",
    )


class RunEventModel(Base):
    """Persisted append-only workflow event log."""

    __tablename__ = "run_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    run_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    stage: Mapped[str] = mapped_column(String(64), nullable=False)
    occurred_at: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationship
    run: Mapped["RunModel"] = relationship("RunModel", back_populates="events")

    __table_args__ = (
        UniqueConstraint("run_id", "sequence", name="uq_run_events_run_id_sequence"),
        Index("ix_run_events_run_id_sequence", "run_id", "sequence"),
    )


class VerificationResultModel(Base):
    """Persisted named assertion evaluation outcome."""

    __tablename__ = "verification_results"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    run_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assertion_id: Mapped[str] = mapped_column(String(64), nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    evaluated_at: Mapped[str] = mapped_column(String(64), nullable=False)
    limitations: Mapped[str] = mapped_column(Text, nullable=False)
    details_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationship
    run: Mapped["RunModel"] = relationship("RunModel", back_populates="verification_results")


def create_tables(engine) -> None:
    """Idempotently create all database tables if they do not exist."""
    Base.metadata.create_all(bind=engine, checkfirst=True)
