"""
HireX — Aptitude Arena Module Packager
Packages the entire Gamified & Standardized Aptitude Arena subsystem into a self-contained,
production-ready ZIP archive with standalone installer and documentation.
"""

import os
import shutil
import zipfile

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
ZIP_OUTPUT = os.path.join(BASE_DIR, "HireX_Aptitude_Arena_Module.zip")
STAGING_DIR = os.path.join(BASE_DIR, "_staging_aptitude_module")

# Clean staging dir if exists
if os.path.exists(STAGING_DIR):
    shutil.rmtree(STAGING_DIR)
os.makedirs(STAGING_DIR, exist_ok=True)

# 1. Define files to copy
files_to_copy = [
    # Server Backend
    ("server/app/routes/aptitude.py", "server/app/routes/aptitude.py"),
    ("server/app/services/aptitude_service.py", "server/app/services/aptitude_service.py"),
    ("server/app/data/aptitude_bank_seed.py", "server/app/data/aptitude_bank_seed.py"),
    ("server/app/data/aptitude_data.py", "server/app/data/aptitude_data.py"),
    ("server/tests/test_aptitude_system.py", "server/tests/test_aptitude_system.py"),
    
    # Client View & Game Components
    ("client/src/views/AptitudeArenaView.tsx", "client/src/views/AptitudeArenaView.tsx"),
    ("client/src/components/aptitude/games/CognitiveFlexibilityGame.tsx", "client/src/components/aptitude/games/CognitiveFlexibilityGame.tsx"),
    ("client/src/components/aptitude/games/DynamicSpatialGame.tsx", "client/src/components/aptitude/games/DynamicSpatialGame.tsx"),
    ("client/src/components/aptitude/games/EmotionRecognitionGame.tsx", "client/src/components/aptitude/games/EmotionRecognitionGame.tsx"),
    ("client/src/components/aptitude/games/InformationProcessingGame.tsx", "client/src/components/aptitude/games/InformationProcessingGame.tsx"),
    ("client/src/components/aptitude/games/MazePressureGame.tsx", "client/src/components/aptitude/games/MazePressureGame.tsx"),
    ("client/src/components/aptitude/games/PlanningStrategyGame.tsx", "client/src/components/aptitude/games/PlanningStrategyGame.tsx"),
    ("client/src/components/aptitude/games/ResourceManagementGame.tsx", "client/src/components/aptitude/games/ResourceManagementGame.tsx"),
    ("client/src/components/aptitude/games/RiskRewardGame.tsx", "client/src/components/aptitude/games/RiskRewardGame.tsx"),
    ("client/src/components/aptitude/games/WorkingMemoryGame.tsx", "client/src/components/aptitude/games/WorkingMemoryGame.tsx"),
    
    # Client Proctoring Subsystem (Used directly by Aptitude Arena)
    ("client/src/services/proctoringEngine.ts", "client/src/services/proctoringEngine.ts"),
    ("client/src/services/proctoring/proctoringConfig.ts", "client/src/services/proctoring/proctoringConfig.ts"),
    ("client/src/services/proctoring/proctoringEngine.ts", "client/src/services/proctoring/proctoringEngine.ts"),
    ("client/src/services/proctoring/proctoringStateMachine.ts", "client/src/services/proctoring/proctoringStateMachine.ts"),
    ("client/src/services/proctoring/proctoringViolationEngine.ts", "client/src/services/proctoring/proctoringViolationEngine.ts"),
]

for src_rel, dst_rel in files_to_copy:
    src_path = os.path.join(BASE_DIR, src_rel)
    dst_path = os.path.join(STAGING_DIR, dst_rel)
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dst_path)
    else:
        print(f"[WARN] File not found: {src_path}")

# 2. Automated Installer Script inside Staging
installer_script = '''#!/usr/bin/env python3
"""
HireX Aptitude Arena Intelligent Drop-in Installer.
Installs and integrates the Aptitude Arena module into any target HireX installation:
- Automatically detects project root directory.
- Copies all backend services, seed banks, test suites, and frontend components.
- Integrates the router in server/app/main.py if not already present.
- Executes the test suite to verify 100% test integrity.
"""

import os
import sys
import shutil
import subprocess
import re

def log(msg):
    print(f"[HireX Aptitude Installer] {msg}")

def find_project_root():
    cwd = os.path.abspath(os.getcwd())
    if os.path.exists(os.path.join(cwd, "server")) and os.path.exists(os.path.join(cwd, "client")):
        return cwd
    script_dir = os.path.abspath(os.path.dirname(__file__))
    if os.path.exists(os.path.join(script_dir, "server")) and os.path.exists(os.path.join(script_dir, "client")):
        return script_dir
    parent = os.path.dirname(script_dir)
    if os.path.exists(os.path.join(parent, "server")) and os.path.exists(os.path.join(parent, "client")):
        return parent
    return None

def main():
    root_dir = find_project_root()
    if not root_dir:
        print("[ERROR] Could not locate HireX project root directory (containing 'server' and 'client').")
        sys.exit(1)

    log(f"Target HireX root: {root_dir}")
    source_dir = os.path.abspath(os.path.dirname(__file__))

    # 1. Copy Files
    for root, dirs, files in os.walk(source_dir):
        for f in files:
            if f in ["apply_aptitude_patch.py", "README_APTITUDE_ARENA.md"]:
                continue
            src_full = os.path.join(root, f)
            rel = os.path.relpath(src_full, source_dir)
            dst_full = os.path.join(root_dir, rel)
            os.makedirs(os.path.dirname(dst_full), exist_ok=True)
            shutil.copy2(src_full, dst_full)
            log(f"Installed: {rel}")

    # 2. Patch server/app/main.py if router not included
    main_py = os.path.join(root_dir, "server", "app", "main.py")
    if os.path.exists(main_py):
        with open(main_py, "r", encoding="utf-8") as f:
            content = f.read()
        if "aptitude" not in content:
            if "from app.routes import" in content:
                content = re.sub(r"from app\\.routes import ([^\\n]+)", r"from app.routes import \\1, aptitude", content, count=1)
            if "app.include_router(aptitude.router)" not in content:
                content = content.replace("app.include_router(", "app.include_router(aptitude.router)\\napp.include_router(", 1)
            with open(main_py, "w", encoding="utf-8") as f:
                f.write(content)
            log("Patched server/app/main.py with aptitude.router")
        else:
            log("server/app/main.py already configured with aptitude router.")

    # 3. Run validation tests
    log("Running automated validation test suite (pytest)...")
    env = os.environ.copy()
    env["PYTHONPATH"] = os.path.join(root_dir, "server")
    try:
        res = subprocess.run(
            [sys.executable, "-m", "pytest", "server/tests/test_aptitude_system.py"],
            cwd=root_dir,
            env=env,
            capture_output=True,
            text=True
        )
        if res.returncode == 0:
            log("SUCCESS! All 8 Aptitude Arena test cases PASSED (100% green)!")
        else:
            log(f"Pytest return code: {res.returncode}")
            log(f"Pytest output:\\n{res.stdout}\\n{res.stderr}")
    except Exception as e:
        log(f"Note: Could not automatically invoke pytest: {e}")

    log("Aptitude Arena installation complete!")

if __name__ == "__main__":
    main()
'''

with open(os.path.join(STAGING_DIR, "apply_aptitude_patch.py"), "w", encoding="utf-8") as f:
    f.write(installer_script)

# 3. Comprehensive README
readme_content = '''# 🎯 HireX: Gamified & Standardized Aptitude Arena Subsystem

The **Aptitude Arena** is HireX's cognitive assessment engine combining:
1. **Standardized Exam & Practice Modes**: 450+ vetted questions across 9 aptitude domains with step-by-step mathematical explanations.
2. **Gamified Cognitive Battery**: 9 interactive mini-games measuring reaction time, executive function, working memory, risk tolerance, and spatial reasoning.
3. **Strict Zero-Repeat Engine**: Cryptographic question hashes and per-student attempt tracking ensuring questions are never repeated in test attempts.
4. **Universal AI Proctoring**: Face tracking, gaze direction, audio levels, tab-switching deterrence, 3-strike dismissal protocol, and server-side immutable audit trails.

---

## 📦 What Is Included

### 1. Backend Modules (`server/`)
- `server/app/routes/aptitude.py`:
  - `GET /api/aptitude/overview`: Returns question counts, student mastery, and completion percentages for 9 categories.
  - `GET /api/aptitude/practice/questions`: Practice questions with step-by-step explanations.
  - `POST /api/aptitude/practice/submit`: Instant answer evaluation and explanation feedback.
  - `POST /api/aptitude/test/start`: Starts timed 20-minute test attempt with strict non-repeat filtering and mode locking (`NORMAL` or `PROCTORED`).
  - `GET /api/aptitude/attempts/active`: Resumes interrupted test attempts seamlessly.
  - `POST /api/aptitude/test/submit`: Computes server-side composite score (`Accuracy: 70%`, `Difficulty: 20%`, `Time: 10%`).
  - `POST /api/aptitude/gamified/battery/submit`: Normalizes raw mini-game telemetry into 9 standardized 0-100 cognitive dimension metrics.
  - `POST /api/aptitude/ai/generate-batch`: AI question generation with SHA-256 deduplication.
  - `POST /api/aptitude/proctor/event`: Authoritative proctor violation logging and 3-strike termination.
- `server/app/services/aptitude_service.py`:
  - Core in-memory question bank (450+ questions).
  - Attempt timer management, strike tracker, and dismissal state.
  - Cognitive dimension normalization algorithms.
- `server/app/data/aptitude_bank_seed.py`:
  - 450+ seed questions categorized into 9 distinct categories (Numerical, Verbal, Quantitative, Abstract, Spatial, Deductive, Mechanical, Data Sufficiency, Error Checking).
- `server/app/data/aptitude_data.py`:
  - Foundation aptitude problems with step-by-step derivations.
- `server/tests/test_aptitude_system.py`:
  - 8 automated test suites verifying question bank size, strict no-repeat rule, composite scoring, gamified battery normalization, SHA-256 deduplication, and mode locking.

### 2. Frontend Modules (`client/`)
- `client/src/views/AptitudeArenaView.tsx`:
  - Main unified interface supporting Normal Practice, Normal Test, Gamified Practice, and Gamified Battery.
  - Universal proctoring pre-check modal (Camera, Face Detection, Microphone).
  - Live proctor HUD with warning modals (Warning 1, Final Warning 2, Dismissal 3).
  - Instant results screen with radar / bar cognitive dimension breakdown.
- `client/src/components/aptitude/games/` (9 Interactive Games):
  - `RiskRewardGame.tsx` (Balloon Analog Risk Task - BART: evaluates risk vs reward calibration)
  - `WorkingMemoryGame.tsx` (N-Back sequence memory)
  - `CognitiveFlexibilityGame.tsx` (Dynamic rule-switching challenge)
  - `DynamicSpatialGame.tsx` (2D/3D mental orientation and rotation)
  - `PlanningStrategyGame.tsx` (Minimum-moves goal planning)
  - `InformationProcessingGame.tsx` (Rapid stimulus discrimination)
  - `ResourceManagementGame.tsx` (Constraint optimization & allocation)
  - `EmotionRecognitionGame.tsx` (Social intelligence & micro-expression detection)
  - `MazePressureGame.tsx` (Spatial navigation under time decay pressure)
- `client/src/services/proctoringEngine.ts`:
  - Re-exports the complete browser-based proctoring and violation detection engine.

---

## 🚀 Quick Installation

To install this module on another machine or project:
1. Extract `HireX_Aptitude_Arena_Module.zip` into your project root.
2. Run the automated installer:
   ```bash
   python apply_aptitude_patch.py
   ```
3. Run the test suite:
   ```bash
   python -m pytest server/tests/test_aptitude_system.py
   ```

---

## 🎮 9 Standardized Cognitive Dimensions

| Dimension | Mini-Game | Metric Measured |
| :--- | :--- | :--- |
| **Risk Tolerance** | Balloon Risk/Reward | Pumping threshold before pop vs. banked points |
| **Working Memory** | N-Back Flash | Sequence recall accuracy under latency |
| **Cognitive Flexibility** | Rule Switcher | Task-switching speed penalty (switch-cost ms) |
| **Spatial Visualization** | Mental Rotation | 3D angular match accuracy |
| **Strategic Planning** | Sequence Planner | Extra moves taken above optimal solution |
| **Processing Speed** | Stimulus Blitz | Accurate reactions per second |
| **Resource Allocation** | Capacity Manager | System stability & final resource margin |
| **Social Cognition** | Emotion Reader | Micro-expression recognition accuracy |
| **Resilience Under Pressure** | Countdown Maze | Error rate under active timer decay |
'''

with open(os.path.join(STAGING_DIR, "README_APTITUDE_ARENA.md"), "w", encoding="utf-8") as f:
    f.write(readme_content)

# 4. Create the Zip file
with zipfile.ZipFile(ZIP_OUTPUT, "w", zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(STAGING_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, STAGING_DIR)
            zipf.write(full_path, arcname)

# Clean staging dir
shutil.rmtree(STAGING_DIR)

print(f"[SUCCESS] Packaged Aptitude Arena Module Zip: {ZIP_OUTPUT}")
print(f"File size: {os.path.getsize(ZIP_OUTPUT):,} bytes")

# Also copy to parent directories for convenient access
copy_destinations = [
    os.path.join(os.path.dirname(BASE_DIR), "HireX_Aptitude_Arena_Module.zip"),
    os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), "HireX_Aptitude_Arena_Module.zip"),
    os.path.join(BASE_DIR, "aptitude_arena.zip")
]

for dst in copy_destinations:
    try:
        shutil.copy2(ZIP_OUTPUT, dst)
        print(f"[SUCCESS] Copied to: {dst}")
    except Exception as e:
        print(f"[WARN] Could not copy to {dst}: {e}")
