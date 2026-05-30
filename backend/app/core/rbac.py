from enum import Enum
from functools import wraps
from fastapi import HTTPException, Request

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

def require_permission(permission: Permission):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request from kwargs or args
            request = kwargs.get("request")
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
                    # Check if it's a Pydantic model that might have request
                    if hasattr(arg, "request"):
                        request = arg.request
                        break

            if not request:
                raise HTTPException(403, "Request object not found")

            role = getattr(request.state, "role", None)
            if not role:
                raise HTTPException(403, "Role not found in request")

            perms = PERMISSION_MAP.get(role, [])
            if permission not in perms:
                raise HTTPException(403, "Insufficient permissions")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
