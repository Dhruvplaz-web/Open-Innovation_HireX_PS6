"""
HireX Skill Ontology & Synonym Normalization Engine
Maps 150+ technology variants, aliases, and misspellings to canonical industry entities.
Provides context-aware regex boundary extraction to prevent false positives (e.g. 'Go' vs English 'go').
"""

import re
import difflib
from typing import Dict, List, Set, Tuple, Optional

# --- CANONICAL SKILL MAPPINGS (150+ tech terms across 7 domains) ---
CANONICAL_SKILL_MAP: Dict[str, str] = {
    # Frontend & Web
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "react js": "React",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "next js": "Next.js",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "angular.js": "Angular",
    "svelte": "Svelte",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "bootstrap": "Bootstrap",
    "redux": "Redux",
    "redux toolkit": "Redux",
    "rtk": "Redux",

    # Backend & Frameworks
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node js": "Node.js",
    "node": "Node.js",
    "express": "Express.js",
    "expressjs": "Express.js",
    "express.js": "Express.js",
    "fastapi": "FastAPI",
    "fast-api": "FastAPI",
    "flask": "Flask",
    "django": "Django",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "spring-boot": "Spring Boot",
    "spring boot": "Spring Boot",
    ".net": ".NET",
    "dotnet": ".NET",
    "asp.net": "ASP.NET",
    "aspnet": "ASP.NET",
    "graphql": "GraphQL",
    "rest": "REST APIs",
    "restful": "REST APIs",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "grpc": "gRPC",
    "microservices": "Microservices",
    "micro-services": "Microservices",
    "microservice": "Microservices",

    # Programming Languages
    "python": "Python",
    "python3": "Python",
    "py": "Python",
    "java": "Java",
    "core java": "Java",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "c-sharp": "C#",
    "c": "C",
    "golang": "Go",
    "go lang": "Go",
    "go": "Go",
    "rust": "Rust",
    "php": "PHP",
    "ruby": "Ruby",
    "kotlin": "Kotlin",
    "swift": "Swift",
    "dart": "Dart",
    "scala": "Scala",
    "sql": "SQL",

    # Databases & Caching
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mysql": "MySQL",
    "my-sql": "MySQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",
    "sqlite3": "SQLite",
    "oracle": "Oracle DB",
    "cassandra": "Cassandra",
    "elasticsearch": "Elasticsearch",
    "elastic search": "Elasticsearch",
    "dynamodb": "DynamoDB",
    "firebase": "Firebase",
    "firestore": "Firestore",
    "prisma": "Prisma ORM",
    "drizzle": "Drizzle ORM",
    "sqlalchemy": "SQLAlchemy",

    # Cloud & DevOps
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kube": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",
    "google cloud platform": "Google Cloud",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "jenkins": "Jenkins",
    "terraform": "Terraform",
    "linux": "Linux",
    "nginx": "Nginx",

    # AI, ML & Data
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "ai": "Artificial Intelligence",
    "nlp": "Natural Language Processing",
    "computer vision": "Computer Vision",
    "cv": "Computer Vision",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-Learn",
    "scikitlearn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "opencv": "OpenCV",
    "genai": "Generative AI",
    "generative ai": "Generative AI",
    "llm": "LLMs",
    "llms": "LLMs",
    "langchain": "LangChain",
    "rag": "RAG Architecture",

    # Testing & Architecture
    "jest": "Jest",
    "cypress": "Cypress",
    "selenium": "Selenium",
    "pytest": "Pytest",
    "playwright": "Playwright",
    "system design": "System Design",
    "oop": "Object-Oriented Programming",
    "oops": "Object-Oriented Programming",
    "dsa": "Data Structures & Algorithms",
    "data structures": "Data Structures & Algorithms"
}

# Domain categorization map for candidate analytics
SKILL_DOMAIN_MAP: Dict[str, str] = {
    "React": "Frontend", "Next.js": "Frontend", "Vue.js": "Frontend", "Angular": "Frontend",
    "TypeScript": "Frontend", "JavaScript": "Frontend", "HTML5": "Frontend", "CSS3": "Frontend",
    "Tailwind CSS": "Frontend", "Redux": "Frontend",
    "Node.js": "Backend", "Express.js": "Backend", "FastAPI": "Backend", "Flask": "Backend",
    "Django": "Backend", "Spring Boot": "Backend", ".NET": "Backend", "REST APIs": "Backend",
    "gRPC": "Backend", "Microservices": "Backend", "GraphQL": "Backend",
    "Python": "Language", "Java": "Language", "C++": "Language", "C#": "Language",
    "Go": "Language", "Rust": "Language", "SQL": "Language", "C": "Language",
    "PostgreSQL": "Database", "MySQL": "Database", "MongoDB": "Database", "Redis": "Database",
    "Docker": "DevOps", "Kubernetes": "DevOps", "AWS": "Cloud", "Azure": "Cloud", "Git": "DevOps",
    "Machine Learning": "AI/Data", "Deep Learning": "AI/Data", "PyTorch": "AI/Data", "TensorFlow": "AI/Data",
    "Data Structures & Algorithms": "Core Fundamentals", "System Design": "Core Fundamentals"
}

# Ambiguous short tokens that need strict word boundaries and context checks
AMBIGUOUS_TOKENS = {"go", "c", "r", "ai", "ml", "ts", "js", "py"}


class SkillOntologyEngine:
    """
    Deterministic skill normalization and alias resolution engine.
    """

    @classmethod
    def normalize_skill(cls, raw_skill: str) -> str:
        """
        Normalizes a single skill string or alias into its canonical form.
        Supports exact match and fuzzy edit distance match (Levenshtein <= 2).
        """
        if not raw_skill or not isinstance(raw_skill, str):
            return ""

        cleaned = raw_skill.strip().lower()
        # Direct dictionary match
        if cleaned in CANONICAL_SKILL_MAP:
            return CANONICAL_SKILL_MAP[cleaned]

        # Handle punctuation normalization (e.g. "react-js" -> "react js")
        alt_cleaned = re.sub(r'[-_]', ' ', cleaned)
        if alt_cleaned in CANONICAL_SKILL_MAP:
            return CANONICAL_SKILL_MAP[alt_cleaned]

        # Fuzzy match for minor typos (e.g., "pyhton" -> "python", "postgress" -> "postgres")
        # Only fuzzy match tokens with length >= 4 to avoid corrupting short acronyms
        if len(cleaned) >= 4:
            matches = difflib.get_close_matches(cleaned, CANONICAL_SKILL_MAP.keys(), n=1, cutoff=0.82)
            if matches:
                return CANONICAL_SKILL_MAP[matches[0]]

        # Fallback: Capitalize words neatly
        return raw_skill.strip().title()

    @classmethod
    def extract_and_normalize_skills(cls, text: str) -> List[str]:
        """
        Scans unstructured text and extracts all recognizable canonical skills.
        Uses boundaries to prevent matching 'Go' in 'good' or 'C' in 'CAT'.
        """
        if not text:
            return []

        found_skills: Set[str] = set()
        lowered_text = text.lower()

        # 1. Multi-word and punctuation-specific keys first (longer phrases take priority)
        sorted_keys = sorted(CANONICAL_SKILL_MAP.keys(), key=lambda k: len(k), reverse=True)

        for key in sorted_keys:
            if key in AMBIGUOUS_TOKENS:
                # Strict boundary for short tokens
                # E.g. \bgo\b but not "go to" or "let's go"
                pattern = r'(?i)\b' + re.escape(key) + r'\b'
                if re.search(pattern, text):
                    # Extra heuristic: check if surrounded by technical context or other tech terms
                    if key == "go" and not re.search(r'(?i)\b(golang|go language|backend in go|go developer|python|docker)\b', text):
                        continue
                    found_skills.add(CANONICAL_SKILL_MAP[key])
            else:
                pattern = r'(?i)(?:\b|(?<=[^a-zA-Z0-9]))' + re.escape(key) + r'(?:\b|(?=[^a-zA-Z0-9]))'
                if re.search(pattern, text):
                    found_skills.add(CANONICAL_SKILL_MAP[key])

        return sorted(list(found_skills))

    @classmethod
    def get_skill_domain(cls, canonical_skill: str) -> str:
        """Returns the domain category for a canonical skill."""
        return SKILL_DOMAIN_MAP.get(canonical_skill, "General Technology")


# Singleton instance
skill_ontology = SkillOntologyEngine()
