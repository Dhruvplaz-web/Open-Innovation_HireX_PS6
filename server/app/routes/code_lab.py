"""
SkillBridge In-Browser Code Lab & AST Auditor Route Module.
Integrates the complete Algorithmic Code Lab & AST Auditor engine from app.code_lab.
Maintains 100% backwards compatibility for legacy endpoints (/challenges, /run, /audit-ast)
while serving all Code Lab 2.0 endpoints (/overview, /prove-my-skills, /submit, /run-sql, etc.).
"""
from app.code_lab.routes_code_lab import (
    router,
    RunCodeRequest,
    AuditASTRequest,
)

__all__ = ["router", "RunCodeRequest", "AuditASTRequest"]

