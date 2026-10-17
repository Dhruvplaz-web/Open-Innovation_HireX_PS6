from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import student, recruiter, academician, admin, auth, ai_agent, assessments, aptitude, code_lab, resume, projects, linkedin, sync, alumni

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sovereign AI-ML & Agentic Academia-Industry Bridge for Skill Mapping & Placements"
)

# Enable CORS for local Vite dev server and Render deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(linkedin.router)
app.include_router(student.router)
app.include_router(recruiter.router)
app.include_router(academician.router)
app.include_router(admin.router)
app.include_router(alumni.router)
app.include_router(projects.router)
app.include_router(ai_agent.router)
app.include_router(assessments.router)
app.include_router(aptitude.router)
app.include_router(code_lab.router)
app.include_router(resume.router)
app.include_router(sync.router)

@app.get("/")
def root():
    return {
        "project": "HireX",
        "tagline": "AI-Powered Academia-Industry Collaboration Platform",
        "hackathon": "CRAFTVERSE (PCCOER)",
        "team": "Team Dominator (JSPM RSCOE, Pune)",
        "status": "online",
        "version": settings.APP_VERSION,
        "ml_models_active": [
            "Objective Skill Verifier (Multi-Signal Ridge)",
            "Explainable Semantic Job Matcher (Vector Overlap)",
            "Skill Demand Trend Forecaster (Polynomial Trend)",
            "AST Code Complexity Auditor (Python AST Static Analyzer)",
            "ATS Resume Compatibility & Keyword Scanner",
            "Cryptographic SHA-256 Credential Authenticity Engine"
        ],
        "agent_active": "Autonomous HireX Co-Pilot (6-Tool ReAct Orchestrator)"
    }

@app.get("/health")
def healthcheck():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
