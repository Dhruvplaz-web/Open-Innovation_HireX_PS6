"""
Standalone FastAPI Server for Algorithmic Code Lab & AST Auditor
Run directly via:
    python standalone_server.py
or
    uvicorn standalone_server:app --port 8000 --reload
"""
import sys
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes_code_lab import router as code_lab_router

app = FastAPI(
    title="SkillBridge Algorithmic Code Lab & AST Auditor API",
    description="Deterministic AST complexity analysis, multi-dimensional sandbox execution, and cryptographic proof-of-skill generation.",
    version="2.0.0"
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the Code Lab router
app.include_router(code_lab_router)

@app.get("/")
def root():
    return {
        "module": "Algorithmic Code Lab & AST Auditor",
        "version": "2.0.0",
        "status": "online",
        "documentation": "/docs",
        "endpoints": [
            "/api/code-lab/overview",
            "/api/code-lab/prove-my-skills",
            "/api/code-lab/challenges",
            "/api/code-lab/submit",
            "/api/code-lab/run-sql",
            "/api/code-lab/missions",
            "/api/code-lab/mistake-intelligence",
            "/api/code-lab/skill-matrix",
            "/api/code-lab/audit-ast",
            "/api/code-lab/audit-repo"
        ]
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "code_lab_engine", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    print("\n=================================================================")
    print("  SkillBridge Algorithmic Code Lab & AST Auditor Server")
    print("  Listening on: http://127.0.0.1:8000")
    print("  Swagger Docs: http://127.0.0.1:8000/docs")
    print("=================================================================\n")
    uvicorn.run("standalone_server:app", host="127.0.0.1", port=8000, reload=True)
