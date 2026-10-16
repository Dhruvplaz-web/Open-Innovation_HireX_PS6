from fastapi import APIRouter
from pydantic import BaseModel
from app.agents.placement_agent import agent

router = APIRouter(prefix="/api/agent", tags=["AI Agent"])

class AgentChatRequest(BaseModel):
    user_role: str = "student"
    user_id: str = "std_1"
    message: str

@router.post("/chat")
def chat_with_agent(req: AgentChatRequest):
    response = agent.execute_prompt(
        user_role=req.user_role,
        user_id=req.user_id,
        message=req.message
    )
    return response
