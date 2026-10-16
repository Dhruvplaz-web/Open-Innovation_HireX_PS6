"""
Skill Extraction & Normalization Engine
Extracts potential technical competencies from:
- Resume text
- GitHub profile / repositories
- Project title & description
- Project README.md and documentation files
- Manually declared project technologies

Applies case-folding, canonical alias mapping, deduplication, and source tracking.
Enforces the sovereign rule: DETECTED ≠ VERIFIED.
"""

import re
from typing import Dict, Any, List, Set

# Comprehensive Canonical Skill Dictionary with alias mapping
CANONICAL_SKILL_MAP = {
    # Languages
    "python": "Python",
    "py": "Python",
    "java": "Java",
    "core java": "Java",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "c++": "C++",
    "cpp": "C++",
    "c": "C",
    "c#": "C#",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "ruby": "Ruby",
    "php": "PHP",
    "kotlin": "Kotlin",
    "swift": "Swift",
    "sql": "SQL",
    "structured query language": "SQL",

    # AI & ML
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "artificial intelligence": "Machine Learning",
    "ai": "Machine Learning",
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "keras": "Keras",
    "scikit-learn": "Scikit-Learn",
    "scikit learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scipy": "SciPy",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "computer vision": "Computer Vision",
    "cv": "Computer Vision",
    "opencv": "Computer Vision",
    "llm": "Machine Learning",
    "generative ai": "Machine Learning",
    "genai": "Machine Learning",

    # Frontend
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "tailwind": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "redux": "Redux",

    # Backend
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node": "Node.js",
    "express": "Express.js",
    "expressjs": "Express.js",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "springboot": "Spring Boot",
    "microservices": "Microservices",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful api": "REST APIs",
    "graphql": "GraphQL",

    # Databases
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",

    # Cloud & DevOps
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",
    "git": "Git",
    "github": "Git",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "linux": "Linux",

    # Core CS
    "data structures": "Data Structures",
    "dsa": "Data Structures",
    "algorithms": "Algorithms",
    "oop": "Object-Oriented Programming",
    "object-oriented programming": "Object-Oriented Programming",
    "system design": "System Design"
}

class SkillExtractor:
    def __init__(self):
        # Sort keys by length descending to match multi-word phrases first
        self.sorted_patterns = sorted(CANONICAL_SKILL_MAP.keys(), key=lambda x: len(x), reverse=True)

    def extract_from_text(self, text: str) -> Set[str]:
        if not text:
            return set()
        text_lower = " " + text.lower() + " "
        found_skills = set()

        for pattern in self.sorted_patterns:
            # Word boundary check
            escaped = re.escape(pattern)
            regex = r'(?:^|[\s,.\-_\(\)\[\]/])' + escaped + r'(?:[\s,.\-_\(\)\[\]/]|$)'
            if re.search(regex, text_lower):
                found_skills.add(CANONICAL_SKILL_MAP[pattern])

        return found_skills

    def extract_from_github_url(self, github_url: str) -> Set[str]:
        if not github_url or "github.com" not in github_url.lower():
            return set()
        
        # Extract potential hints from repo/profile path
        skills = set()
        cleaned = github_url.lower().replace("https://github.com/", "").replace("http://github.com/", "")
        parts = re.split(r'[/_\-\.]', cleaned)
        for part in parts:
            if part in CANONICAL_SKILL_MAP:
                skills.add(CANONICAL_SKILL_MAP[part])
                
        # If a valid github URL is provided without specific tech in name, infer foundational tools
        skills.add("Git")
        return skills

    def extract_all(
        self,
        resume_text: str = "",
        github_url: str = "",
        projects: List[Dict[str, Any]] = None,
        manual_skills: List[str] = None,
        authorized_linkedin_skills: List[str] = None
    ) -> Dict[str, Any]:
        """
        Extracts skills from all verified input sources with strict evidence source tracking:
        Skill
        ├── source: RESUME
        ├── source: GITHUB
        ├── source: LINKEDIN
        ├── source: PROJECT
        └── source: ASSESSMENT

        IMPORTANT LINKEDIN LIMITATION GUARANTEE:
        - The current LinkedIn OAuth/OIDC permissions (openid, profile, email) do NOT provide
          LinkedIn Skills, Experience, Education, or Certifications.
        - Therefore, skills are NEVER inferred from a student's LinkedIn URL.
        - Only data actually returned by an authorized LinkedIn API with skill permissions is ever
          assigned the 'LINKEDIN' evidence source.
        """
        projects = projects or []
        manual_skills = manual_skills or []
        authorized_linkedin_skills = authorized_linkedin_skills or []

        # Map: skill_name -> list of source identifiers ("RESUME", "GITHUB", "PROJECT", "ASSESSMENT", "LINKEDIN")
        detected_map: Dict[str, List[str]] = {}

        # 1. Resume extraction (source: RESUME)
        resume_skills = self.extract_from_text(resume_text)
        for s in resume_skills:
            detected_map.setdefault(s, []).append("RESUME")

        # 2. GitHub profile extraction (source: GITHUB)
        github_skills = self.extract_from_github_url(github_url)
        for s in github_skills:
            detected_map.setdefault(s, []).append("GITHUB")

        # 3. Project information & multiple READMEs (source: PROJECT)
        for idx, p in enumerate(projects, 1):
            p_name = p.get("name") or p.get("title") or f"Project {idx}"
            p_desc = p.get("description", "")
            p_repo = p.get("github_repo_url", "")
            p_techs = p.get("technologies", [])
            doc_files = p.get("documentation_files", [])

            # From project title & desc
            p_text = f"{p_name} {p_desc} {p_repo}"
            p_skills = self.extract_from_text(p_text)
            for s in p_skills:
                detected_map.setdefault(s, []).append("PROJECT")

            # From multiple README/doc files
            for doc in doc_files:
                doc_content = doc.get("content", "")
                doc_skills = self.extract_from_text(doc_content)
                for s in doc_skills:
                    detected_map.setdefault(s, []).append("PROJECT")

            # From manual tech tags
            for tech in p_techs:
                norm = CANONICAL_SKILL_MAP.get(tech.lower().strip(), tech.strip())
                if norm:
                    detected_map.setdefault(norm, []).append("PROJECT")

        # 4. Authorized LinkedIn API Data (source: LINKEDIN)
        # ONLY create LINKEDIN evidence from data actually returned by the authorized LinkedIn API
        for l_skill in authorized_linkedin_skills:
            norm = CANONICAL_SKILL_MAP.get(l_skill.lower().strip(), l_skill.strip())
            if norm:
                detected_map.setdefault(norm, []).append("LINKEDIN")

        # 5. Self-Declared Manual input skills
        for m in manual_skills:
            norm = CANONICAL_SKILL_MAP.get(m.lower().strip(), m.strip())
            if norm:
                detected_map.setdefault(norm, []).append("SELF_DECLARED")

        # Format output with strict evidence source attribution
        detected_list = []
        source_counts = {"RESUME": 0, "GITHUB": 0, "PROJECT": 0, "LINKEDIN": 0, "ASSESSMENT": 0}

        for skill_name, raw_sources in detected_map.items():
            unique_sources = list(dict.fromkeys(raw_sources))
            for src in unique_sources:
                if src in source_counts:
                    source_counts[src] += 1

            detected_list.append({
                "skill": skill_name,
                "sources": unique_sources,
                "evidence_sources": unique_sources,
                "primary_source": unique_sources[0] if unique_sources else "RESUME",
                "state": "DETECTED",
                "is_verified": False,
                "note": "DETECTED ≠ VERIFIED. Must be confirmed and evaluated through assessment."
            })

        # Sort alphabetically
        detected_list.sort(key=lambda x: x["skill"])

        return {
            "status": "success",
            "total_detected": len(detected_list),
            "evidence_counts": source_counts,
            "linkedin_data_limitation": {
                "status": "Not available through current LinkedIn permissions",
                "message": (
                    "Current authorized LinkedIn scopes ('openid profile email') provide basic profile identity only. "
                    "LinkedIn Skills, Experience, Education, and Certifications are not accessible through these scopes. "
                    "SkillBridge accurately uses student Resume, GitHub, and Projects as primary objective evidence."
                )
            },
            "notice": "DETECTED ≠ VERIFIED. A detected skill is not automatically a verified skill. Review and select skills to be assessed on.",
            "detected_skills": detected_list
        }

# Global singleton
skill_extractor = SkillExtractor()

def normalize_skill(skill: str) -> str:
    """Normalize a skill name against canonical skill map or return clean stripped."""
    if not skill:
        return ""
    clean = skill.strip()
    return CANONICAL_SKILL_MAP.get(clean.lower(), clean)

