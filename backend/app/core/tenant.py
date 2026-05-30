from fastapi import Request, HTTPException
import uuid

async def tenant_middleware(request: Request, call_next):
    # SKIP: OPTIONS requests (CORS preflight)
    if request.method == "OPTIONS":
        return await call_next(request)
    
    # SKIP: Health check, docs, root
    path = request.url.path
    if path in ["/", "/health", "/docs", "/openapi.json", "/api/v1/auth/login", "/api/v1/auth/refresh"]:
        return await call_next(request)
    
    # Extract tenant from token
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        token = auth.replace("Bearer ", "")
        from app.core.security import decode_token
        payload = decode_token(token)
        if payload:
            request.state.user_id = payload.get("user_id")
            request.state.role = payload.get("role")
            request.state.hospital_id = payload.get("hospital_id")
        else:
            request.state.user_id = None
            request.state.role = None
            request.state.hospital_id = None
    else:
        request.state.user_id = None
        request.state.role = None
        request.state.hospital_id = None
    
    return await call_next(request)

def require_tenant(request: Request):
    hospital_id = getattr(request.state, "hospital_id", None)
    return hospital_id
