import uuid
import secrets
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta

from app.core.database import get_db, engine, Base
from app.core.rbac import Permission, require_permission
from app.core.encryption import encrypt_field
from app.models.hospital import Hospital
from app.models.user import User
from app.models.hospital_invite import HospitalInvite
from app.models.patient import Patient
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/superadmin", tags=["SuperAdmin"])


class HospitalCreate(BaseModel):
    name: str
    city: str
    state: str
    bed_count: int = 100
    nabh_level: str = "Entry Level"
    contact_email: EmailStr
    contact_phone: str


class InviteCreate(BaseModel):
    email: EmailStr
    role: str = "HOSPITAL_ADMIN"


@router.post("/hospitals")
@require_permission(Permission.HOSPITAL_MANAGE)
async def create_hospital(req: HospitalCreate, request: Request, db: AsyncSession = Depends(get_db)):
    if request.state.role != "SUPER_ADMIN":
        raise HTTPException(403, "Superadmin only")

    hospital = Hospital(
        name=req.name,
        city=req.city,
        state=req.state,
        bed_count=req.bed_count,
        nabh_level=req.nabh_level,
        contact_email=encrypt_field(req.contact_email),
        contact_phone=encrypt_field(req.contact_phone)
    )
    db.add(hospital)
    await db.commit()
    await db.refresh(hospital)
    return {"id": str(hospital.id), "name": hospital.name, "message": "Hospital created"}


@router.get("/hospitals")
@require_permission(Permission.HOSPITAL_MANAGE)
async def list_hospitals(request: Request, db: AsyncSession = Depends(get_db)):
    if request.state.role != "SUPER_ADMIN":
        raise HTTPException(403, "Superadmin only")

    result = await db.execute(select(Hospital).where(Hospital.is_active == True))
    hospitals = result.scalars().all()

    data = []
    for h in hospitals:
        patient_count = await db.execute(select(func.count()).select_from(Patient).where(Patient.hospital_id == h.id))
        data.append({
            "id": str(h.id),
            "name": h.name,
            "city": h.city,
            "state": h.state,
            "bed_count": h.bed_count,
            "nabh_level": h.nabh_level,
            "plan_type": h.plan_type,
            "patient_count": patient_count.scalar(),
            "created_at": h.created_at.isoformat() if h.created_at else None
        })
    return data


@router.get("/hospitals/{hospital_id}")
@require_permission(Permission.HOSPITAL_MANAGE)
async def get_hospital(hospital_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    if request.state.role != "SUPER_ADMIN":
        raise HTTPException(403, "Superadmin only")

    result = await db.execute(select(Hospital).where(Hospital.id == uuid.UUID(hospital_id)))
    h = result.scalar_one_or_none()
    if not h:
        raise HTTPException(404, "Hospital not found")

    patient_count = await db.execute(select(func.count()).select_from(Patient).where(Patient.hospital_id == h.id))
    user_count = await db.execute(select(func.count()).select_from(User).where(User.hospital_id == h.id))

    return {
        "id": str(h.id),
        "name": h.name,
        "city": h.city,
        "state": h.state,
        "bed_count": h.bed_count,
        "nabh_level": h.nabh_level,
        "patient_count": patient_count.scalar(),
        "user_count": user_count.scalar(),
        "settings": h.settings
    }


@router.post("/hospitals/{hospital_id}/invite")
@require_permission(Permission.HOSPITAL_MANAGE)
async def invite_user(hospital_id: str, req: InviteCreate, request: Request, db: AsyncSession = Depends(get_db)):
    if request.state.role != "SUPER_ADMIN":
        raise HTTPException(403, "Superadmin only")

    token = secrets.token_urlsafe(32)
    invite = HospitalInvite(
        hospital_id=uuid.UUID(hospital_id),
        email=req.email,
        role=req.role,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=48),
        created_by=uuid.UUID(request.state.user_id) if request.state.user_id else None
    )
    db.add(invite)
    await db.commit()

    return {
        "message": "Invite created",
        "token": token,
        "link": f"https://ojas.care/accept-invite?token={token}"
    }


@router.get("/audit-logs")
@require_permission(Permission.HOSPITAL_MANAGE)
async def get_audit_logs(request: Request, db: AsyncSession = Depends(get_db), limit: int = 100):
    if request.state.role != "SUPER_ADMIN":
        raise HTTPException(403, "Superadmin only")

    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit))
    logs = result.scalars().all()
    return [{
        "id": str(l.id),
        "user_id": str(l.user_id) if l.user_id else None,
        "hospital_id": str(l.hospital_id) if l.hospital_id else None,
        "action": l.action,
        "resource": l.resource,
        "ip_address": l.ip_address,
        "timestamp": l.timestamp.isoformat() if l.timestamp else None,
        "success": l.success
    } for l in logs]


@router.post("/reset-database")
@require_permission(Permission.HOSPITAL_MANAGE)
async def reset_database(request: Request, db: AsyncSession = Depends(get_db)):
    if request.state.role != "SUPER_ADMIN":
        raise HTTPException(403, "Superadmin only")
    
    if request.headers.get("X-Reset-Key") != "ojas-reset-2026":
        raise HTTPException(403, "Reset key required")
    
    tables = [
        "refresh_tokens", "audit_logs", "timeline_events", 
        "escalations", "checkins", "patients", 
        "users", "hospital_invites", "hospitals"
    ]
    
    for table in tables:
        try:
            await db.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
        except:
            pass
    
    await db.commit()
    
    # FIX: Use engine.begin() instead of db.begin()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Run seed
    from seed_data import seed
    await seed()
    
    return {"message": "Database reset and seeded successfully"}
