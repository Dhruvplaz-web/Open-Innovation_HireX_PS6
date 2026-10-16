"""
LinkedIn OAuth 2.0 / OpenID Connect Data Models and Security Services.

Encapsulates:
- LinkedIn Connection models
- Minimal data storage schema
- Authenticated cryptographic token encryption (never plaintext)
- OAuth state generation & CSRF protection
- Input validation for LinkedIn Profile URLs
"""

import os
import re
import time
import base64
import hashlib
import hmac
import secrets
from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

# ----------------------------------------------------
# 1. ENUMS & SCHEMAS
# ----------------------------------------------------

class ConnectionStatus(str, Enum):
    CONNECTED = "CONNECTED"
    NOT_CONNECTED = "NOT_CONNECTED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"
    ERROR = "ERROR"

class LinkedInConnection(BaseModel):
    """
    LinkedIn Connection Model.
    Stores ONLY necessary information permitted by OpenID Connect (openid, profile, email).
    Does NOT store unnecessary data or fake fields (skills, experience, etc.).
    Tokens are stored only in encrypted format.
    """
    student_id: str
    linkedin_subject_id: str
    linkedin_profile_url: Optional[str] = ""
    linkedin_name: str
    linkedin_email: Optional[str] = ""
    linkedin_email_verified: bool = False
    linkedin_picture_url: Optional[str] = ""
    linkedin_connected_at: int = Field(default_factory=lambda: int(time.time()))
    linkedin_updated_at: int = Field(default_factory=lambda: int(time.time()))
    connection_status: ConnectionStatus = ConnectionStatus.CONNECTED
    # Encrypted token storage - NEVER plaintext
    encrypted_access_token: Optional[str] = None
    token_expires_at: Optional[int] = None
    scope: str = "openid profile email"

class LinkedInStatusResponse(BaseModel):
    student_id: str
    connected: bool
    status: ConnectionStatus
    connection: Optional[LinkedInConnection] = None
    last_synchronized: Optional[str] = None
    granted_scopes: List[str] = ["openid", "profile", "email"]
    available_fields: List[str] = ["sub", "name", "email", "email_verified", "picture"]
    unavailable_fields: Dict[str, str] = {
        "skills": "Not available through current LinkedIn permissions",
        "experience": "Not available through current LinkedIn permissions",
        "education": "Not available through current LinkedIn permissions",
        "certifications": "Not available through current LinkedIn permissions"
    }
    evidence_source_status: str = (
        "Basic identity and professional profile handle verified. "
        "Objective skill evidence remains derived from RESUME, GITHUB, PROJECT, and ASSESSMENT."
    )

class LinkedInDisconnectResponse(BaseModel):
    status: str = "success"
    message: str = "LinkedIn account disconnected successfully."
    student_id: str
    connection_status: ConnectionStatus = ConnectionStatus.NOT_CONNECTED

# ----------------------------------------------------
# 2. PERSISTENT STORAGE REGISTRY
# ----------------------------------------------------

# Primary LinkedIn Connection store keyed by student_id
LINKEDIN_CONNECTIONS: Dict[str, Dict[str, Any]] = {}

# In-memory CSRF OAuth State Registry: state -> {student_id, redirect_to, expires_at}
OAUTH_STATE_STORE: Dict[str, Dict[str, Any]] = {}

# ----------------------------------------------------
# 3. CRYPTOGRAPHIC TOKEN ENCRYPTION / DECRYPTION
# ----------------------------------------------------

_DEFAULT_SECRET = "sb_oauth_token_master_key_2026_secure"

def _derive_keys(secret_key: str, salt: bytes):
    """Derives encryption key and HMAC key from master secret using PBKDF2-HMAC-SHA256."""
    derived = hashlib.pbkdf2_hmac('sha256', secret_key.encode('utf-8'), salt, 100000, 64)
    enc_key = derived[:32]
    mac_key = derived[32:]
    return enc_key, mac_key

def encrypt_access_token(token: str, secret_key: Optional[str] = None) -> str:
    """
    Encrypts a token using authenticated encryption (PBKDF2 + keystream + HMAC-SHA256).
    Produces tamper-evident base64 string with random salt and IV.
    Access tokens are NEVER stored in plaintext.
    """
    if not token:
        return ""
    master_secret = secret_key or os.getenv("LINKEDIN_CLIENT_SECRET") or _DEFAULT_SECRET
    salt = secrets.token_bytes(16)
    iv = secrets.token_bytes(16)
    enc_key, mac_key = _derive_keys(master_secret, salt)

    plaintext = token.encode('utf-8')
    # Generate keystream blocks
    keystream = bytearray()
    counter = 0
    while len(keystream) < len(plaintext):
        block = hashlib.sha256(enc_key + iv + counter.to_bytes(4, 'big')).digest()
        keystream.extend(block)
        counter += 1

    ciphertext = bytes(p ^ k for p, k in zip(plaintext, keystream[:len(plaintext)]))
    tag = hmac.new(mac_key, salt + iv + ciphertext, hashlib.sha256).digest()

    payload = salt + iv + tag + ciphertext
    return "enc_" + base64.urlsafe_b64encode(payload).decode('utf-8')

def decrypt_access_token(encrypted_str: str, secret_key: Optional[str] = None) -> Optional[str]:
    """
    Decrypts an encrypted token string and verifies HMAC authenticity.
    Returns None if signature is invalid or tampered.
    """
    if not encrypted_str or not encrypted_str.startswith("enc_"):
        return None
    try:
        raw_b64 = encrypted_str[4:]
        payload = base64.urlsafe_b64decode(raw_b64.encode('utf-8'))
        if len(payload) < 64:  # salt(16) + iv(16) + tag(32) = 64
            return None
        salt = payload[:16]
        iv = payload[16:32]
        expected_tag = payload[32:64]
        ciphertext = payload[64:]

        master_secret = secret_key or os.getenv("LINKEDIN_CLIENT_SECRET") or _DEFAULT_SECRET
        enc_key, mac_key = _derive_keys(master_secret, salt)

        computed_tag = hmac.new(mac_key, salt + iv + ciphertext, hashlib.sha256).digest()
        if not hmac.compare_digest(expected_tag, computed_tag):
            return None

        keystream = bytearray()
        counter = 0
        while len(keystream) < len(ciphertext):
            block = hashlib.sha256(enc_key + iv + counter.to_bytes(4, 'big')).digest()
            keystream.extend(block)
            counter += 1

        plaintext = bytes(c ^ k for c, k in zip(ciphertext, keystream[:len(ciphertext)]))
        return plaintext.decode('utf-8')
    except Exception:
        return None

# ----------------------------------------------------
# 4. OAUTH STATE & CSRF MANAGEMENT
# ----------------------------------------------------

def generate_oauth_state(student_id: str, redirect_to: str = "workflow") -> str:
    """
    Generates a cryptographically secure random state parameter for OAuth 2.0 flow.
    Associates the state with student_id, redirect destination, and expiration time.
    """
    # Clean expired states
    now = time.time()
    expired = [k for k, v in OAUTH_STATE_STORE.items() if v.get("expires_at", 0) < now]
    for k in expired:
        OAUTH_STATE_STORE.pop(k, None)

    state = secrets.token_urlsafe(32)
    OAUTH_STATE_STORE[state] = {
        "student_id": student_id,
        "redirect_to": redirect_to,
        "created_at": now,
        "expires_at": now + 600  # Valid for 10 minutes
    }
    return state

def validate_and_consume_oauth_state(state: str) -> Optional[Dict[str, Any]]:
    """
    Validates the OAuth state against CSRF attacks.
    If valid and unexpired, consumes (deletes) the state to prevent replay attacks.
    """
    if not state or state not in OAUTH_STATE_STORE:
        return None
    data = OAUTH_STATE_STORE.pop(state)
    if data.get("expires_at", 0) < time.time():
        return None
    return data

# ----------------------------------------------------
# 5. INPUT SANITIZATION & URL VALIDATION
# ----------------------------------------------------

LINKEDIN_URL_PATTERN = re.compile(
    r"^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_\-\.%]+\/?$",
    re.IGNORECASE
)

def validate_linkedin_url(url: Optional[str]) -> bool:
    """
    Validates that a provided LinkedIn URL is well-formed and safe.
    Allows empty strings (optional field).
    Rejects JavaScript, data URIs, or non-LinkedIn domains.
    """
    if not url:
        return True
    cleaned = url.strip()
    if not cleaned:
        return True
    return bool(LINKEDIN_URL_PATTERN.match(cleaned))

def normalize_linkedin_url(url: Optional[str]) -> str:
    """Normalizes LinkedIn URL to standard canonical format."""
    if not url:
        return ""
    cleaned = url.strip()
    if not cleaned:
        return ""
    if not cleaned.startswith("http://") and not cleaned.startswith("https://"):
        cleaned = "https://" + cleaned
    return cleaned.rstrip("/")
