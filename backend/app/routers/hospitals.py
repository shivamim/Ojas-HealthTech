import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.tenant import require_tenant
from app.core.encryption import decrypt_field
from app.models.hospital import Hospital

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

class HospitalUpdate(BaseModel):
    name: str = None
    city: str = None
    state: str = None
    bed_count: int = None
    nabh_level: str = None
    logo_url: str = None
    settings: dict = None

@router.get("/me")
async def get_my_hospital(request: Request, db: AsyncSession = Depends(get_db)):
    hospital_id = require_tenant(request)
    if not hospital_id:
        raise HTTPException(400, "No hospital context")

    result = await db.execute(select(Hospital).where(Hospital.id == uuid.UUID(hospital_id)))
    h = result.scalar_one_or_none()
    if not h:
        raise HTTPException(404, "Hospital not found")

    return {
        "id": str(h.id),
        "name": h.name,
        "city": h.city,
        "state": h.state,
        "bed_count": h.bed_count,
        "nabh_level": h.nabh_level,
        "contact_email": decrypt_field(h.contact_email),
        "contact_phone": decrypt_field(h.contact_phone),
        "logo_url": h.logo_url,
        "settings": h.settings or {}
    }

@router.put("/me")
async def update_my_hospital(req: HospitalUpdate, request: Request, db: AsyncSession = Depends(get_db)):
    hospital_id = require_tenant(request)
    result = await db.execute(select(Hospital).where(Hospital.id == uuid.UUID(hospital_id)))
    h = result.scalar_one_or_none()
    if not h:
        raise HTTPException(404, "Hospital not found")

    if req.name: h.name = req.name
    if req.city: h.city = req.city
    if req.state: h.state = req.state
    if req.bed_count: h.bed_count = req.bed_count
    if req.nabh_level: h.nabh_level = req.nabh_level
    if req.logo_url: h.logo_url = req.logo_url
    if req.settings: h.settings = req.settings

    await db.commit()
    return {"message": "Hospital updated"}
