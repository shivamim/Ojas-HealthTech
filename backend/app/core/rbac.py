from enum import Enum
from functools import wraps
from fastapi import HTTPException

class Permission(Enum):
    PATIENT_CREATE = "patient:create"
    PATIENT_READ = "patient:read"
    PATIENT_UPDATE = "patient:update"
    PATIENT_DELETE = "patient:delete"
    REPORT_GENERATE = "report:generate"
    USER_MANAGE = "user:manage"
    HOSPITAL_MANAGE = "hospital:manage"
    SUPERADMIN = "superadmin"

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

def require_permission(permission: Permission):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = kwargs.get("request") or args[0] if args else None
            if not request:
                for arg in args:
                    if hasattr(arg, "state"):
                        request = arg
                        break

            role = getattr(request.state, "role", None) if request else None
            perms = PERMISSION_MAP.get(role, [])
            if permission not in perms:
                raise HTTPException(403, "Insufficient permissions")
            return await func(*args, **kwargs)
        return wrapper
    return decorator
