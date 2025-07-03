from fastapi import APIRouter

router = APIRouter()

@router.post("/sporelink/analyze")
async def analyze_market(prompt: str, context: dict | None = None):
    return {"agent": "sporelink", "response": "analysis", "timestamp": "now"}

@router.get("/sporelink/market/{symbol}")
async def get_market_data(symbol: str):
    return {"status": "ok", "data": {}, "cached": False}

@router.get("/sporelink/news")
async def get_market_news(category: str | None = None, limit: int = 10):
    return {"status": "ok", "news": [], "cached": False}

@router.get("/sporelink/health")
async def sporelink_health():
    return {"status": "ok"}
