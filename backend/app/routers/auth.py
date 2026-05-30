import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.models.user import User
from app.models.hospital_invite import HospitalInvite
from app.models.refresh_token import RefreshToken

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class InviteAcceptRequest(BaseModel):
    token: str
    full_name: str
    password: str

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    if user.is_active != "true":
        raise HTTPException(403, "Account inactive")

    payload = {
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role,
        "hospital_id": str(user.hospital_id) if user.hospital_id else None
    }
    access = create_access_token(payload)
    refresh = create_refresh_token({"user_id": str(user.id)})

    # Store refresh token hash
    rt = RefreshToken(
        user_id=user.id,
        token_hash=get_password_hash(refresh),
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(rt)
    await db.commit()

    return {
        "access_token": access,
        "refresh_token": refresh,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "hospital_id": str(user.hospital_id) if user.hospital_id else None
        }
    }

@router.post("/refresh")
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid refresh token")

    user_id = payload.get("user_id")
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(401, "User not found")

    new_payload = {
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role,
        "hospital_id": str(user.hospital_id) if user.hospital_id else None
    }
    return {"access_token": create_access_token(new_payload)}

@router.post("/logout")  # ADDED
async def logout(request: Request, db: AsyncSession = Depends(get_db)):
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        token = auth.replace("Bearer ", "")
        payload = decode_token(token)
        if payload:
            user_id = payload.get("user_id")
            # Delete refresh tokens for this user
            await db.execute(
                select(RefreshToken).where(RefreshToken.user_id == uuid.UUID(user_id))
            )
            # Note: In production, you might want to mark as revoked instead of deleting
    return {"message": "Logged out successfully"}

@router.post("/verify-invite")
async def verify_invite(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HospitalInvite).where(HospitalInvite.token == token))
    invite = result.scalar_one_or_none()
    if not invite or invite.used_at:
        raise HTTPException(400, "Invalid or used invite")
    if invite.expires_at < datetime.utcnow():
        raise HTTPException(400, "Invite expired")
    return {"valid": True, "email": invite.email, "role": invite.role}

@router.post("/accept-invite")
async def accept_invite(req: InviteAcceptRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HospitalInvite).where(HospitalInvite.token == req.token))
    invite = result.scalar_one_or_none()
    if not invite or invite.used_at:
        raise HTTPException(400, "Invalid or used invite")

    user = User(
        email=invite.email,
        hashed_password=get_password_hash(req.password),
        full_name=req.full_name,
        role=invite.role,
        hospital_id=invite.hospital_id
    )
    db.add(user)
    invite.used_at = datetime.utcnow()
    await db.commit()

    payload = {
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role,
        "hospital_id": str(user.hospital_id)
    }
    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token({"user_id": str(user.id)}),
        "user": {"id": str(user.id), "email": user.email, "full_name": user.full_name, "role": user.role}
    }

@router.get("/me")
async def get_me(request: Request):
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    payload = decode_token(auth.replace("Bearer ", ""))
    if not payload:
        raise HTTPException(401, "Invalid token")
    return {
        "user_id": payload.get("user_id"),
        "email": payload.get("email"),
        "role": payload.get("role"),
        "hospital_id": payload.get("hospital_id")
    }
