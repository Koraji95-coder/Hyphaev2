from fastapi import APIRouter

router = APIRouter()

@router.get("/plugins/list")
async def list_plugins():
    return {"status": "ok", "plugins": []}

@router.post("/plugins/execute")
async def execute_plugin(data: dict):
    return {"status": "ok", "result": None}

@router.post("/plugins/chain")
async def execute_plugin_chain(data: dict):
    return {"status": "ok", "results": []}
