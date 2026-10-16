"""
Seed data for SkillBridge platform.
Provides realistic academia, student, recruiter, and market data for Pan-India National context.
"""

import re
from typing import Optional, List, Dict, Any
import hashlib
import time
import uuid

INSTITUTIONS = [
    {"id": "inst_rscoe", "name": "JSPM RSCOE, Pune", "city": "Pune", "state": "Maharashtra"},
    {"id": "inst_coep", "name": "COEP Pune", "city": "Pune", "state": "Maharashtra"}
]

DEPARTMENTS = [
    {"id": "dept_comp", "name": "Computer Engineering", "institution_id": "inst_rscoe"},
    {"id": "dept_mech", "name": "Mechanical Engineering", "institution_id": "inst_rscoe"},
    {"id": "dept_it", "name": "Information Technology", "institution_id": "inst_coep"}
]

def resolve_or_create_institution(college_name: str, city: str = "Pune", state: str = "Maharashtra") -> str:
    name_clean = college_name.strip()
    if not name_clean:
        return "inst_rscoe"
    for inst in INSTITUTIONS:
        if inst["name"].lower() == name_clean.lower() or name_clean.lower() in inst["name"].lower() or inst["name"].lower() in name_clean.lower():
            return inst["id"]
    slug = re.sub(r'[^a-zA-Z0-9]', '', name_clean.lower())[:8]
    new_id = f"inst_{slug}" if slug else f"inst_{len(INSTITUTIONS)+1}"
    if any(i["id"] == new_id for i in INSTITUTIONS):
        new_id = f"inst_{slug}_{len(INSTITUTIONS)+1}"
    INSTITUTIONS.append({
        "id": new_id,
        "name": name_clean,
        "city": city,
        "state": state
    })
    return new_id

def resolve_or_create_department(dept_name: str, institution_id: str) -> str:
    dept_clean = dept_name.strip()
    if not dept_clean:
        return "dept_comp"
    for dept in DEPARTMENTS:
        if dept.get("institution_id") == institution_id and (
            dept["name"].lower() == dept_clean.lower() or 
            dept_clean.lower() in dept["name"].lower() or 
            dept["name"].lower() in dept_clean.lower()
        ):
            return dept["id"]
    slug = re.sub(r'[^a-zA-Z0-9]', '', dept_clean.lower())[:6]
    inst_short = institution_id.replace("inst_", "")[:4]
    new_id = f"dept_{slug}_{inst_short}" if slug else f"dept_{len(DEPARTMENTS)+1}"
    if any(d["id"] == new_id for d in DEPARTMENTS):
        new_id = f"dept_{slug}_{len(DEPARTMENTS)+1}"
    DEPARTMENTS.append({
        "id": new_id,
        "name": dept_clean,
        "institution_id": institution_id
    })
    return new_id


STUDENTS = [
    {
        "id": "std_1",
        "name": "Dhruv Patil",
        "email": "dhruv.patil@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "year": "3rd Year",
        "cgpa": 8.92,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv",
        "verified_score": 88,
        "skills": {
            "Python": {"level": "Advanced", "score": 92, "verified": True},
            "React": {"level": "Advanced", "score": 89, "verified": True},
            "FastAPI": {"level": "Intermediate", "score": 84, "verified": True},
            "Machine Learning": {"level": "Intermediate", "score": 82, "verified": True},
            "Docker": {"level": "Beginner", "score": 68, "verified": False},
            "PostgreSQL": {"level": "Intermediate", "score": 78, "verified": True},
            "Data Structures": {"level": "Advanced", "score": 90, "verified": True}
        },
        "projects_count": 6,
        "assessments_completed": 14,
        "rank_in_college": 4,
        "target_role": "Full-Stack AI Engineer",
        "bio": "Passionate full-stack & AI-ML developer building agentic systems."
    },
    {
        "id": "std_2",
        "name": "Yuvraj Kadam",
        "email": "yuvraj.kadam@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "year": "3rd Year",
        "cgpa": 8.75,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuvraj",
        "verified_score": 85,
        "skills": {
            "Python": {"level": "Advanced", "score": 88, "verified": True},
            "Django": {"level": "Intermediate", "score": 81, "verified": True},
            "Machine Learning": {"level": "Advanced", "score": 86, "verified": True},
            "SQL": {"level": "Intermediate", "score": 79, "verified": True},
            "Docker": {"level": "Intermediate", "score": 74, "verified": True}
        },
        "projects_count": 5,
        "assessments_completed": 12,
        "rank_in_college": 7,
        "target_role": "ML & Data Engineer",
        "bio": "Building scalable ML pipelines and data processing engines."
    },
    {
        "id": "std_3",
        "name": "Nimisha Joshi",
        "email": "nimisha.joshi@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "year": "3rd Year",
        "cgpa": 9.10,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Nimisha",
        "verified_score": 91,
        "skills": {
            "React": {"level": "Advanced", "score": 94, "verified": True},
            "TypeScript": {"level": "Advanced", "score": 91, "verified": True},
            "Node.js": {"level": "Intermediate", "score": 85, "verified": True},
            "UI/UX Design": {"level": "Advanced", "score": 93, "verified": True},
            "Tailwind CSS": {"level": "Advanced", "score": 95, "verified": True}
        },
        "projects_count": 8,
        "assessments_completed": 16,
        "rank_in_college": 2,
        "target_role": "Frontend Architect",
        "bio": "Specializing in micro-interactions, responsive design, and frontend architecture."
    },
    {
        "id": "std_4",
        "name": "Khushi Patil",
        "email": "khushi.patil@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "year": "3rd Year",
        "cgpa": 8.85,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Khushi",
        "verified_score": 87,
        "skills": {
            "Python": {"level": "Advanced", "score": 89, "verified": True},
            "Deep Learning": {"level": "Intermediate", "score": 84, "verified": True},
            "PyTorch": {"level": "Intermediate", "score": 82, "verified": True},
            "Cloud Computing": {"level": "Intermediate", "score": 78, "verified": True},
            "FastAPI": {"level": "Intermediate", "score": 83, "verified": True}
        },
        "projects_count": 6,
        "assessments_completed": 13,
        "rank_in_college": 5,
        "target_role": "AI Research Trainee",
        "bio": "Deep learning enthusiast working on NLP and vision systems."
    },
    {
        "id": "std_5",
        "name": "Rohan Deshmukh",
        "email": "rohan.deshmukh@coep.ac.in",
        "college": "COEP Pune",
        "institution_id": "inst_coep",
        "department": "Information Technology",
        "department_id": "dept_it",
        "year": "4th Year",
        "cgpa": 8.40,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
        "verified_score": 79,
        "skills": {
            "Java": {"level": "Advanced", "score": 88, "verified": True},
            "Spring Boot": {"level": "Intermediate", "score": 80, "verified": True},
            "AWS": {"level": "Beginner", "score": 64, "verified": False},
            "SQL": {"level": "Intermediate", "score": 82, "verified": True}
        },
        "projects_count": 4,
        "assessments_completed": 9,
        "rank_in_college": 18,
        "target_role": "Backend Engineer",
        "bio": "Backend specialist focused on distributed microservices."
    },
    {
        "id": "std_6",
        "name": "Ananya Sharma",
        "email": "ananya.sharma@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "year": "2nd Year",
        "cgpa": 8.65,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
        "verified_score": 81,
        "skills": {
            "Python": {"level": "Intermediate", "score": 84, "verified": True},
            "Data Structures": {"level": "Advanced", "score": 88, "verified": True},
            "C++": {"level": "Advanced", "score": 90, "verified": True},
            "SQL": {"level": "Beginner", "score": 62, "verified": False}
        },
        "projects_count": 3,
        "assessments_completed": 8,
        "rank_in_college": 12,
        "target_role": "Software Engineering Intern",
        "bio": "Sophomore competitive programmer and systems enthusiast."
    },
    {
        "id": "std_7",
        "name": "Siddharth Mane",
        "email": "siddharth.mane@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "year": "4th Year",
        "cgpa": 8.35,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Siddharth",
        "verified_score": 83,
        "skills": {
            "Java": {"level": "Advanced", "score": 86, "verified": True},
            "Spring Boot": {"level": "Intermediate", "score": 75, "verified": True},
            "SQL": {"level": "Advanced", "score": 88, "verified": True},
            "Docker": {"level": "Intermediate", "score": 78, "verified": True}
        },
        "projects_count": 7,
        "assessments_completed": 15,
        "rank_in_college": 9,
        "target_role": "Full-Time Backend Engineer",
        "bio": "Senior graduating engineer looking for distributed backend roles."
    },
    {
        "id": "std_8",
        "name": "Aditya Joshi",
        "email": "aditya.joshi@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Mechanical Engineering",
        "department_id": "dept_mech",
        "year": "3rd Year",
        "cgpa": 8.10,
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya",
        "verified_score": 72,
        "skills": {
            "AutoCAD": {"level": "Advanced", "score": 92, "verified": True},
            "Python": {"level": "Beginner", "score": 58, "verified": False}
        },
        "projects_count": 2,
        "assessments_completed": 4,
        "rank_in_college": 25,
        "target_role": "Robotics & Automation Trainee",
        "bio": "Mechanical engineer specializing in automation robotics."
    }
]

OPPORTUNITIES = [
    {
        "id": "opp_1",
        "title": "Full-Stack AI Developer Intern",
        "company": "Barclays India Innovation Centre",
        "logo_text": "BARCLAYS",
        "location": "Bengaluru & Pune (Hybrid)",
        "stipend": "₹45,000 / month",
        "duration": "6 Months",
        "type": "Internship to PPO",
        "required_skills": ["Python", "React", "FastAPI", "Machine Learning"],
        "good_to_have": ["Docker", "PostgreSQL"],
        "skillRequirements": [
            {"skill": "Python", "importance": "MUST_HAVE", "targetLevel": 80},
            {"skill": "React", "importance": "MUST_HAVE", "targetLevel": 80},
            {"skill": "FastAPI", "importance": "MUST_HAVE", "targetLevel": 75},
            {"skill": "Machine Learning", "importance": "MUST_HAVE", "targetLevel": 75},
            {"skill": "Docker", "importance": "NICE_TO_HAVE", "targetLevel": 65},
            {"skill": "PostgreSQL", "importance": "NICE_TO_HAVE", "targetLevel": 70}
        ],
        "min_verified_score": 80,
        "openings": 4,
        "deadline": "2026-10-30",
        "color_theme": "indigo",
        "description": "Work with the Global Technology team across Bengaluru & Pune to build AI-driven financial copilot services."
    },
    {
        "id": "opp_2",
        "title": "Junior Machine Learning Engineer",
        "company": "TechCorp Innovations",
        "logo_text": "TECHCORP",
        "location": "HITEC City, Hyderabad",
        "stipend": "₹50,000 / month",
        "duration": "6 Months",
        "type": "Full-Time Placement",
        "required_skills": ["Python", "Machine Learning", "PyTorch", "FastAPI"],
        "good_to_have": ["Docker", "Data Structures"],
        "skillRequirements": [
            {"skill": "Python", "importance": "MUST_HAVE", "targetLevel": 85},
            {"skill": "Machine Learning", "importance": "MUST_HAVE", "targetLevel": 80},
            {"skill": "PyTorch", "importance": "MUST_HAVE", "targetLevel": 75},
            {"skill": "FastAPI", "importance": "NICE_TO_HAVE", "targetLevel": 70},
            {"skill": "Docker", "importance": "NICE_TO_HAVE", "targetLevel": 65}
        ],
        "min_verified_score": 82,
        "openings": 2,
        "deadline": "2026-11-15",
        "color_theme": "pink",
        "description": "Develop and deploy deep learning models for predictive maintenance and intelligent automation."
    },
    {
        "id": "opp_3",
        "title": "Frontend Architect Trainee",
        "company": "Persistent Systems",
        "logo_text": "PERSISTENT",
        "location": "Pune & Hyderabad",
        "stipend": "₹38,000 / month",
        "duration": "4 Months",
        "type": "Internship",
        "required_skills": ["React", "TypeScript", "Tailwind CSS"],
        "good_to_have": ["UI/UX Design", "Node.js"],
        "skillRequirements": [
            {"skill": "React", "importance": "MUST_HAVE", "targetLevel": 80},
            {"skill": "TypeScript", "importance": "MUST_HAVE", "targetLevel": 75},
            {"skill": "Tailwind CSS", "importance": "MUST_HAVE", "targetLevel": 70},
            {"skill": "UI/UX Design", "importance": "NICE_TO_HAVE", "targetLevel": 70},
            {"skill": "Node.js", "importance": "NICE_TO_HAVE", "targetLevel": 65}
        ],
        "min_verified_score": 78,
        "openings": 5,
        "deadline": "2026-11-05",
        "color_theme": "peach",
        "description": "Create next-generation web applications with accessible, smooth micro-interactions."
    },
    {
        "id": "opp_4",
        "title": "Cloud & DevOps Associate",
        "company": "Tata Technologies",
        "logo_text": "TATA TECH",
        "location": "Bengaluru & Pune",
        "stipend": "₹42,000 / month",
        "duration": "6 Months",
        "type": "Placement Track",
        "required_skills": ["Docker", "Cloud Computing", "Python", "SQL"],
        "good_to_have": ["Kubernetes", "Linux"],
        "skillRequirements": [
            {"skill": "Docker", "importance": "MUST_HAVE", "targetLevel": 75},
            {"skill": "Cloud Computing", "importance": "MUST_HAVE", "targetLevel": 75},
            {"skill": "Python", "importance": "MUST_HAVE", "targetLevel": 70},
            {"skill": "SQL", "importance": "NICE_TO_HAVE", "targetLevel": 65},
            {"skill": "Kubernetes", "importance": "NICE_TO_HAVE", "targetLevel": 65}
        ],
        "min_verified_score": 75,
        "openings": 3,
        "deadline": "2026-10-28",
        "color_theme": "sky",
        "description": "Architect robust CI/CD pipelines and manage multi-cloud infrastructure."
    },
    {
        "id": "opp_5",
        "title": "High-Throughput Distributed Systems Intern",
        "company": "Flipkart Commerce Labs",
        "logo_text": "FLIPKART",
        "location": "Bellandur, Bengaluru",
        "stipend": "₹65,000 / month",
        "duration": "6 Months",
        "type": "Internship to PPO",
        "required_skills": ["Data Structures", "Java", "Python", "SQL"],
        "good_to_have": ["Kafka", "Redis"],
        "min_verified_score": 85,
        "openings": 4,
        "deadline": "2026-11-20",
        "color_theme": "indigo",
        "description": "Scale distributed inventory caching engines handling millions of transactions per second."
    }
]

COLLEGE_CURRICULUM = {
    "college_name": "JSPM Rajarshi Shahu College of Engineering (RSCOE)",
    "university": "Savitribai Phule Pune University (SPPU)",
    "department": "Computer Engineering",
    "semester": "Semester 6 (3rd Year)",
    "taught_modules": [
        {"subject": "Database Management Systems", "skills": ["SQL", "Relational Algebra", "Normalization"], "hours": 48},
        {"subject": "Computer Networks", "skills": ["TCP/IP", "Socket Programming", "Routing Protocols"], "hours": 45},
        {"subject": "Web Technology", "skills": ["HTML", "CSS", "JavaScript", "PHP"], "hours": 42},
        {"subject": "Software Engineering", "skills": ["Agile", "UML", "SDLC"], "hours": 36},
        {"subject": "Data Science & Big Data", "skills": ["Python", "Pandas", "Basic Stats"], "hours": 45}
    ],
    "missing_industry_skills": [
        {"skill": "FastAPI / Microservices", "market_demand_increase": "+184%", "urgency": "High"},
        {"skill": "Docker & Containerization", "market_demand_increase": "+142%", "urgency": "Critical"},
        {"skill": "Modern React & TypeScript", "market_demand_increase": "+126%", "urgency": "High"},
        {"skill": "Applied LLMs & Agentic AI", "market_demand_increase": "+310%", "urgency": "Critical"},
        {"skill": "Vector DBs & Embeddings", "market_demand_increase": "+220%", "urgency": "Medium"}
    ],
    "overall_curriculum_sync_score": 58,  # Out of 100
    "action_plan": [
        "Incorporate a 4-week Docker & CI/CD module in Web Tech Lab.",
        "Replace PHP practicals with React & FastAPI full-stack projects.",
        "Introduce 1 credit on GenAI & Model Deployment under NEP 2020 framework."
    ]
}

RECRUITER_PROFILE = {
    "id": "rec_1",
    "name": "Priya Sharma",
    "email": "priya.sharma@barclays.com",
    "title": "Senior Campus Talent Partner",
    "company": "Barclays India Innovation Centre",
    "company_id": "comp_barclays",
    "active_listings": 4,
    "total_applicants": 84,
    "verified_shortlisted": 18,
    "interviews_scheduled": 7,
    "offers_released": 3,
    "is_email_verified": True,
    "status": "APPROVED",
    "verification_timestamp": "2026-09-10T10:00:00Z"
}

RECRUITERS = [
    RECRUITER_PROFILE
]

ACADEMICIAN_PROFILE = {
    "id": "acad_1",
    "name": "Dr. Rajesh Kulkarni",
    "email": "hod.comp@rscoe.edu.in",
    "title": "Head of Department (Computer Engineering)",
    "college": "JSPM RSCOE, Pune",
    "institution_id": "inst_rscoe",
    "department": "Computer Engineering",
    "department_id": "dept_comp",
    "access_scope": "department",
    "is_email_verified": True,
    "status": "APPROVED",
    "verification_timestamp": "2026-09-15T08:00:00Z",
    "total_students": 240,
    "active_on_portal": 218,
    "placed_students": 142,
    "internship_secured": 76,
    "placement_rate_pct": 74.2,
    "average_package_lpa": 7.8,
    "industry_partnerships": 19
}

ACADEMICIANS = [
    ACADEMICIAN_PROFILE
]

PLATFORM_STATS = {
    "total_verified_students": 15420,
    "registered_colleges": 48,
    "corporate_partners": 312,
    "active_internships": 1280,
    "verified_skill_badges_issued": 42100,
    "average_time_to_hire_days": 8.5
}

APPLICATIONS = [
    {
        "id": "app_1",
        "student_id": "std_1",
        "student_name": "Dhruv Patil",
        "student_email": "dhruv.patil@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "opportunity_id": "opp_1",
        "company": "Barclays India Innovation Centre",
        "title": "Full-Stack AI Developer Intern",
        "match_percentage": 92,
        "matched_skills": ["Python", "React", "FastAPI"],
        "status": "Shortlisted",
        "applied_at": "2026-10-01T10:30:00Z",
        "status_history": [
            {"status": "Applied", "updated_at": "2026-10-01T10:30:00Z", "note": "Direct placement pipeline"},
            {"status": "Shortlisted", "updated_at": "2026-10-02T14:00:00Z", "note": "Verified React & Python scores meet benchmark cutoff"}
        ],
        # Additive Cached JD Fit Snapshot (Step 2 Migration)
        "jdFitScore": 96,
        "jdFitVerdict": "STRONG_FIT",
        "jdFitSummary": {
            "mustHaveCoverage": 100.0,
            "niceToHaveCoverage": 100.0,
            "topGaps": [],
            "metCount": 6,
            "totalCount": 6
        },
        "jdFitComputedAt": "2026-10-02T14:00:00Z"
    },
    {
        "id": "app_2",
        "student_id": "std_1",
        "student_name": "Dhruv Patil",
        "student_email": "dhruv.patil@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "opportunity_id": "opp_2",
        "company": "TechCorp Innovations",
        "title": "Junior Machine Learning Engineer",
        "match_percentage": 84,
        "matched_skills": ["Python", "Machine Learning", "FastAPI"],
        "status": "Applied",
        "applied_at": "2026-10-03T11:15:00Z",
        "status_history": [
            {"status": "Applied", "updated_at": "2026-10-03T11:15:00Z", "note": "Direct campus application (Demo Data)"}
        ],
        # Additive Cached JD Fit Snapshot (Step 2 Demo Data)
        "jdFitScore": 73,
        "jdFitVerdict": "PARTIAL_FIT",
        "jdFitSummary": {
            "mustHaveCoverage": 71.4,
            "niceToHaveCoverage": 100.0,
            "topGaps": ["PyTorch"],
            "metCount": 4,
            "totalCount": 5
        },
        "jdFitComputedAt": "2026-10-03T11:15:00Z"
    },
    {
        "id": "app_3",
        "student_id": "std_2",
        "student_name": "Yuvraj Kadam",
        "student_email": "yuvraj.kadam@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "opportunity_id": "opp_1",
        "company": "Barclays India Innovation Centre",
        "title": "Full-Stack AI Developer Intern",
        "match_percentage": 78,
        "matched_skills": ["Python", "Machine Learning"],
        "status": "Applied",
        "applied_at": "2026-10-04T09:20:00Z",
        "status_history": [
            {"status": "Applied", "updated_at": "2026-10-04T09:20:00Z", "note": "Standard applicant without pre-computed snapshot (Demo Data)"}
        ],
        # Uncomputed old row (null fields) to verify on-demand backward compatibility
        "jdFitScore": None,
        "jdFitVerdict": None,
        "jdFitSummary": None,
        "jdFitComputedAt": None
    }
]

ACADEMICIAN_RECOMMENDATIONS = [
    {
        "id": "rec_c_1",
        "academician_id": "acad_1",
        "academician_name": "Dr. Rajesh Kulkarni",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department_id": "dept_comp",
        "target_type": "cohort",
        "target_id": "dept_comp",
        "target_label": "Entire Computer Engineering Cohort",
        "skill": "FastAPI",
        "course_id": "crs_fa_1",
        "course_title": "FastAPI, Docker & Modern Microservices Architecture",
        "provider": "Coursera / DeepLearning.AI",
        "duration": "6 Weeks",
        "link": "https://www.coursera.org",
        "note": "Critical industry gap identified: +184% live market demand in campus drives.",
        "created_at": "2026-10-02T11:00:00Z"
    },
    {
        "id": "rec_c_2",
        "academician_id": "acad_1",
        "academician_name": "Dr. Rajesh Kulkarni",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department_id": "dept_comp",
        "target_type": "individual",
        "target_id": "std_1",
        "target_label": "Dhruv Patil (3rd Year)",
        "skill": "Docker",
        "course_id": "crs_dk_1",
        "course_title": "Docker & Container Mastery for Production Engineers",
        "provider": "NPTEL / IIT Madras",
        "duration": "4 Weeks",
        "link": "https://nptel.ac.in",
        "note": "Completing this micro-lab bridges your Docker gap for the Barclays Innovation Lab drive.",
        "created_at": "2026-10-03T14:30:00Z"
    }
]

COURSE_CATALOG = {
    "Machine Learning": [
        {
            "id": "crs_ml_1",
            "title": "Machine Learning Specialization",
            "skill": "Machine Learning",
            "provider": "DeepLearning.AI / Coursera (Andrew Ng)",
            "level": "Beginner to Intermediate",
            "duration": "8 Weeks (4 hrs/week)",
            "rating": 4.9,
            "link": "https://www.coursera.org/specializations/machine-learning-introduction"
        },
        {
            "id": "crs_ml_2",
            "title": "Applied Machine Learning in Python",
            "skill": "Machine Learning",
            "provider": "University of Michigan / Coursera",
            "level": "Intermediate",
            "duration": "4 Weeks",
            "rating": 4.8,
            "link": "https://www.coursera.org/learn/python-machine-learning"
        },
        {
            "id": "crs_ml_3",
            "title": "NPTEL Applied Machine Learning Bootcamp",
            "skill": "Machine Learning",
            "provider": "IIT Kharagpur / SWAYAM NPTEL",
            "level": "Advanced",
            "duration": "12 Weeks (AICTE Approved)",
            "rating": 4.7,
            "link": "https://nptel.ac.in/courses/106105206"
        }
    ],
    "SQL": [
        {
            "id": "crs_sql_1",
            "title": "Advanced SQL for Relational Databases & Analytics",
            "skill": "SQL",
            "provider": "Coursera / Mode Analytics",
            "level": "Intermediate",
            "duration": "4 Weeks",
            "rating": 4.8,
            "link": "https://www.coursera.org/learn/advanced-sql"
        },
        {
            "id": "crs_sql_2",
            "title": "Database Management Systems Certification",
            "skill": "SQL",
            "provider": "IIT Madras / NPTEL",
            "level": "Beginner to Intermediate",
            "duration": "8 Weeks",
            "rating": 4.9,
            "link": "https://nptel.ac.in/courses/106106220"
        }
    ],
    "Spring Boot": [
        {
            "id": "crs_sb_1",
            "title": "Master Microservices with Spring Boot and Spring Cloud",
            "skill": "Spring Boot",
            "provider": "Udemy / in28Minutes",
            "level": "Intermediate to Advanced",
            "duration": "24 Hours on-demand",
            "rating": 4.8,
            "link": "https://www.udemy.com/course/microservices-with-spring-boot-and-spring-cloud/"
        },
        {
            "id": "crs_sb_2",
            "title": "Spring Boot 3, Spring 6 & Hibernate for Beginners",
            "skill": "Spring Boot",
            "provider": "Chad Darby / Udemy",
            "level": "Beginner to Intermediate",
            "duration": "30 Hours",
            "rating": 4.7,
            "link": "https://www.udemy.com/course/spring-hibernate-tutorial/"
        }
    ],
    "Docker": [
        {
            "id": "crs_dk_1",
            "title": "Docker & Kubernetes: The Practical Guide",
            "skill": "Docker",
            "provider": "Academind / Udemy",
            "level": "Beginner to Advanced",
            "duration": "23 Hours",
            "rating": 4.9,
            "link": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/"
        },
        {
            "id": "crs_dk_2",
            "title": "Cloud Native DevOps with Docker and Kubernetes",
            "skill": "Docker",
            "provider": "IIT Roorkee / NPTEL",
            "level": "Intermediate",
            "duration": "8 Weeks",
            "rating": 4.7,
            "link": "https://nptel.ac.in"
        }
    ],
    "Python": [
        {
            "id": "crs_py_1",
            "title": "Python for Everybody Specialization",
            "skill": "Python",
            "provider": "University of Michigan / Coursera",
            "level": "Beginner",
            "duration": "6 Weeks",
            "rating": 4.8,
            "link": "https://www.coursera.org/specializations/python"
        },
        {
            "id": "crs_py_2",
            "title": "Python 3 Programming Specialization",
            "skill": "Python",
            "provider": "University of Michigan / Coursera",
            "level": "Intermediate",
            "duration": "5 Months",
            "rating": 4.7,
            "link": "https://www.coursera.org/specializations/python-3-programming"
        }
    ],
    "Java": [
        {
            "id": "crs_jv_1",
            "title": "Java Programming and Software Engineering Fundamentals",
            "skill": "Java",
            "provider": "Duke University / Coursera",
            "level": "Beginner to Intermediate",
            "duration": "8 Weeks",
            "rating": 4.7,
            "link": "https://www.coursera.org/specializations/java-programming"
        },
        {
            "id": "crs_jv_2",
            "title": "Programming in Java (AICTE / NPTEL)",
            "skill": "Java",
            "provider": "IIT Kharagpur / SWAYAM NPTEL",
            "level": "Intermediate",
            "duration": "12 Weeks",
            "rating": 4.8,
            "link": "https://nptel.ac.in/courses/106105191"
        }
    ],
    "React": [
        {
            "id": "crs_rc_1",
            "title": "Meta Front-End Developer Professional Certificate",
            "skill": "React",
            "provider": "Meta / Coursera",
            "level": "Intermediate",
            "duration": "7 Months",
            "rating": 4.8,
            "link": "https://www.coursera.org/professional-certificates/meta-front-end-developer"
        },
        {
            "id": "crs_rc_2",
            "title": "The Complete React 19 Developer Bootcamp",
            "skill": "React",
            "provider": "Jonas Schmedtmann / Udemy",
            "level": "Intermediate to Advanced",
            "duration": "68 Hours",
            "rating": 4.9,
            "link": "https://www.udemy.com/course/the-ultimate-react-course/"
        }
    ],
    "Data Structures": [
        {
            "id": "crs_dsa_1",
            "title": "Data Structures and Algorithms Specialization",
            "skill": "Data Structures",
            "provider": "UC San Diego / Coursera",
            "level": "Intermediate to Advanced",
            "duration": "12 Weeks",
            "rating": 4.8,
            "link": "https://www.coursera.org/specializations/data-structures-algorithms"
        },
        {
            "id": "crs_dsa_2",
            "title": "Data Structures and Algorithms using Java/C++",
            "skill": "Data Structures",
            "provider": "IIT Delhi / NPTEL",
            "level": "Advanced",
            "duration": "8 Weeks",
            "rating": 4.7,
            "link": "https://nptel.ac.in/courses/106102064"
        }
    ],
    "FastAPI": [
        {
            "id": "crs_fa_1",
            "title": "FastAPI, Docker & Modern Microservices Architecture",
            "skill": "FastAPI",
            "provider": "Coursera / DeepLearning.AI",
            "level": "Intermediate",
            "duration": "6 Weeks",
            "rating": 4.9,
            "link": "https://www.coursera.org"
        },
        {
            "id": "crs_fa_2",
            "title": "Building High-Throughput REST APIs with FastAPI and Python",
            "skill": "FastAPI",
            "provider": "TestDriven.io / NPTEL",
            "level": "Advanced",
            "duration": "4 Weeks",
            "rating": 4.8,
            "link": "https://nptel.ac.in"
        }
    ]
}

# ----------------------------------------------------
# PART 13 & 14: TRAINING INTERVENTIONS STORE
# ----------------------------------------------------
TRAINING_INTERVENTIONS = [
    {
        "id": "int_1",
        "institution_id": "inst_rscoe",
        "college": "JSPM RSCOE, Pune",
        "department_id": "dept_comp",
        "department": "Computer Engineering",
        "target_year": "3rd Year",
        "skill": "Cloud Computing",
        "course_title": "Cloud Computing & AWS Architecture Bootcamp",
        "provider": "NPTEL / AWS Academy",
        "enrolled_students": 120,
        "before_score": 38,
        "after_score": 61,  # Post-training reassessment completed
        "improvement_points": 23,
        "status": "COMPLETED",
        "created_at": "2026-08-15T09:00:00Z",
        "completed_at": "2026-09-28T17:00:00Z"
    },
    {
        "id": "int_2",
        "institution_id": "inst_rscoe",
        "college": "JSPM RSCOE, Pune",
        "department_id": "dept_comp",
        "department": "Computer Engineering",
        "target_year": "3rd Year",
        "skill": "Docker",
        "course_title": "Docker & Container Mastery for Production Engineers",
        "provider": "Academind / Coursera",
        "enrolled_students": 140,
        "before_score": 35,
        "after_score": None,  # Post-training evaluation pending
        "improvement_points": None,
        "status": "IN_PROGRESS",
        "created_at": "2026-10-01T10:00:00Z",
        "completed_at": None
    }
]

# ----------------------------------------------------
# PART 15, 16, 17: RECRUITMENT OUTCOME FEEDBACK STORE
# ----------------------------------------------------
RECRUITMENT_OUTCOMES = [
    {
        "id": "out_1",
        "application_id": "app_1",
        "opportunity_id": "opp_1",
        "candidate_id": "std_1",
        "candidate_name": "Dhruv Patil",
        "recruiter_id": "rec_1",
        "recruiter_name": "Priya Sharma",
        "company": "Barclays India Innovation Centre",
        "role": "Full-Stack AI Developer Intern",
        "outcome": "SELECTED",
        "important_skills": ["Python", "FastAPI", "React"],
        "skill_readiness": "Exceeded benchmark cutoff on proctored live coding",
        "interview_readiness": "Excellent architectural clarity on RESTful microservices",
        "technical_gap": "Container deployment knowledge can be polished before onboarding",
        "notes": "Python and FastAPI were among the verified skills associated with this positive recruitment outcome.",
        "timestamp": "2026-10-03T16:45:00Z"
    }
]

# ----------------------------------------------------
# PART 23: VERSIONED STUDENT SKILL PROGRESSION HISTORY
# ----------------------------------------------------
STUDENT_SKILL_HISTORY = [
    {"student_id": "std_1", "skill": "Python", "attempt": 1, "score": 61, "date": "2026-07-10"},
    {"student_id": "std_1", "skill": "Python", "attempt": 2, "score": 74, "date": "2026-08-20"},
    {"student_id": "std_1", "skill": "Python", "attempt": 3, "score": 92, "date": "2026-09-25"},
    {"student_id": "std_1", "skill": "React", "attempt": 1, "score": 68, "date": "2026-07-15"},
    {"student_id": "std_1", "skill": "React", "attempt": 2, "score": 89, "date": "2026-09-12"},
    {"student_id": "std_1", "skill": "FastAPI", "attempt": 1, "score": 58, "date": "2026-08-05"},
    {"student_id": "std_1", "skill": "FastAPI", "attempt": 2, "score": 84, "date": "2026-09-28"},
    {"student_id": "std_1", "skill": "Docker", "attempt": 1, "score": 42, "date": "2026-08-12"},
    {"student_id": "std_1", "skill": "Docker", "attempt": 2, "score": 68, "date": "2026-10-01"},
    # Student 2
    {"student_id": "std_2", "skill": "Python", "attempt": 1, "score": 72, "date": "2026-08-01"},
    {"student_id": "std_2", "skill": "Python", "attempt": 2, "score": 88, "date": "2026-09-18"},
    {"student_id": "std_2", "skill": "Machine Learning", "attempt": 1, "score": 65, "date": "2026-08-10"},
    {"student_id": "std_2", "skill": "Machine Learning", "attempt": 2, "score": 86, "date": "2026-09-22"}
]

# ----------------------------------------------------
# PART 39: AUDIT TRAIL STORE
# ----------------------------------------------------
AUDIT_LOGS = [
    {
        "id": "aud_1",
        "actor": "dhruv.patil@rscoe.edu.in",
        "role": "student",
        "action": "ASSESSMENT_COMPLETED",
        "entity": "AssessmentAttempt",
        "entity_id": "atm_py_1",
        "old_value": "Python: 74%",
        "new_value": "Python: 92% (VERIFIED)",
        "timestamp": "2026-09-25T14:30:00Z"
    },
    {
        "id": "aud_2",
        "actor": "hod.comp@rscoe.edu.in",
        "role": "academician",
        "action": "INTERVENTION_CREATED",
        "entity": "TrainingIntervention",
        "entity_id": "int_2",
        "old_value": None,
        "new_value": "Docker Mastery Bootcamp (140 Students)",
        "timestamp": "2026-10-01T10:00:00Z"
    },
    {
        "id": "aud_3",
        "actor": "priya.sharma@barclays.com",
        "role": "recruiter",
        "action": "APPLICATION_STATUS_UPDATED",
        "entity": "Application",
        "entity_id": "app_1",
        "old_value": "Shortlisted",
        "new_value": "Selected",
        "timestamp": "2026-10-03T16:30:00Z"
    },
    {
        "id": "aud_4",
        "actor": "priya.sharma@barclays.com",
        "role": "recruiter",
        "action": "OUTCOME_FEEDBACK_RECORDED",
        "entity": "RecruitmentOutcome",
        "entity_id": "out_1",
        "old_value": None,
        "new_value": "Associated skills: Python, FastAPI, React",
        "timestamp": "2026-10-03T16:45:00Z"
    }
]

def log_audit_trail(actor: str, role: str, action: str, entity: str, entity_id: str, old_value: Optional[str] = None, new_value: Optional[str] = None):
    """Appends an immutable audit record."""
    import uuid
    import time
    AUDIT_LOGS.insert(0, {
        "id": f"aud_{uuid.uuid4().hex[:8]}",
        "actor": actor,
        "role": role,
        "action": action,
        "entity": entity,
        "entity_id": entity_id,
        "old_value": old_value,
        "new_value": new_value,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    })

# ----------------------------------------------------
# PART 36: COMMERCIAL & MULTI-INSTITUTION SUBSCRIPTIONS
# ----------------------------------------------------
INSTITUTION_SUBSCRIPTIONS = {
    "inst_rscoe": {
        "institution_id": "inst_rscoe",
        "name": "JSPM RSCOE, Pune",
        "plan": "Institution Enterprise",
        "status": "ACTIVE",
        "entitlements": {
            "max_students": 5000,
            "proctored_assessments_enabled": True,
            "institutional_intelligence_enabled": True,
            "demand_gap_analytics_enabled": True,
            "cohort_interventions_enabled": True,
            "erp_api_integration_readiness": True
        },
        "usage_metrics": {
            "active_students": 240,
            "skills_verified": 420,
            "interventions_run": 2,
            "recruiter_connections": 18
        }
    },
    "inst_coep": {
        "institution_id": "inst_coep",
        "name": "COEP Pune",
        "plan": "Institution Professional",
        "status": "ACTIVE",
        "entitlements": {
            "max_students": 2500,
            "proctored_assessments_enabled": True,
            "institutional_intelligence_enabled": True,
            "demand_gap_analytics_enabled": True,
            "cohort_interventions_enabled": True,
            "erp_api_integration_readiness": False
        },
        "usage_metrics": {
            "active_students": 180,
            "skills_verified": 290,
            "interventions_run": 1,
            "recruiter_connections": 12
        }
    }
}

# ----------------------------------------------------
# FEATURE 1: ANONYMOUS / INCOGNITO TALENT MATCHING
# ----------------------------------------------------

def generate_talent_id(student_id: str) -> str:
    """Generates non-guessable, privacy-safe public talent identifier."""
    if student_id == "std_1":
        return "SB-TALENT-10482"
    elif student_id == "std_2":
        return "SB-TALENT-20831"
    elif student_id == "std_3":
        return "SB-TALENT-39120"
    
    # Hash-based 5-digit token preventing sequential DB enumeration
    val = int(hashlib.sha256(f"skillbridge_talent_hash_{student_id}".encode()).hexdigest(), 16) % 89999 + 10001
    return f"SB-TALENT-{val}"

def get_talent_id_for_student(student_id: str) -> str:
    """Returns assigned or generated talent ID for student."""
    if student_id in TALENT_VISIBILITY_SETTINGS:
        return TALENT_VISIBILITY_SETTINGS[student_id].get("talent_id", generate_talent_id(student_id))
    return generate_talent_id(student_id)

TALENT_VISIBILITY_SETTINGS: Dict[str, Dict[str, Any]] = {
    "std_1": {
        "student_id": "std_1",
        "talent_id": "SB-TALENT-10482",
        "mode": "INCOGNITO",  # NORMAL, INCOGNITO, HIDDEN
        "allow_recruiter_discovery": True,
        "hide_identity_until_accepted": True,
        "allow_recruiter_invitations": True,
        "show_projects_anonymously": True,
        "show_research_anonymously": True,
        "research_interests": ["Machine Learning", "Computer Vision", "Agentic AI"],
        "availability": "Immediate Internship (6 Months)",
        "achievements": [
            "Top 5% in AICTE National Aptitude Sprint",
            "1st Place JSPM Pune Hackathon 2026",
            "Verified Proctored Score: 88%"
        ],
        "updated_at": "2026-10-01T12:00:00Z"
    },
    "std_2": {
        "student_id": "std_2",
        "talent_id": "SB-TALENT-20831",
        "mode": "INCOGNITO",
        "allow_recruiter_discovery": True,
        "hide_identity_until_accepted": True,
        "allow_recruiter_invitations": True,
        "show_projects_anonymously": True,
        "show_research_anonymously": True,
        "research_interests": ["Smart Energy & IoT", "Embedded ML", "Distributed Systems"],
        "availability": "Summer Internship 2027",
        "achievements": ["Smart Grid Innovation Certificate - IIT Bombay"],
        "updated_at": "2026-10-02T10:00:00Z"
    },
    "std_3": {
        "student_id": "std_3",
        "talent_id": "SB-TALENT-39120",
        "mode": "INCOGNITO",
        "allow_recruiter_discovery": True,
        "hide_identity_until_accepted": True,
        "allow_recruiter_invitations": True,
        "show_projects_anonymously": True,
        "show_research_anonymously": True,
        "research_interests": ["Cloud Architecture", "DevOps", "Microservices"],
        "availability": "Full-Time Placement 2027",
        "achievements": ["AWS Certified Cloud Practitioner"],
        "updated_at": "2026-10-03T11:00:00Z"
    }
}

def get_or_create_talent_profile(student_id: str) -> Dict[str, Any]:
    """Retrieves or provisions student's talent discovery profile with privacy-first defaults."""
    if student_id not in TALENT_VISIBILITY_SETTINGS:
        t_id = generate_talent_id(student_id)
        TALENT_VISIBILITY_SETTINGS[student_id] = {
            "student_id": student_id,
            "talent_id": t_id,
            "mode": "INCOGNITO",
            "allow_recruiter_discovery": True,
            "hide_identity_until_accepted": True,
            "allow_recruiter_invitations": True,
            "show_projects_anonymously": True,
            "show_research_anonymously": True,
            "research_interests": ["Machine Learning", "Software Engineering"],
            "availability": "Internship / Full-Time",
            "achievements": [],
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
    return TALENT_VISIBILITY_SETTINGS[student_id]

def get_student_id_from_talent_id(talent_id: str) -> Optional[str]:
    """Resolves anonymous public talent ID back to internal student ID."""
    clean = talent_id.strip()
    for sid, prof in TALENT_VISIBILITY_SETTINGS.items():
        if prof.get("talent_id") == clean:
            return sid
    for s in STUDENTS:
        if generate_talent_id(s["id"]) == clean:
            return s["id"]
    return None

TALENT_INVITATIONS: List[Dict[str, Any]] = [
    {
        "id": "inv_1",
        "talent_id": "SB-TALENT-10482",
        "student_id": "std_1",
        "recruiter_id": "rec_1",
        "recruiter_name": "Priya Sharma",
        "recruiter_email": "priya.sharma@barclays.com",
        "company": "Barclays India Innovation Centre",
        "opportunity_id": "opp_1",
        "opportunity_title": "Full-Stack AI Developer Intern",
        "match_percentage": 92,
        "matched_skills": ["Python", "Machine Learning", "FastAPI"],
        "message": "Your verified Python (92%) and ML assessment scores and project work strongly align with our Generative AI squad. We would love to interview you!",
        "status": "PENDING",  # PENDING, ACCEPTED, DECLINED, EXPIRED
        "created_at": "2026-10-04T10:00:00Z",
        "responded_at": None
    }
]

IDENTITY_REVEAL_CONSENTS: List[Dict[str, Any]] = []

def has_identity_reveal_consent(student_id: str, recruiter_id: str) -> bool:
    """Verifies whether candidate has explicitly consented to reveal identity to recruiter."""
    for c in IDENTITY_REVEAL_CONSENTS:
        if c.get("student_id") == student_id and c.get("recruiter_id") == recruiter_id and c.get("student_consent"):
            return True
    return False


# ----------------------------------------------------
# FEATURE 2: PROJECT & RESEARCH COLLABORATION HUB
# ----------------------------------------------------

COLLABORATION_PROJECTS: List[Dict[str, Any]] = [
    {
        "id": "proj_1",
        "title": "AI-Based Crop Disease Detection & Prevention",
        "type": "Research Project",  # Research Project, Capstone Project, Industry Project, Innovation Project, Open Challenge, Internship Project
        "description": "Deep learning convolutional models deployed on edge IoT devices to detect foliar disease and leaf rust in real-time.",
        "problem_statement": "Smallholder farmers suffer up to 35% crop loss due to delayed detection of foliar fungal infections.",
        "research_area": "Computer Vision & Edge AI",
        "domain": "Artificial Intelligence & Agriculture",
        "academician_id": "acad_1",
        "academician_name": "Dr. Rajesh Kulkarni",
        "mentor_email": "hod.comp@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "required_skills": ["Python", "Machine Learning", "Computer Vision"],
        "preferred_skills": ["FastAPI", "React", "Docker"],
        "team_size": 4,
        "difficulty_level": "Advanced",
        "start_date": "2026-08-01",
        "expected_end_date": "2026-11-30",
        "status": "ACTIVE",  # ACTIVE, COMPLETED, ARCHIVED
        "visibility": "PUBLIC",  # PUBLIC, INSTITUTION_ONLY
        "expected_deliverables": "Working PyTorch/ONNX model with >90% mAP, FastAPI REST service, and React dashboard.",
        "team": [
            {
                "student_id": "std_1",
                "talent_id": "SB-TALENT-10482",
                "student_name": "Dhruv Patil",
                "role": "Lead ML Engineer",
                "joined_at": "2026-08-05T10:00:00Z",
                "contribution": "Trained ResNet-50 backbone with 94.2% validation accuracy. Quantized model to ONNX for edge deployment.",
                "verified_skills_awarded": ["Python", "Machine Learning", "Computer Vision"]
            }
        ],
        "join_requests": [],
        "milestones": [
            {
                "id": "m_1",
                "title": "Research & Requirement Analysis",
                "status": "COMPLETED",
                "deliverable": "Literature review and dataset specifications",
                "feedback": "Thorough methodology and clean problem definition.",
                "completed_at": "2026-08-20T17:00:00Z"
            },
            {
                "id": "m_2",
                "title": "Dataset Collection & Preprocessing",
                "status": "COMPLETED",
                "deliverable": "12,000 augmented leaf images labeled in YOLO/COCO format",
                "feedback": "Good augmentation pipeline and class balancing.",
                "completed_at": "2026-09-10T17:00:00Z"
            },
            {
                "id": "m_3",
                "title": "Model Development & Optimization",
                "status": "IN_PROGRESS",
                "deliverable": "Lightweight PyTorch model converted to ONNX",
                "feedback": "Quantization in progress.",
                "completed_at": None
            },
            {
                "id": "m_4",
                "title": "Testing & Benchmarking",
                "status": "NOT_STARTED",
                "deliverable": "Test suite with inference latency <50ms on Raspberry Pi",
                "feedback": None,
                "completed_at": None
            },
            {
                "id": "m_5",
                "title": "Final Demonstration & Open-Source Release",
                "status": "NOT_STARTED",
                "deliverable": "GitHub repository, paper preprint, and live demo video",
                "feedback": None,
                "completed_at": None
            }
        ],
        "evidence_submissions": [
            {
                "id": "ev_1",
                "student_id": "std_1",
                "talent_id": "SB-TALENT-10482",
                "title": "ONNX Model Conversion & Benchmark Script",
                "github_url": "https://github.com/skillbridge-research/crop-vision-onnx",
                "description": "Quantized ResNet-50 inference script achieving 38ms latency on ARM Cortex.",
                "submitted_at": "2026-09-28T14:00:00Z"
            }
        ],
        "evaluations": [
            {
                "student_id": "std_1",
                "talent_id": "SB-TALENT-10482",
                "evaluated_by": "Dr. Rajesh Kulkarni",
                "grade": "Exemplary",
                "skills_verified": ["Python", "Machine Learning", "Computer Vision"],
                "feedback": "Demonstrated exceptional depth in computer vision model training and ONNX deployment.",
                "timestamp": "2026-10-02T16:00:00Z"
            }
        ],
        "sponsorship_interests": [
            {
                "id": "sp_1",
                "recruiter_id": "rec_1",
                "company": "Barclays India Innovation Centre",
                "recruiter_name": "Priya Sharma",
                "type": "Industry Collaboration Request",
                "message": "Interested in evaluating your edge AI inference engine for our Sustainability Tech track.",
                "status": "Accepted",
                "created_at": "2026-09-29T11:00:00Z"
            }
        ],
        "created_at": "2026-08-01T09:00:00Z"
    },
    {
        "id": "proj_2",
        "title": "Autonomous Campus Electric Micro-Grid Load Balancer",
        "type": "Capstone Project",
        "description": "Real-time smart grid power monitoring and peak shaving controller using Reinforcement Learning and MQTT sensors.",
        "problem_statement": "University campuses overpay peak tariff charges by up to 28% due to uncoordinated EV and lab HVAC loads.",
        "research_area": "Smart Energy & Embedded Systems",
        "domain": "IoT & Machine Learning",
        "academician_id": "acad_1",
        "academician_name": "Dr. Rajesh Kulkarni",
        "mentor_email": "hod.comp@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "required_skills": ["Python", "IoT", "Data Structures"],
        "preferred_skills": ["PostgreSQL", "React", "Docker"],
        "team_size": 3,
        "difficulty_level": "Intermediate",
        "start_date": "2026-09-01",
        "expected_end_date": "2026-12-15",
        "status": "ACTIVE",
        "visibility": "PUBLIC",
        "expected_deliverables": "Hardware IoT prototype with simulation dashboard and auto-switching algorithm.",
        "team": [
            {
                "student_id": "std_2",
                "talent_id": "SB-TALENT-20831",
                "student_name": "Yuvraj Kadam",
                "role": "Embedded & IoT Developer",
                "joined_at": "2026-09-05T11:00:00Z",
                "contribution": "Configured MQTT broker and telemetry ingestion pipeline in Python.",
                "verified_skills_awarded": ["Python", "IoT"]
            }
        ],
        "join_requests": [],
        "milestones": [
            {
                "id": "m_21",
                "title": "Architecture & Sensor Selection",
                "status": "COMPLETED",
                "deliverable": "Schematic & sensor BOM",
                "feedback": "Approved for procurement.",
                "completed_at": "2026-09-15T10:00:00Z"
            },
            {
                "id": "m_22",
                "title": "Telemetry Ingestion Pipeline",
                "status": "IN_PROGRESS",
                "deliverable": "MQTT broker and timeseries database",
                "feedback": "Telemetry streaming running smoothly.",
                "completed_at": None
            },
            {
                "id": "m_23",
                "title": "Peak Prediction & Switching Logic",
                "status": "NOT_STARTED",
                "deliverable": "RL agent trained on historical load data",
                "feedback": None,
                "completed_at": None
            },
            {
                "id": "m_24",
                "title": "Final Hardware Demo",
                "status": "NOT_STARTED",
                "deliverable": "Bench scale power switcher",
                "feedback": None,
                "completed_at": None
            }
        ],
        "evidence_submissions": [],
        "evaluations": [],
        "sponsorship_interests": [],
        "created_at": "2026-09-01T10:00:00Z"
    },
    {
        "id": "proj_3",
        "title": "Federated Privacy-Preserving Health Analytics Engine",
        "type": "Industry Project",
        "description": "Multi-institutional federated learning system enabling collaborative diagnostic models without sharing raw clinical records.",
        "problem_statement": "Healthcare compliance (HIPAA/DPDP) prevents centralized clinical data aggregation, stalling rare disease research.",
        "research_area": "Differential Privacy & Distributed ML",
        "domain": "Artificial Intelligence & Cybersecurity",
        "academician_id": "acad_1",
        "academician_name": "Dr. Rajesh Kulkarni",
        "mentor_email": "hod.comp@rscoe.edu.in",
        "college": "JSPM RSCOE, Pune",
        "institution_id": "inst_rscoe",
        "department": "Computer Engineering",
        "department_id": "dept_comp",
        "required_skills": ["Python", "Machine Learning", "FastAPI"],
        "preferred_skills": ["Docker", "PostgreSQL", "Cloud Computing"],
        "team_size": 4,
        "difficulty_level": "Advanced",
        "start_date": "2026-08-15",
        "expected_end_date": "2026-11-20",
        "status": "ACTIVE",
        "visibility": "PUBLIC",
        "expected_deliverables": "Flower/PySyft federated node testbed with differential privacy epsilon < 2.0.",
        "team": [],
        "join_requests": [],
        "milestones": [
            {
                "id": "m_31",
                "title": "Protocol Specification",
                "status": "COMPLETED",
                "deliverable": "Zero-knowledge aggregation spec",
                "feedback": "Approved by Barclays research liaison.",
                "completed_at": "2026-09-01T14:00:00Z"
            },
            {
                "id": "m_32",
                "title": "Local Node Agent Development",
                "status": "IN_PROGRESS",
                "deliverable": "Containerized worker node with secure enclave",
                "feedback": "Docker image ready for testbed.",
                "completed_at": None
            },
            {
                "id": "m_33",
                "title": "Federated Aggregator & Benchmarking",
                "status": "NOT_STARTED",
                "deliverable": "Central parameter server with DP noise injection",
                "feedback": None,
                "completed_at": None
            }
        ],
        "evidence_submissions": [],
        "evaluations": [],
        "sponsorship_interests": [
            {
                "id": "sp_31",
                "recruiter_id": "rec_1",
                "company": "Barclays India Innovation Centre",
                "recruiter_name": "Priya Sharma",
                "type": "Industry Project Sponsorship",
                "message": "Offering direct cloud compute credits and mentorship on distributed security for this capstone.",
                "status": "Accepted",
                "created_at": "2026-09-10T12:00:00Z"
            }
        ],
        "created_at": "2026-08-15T09:00:00Z"
    }
]

def evaluate_student_project_contribution(
    project_id: str,
    student_id: str,
    skills_verified: List[str],
    feedback: str,
    mentor_name: str
) -> Dict[str, Any]:
    """
    CRITICAL DIFFERENTIATOR:
    Translates validated project work into persistent verified skill records.
    Updates STUDENT_SKILL_HISTORY and Student.skills.
    """
    # 1. Locate student
    student = next((s for s in STUDENTS if s["id"] == student_id), None)
    if not student:
        return {"error": "Student not found"}
        
    talent_id = get_talent_id_for_student(student_id)
    
    # 2. Locate project
    project = next((p for p in COLLABORATION_PROJECTS if p["id"] == project_id), None)
    if not project:
        return {"error": "Project not found"}
        
    # 3. Add to project evaluations
    eval_record = {
        "student_id": student_id,
        "talent_id": talent_id,
        "evaluated_by": mentor_name,
        "grade": "Verified Distinction",
        "skills_verified": skills_verified,
        "feedback": feedback,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    project.setdefault("evaluations", []).append(eval_record)
    
    # 4. Update member entry in project team
    for member in project.get("team", []):
        if member.get("student_id") == student_id:
            curr_skills = member.get("verified_skills_awarded", [])
            for sk in skills_verified:
                if sk not in curr_skills:
                    curr_skills.append(sk)
            member["verified_skills_awarded"] = curr_skills
            member["evaluated"] = True
            
    # 5. Feed back into Student's verified skill profile & skill history
    for sk in skills_verified:
        norm_sk = sk.strip()
        # Find or create skill in student skills
        if norm_sk in student["skills"]:
            existing = student["skills"][norm_sk]
            if isinstance(existing, dict):
                existing["verified"] = True
                existing["project_verified"] = True
                existing["score"] = max(existing.get("score", 70), 85)
                existing["level"] = "Advanced" if existing["score"] >= 85 else "Intermediate"
        else:
            student["skills"][norm_sk] = {
                "level": "Intermediate",
                "score": 85,
                "verified": True,
                "project_verified": True
            }
            
        # Record longitudinal progression history
        attempt_count = sum(1 for h in STUDENT_SKILL_HISTORY if h["student_id"] == student_id and h["skill"].lower() == norm_sk.lower()) + 1
        STUDENT_SKILL_HISTORY.append({
            "student_id": student_id,
            "skill": norm_sk,
            "attempt": attempt_count,
            "score": 85,
            "source": "PROJECT_EVALUATION",
            "project_id": project_id,
            "date": time.strftime("%Y-%m-%d", time.gmtime())
        })
        
    student["projects_count"] = student.get("projects_count", 0) + 1
    all_scores = [v.get("score", 70) if isinstance(v, dict) else int(v) for v in student["skills"].values()]
    if all_scores:
        student["verified_score"] = round(sum(all_scores) / len(all_scores))
    
    # 6. Audit Trail
    log_audit_trail(
        actor=mentor_name,
        role="academician",
        action="PROJECT_CONTRIBUTION_EVALUATED",
        entity="CollaborationProject",
        entity_id=project_id,
        old_value=None,
        new_value=f"Awarded verified project skill evidence to {talent_id}: {', '.join(skills_verified)}"
    )
    
    return {
        "status": "success",
        "message": f"Successfully evaluated contribution for {talent_id}. Project skill evidence integrated into Skill Passport.",
        "skills_verified": skills_verified,
        "evaluation": eval_record
    }

def record_identity_reveal_consent(
    student_id: str,
    recruiter_id: str,
    opportunity_id: str,
    talent_id: str,
    recruiter_email: str = ""
) -> Dict[str, Any]:
    """Records explicit user action revealing candidate identity to a specific recruiter."""
    now_ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    # Check existing consent
    existing = next((c for c in IDENTITY_REVEAL_CONSENTS if c.get("student_id") == student_id and c.get("recruiter_id") == recruiter_id), None)
    if existing:
        existing["student_consent"] = True
        existing["identity_revealed_at"] = now_ts
        consent_record = existing
    else:
        consent_record = {
            "id": f"rev_{uuid.uuid4().hex[:8]}",
            "student_id": student_id,
            "talent_id": talent_id,
            "recruiter_id": recruiter_id,
            "recruiter_email": recruiter_email,
            "opportunity_id": opportunity_id,
            "student_consent": True,
            "identity_reveal_requested_at": now_ts,
            "identity_revealed_at": now_ts
        }
        IDENTITY_REVEAL_CONSENTS.append(consent_record)
        
    # Update invitation status if exists
    for inv in TALENT_INVITATIONS:
        if inv.get("student_id") == student_id and (inv.get("recruiter_id") == recruiter_id or inv.get("opportunity_id") == opportunity_id):
            inv["status"] = "ACCEPTED"
            inv["responded_at"] = now_ts
            
    student = next((s for s in STUDENTS if s["id"] == student_id), None)
    log_audit_trail(
        actor=student.get("email", student_id) if student else student_id,
        role="student",
        action="IDENTITY_REVEAL_CONSENT_GRANTED",
        entity="IdentityRevealConsent",
        entity_id=consent_record["id"],
        old_value="ANONYMOUS",
        new_value=f"Consent granted to {recruiter_email or recruiter_id} for {opportunity_id}"
    )
    return consent_record



