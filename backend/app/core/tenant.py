from fastapi import Request, HTTPException
from app.core.security import decode_token

async def tenant_middleware(request: Request, call_next):
    request.state.hospital_id = None
    request.state.role = None
    request.state.user_id = None

    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        payload = decode_token(auth.replace("Bearer ", ""))
        if payload:
            request.state.user_id = payload.get("user_id")
            request.state.hospital_id = payload.get("hospital_id")
            request.state.role = payload.get("role")

    response = await call_next(request)
    return response

def require_tenant(request: Request):
    if request.state.role == "SUPER_ADMIN":
        return None
    if not request.state.hospital_id:
        raise HTTPException(403, "Hospital context required")
    return request.state.hospital_id
