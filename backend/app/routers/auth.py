@router.post("/login", response_model=TokenResponse)
async def login(
    req: LoginRequest, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    print(f"🔐 Login attempt: {req.email}")
    
    try:
        result = await db.execute(select(User).where(User.email == req.email))
        user = result.scalar_one_or_none()
    except Exception as e:
        print(f"💥 DB query failed: {e}")
        raise HTTPException(500, f"Database error: {str(e)}")

    if not user:
        print(f"❌ User not found: {req.email}")
        raise HTTPException(401, "Invalid credentials")

    print(f"✅ User found: {user.email}, role: {user.role}, active: {user.is_active}")
    
    try:
        password_valid = verify_password(req.password, user.hashed_password)
    except Exception as e:
        print(f"💥 Password verify error: {e}")
        raise HTTPException(500, f"Password verification error: {str(e)}")

    if not password_valid:
        print(f"❌ Invalid password for: {req.email}")
        raise HTTPException(401, "Invalid credentials")

    if not user.is_active:
        raise HTTPException(403, "Account inactive or suspended")
    
    # ... rest of login code stays the same
