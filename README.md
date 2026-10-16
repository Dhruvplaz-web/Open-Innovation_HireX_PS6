# HireX — AI-Powered Talent Intelligence & Campus Placement Engine

> **Domain:** AI-ML, Autonomous Agentic AI & Verified Skill Infrastructure  
> **Team:** Team Dominator (JSPM RSCOE, Pune)  
> **Team Members:** Yuvraj Kadam, Nimisha Joshi, Khushi Patil, Dhruv Patil  
> **Repository:** [https://github.com/Yuvi1981/HireX](https://github.com/Yuvi1981/HireX)  

---

## 🌟 Overview
**HireX** bridges the critical disconnect between higher education curricula and corporate hiring. We replace unverified resume claims with **in-browser AST code verification**, real-time **curriculum telemetry**, and **explainable AI matching** to connect engineering students, recruiters, and placement directorates with mathematical certainty.

Unlike fragmented recruitment portals, HireX delivers a unified, high-performance soft-card command center with persona switching for:
- 🎓 **Students:** Skill Passport, AST Code Lab, Aptitude Arena, and AI Mock Interviews.
- 💼 **Recruiters:** Bias-free semantic vector matching, verified candidate shortlisting, and drive pipelines.
- 🏛️ **Academicians & TPOs:** Live curriculum desynchronization index, placement analytics, and eligibility rosters.
- 🛡️ **Platform Governance:** DPDP Act 2023 compliance, audit logs, and institutional verification standards.

---

## 🧠 Sovereign AI-ML & Agentic AI Engines

### 1. Objective Skill Verifier (Multi-Signal Ridge Model)
- **Problem Solved:** Self-reported resume inflation and unverified buzzwords.
- **Model Architecture:** Multi-signal Ridge regression calibrating proctored test telemetry, code AST complexity, and project repositories into a standardized competency score (0–100).
- **Latency:** < 2ms (local in-memory execution).

### 2. Explainable Semantic Job Matcher (Vector Overlap Model)
- **Problem Solved:** Black-box ATS keyword rejections without transparency.
- **Model Architecture:** Semantic vector overlap and weighted skill intersection that calculates exact match percentages, highlights missing skills, and explains hiring rationale.

### 3. Skill Demand Trend Forecaster (Polynomial Trend Model)
- **Problem Solved:** Reactive university syllabi lagging years behind industry demand.
- **Model Architecture:** Polynomial trend regression forecasting 6-month demand curves across emerging tech (FastAPI, Docker, Agentic AI) against college syllabi.

### 4. Autonomous HireX Co-Pilot (6-Tool ReAct Orchestrator)
- **Problem Solved:** Static dashboards requiring manual data synthesis.
- **Capabilities:** Autonomous action plan generation, instant code AST proofs, ATS compatibility analysis, and drive eligibility gatekeeping.

---

## 📁 Repository Structure

```text
HireX/
├── server/                     # Python FastAPI backend & sovereign ML models
│   ├── app/
│   │   ├── ml/                 # 6 Local ML Models & Trend Analyzers
│   │   ├── agents/             # Autonomous HireX Co-Pilot ReAct Orchestrator
│   │   ├── code_lab/           # AST code complexity engine
│   │   ├── data/               # Seed data (Engineering colleges & live vacancies)
│   │   ├── routes/             # REST endpoints for all 4 roles
│   │   └── main.py             # FastAPI entrypoint
│   ├── requirements.txt
│   └── run_server.py
├── client/                     # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── public/                 # High-res favicon.svg, robots.txt, sitemap.xml
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # HireXLogo, SEOHead, CookieBanner, GlobalFooter
│   │   │   ├── layout/         # TopNavBar, LeftIconRail
│   │   │   ├── cards/          # HeroPerformance, AgentChatDrawer, ScoreCards
│   │   │   └── modals/         # AuthModal, LegalModal, AboutModal, ContactModal
│   │   ├── views/              # LandingPage, Dashboard, CodeLab, Portals
│   │   ├── services/           # Resilient API services with fallbacks
│   │   └── types/              # Strict TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile                  # Production container definition
├── docker-compose.yml          # Multi-container orchestration
├── nginx.conf                  # Production reverse proxy configuration
├── start_hirex.bat             # 1-Click Windows Batch launcher
├── start_hirex.ps1             # 1-Click PowerShell launcher
└── README.md
```

---

## 🚀 Quick Start Guide

### Option 1: One-Click Windows Launchers (Fastest)
Double-click `start_hirex.bat` or run:
```powershell
.\start_hirex.ps1
```
* **Frontend Web App:** `http://localhost:5173`  
* **Backend API:** `http://localhost:8000`  
* **Interactive API Docs (Swagger):** `http://localhost:8000/docs`  

### Option 2: 🐳 Docker & Docker Compose
```bash
# Build and run all services in background
docker compose up -d --build

# View container logs
docker compose logs -f
```

### Option 3: 💻 Manual Development
```bash
# 1. Start Python Backend
python server/run_server.py

# 2. Start Vite Client (in another terminal)
cd client
npm install
npm run dev
```

---

## 🔒 Security & Regulatory Compliance
- **DPDP Act 2023 (India):** Data sovereignty with local processing; zero third-party commercial data export.
- **Accessibility:** Built according to WCAG 2.1 AA standards with full keyboard navigation and high-contrast color tokens.
- **AICTE & NEP 2020 Aligned:** Micro-credentialing, skill credit verification, and national recruitment telemetry.

---

## 📜 License
Developed with pride by **Team Dominator** for the academic and enterprise technology ecosystem.
