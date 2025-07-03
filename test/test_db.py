import asyncio
from db.database import connect_db, close_db, get_db

async def main():
    await connect_db()
    print("Connected to database.")
    # Use a session to run a quick check
    async for db in get_db():
        try:
            result = await db.execute("SELECT 1")
            print("DB Result:", result.scalar())
            db_ok = True
        except Exception as e:
            print("DB Error:", e)
            db_ok = False
        break  # Only test one session
    await close_db()
    print("Closed database connection.")
    print("Database health:", db_ok)

if __name__ == "__main__":
    asyncio.run(main())
