import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.tenant import require_tenant
from app.core.rbac import Permission, require_permission
from app.models.escalation import Escalation
from app.models.patient import Patient
from app.models.timeline import TimelineEvent
from app.services.coach_suggestions import get_suggestions

router = APIRouter(prefix="/escalations", tags=["Escalations"])

class ResolveRequest(BaseModel):
    resolution_note: str

@router.get("")
@require_permission(Permission.PATIENT_READ)
async def list_escalations(request: Request, db: AsyncSession = Depends(get_db), status: str = "OPEN"):
    hospital_id = require_tenant(request)

    query = select(Escalation).join(Patient).where(Patient.hospital_id == uuid.UUID(hospital_id))
    if status:
        query = query.where(Escalation.status == status)

    result = await db.execute(query.order_by(Escalation.created_at.desc()))
    escalations = result.scalars().all()

    data = []
    for e in escalations:
        patient_result = await db.execute(select(Patient).where(Patient.id == e.patient_id))
        p = patient_result.scalar_one_or_none()
        data.append({
            "id": str(e.id),
            "patient_id": str(e.patient_id),
            "patient_name": p.full_name if p else "Unknown",
            "level": e.level,
            "status": e.status,
            "trigger_type": e.trigger_type,
            "trigger_detail": e.trigger_detail,
            "description": e.description,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "suggestions": get_suggestions(e.trigger_type, p.doctor_name if p else "Doctor")
        })
    return data

@router.post("/{escalation_id}/resolve")
@require_permission(Permission.PATIENT_UPDATE)
async def resolve_escalation(escalation_id: str, req: ResolveRequest, request: Request, db: AsyncSession = Depends(get_db)):
    hospital_id = require_tenant(request)

    result = await db.execute(select(Escalation).where(Escalation.id == uuid.UUID(escalation_id)))
    e = result.scalar_one_or_none()
    if not e:
        raise HTTPException(404, "Escalation not found")

    # Verify patient belongs to hospital
    patient_result = await db.execute(select(Patient).where(Patient.id == e.patient_id, Patient.hospital_id == uuid.UUID(hospital_id)))
    p = patient_result.scalar_one_or_none()
    if not p:
        raise HTTPException(403, "Not authorized")

    e.status = "RESOLVED"
    e.resolution_note = req.resolution_note
    e.resolved_at = datetime.utcnow()
    e.resolved_by = uuid.UUID(request.state.user_id) if request.state.user_id else None

    # Update patient status if no more open escalations
    open_count_result = await db.execute(select(Escalation).where(Escalation.patient_id == e.patient_id, Escalation.status == "OPEN"))
    if len(open_count_result.scalars().all()) == 0:
        p.status = "ACTIVE"

    event = TimelineEvent(
        patient_id=e.patient_id,
        event_type="HUMAN_ACTION",
        title="Escalation Resolved",
        description=req.resolution_note,
        day_number=p.current_day
    )
    db.add(event)

    await db.commit()
    return {"message": "Escalation resolved"}
