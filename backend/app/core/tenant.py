from fastapi import Request

def require_tenant(request: Request):
    """Extract hospital_id from JWT token in request state"""
    hospital_id = getattr(request.state, "hospital_id", None)
    return hospital_id
