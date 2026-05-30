import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime, date, timezone
from typing import Optional

from app.core.database import get_db
from app.core.tenant import require_tenant
from app.core.encryption import encrypt_field, decrypt_field
from app.core.rbac import Permission, require_permission
from app.core.audit import log_audit
from app.models.patient import Patient
from app.models.checkin import CheckIn
from app.models.escalation import Escalation
from app.models.timeline import TimelineEvent
from app.models.user import User
from app.services.ai_scoring import calculate_risk_score
from app.services.readmission_risk import predict_readmission_risk
from app.services.whatsapp import send_whatsapp_message

router = APIRouter(prefix="/patients", tags=["Patients"])


class PatientCreate(BaseModel):
    full_name: str
    mobile: str
    family_mobile: str
    age: int
    surgery_type: str
    discharge_date: date
    doctor_name: str
    doctor_specialty: str
    bed_number: str
    uhid: str
    instructions: str = "Keep wound dry. Take prescribed medicines. Walk daily."


class PatientUpdate(BaseModel):
    status: Optional[str] = None
    current_day: Optional[int] = None
    instructions: Optional[str] = None


@router.post("")
@require_permission(Permission.PATIENT_CREATE)
async def create_patient(req: PatientCreate, request: Request, db: AsyncSession = Depends(get_db)):
    hospital_id = require_tenant(request)

    patient = Patient(
        hospital_id=uuid.UUID(hospital_id) if hospital_id else None,
        full_name=encrypt_field(req.full_name),
        mobile=encrypt_field(req.mobile),
        family_mobile=encrypt_field(req.family_mobile),
        age=req.age,
        surgery_type=req.surgery_type,
        discharge_date=datetime.combine(req.discharge_date, datetime.min.time()),
        doctor_name=encrypt_field(req.doctor_name),
        doctor_specialty=req.doctor_specialty,
        bed_number=encrypt_field(req.bed_number),
        uhid=encrypt_field(req.uhid),
        instructions=req.instructions,
        status="ACTIVE",
        current_day=1,
        total_days=14
    )
    db.add(patient)
    await db.flush()

    # Create 14-day checkin schedule
    for day in range(1, 15):
        checkin = CheckIn(
            patient_id=patient.id,
            day_number=day,
            status="PENDING"
        )
        db.add(checkin)

    # Timeline event
    event = TimelineEvent(
        patient_id=patient.id,
        event_type="ENROLLMENT",
        title="Patient Enrolled",
        description=f"{req.full_name} enrolled for {req.surgery_type} post-discharge monitoring.",
        day_number=0
    )
    db.add(event)

    # Send welcome WhatsApp (simulation if no API key)
    await send_whatsapp_message(req.mobile, f"Welcome to Ojas Recovery Monitoring, {req.full_name}! You will receive daily check-ins for 14 days. Reply to this message if you need help.")

    await db.commit()
    await log_audit(db, request.state.user_id, hospital_id, "CREATE", "patients", str(patient.id), request.client.host if request.client else "", request.headers.get("user-agent", ""))

    return {"id": str(patient.id), "message": "Patient enrolled", "checkins_created": 14}


@router.get("")
@require_permission(Permission.PATIENT_READ)
async def list_patients(request: Request, db: AsyncSession = Depends(get_db), status: str = None, page: int = 1, limit: int = 20):
    hospital_id = require_tenant(request)

    # FIX: Super Admin sees all patients, others see only their hospital
    query = select(Patient)
    if hospital_id:
        query = query.where(Patient.hospital_id == uuid.UUID(hospital_id))
    
    if status:
        query = query.where(Patient.status == status)

    # Pagination
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    patients = result.scalars().all()

    data = []
    for p in patients:
        data.append({
            "id": str(p.id),
            "full_name": decrypt_field(p.full_name),
            "age": p.age,
            "surgery_type": p.surgery_type,
            "discharge_date": p.discharge_date.isoformat() if p.discharge_date else None,
            "doctor_name": decrypt_field(p.doctor_name),
            "status": p.status,
            "current_day": p.current_day,
            "response_rate": p.response_rate,
            "risk_score": p.risk_score,
            "risk_level": p.risk_level,
            "readmission_risk": p.readmission_risk
        })

    return {"data": data, "total": total, "page": page, "limit": limit}


@router.get("/{patient_id}")
@require_permission(Permission.PATIENT_READ)
async def get_patient(patient_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    hospital_id = require_tenant(request)

    # FIX: Super Admin can access any patient
    query = select(Patient).where(Patient.id == uuid.UUID(patient_id))
    if hospital_id:
        query = query.where(Patient.hospital_id == uuid.UUID(hospital_id))
    
    result = await db.execute(query)
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Patient not found")

    checkins_result = await db.execute(select(CheckIn).where(CheckIn.patient_id == p.id).order_by(CheckIn.day_number))
    checkins = checkins_result.scalars().all()

    timeline_result = await db.execute(select(TimelineEvent).where(TimelineEvent.patient_id == p.id).order_by(TimelineEvent.day_number))
    timeline = timeline_result.scalars().all()

    return {
        "id": str(p.id),
        "full_name": decrypt_field(p.full_name),
        "mobile": decrypt_field(p.mobile),
        "family_mobile": decrypt_field(p.family_mobile),
        "age": p.age,
        "surgery_type": p.surgery_type,
        "discharge_date": p.discharge_date.isoformat() if p.discharge_date else None,
        "doctor_name": decrypt_field(p.doctor_name),
        "doctor_specialty": p.doctor_specialty,
        "bed_number": decrypt_field(p.bed_number),
        "uhid": decrypt_field(p.uhid),
        "status": p.status,
        "current_day": p.current_day,
        "instructions": p.instructions,
        "response_rate": p.response_rate,
        "risk_score": p.risk_score,
        "risk_level": p.risk_level,
        "readmission_risk": p.readmission_risk,
        "checkins": [{"day": c.day_number, "status": c.status, "risk_level": c.risk_level, "responses": c.responses} for c in checkins],
        "timeline": [{"day": t.day_number, "type": t.event_type, "title": t.title, "description": t.description} for t in timeline]
    }


# FIX: Added @require_permission decorator
@router.post("/{patient_id}/checkin/{day}")
@require_permission(Permission.PATIENT_UPDATE)
async def submit_checkin(patient_id: str, day: int, request: Request, db: AsyncSession = Depends(get_db), responses: dict = None):
    hospital_id = require_tenant(request)

    # FIX: Super Admin can access any patient for checkin
    query = select(Patient).where(Patient.id == uuid.UUID(patient_id))
    if hospital_id:
        query = query.where(Patient.hospital_id == uuid.UUID(hospital_id))
    
    result = await db.execute(query)
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Patient not found")

    checkin_result = await db.execute(select(CheckIn).where(CheckIn.patient_id == p.id, CheckIn.day_number == day))
    checkin = checkin_result.scalar_one_or_none()
    if not checkin:
        raise HTTPException(404, "Checkin not found")

    checkin.status = "COMPLETED"
    checkin.replied_at = datetime.now(timezone.utc)  # FIX: timezone-aware
    checkin.responses = responses or {}
    checkin.pain_level = int(responses.get("pain", 0)) if responses else None

    # AI Risk Scoring
    ai_result = calculate_risk_score(checkin.responses, {"response_rate": p.response_rate})
    checkin.risk_score = ai_result["score"]
    checkin.risk_level = ai_result["level"]
    checkin.risk_reasons = ai_result["reasons"]

    # Update patient aggregate risk
    p.risk_score = ai_result["score"]
    p.risk_level = ai_result["level"]

    # Update readmission risk
    p.readmission_risk = predict_readmission_risk(p)

    # Calculate response rate
    total = len(p.checkins)
    completed = sum(1 for c in p.checkins if c.status == "COMPLETED")
    p.response_rate = (completed / total) * 100 if total > 0 else 0
    p.current_day = day

    # Timeline
    event = TimelineEvent(
        patient_id=p.id,
        event_type="CHECKIN",
        title=f"Day {day} Check-in Completed",
        description=f"Pain: {responses.get('pain', 'N/A
