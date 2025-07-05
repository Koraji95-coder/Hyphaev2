from fastapi import APIRouter, UploadFile, File
import random

router = APIRouter()


@router.get("/market/{symbol}/history")
async def market_history(symbol: str):
    # Placeholder historical data
    prices = [round(random.uniform(10, 100), 2) for _ in range(30)]
    return {"symbol": symbol, "prices": prices}


@router.get("/market-context/{symbol}")
async def market_context(symbol: str):
    return {"symbol": symbol, "context": "No context available"}


@router.get("/news")
async def news():
    return {"news": []}


@router.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    data = await file.read()
    return {"filename": file.filename, "size": len(data)}
