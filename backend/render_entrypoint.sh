#!/bin/bash
set -e

echo "=== Creating tables ==="
python -c "
import asyncio
from app.core.database import engine, Base

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print('Tables created successfully')

asyncio.run(init())
"

echo "=== Seeding data ==="
python seed_data.py

echo "=== Starting server ==="
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
