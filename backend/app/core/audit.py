from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog
from datetime import datetime

async def log_audit(db: AsyncSession, user_id: str, hospital_id: str, action: str, resource: str, resource_id: str = None, ip: str = "", user_agent: str = "", success: bool = True, details: dict = None):
    log = AuditLog(
        user_id=user_id,
        hospital_id=hospital_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        ip_address=ip,
        user_agent=user_agent,
        success=success,
        details=details or {}
    )
    db.add(log)
    await db.commit()
