"""
Script to package the SkillBridge LinkedIn OAuth 2.0 / OpenID Connect module
into a self-contained, drop-in zip file with an intelligent patch installer.
"""

import os
import shutil
import zipfile

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
ZIP_OUTPUT = os.path.join(BASE_DIR, "SkillBridge_LinkedIn_OAuth_Module.zip")
STAGING_DIR = os.path.join(BASE_DIR, "_staging_linkedin_module")

# Clean staging dir
if os.path.exists(STAGING_DIR):
    shutil.rmtree(STAGING_DIR)
os.makedirs(STAGING_DIR, exist_ok=True)

# 1. Copy Files
files_to_copy = [
    ("server/app/models/__init__.py", "server/app/models/__init__.py"),
    ("server/app/models/linkedin.py", "server/app/models/linkedin.py"),
    ("server/app/routes/linkedin.py", "server/app/routes/linkedin.py"),
    ("server/app/routes/student.py", "server/app/routes/student.py"),
    ("server/app/ml/skill_extractor.py", "server/app/ml/skill_extractor.py"),
    ("server/app/ml/skill_intelligence.py", "server/app/ml/skill_intelligence.py"),
    ("server/app/config.py", "server/app/config.py"),
    ("server/app/main.py", "server/app/main.py"),
    ("server/tests/test_linkedin_oauth.py", "server/tests/test_linkedin_oauth.py"),
    (".env.example", ".env.example"),
    ("server/.env.example", "server/.env.example"),
    ("client/src/types/index.ts", "client/src/types/index.ts"),
    ("client/src/services/api.ts", "client/src/services/api.ts"),
    ("client/src/views/StudentJourneyWorkflowView.tsx", "client/src/views/StudentJourneyWorkflowView.tsx"),
    ("client/src/views/ProfileView.tsx", "client/src/views/ProfileView.tsx"),
    ("client/src/App.tsx", "client/src/App.tsx")
]

for src_rel, dst_rel in files_to_copy:
    src_path = os.path.join(BASE_DIR, src_rel)
    dst_path = os.path.join(STAGING_DIR, dst_rel)
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dst_path)
    else:
        print(f"[WARN] File not found: {src_path}")

# 2. Create the standalone auto-patch installer script inside staging
installer_script = '''#!/usr/bin/env python3
"""
SkillBridge LinkedIn OAuth 2.0 / OpenID Connect Intelligent Patch Installer.
Safely integrates the LinkedIn module into any PC running SkillBridge:
- Detects project root automatically (whether run from root or unzipped folder).
- Backs up existing files (.bak) before modifying.
- Idempotent and non-destructive: intelligently injects router, config, types, and endpoints
  without breaking existing customizations or routing.
- Automatically executes pytest to verify 100% test integrity.
"""

import os
import sys
import shutil
import subprocess
import re

def log(msg):
    print(f"[SkillBridge LinkedIn Installer] {msg}")

def find_project_root():
    # 1. Check current working directory
    cwd = os.path.abspath(os.getcwd())
    if os.path.exists(os.path.join(cwd, "server")) and os.path.exists(os.path.join(cwd, "client")):
        return cwd
    # 2. Check script directory
    script_dir = os.path.abspath(os.path.dirname(__file__))
    if os.path.exists(os.path.join(script_dir, "server")) and os.path.exists(os.path.join(script_dir, "client")):
        return script_dir
    # 3. Check parent of script directory (if unzipped into a subfolder)
    parent = os.path.dirname(script_dir)
    if os.path.exists(os.path.join(parent, "server")) and os.path.exists(os.path.join(parent, "client")):
        return parent
    return None

def backup_file(path):
    if os.path.exists(path):
        bak = path + ".bak"
        if not os.path.exists(bak):
            shutil.copy2(path, bak)
            log(f"Created backup: {os.path.basename(path)}.bak")

def patch_file(path, check_str, patch_fn):
    if not os.path.exists(path):
        log(f"Warning: File not found for patching: {path}")
        return False
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if check_str in content:
        log(f"Already patched / present in {os.path.basename(path)}")
        return True
    backup_file(path)
    new_content = patch_fn(content)
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        log(f"Successfully patched {os.path.basename(path)}")
        return True
    return False

def main():
    root_dir = find_project_root()
    if not root_dir:
        print("[ERROR] Could not find SkillBridge project root (must contain 'server' and 'client' directories).")
        print("Please run this script from the project root or specify the target folder.")
        sys.exit(1)

    log(f"Target SkillBridge project root identified: {root_dir}")
    source_dir = os.path.abspath(os.path.dirname(__file__))

    # 1. Copy Standalone LinkedIn Modules
    standalone_files = [
        "server/app/models/linkedin.py",
        "server/app/routes/linkedin.py",
        "server/tests/test_linkedin_oauth.py"
    ]
    for rel_path in standalone_files:
        src = os.path.join(source_dir, rel_path)
        dst = os.path.join(root_dir, rel_path)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.exists(src) and src != dst:
            backup_file(dst)
            shutil.copy2(src, dst)
            log(f"Copied standalone module: {rel_path}")

    # Ensure __init__.py in models
    models_init = os.path.join(root_dir, "server", "app", "models", "__init__.py")
    if not os.path.exists(models_init):
        with open(models_init, "w", encoding="utf-8") as f:
            f.write('"""Models package."""\\n')
        log("Created server/app/models/__init__.py")

    # 2. Patch server/app/config.py
    config_path = os.path.join(root_dir, "server", "app", "config.py")
    def patch_config(c):
        block = """    # LinkedIn OAuth 2.0 / OpenID Connect
    LINKEDIN_CLIENT_ID: str = os.getenv("LINKEDIN_CLIENT_ID", "")
    LINKEDIN_CLIENT_SECRET: str = os.getenv("LINKEDIN_CLIENT_SECRET", "")
    LINKEDIN_REDIRECT_URI: str = os.getenv(
        "LINKEDIN_REDIRECT_URI",
        "http://localhost:8000/api/auth/linkedin/callback"
    )
    LINKEDIN_FRONTEND_REDIRECT_URI: str = os.getenv(
        "LINKEDIN_FRONTEND_REDIRECT_URI",
        "http://localhost:5173"
    )
    LINKEDIN_AUTH_URL: str = "https://www.linkedin.com/oauth/v2/authorization"
    LINKEDIN_TOKEN_URL: str = "https://www.linkedin.com/oauth/v2/accessToken"
    LINKEDIN_USERINFO_URL: str = "https://api.linkedin.com/v2/userinfo"
    LINKEDIN_SCOPES: str = "openid profile email"\\n"""
        if "class Settings(BaseModel):" in c:
            return c.replace("class Settings(BaseModel):", "class Settings(BaseModel):\\n" + block)
        return c + "\\n" + block
    patch_file(config_path, "LINKEDIN_CLIENT_ID", patch_config)

    # 3. Patch server/app/main.py
    main_path = os.path.join(root_dir, "server", "app", "main.py")
    def patch_main(c):
        # Patch import
        if "from app.routes import" in c and "linkedin" not in c:
            c = re.sub(r"from app\\.routes import ([^\\n]+)", r"from app.routes import \\1, linkedin", c, count=1)
        # Patch router inclusion
        if "linkedin.router" not in c:
            if "app.include_router(auth.router)" in c:
                c = c.replace("app.include_router(auth.router)", "app.include_router(auth.router)\\napp.include_router(linkedin.router)")
            elif "app.include_router(student.router)" in c:
                c = c.replace("app.include_router(student.router)", "app.include_router(linkedin.router)\\napp.include_router(student.router)")
        return c
    patch_file(main_path, "linkedin.router", patch_main)

    # 4. Patch .env.example
    env_example_path = os.path.join(root_dir, ".env.example")
    if os.path.exists(env_example_path):
        def patch_env(c):
            return c + """
# LinkedIn OAuth 2.0 / OpenID Connect
LINKEDIN_CLIENT_ID="your_linkedin_client_id_here"
LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret_here"
LINKEDIN_REDIRECT_URI="http://localhost:8000/api/auth/linkedin/callback"
LINKEDIN_FRONTEND_REDIRECT_URI="http://localhost:5173"
"""
        patch_file(env_example_path, "LINKEDIN_CLIENT_ID", patch_env)

    # 5. Patch client/src/types/index.ts
    types_path = os.path.join(root_dir, "client", "src", "types", "index.ts")
    if os.path.exists(types_path):
        def patch_types(c):
            types_snippet = """
// ====================================================
// LINKEDIN OAUTH 2.0 / OPENID CONNECT TYPES
// ====================================================

export type LinkedInConnectionStatus = 'CONNECTED' | 'NOT_CONNECTED' | 'EXPIRED' | 'REVOKED' | 'ERROR';

export interface LinkedInConnectionProfile {
  student_id: string;
  linkedin_subject_id: string;
  linkedin_profile_url?: string;
  linkedin_name: string;
  linkedin_email?: string;
  linkedin_email_verified: bool;
  linkedin_picture_url?: string;
  linkedin_connected_at: number;
  linkedin_updated_at: number;
  connection_status: LinkedInConnectionStatus;
  scope: string;
}

export interface LinkedInStatusData {
  student_id: string;
  connected: boolean;
  status: LinkedInConnectionStatus;
  connection?: LinkedInConnectionProfile | null;
  last_synchronized?: string | null;
  granted_scopes: string[];
  available_fields: string[];
  unavailable_fields: {
    skills: string;
    experience: string;
    education: string;
    certifications: string;
  };
  evidence_source_status: string;
}
""".replace("bool;", "boolean;")
            return c + "\\n" + types_snippet
        patch_file(types_path, "LinkedInConnectionProfile", patch_types)

    # 6. Run verification pytest
    log("Running automated validation test suite (pytest)...")
    try:
        res = subprocess.run([sys.executable, "-m", "pytest", "server/tests/test_linkedin_oauth.py"], cwd=root_dir, capture_output=True, text=True)
        if res.returncode == 0:
            log("SUCCESS! All LinkedIn OAuth test cases PASSED (100% green)!")
        else:
            log(f"Pytest return code: {res.returncode}")
            log(f"Test output:\\n{res.stdout}\\n{res.stderr}")
    except Exception as e:
        log(f"Notice: Could not automatically invoke pytest: {e}")

    log("LinkedIn OAuth 2.0 / OpenID Connect module installation complete!")

if __name__ == "__main__":
    main()
'''

with open(os.path.join(STAGING_DIR, "apply_linkedin_patch.py"), "w", encoding="utf-8") as f:
    f.write(installer_script)

# 3. Create comprehensive README in staging
readme_content = '''# SkillBridge: Official LinkedIn OAuth 2.0 / OpenID Connect Module

This package contains the complete, production-ready, official **LinkedIn OAuth 2.0 / OpenID Connect (OIDC)** module for the SkillBridge application.

---

## 📦 What Is Included

### 1. Backend Modules (`server/`)
- `server/app/models/linkedin.py`:
  - `LinkedInConnection` (Pydantic model storing only permitted OIDC fields: `student_id`, `linkedin_subject_id`, `linkedin_profile_url`, `linkedin_name`, `linkedin_email`, `linkedin_email_verified`, `linkedin_picture_url`, `linkedin_connected_at`, `connection_status`).
  - Cryptographic token encryption (`encrypt_access_token`, `decrypt_access_token`) using `PBKDF2-HMAC-SHA256` key derivation + random salt/IV + `HMAC-SHA256` tag verification. **Access tokens are NEVER stored in plaintext**.
  - OAuth state CSRF token manager (`generate_oauth_state`, `validate_and_consume_oauth_state`) with 10-minute expiry and single-use consume (prevents replay attacks).
  - LinkedIn URL input validator (`validate_linkedin_url`) with strict scheme and regex sanitization.
- `server/app/routes/linkedin.py`:
  - `GET /api/auth/linkedin/authorize`: Generates cryptographic state and official LinkedIn authorization URL with scopes `openid profile email`. Enforces HTTPS in production.
  - `GET /api/auth/linkedin/callback`: Validates CSRF state, securely exchanges authorization code on backend (`POST https://www.linkedin.com/oauth/v2/accessToken`), decodes & validates ID token claims (`iss`, `aud`, `exp`), retrieves userinfo from `https://api.linkedin.com/v2/userinfo`, prevents duplicate account collisions across students, encrypts access token, associates with existing student ID, records immutable audit trail (`log_audit_trail`), and redirects back to frontend.
  - `GET /api/auth/linkedin/status`: Returns real-time connection status, public profile info, last sync timestamp, and explicit disclosure of unavailable permission fields.
  - `POST /api/auth/linkedin/disconnect`: Revokes SkillBridge connection state, stops future sync, clears encrypted tokens, and logs audit trail.
  - `POST /api/auth/linkedin/simulate-callback`: Deterministic local sandbox endpoint for automated testing without live LinkedIn credentials.
- `server/app/main.py`: Router registration for `linkedin.router`.
- `server/app/config.py`: OAuth configuration constants and environment variables.
- `server/app/routes/student.py`: LinkedIn URL validation in registration and connection metadata in profile completion.
- `server/app/ml/skill_extractor.py`: Strict evidence source hierarchy (`RESUME`, `GITHUB`, `PROJECT`, `ASSESSMENT`, `LINKEDIN`). Zero faking of skills from URLs or basic profiles.
- `server/app/ml/skill_intelligence.py`: Safe default `has_linkedin = False`; only adds LinkedIn evidence when explicitly returned by authorized APIs.
- `server/tests/test_linkedin_oauth.py`: Complete 11-test suite verifying the entire integration.

### 2. Frontend Modules (`client/`)
- `client/src/types/index.ts`: TypeScript interfaces (`LinkedInConnectionProfile`, `LinkedInStatusData`, `LinkedInConnectionStatus`).
- `client/src/services/api.ts`: API service methods (`getLinkedInAuthorizeUrl`, `getLinkedInStatus`, `disconnectLinkedIn`, `simulateLinkedInConnect`).
- `client/src/views/StudentJourneyWorkflowView.tsx`: Step 3 Registration UI with optional LinkedIn URL field, `[Connect LinkedIn]` button, `○ Not connected` / `✓ LinkedIn Connected` status, imported permitted profile preview, real-time sync timestamp, reconnect/disconnect buttons, and permissions notice.
- `client/src/views/ProfileView.tsx`: Dedicated **Professional Profiles** section featuring GitHub (`✓ Connected`) and LinkedIn (`✓ Connected` / `○ Not connected`), sync timestamp, permissions disclaimer, and reconnect/disconnect actions.
- `client/src/App.tsx`: Synchronized URL routing for redirect returns (`?linkedin_status=success` or `error`).

---

## 🚀 Quick 1-Click Installation (Any Other PC)

1. Unzip `SkillBridge_LinkedIn_OAuth_Module.zip` directly into the SkillBridge root folder of the target PC (overwrite/merge files).
2. Run the automated patch validator:
   ```bash
   python apply_linkedin_patch.py
   ```
3. Run tests to confirm 100% success:
   ```bash
   python -m pytest server/tests/test_linkedin_oauth.py
   ```
4. Verify frontend build:
   ```bash
   cd client
   npm run build
   ```

---

## 🔑 Environment Variables

Add to your `.env` (or `server/.env`):

```env
LINKEDIN_CLIENT_ID="your_client_id"
LINKEDIN_CLIENT_SECRET="your_client_secret"
LINKEDIN_REDIRECT_URI="http://localhost:8000/api/auth/linkedin/callback"
LINKEDIN_FRONTEND_REDIRECT_URI="http://localhost:5173"
ENVIRONMENT="development"
```
'''

with open(os.path.join(STAGING_DIR, "README_LINKEDIN_INTEGRATION.md"), "w", encoding="utf-8") as f:
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

print(f"[SUCCESS] Packaged LinkedIn OAuth Module Zip: {ZIP_OUTPUT}")
print(f"File size: {os.path.getsize(ZIP_OUTPUT)} bytes")

# Also copy to parent directory if applicable
parent_dir = os.path.dirname(BASE_DIR)
if os.path.exists(parent_dir) and parent_dir != BASE_DIR:
    parent_zip = os.path.join(parent_dir, "SkillBridge_LinkedIn_OAuth_Module.zip")
    try:
        shutil.copy2(ZIP_OUTPUT, parent_zip)
        print(f"[SUCCESS] Also copied to workspace root: {parent_zip}")
    except Exception as e:
        print(f"[WARN] Could not copy to parent: {e}")

