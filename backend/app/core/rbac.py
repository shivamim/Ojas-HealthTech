from enum import Enum
from functools import wraps
from fastapi import HTTPException, Request, Depends
from app.core.security import decode_token

class Permission(Enum):
    PATIENT_CREATE = "patient:create"
    PATIENT_READ = "patient:read"
    PATIENT_UPDATE = "patient:update"
    PATIENT_DELETE = "patient:delete"
    REPORT_GENERATE = "report:generate"
    USER_MANAGE = "user:manage"
    HOSPITAL_MANAGE = "hospital:manage"

PERMISSION_MAP = {
    "SUPER_ADMIN": [p for p in Permission],
    "HOSPITAL_ADMIN": [
        Permission.PATIENT_CREATE, Permission.PATIENT_READ,
        Permission.PATIENT_UPDATE, Permission.REPORT_GENERATE,
        Permission.USER_MANAGE
    ],
    "COORDINATOR": [
        Permission.PATIENT_CREATE, Permission.PATIENT_READ, Permission.PATIENT_UPDATE
    ],
    "DOCTOR": [Permission.PATIENT_READ, Permission.REPORT_GENERATE]
}

def get_current_user(request: Request):
    """Extract user from token and set request.state"""
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    
    token = auth.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    
    request.state.user_id = payload.get("user_id")
    request.state.role = payload.get("role")
    request.state.hospital_id = payload.get("hospital_id")
    
    return payload

def require_permission(permission: Permission):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = kwargs.get("request")
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            if not request:
                raise HTTPException(403, "Request object not found")

            # Use get_current_user to set request.state
            try:
                get_current_user(request)
            except HTTPException:
                raise HTTPException(403, "Authentication required")

            role = getattr(request.state, "role", None)
            if not role:
                raise HTTPException(403, "Role not found in request")

            perms = PERMISSION_MAP.get(role, [])
            if permission not in perms:
                raise HTTPException(403, "Insufficient permissions")

            return await func(*args, **kwargs)
        return wrapper
    return decorator
