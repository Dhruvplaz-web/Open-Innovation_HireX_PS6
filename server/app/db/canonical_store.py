"""
HireX Canonical Persistent Data Store
Single Authoritative Source of Truth with:
1. Atomic Disk Persistence (ACID-like JSON storage with os.replace)
2. Monotonic Entity Versioning for all entities
3. Optimistic Concurrency Control (OCC) with 409 Conflict rejection
4. Comprehensive Audit Trail Logging
5. Algorithmic Profile Completion Calculation
6. Derived Opportunity Match Freshness & Version Tracking
7. Soft Delete Support
"""

import os
import json
import time
import uuid
import threading
from typing import Dict, Any, List, Optional, Tuple, Set
from fastapi import HTTPException

# Import baseline seed data for initial bootstrap
from app.data.seed_data import (
    INSTITUTIONS as SEED_INSTITUTIONS,
    DEPARTMENTS as SEED_DEPARTMENTS,
    STUDENTS as SEED_STUDENTS,
    OPPORTUNITIES as SEED_OPPORTUNITIES,
    RECRUITERS as SEED_RECRUITERS,
    ACADEMICIANS as SEED_ACADEMICIANS,
    APPLICATIONS as SEED_APPLICATIONS,
    ACADEMICIAN_RECOMMENDATIONS as SEED_RECOMMENDATIONS,
    COURSE_CATALOG as SEED_COURSES
)

STORE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
STORE_PATH = os.path.join(STORE_DIR, "canonical_store.json")

class ConcurrencyConflictException(HTTPException):
    def __init__(self, entity_type: str, entity_id: str, current_version: int, expected_version: int):
        super().__init__(
            status_code=409,
            detail={
                "error": "OCC_CONFLICT",
                "message": f"Conflict: {entity_type} '{entity_id}' has been modified by another session. Current version is {current_version}, but client expected version {expected_version}.",
                "entity_type": entity_type,
                "entity_id": entity_id,
                "current_version": current_version,
                "expected_version": expected_version
            }
        )

class CanonicalStore:
    def __init__(self, file_path: str = STORE_PATH):
        self.file_path = file_path
        self._lock = threading.RLock()
        self._initialized = False
        
        # In-memory structured cache backed by disk
        self.users: Dict[str, dict] = {}
        self.students: Dict[str, dict] = {}
        self.student_registrations: Dict[str, dict] = {}
        self.companies: Dict[str, dict] = {}
        self.recruiters: Dict[str, dict] = {}
        self.academicians: Dict[str, dict] = {}
        self.institutions: Dict[str, dict] = {}
        self.departments: Dict[str, dict] = {}
        self.opportunities: Dict[str, dict] = {}
        self.applications: Dict[str, dict] = {}
        self.assessments: Dict[str, dict] = {}
        self.recommendations: Dict[str, dict] = {}
        self.audit_logs: List[dict] = []
        self.notifications: List[dict] = []
        self.match_cache: Dict[str, dict] = {}
        self.skill_reviews: Dict[str, dict] = {}
        self.assessment_questions: Dict[str, dict] = {}
        self.assessment_attempts: Dict[str, dict] = {}
        self.student_seen_questions: Dict[str, List[str]] = {}
        self.curriculum_mappings: Dict[str, dict] = {}
        self.academic_assignments: Dict[str, dict] = {}
        self.assignment_submissions: Dict[str, dict] = {}
        self.academic_interventions: Dict[str, dict] = {}
        self.campus_drives: Dict[str, dict] = {}
        self.recruiter_assessments: Dict[str, dict] = {}
        self.recruiter_assessment_results: Dict[str, dict] = {}
        self.candidate_feedbacks: Dict[str, dict] = {}
        self.skill_timelines: Dict[str, dict] = {}

        self._load_or_bootstrap()

    def _load_or_bootstrap(self):
        """Loads canonical state from persistent disk file, or bootstraps with seed data."""
        with self._lock:
            if os.path.exists(self.file_path):
                try:
                    with open(self.file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self.users = data.get("users", {})
                    self.students = data.get("students", {})
                    self.student_registrations = data.get("student_registrations", {})
                    self.companies = data.get("companies", {})
                    self.recruiters = data.get("recruiters", {})
                    self.academicians = data.get("academicians", {})
                    self.institutions = data.get("institutions", {})
                    self.departments = data.get("departments", {})
                    self.opportunities = data.get("opportunities", {})
                    self.applications = data.get("applications", {})
                    self.assessments = data.get("assessments", {})
                    self.recommendations = data.get("recommendations", {})
                    self.audit_logs = data.get("audit_logs", [])
                    self.notifications = data.get("notifications", [])
                    self.match_cache = data.get("match_cache", {})
                    self.skill_reviews = data.get("skill_reviews", {})
                    self.assessment_questions = data.get("assessment_questions", {})
                    self.assessment_attempts = data.get("assessment_attempts", {})
                    self.student_seen_questions = data.get("student_seen_questions", {})
                    self.curriculum_mappings = data.get("curriculum_mappings", {})
                    self.academic_assignments = data.get("academic_assignments", {})
                    self.assignment_submissions = data.get("assignment_submissions", {})
                    self.academic_interventions = data.get("academic_interventions", {})
                    self.campus_drives = data.get("campus_drives", {})
                    self.recruiter_assessments = data.get("recruiter_assessments", {})
                    self.recruiter_assessment_results = data.get("recruiter_assessment_results", {})
                    self.candidate_feedbacks = data.get("candidate_feedbacks", {})
                    self.skill_timelines = data.get("skill_timelines", {})

                    if not self.curriculum_mappings or not self.academic_assignments or not self.academic_interventions:
                        self._bootstrap_intelligence_entities()
                        self._save_to_disk()

                    self._initialized = True
                    return
                except Exception as e:
                    print(f"[CanonicalStore] Warning loading {self.file_path}: {e}. Re-bootstrapping.")

            self._bootstrap_from_seed()
            self._save_to_disk()
            self._initialized = True

    def _bootstrap_from_seed(self):
        """Seeds initial dataset with version=1 and metadata."""
        now = time.time()

        # 1. Institutions & Departments
        for inst in SEED_INSTITUTIONS:
            self.institutions[inst["id"]] = {
                **inst,
                "version": 1,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None
            }

        for dept in SEED_DEPARTMENTS:
            self.departments[dept["id"]] = {
                **dept,
                "version": 1,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None
            }

        # 2. Students
        for std in SEED_STUDENTS:
            self.students[std["id"]] = {
                **std,
                "version": 1,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None,
                "profile_completion": self.calculate_profile_completion(std)
            }

        # 3. Recruiters & Companies
        for rec in SEED_RECRUITERS:
            self.recruiters[rec["id"]] = {
                **rec,
                "version": 1,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None
            }
            # Add company record
            c_name = rec.get("company", "Corporate Partner")
            c_id = f"comp_{c_name.lower().replace(' ', '_')[:10]}"
            if c_id not in self.companies:
                self.companies[c_id] = {
                    "id": c_id,
                    "name": c_name,
                    "website": "https://company.com",
                    "verification_status": "COMPANY_VERIFIED",
                    "version": 1,
                    "created_at": now,
                    "updated_at": now,
                    "deleted_at": None
                }

        # 4. Academicians
        for acad in SEED_ACADEMICIANS:
            self.academicians[acad["id"]] = {
                **acad,
                "version": 1,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None
            }

        # 5. Opportunities
        for opp in SEED_OPPORTUNITIES:
            self.opportunities[opp["id"]] = {
                **opp,
                "version": 1,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None
            }

        # 6. Applications
        for app_item in SEED_APPLICATIONS:
            self.applications[app_item["id"]] = {
                **app_item,
                "version": 1,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None,
                "status_history": app_item.get("status_history", [
                    {"status": app_item.get("status", "Applied"), "updated_at": "2026-10-01T10:00:00Z", "note": "Initial submission"}
                ])
            }

        # 7. Recommendations
        for rec_item in SEED_RECOMMENDATIONS:
            self.recommendations[rec_item["id"]] = {
                **rec_item,
                "version": 1,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None
            }

        self._bootstrap_intelligence_entities()

    def _bootstrap_intelligence_entities(self):
        """Initializes canonical intelligence data structures if absent."""
        now = time.time()
        iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))

        if not self.curriculum_mappings:
            self.curriculum_mappings = {
                "cur_dsa": {
                    "id": "cur_dsa",
                    "subject": "Data Structures & Algorithms",
                    "code": "CS-301",
                    "department_id": "dept_comp",
                    "institution_id": "inst_rscoe",
                    "semester": "Semester 5",
                    "topics": [
                        "Arrays & Dynamic Arrays",
                        "Linked Lists",
                        "Stacks & Queues",
                        "Trees & Binary Search Trees",
                        "Graphs & Graph Traversals (BFS/DFS)",
                        "Sorting & Searching Algorithms",
                        "Time & Space Complexity Analysis",
                        "Dynamic Programming Basics"
                    ],
                    "mapped_skills": ["DSA", "Python", "Algorithmic Thinking", "Problem Solving"],
                    "industry_requirements": ["Array/Graph Manipulations", "LeetCode-Style Optimization", "Clean Code AST Standards"],
                    "curriculum_coverage_pct": 91,
                    "expected_skill_level_pct": 80,
                    "version": 1,
                    "created_at": now,
                    "updated_at": now
                },
                "cur_dbms": {
                    "id": "cur_dbms",
                    "subject": "Database Management Systems",
                    "code": "CS-302",
                    "department_id": "dept_comp",
                    "institution_id": "inst_rscoe",
                    "semester": "Semester 5",
                    "topics": [
                        "Relational Data Models",
                        "SQL DDL / DML / DQL",
                        "Complex Joins & Subqueries",
                        "Indexes & Query Optimization",
                        "ACID Transactions & Concurrency",
                        "Normalization (1NF to BCNF)",
                        "NoSQL & MongoDB Introduction"
                    ],
                    "mapped_skills": ["SQL", "PostgreSQL", "Database Design", "Performance Tuning"],
                    "industry_requirements": ["High-Throughput Queries", "Index Strategy", "Data Integrity Assurance"],
                    "curriculum_coverage_pct": 88,
                    "expected_skill_level_pct": 75,
                    "version": 1,
                    "created_at": now,
                    "updated_at": now
                },
                "cur_web_cloud": {
                    "id": "cur_web_cloud",
                    "subject": "Web Technologies & Cloud Architecture",
                    "code": "CS-303",
                    "department_id": "dept_comp",
                    "institution_id": "inst_rscoe",
                    "semester": "Semester 6",
                    "topics": [
                        "Modern Frontend (React, Component Architecture)",
                        "RESTful API & FastAPI / Express",
                        "Asynchronous JavaScript & TypeScript",
                        "Microservices & Containerization (Docker)",
                        "Cloud Deployment & Serverless Basics (AWS/GCP)",
                        "Security, JWT & OAuth2"
                    ],
                    "mapped_skills": ["React", "FastAPI", "Docker", "AWS", "TypeScript", "REST API"],
                    "industry_requirements": ["Production Cloud-Native Services", "State Management", "CI/CD Deployment"],
                    "curriculum_coverage_pct": 82,
                    "expected_skill_level_pct": 70,
                    "version": 1,
                    "created_at": now,
                    "updated_at": now
                },
                "cur_aiml": {
                    "id": "cur_aiml",
                    "subject": "Artificial Intelligence & Applied Machine Learning",
                    "code": "CS-304",
                    "department_id": "dept_comp",
                    "institution_id": "inst_rscoe",
                    "semester": "Semester 6",
                    "topics": [
                        "Supervised Learning (Regression, Classification)",
                        "Scikit-Learn Model Pipelines",
                        "Feature Engineering & Data Cleaning",
                        "Neural Networks & Deep Learning Foundations",
                        "Evaluation Metrics (Precision, Recall, ROC-AUC)",
                        "Agentic Workflows & LLM Integration"
                    ],
                    "mapped_skills": ["Machine Learning", "Python", "Data Science", "Scikit-Learn"],
                    "industry_requirements": ["Production ML Inference", "Pipeline Robustness", "Model Monitoring"],
                    "curriculum_coverage_pct": 85,
                    "expected_skill_level_pct": 75,
                    "version": 1,
                    "created_at": now,
                    "updated_at": now
                }
            }

        if not self.academic_assignments:
            self.academic_assignments = {
                "asg_1": {
                    "id": "asg_1",
                    "title": "DSA Intermediate Mastery Challenge",
                    "type": "coding_challenge",
                    "skill": "DSA",
                    "target_type": "cohort",
                    "target_id": "dept_comp",
                    "target_label": "2027 CSE Batch",
                    "institution_id": "inst_rscoe",
                    "department_id": "dept_comp",
                    "created_by": "acad_1",
                    "creator_name": "Dr. Rajesh Kulkarni",
                    "description": "Complete intermediate Tree traversal and Dynamic Programming challenges to bridge the 29% cohort skill gap.",
                    "status": "In Progress",
                    "difficulty": "Intermediate",
                    "due_date": "2026-10-30",
                    "points": 100,
                    "total_assigned": 8,
                    "completed_count": 5,
                    "average_score": 76.4,
                    "created_at": now - 86400 * 5,
                    "version": 1
                },
                "asg_2": {
                    "id": "asg_2",
                    "title": "SQL Analytical Query Optimization Lab",
                    "type": "technical_assessment",
                    "skill": "SQL",
                    "target_type": "cohort",
                    "target_id": "dept_comp",
                    "target_label": "2027 CSE Batch",
                    "institution_id": "inst_rscoe",
                    "department_id": "dept_comp",
                    "created_by": "acad_1",
                    "creator_name": "Dr. Rajesh Kulkarni",
                    "description": "Solve complex relational joins, aggregations, and window functions simulating real recruiter technical benchmarks.",
                    "status": "Completed",
                    "difficulty": "Intermediate",
                    "due_date": "2026-10-15",
                    "points": 100,
                    "total_assigned": 8,
                    "completed_count": 7,
                    "average_score": 82.1,
                    "created_at": now - 86400 * 12,
                    "version": 1
                },
                "asg_3": {
                    "id": "asg_3",
                    "title": "National Campus Aptitude Simulation Series",
                    "type": "aptitude_test",
                    "skill": "Aptitude",
                    "target_type": "cohort",
                    "target_id": "dept_comp",
                    "target_label": "2027 CSE Batch",
                    "institution_id": "inst_rscoe",
                    "department_id": "dept_comp",
                    "created_by": "acad_1",
                    "creator_name": "Dr. Rajesh Kulkarni",
                    "description": "Timed quantitative aptitude, logical reasoning, and verbal analysis test calibrated against Barclays and TCS benchmarks.",
                    "status": "In Progress",
                    "difficulty": "Advanced",
                    "due_date": "2026-11-05",
                    "points": 100,
                    "total_assigned": 8,
                    "completed_count": 6,
                    "average_score": 84.5,
                    "created_at": now - 86400 * 3,
                    "version": 1
                }
            }

        if not self.assignment_submissions:
            self.assignment_submissions = {
                "sub_1": {
                    "id": "sub_1",
                    "assignment_id": "asg_1",
                    "student_id": "std_1",
                    "student_name": "Dhruv Patil",
                    "status": "Evaluated",
                    "submitted_at": iso_now,
                    "score": 92,
                    "feedback": "Flawless tree recursion and optimal time complexity.",
                    "skill_updated": True,
                    "created_at": now - 86400 * 2,
                    "version": 1
                },
                "sub_2": {
                    "id": "sub_2",
                    "assignment_id": "asg_1",
                    "student_id": "std_2",
                    "student_name": "Yuvraj Kadam",
                    "status": "Evaluated",
                    "submitted_at": iso_now,
                    "score": 85,
                    "feedback": "Good algorithmic structure; minor space overhead on memoization.",
                    "skill_updated": True,
                    "created_at": now - 86400 * 2,
                    "version": 1
                }
            }

        if not self.academic_interventions:
            self.academic_interventions = {
                "int_1": {
                    "id": "int_1",
                    "student_id": "std_2",
                    "student_name": "Yuvraj Kadam",
                    "institution_id": "inst_rscoe",
                    "department_id": "dept_comp",
                    "cohort": "2027 CSE Batch",
                    "priority": "HIGH",
                    "trigger_reasons": [
                        "DSA proficiency below target (56% vs 85% target)",
                        "Aptitude practice incomplete (< 3 completed tests)"
                    ],
                    "suggested_action": "Assign intermediate DSA practice and schedule peer mentoring",
                    "action_type": "assign_practice",
                    "status": "pending",
                    "created_by": "acad_1",
                    "created_at": iso_now,
                    "version": 1
                },
                "int_2": {
                    "id": "int_2",
                    "student_id": "std_1",
                    "student_name": "Dhruv Patil",
                    "institution_id": "inst_rscoe",
                    "department_id": "dept_comp",
                    "cohort": "2027 CSE Batch",
                    "priority": "MEDIUM",
                    "trigger_reasons": [
                        "No verified repository or code lab submission for Docker",
                        "SQL assessment incomplete"
                    ],
                    "suggested_action": "Request project evidence and assign SQL starter lab",
                    "action_type": "request_evidence",
                    "status": "pending",
                    "created_by": "acad_1",
                    "created_at": iso_now,
                    "version": 1
                }
            }

        if not self.campus_drives:
            self.campus_drives = {
                "drv_1": {
                    "id": "drv_1",
                    "title": "Barclays India 2026/2027 Campus Innovation Drive",
                    "recruiter_id": "recruiter_1",
                    "company": "Barclays India Innovation Centre",
                    "institution_id": "inst_rscoe",
                    "department_id": "dept_comp",
                    "batch": "2027 CSE",
                    "job_id": "opp_1",
                    "eligible_programs": ["B.Tech Computer Engineering", "B.Tech Information Technology"],
                    "min_cgpa": 7.5,
                    "min_assessment_score": 75,
                    "required_skills": ["Python", "FastAPI", "SQL", "DSA"],
                    "preferred_skills": ["Docker", "AWS"],
                    "salary": "₹12.5 LPA - ₹16.0 LPA",
                    "stipend": "₹45,000 / month",
                    "openings": 5,
                    "deadline": "2026-11-20",
                    "current_round": "Technical Interview",
                    "stages": [
                        {"name": "Eligibility & Screening", "candidates_count": 8, "status": "completed"},
                        {"name": "Online Skill Assessment", "candidates_count": 6, "status": "completed"},
                        {"name": "Shortlisting", "candidates_count": 4, "status": "completed"},
                        {"name": "Technical Interview", "candidates_count": 3, "status": "in_progress"},
                        {"name": "HR Interview", "candidates_count": 0, "status": "pending"},
                        {"name": "Offer Release", "candidates_count": 0, "status": "pending"},
                        {"name": "Joined", "candidates_count": 0, "status": "pending"}
                    ],
                    "status": "active",
                    "created_at": now - 86400 * 7,
                    "version": 1
                }
            }

        if not self.recruiter_assessments:
            self.recruiter_assessments = {
                "rec_asg_1": {
                    "id": "rec_asg_1",
                    "recruiter_id": "recruiter_1",
                    "company": "Barclays India Innovation Centre",
                    "title": "Fintech Full-Stack & Algorithm Hiring Assessment",
                    "target_job_id": "opp_1",
                    "duration_minutes": 60,
                    "passing_score": 75,
                    "sections": [
                        {"name": "Quantitative & Logical Aptitude", "questions_count": 10, "weight": 25},
                        {"name": "Coding (DSA & Complexity)", "questions_count": 2, "weight": 35},
                        {"name": "SQL & Relational Architecture", "questions_count": 5, "weight": 25},
                        {"name": "Technical Architecture MCQs", "questions_count": 10, "weight": 15}
                    ],
                    "total_takers": 6,
                    "avg_score": 81.2,
                    "created_at": now - 86400 * 6,
                    "version": 1
                }
            }

        if not self.recruiter_assessment_results:
            self.recruiter_assessment_results = {
                "res_1": {
                    "id": "res_1",
                    "assessment_id": "rec_asg_1",
                    "student_id": "std_1",
                    "student_name": "Dhruv Patil",
                    "job_id": "opp_1",
                    "scores_by_section": {
                        "Aptitude": 90,
                        "Coding": 95,
                        "SQL": 88,
                        "Architecture": 92
                    },
                    "overall_score": 91.5,
                    "passed": True,
                    "completed_at": iso_now,
                    "is_platform_verification": False,
                    "version": 1
                }
            }

        if not self.candidate_feedbacks:
            self.candidate_feedbacks = {
                "fb_1": {
                    "id": "fb_1",
                    "application_id": "app_1",
                    "recruiter_id": "recruiter_1",
                    "student_id": "std_1",
                    "student_name": "Dhruv Patil",
                    "job_id": "opp_1",
                    "round": "Technical Interview 1",
                    "technical_knowledge": 5,
                    "problem_solving": 5,
                    "communication": 4,
                    "skill_ratings": {
                        "Python": 5,
                        "FastAPI": 4,
                        "DSA": 4,
                        "Docker": 3
                    },
                    "strengths": "Outstanding grasp of async programming, API design, and AST complexity optimization.",
                    "improvement_areas": "Deepen containerization orchestration (Kubernetes / Docker Compose multi-stage builds).",
                    "recommended_student_action": "Complete Docker Production Lab & Multi-Stage Deployment Challenge in Code Lab.",
                    "created_at": iso_now,
                    "version": 1
                }
            }

        if not self.skill_timelines:
            self.skill_timelines = {
                "std_1": [
                    {
                        "skill": "Python",
                        "month": "Jan",
                        "score": 62,
                        "event": "Self-declared enrollment",
                        "source": "Student Profile",
                        "timestamp": "2026-01-15T10:00:00Z"
                    },
                    {
                        "skill": "Python",
                        "month": "Feb",
                        "score": 74,
                        "event": "Code Lab AST Challenge Completed",
                        "source": "Code Lab",
                        "timestamp": "2026-02-20T14:30:00Z"
                    },
                    {
                        "skill": "Python",
                        "month": "Mar",
                        "score": 86,
                        "event": "Project Repository Verified & Faculty Endorsed",
                        "source": "Faculty Verification",
                        "timestamp": "2026-03-25T11:00:00Z"
                    },
                    {
                        "skill": "Python",
                        "month": "Apr",
                        "score": 92,
                        "event": "Adaptive Timed Skill Assessment Passed",
                        "source": "Platform Assessment",
                        "timestamp": "2026-04-12T16:45:00Z"
                    },
                    {
                        "skill": "DSA",
                        "month": "Jan",
                        "score": 42,
                        "event": "Initial Aptitude Diagnostic",
                        "source": "Platform Assessment",
                        "timestamp": "2026-01-20T09:00:00Z"
                    },
                    {
                        "skill": "DSA",
                        "month": "Feb",
                        "score": 51,
                        "event": "Academic Assignment: Arrays & Linked Lists",
                        "source": "Academician Assignment",
                        "timestamp": "2026-02-18T10:00:00Z"
                    },
                    {
                        "skill": "DSA",
                        "month": "Mar",
                        "score": 63,
                        "event": "Faculty Intervention: Peer Mentoring Lab",
                        "source": "Academician Intervention",
                        "timestamp": "2026-03-22T15:00:00Z"
                    },
                    {
                        "skill": "DSA",
                        "month": "Apr",
                        "score": 78,
                        "event": "Barclays Hiring Assessment Section Completed",
                        "source": "Recruiter Assessment",
                        "timestamp": "2026-04-05T14:00:00Z"
                    }
                ]
            }

    def _save_to_disk(self):
        """Thread-safe, atomic write using temporary swap file."""
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        tmp_path = f"{self.file_path}.tmp_{uuid.uuid4().hex[:6]}"
        data = {
            "version": 2,
            "saved_at": time.time(),
            "users": self.users,
            "students": self.students,
            "student_registrations": self.student_registrations,
            "companies": self.companies,
            "recruiters": self.recruiters,
            "academicians": self.academicians,
            "institutions": self.institutions,
            "departments": self.departments,
            "opportunities": self.opportunities,
            "applications": self.applications,
            "assessments": self.assessments,
            "recommendations": self.recommendations,
            "audit_logs": self.audit_logs[-500:],  # keep last 500 audit logs
            "notifications": self.notifications[-300:],
            "match_cache": self.match_cache,
            "skill_reviews": self.skill_reviews,
            "assessment_questions": self.assessment_questions,
            "assessment_attempts": self.assessment_attempts,
            "student_seen_questions": self.student_seen_questions,
            "curriculum_mappings": self.curriculum_mappings,
            "academic_assignments": self.academic_assignments,
            "assignment_submissions": self.assignment_submissions,
            "academic_interventions": self.academic_interventions,
            "campus_drives": self.campus_drives,
            "recruiter_assessments": self.recruiter_assessments,
            "recruiter_assessment_results": self.recruiter_assessment_results,
            "candidate_feedbacks": self.candidate_feedbacks,
            "skill_timelines": self.skill_timelines
        }
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        # Atomic rename guarantees file integrity with Windows fallback
        try:
            os.replace(tmp_path, self.file_path)
        except OSError:
            import shutil
            shutil.copyfile(tmp_path, self.file_path)
            try:
                os.remove(tmp_path)
            except OSError:
                pass

    # -------------------------------------------------------------
    # AUDIT LOGGING & NOTIFICATIONS
    # -------------------------------------------------------------
    def record_audit_log(
        self,
        actor_id: str,
        action: str,
        entity_type: str,
        entity_id: str,
        from_value: Any,
        to_value: Any,
        event_id: Optional[str] = None
    ) -> dict:
        log_entry = {
            "log_id": f"aud_{int(time.time()*1000)}_{uuid.uuid4().hex[:4]}",
            "timestamp": time.time(),
            "iso_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "actor_id": actor_id or "system",
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "from_value": from_value,
            "to_value": to_value,
            "event_id": event_id
        }
        self.audit_logs.append(log_entry)
        return log_entry

    def create_notification(
        self,
        recipient_id: str,
        notif_type: str,
        title: str,
        message: str,
        entity_type: str,
        entity_id: str
    ) -> dict:
        notif = {
            "notification_id": f"notif_{int(time.time()*1000)}_{uuid.uuid4().hex[:4]}",
            "recipient_id": recipient_id,
            "type": notif_type,
            "title": title,
            "message": message,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "read_at": None,
            "created_at": time.time(),
            "formatted_time": time.strftime("%H:%M:%S")
        }
        self.notifications.append(notif)
        return notif

    def get_notifications_for_user(self, recipient_id: str) -> List[dict]:
        with self._lock:
            return [n for n in self.notifications if n.get("recipient_id") == recipient_id][-50:]

    # -------------------------------------------------------------
    # PROFILE COMPLETION CALCULATION
    # -------------------------------------------------------------
    def calculate_profile_completion(self, student: dict) -> int:
        """Calculates authentic profile completion % based on actual populated fields."""
        weights = {
            "basic_info": 15,       # name, email, college
            "academic_details": 15, # department, year, prn, cgpa
            "skills": 25,           # at least 3 skills
            "resume": 15,           # resume_text or resume attachment
            "github_profile": 10,   # github_url provided
            "projects": 10,         # at least 1 project
            "verification": 10      # verified_score >= 70 or verified skill
        }

        earned = 0
        if student.get("name") and student.get("email") and student.get("college"):
            earned += weights["basic_info"]

        if student.get("department") and student.get("year") and student.get("prn"):
            earned += weights["academic_details"]

        skills = student.get("skills", {})
        if len(skills) >= 3:
            earned += weights["skills"]
        elif len(skills) > 0:
            earned += int(weights["skills"] * (len(skills) / 3))

        if student.get("resume_text") or student.get("resume_url") or student.get("resume_name"):
            earned += weights["resume"]

        if student.get("github_url"):
            earned += weights["github_profile"]

        if student.get("projects_count", 0) > 0 or len(student.get("projects", [])) > 0:
            earned += weights["projects"]

        if student.get("verified_score", 0) >= 70 or any(s.get("verified") for s in skills.values()):
            earned += weights["verification"]

        return min(100, max(0, earned))

    # -------------------------------------------------------------
    # STUDENT ENTITY OPERATIONS (OCC + VERSIONING)
    # -------------------------------------------------------------
    def get_student(self, student_id: str) -> Optional[dict]:
        with self._lock:
            s = self.students.get(student_id)
            if s and not s.get("deleted_at"):
                return dict(s)
            return None

    def get_all_students(self, filter_fn=None) -> List[dict]:
        with self._lock:
            res = [dict(s) for s in self.students.values() if not s.get("deleted_at")]
            if filter_fn:
                res = [s for s in res if filter_fn(s)]
            return res

    def update_student(
        self,
        student_id: str,
        updates: dict,
        expected_version: Optional[int] = None,
        actor_id: Optional[str] = None
    ) -> Tuple[dict, dict]:
        """
        Updates student atomically. Enforces OCC if expected_version is provided.
        Returns: (updated_student, previous_student)
        """
        with self._lock:
            current = self.students.get(student_id)
            if not current or current.get("deleted_at"):
                raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")

            curr_ver = current.get("version", 1)
            if expected_version is not None and expected_version != curr_ver:
                raise ConcurrencyConflictException("Student", student_id, curr_ver, expected_version)

            prev_copy = dict(current)
            new_ver = curr_ver + 1

            # Apply updates
            for k, v in updates.items():
                if k not in ["id", "version", "created_at"]:
                    current[k] = v

            current["version"] = new_ver
            current["updated_at"] = time.time()
            current["profile_completion"] = self.calculate_profile_completion(current)

            # Record Audit Log
            self.record_audit_log(
                actor_id=actor_id or student_id,
                action="STUDENT_UPDATED",
                entity_type="student",
                entity_id=student_id,
                from_value={"version": curr_ver, "keys": list(updates.keys())},
                to_value={"version": new_ver}
            )

            # Invalidate match cache for this student
            self._invalidate_matches_for_student(student_id)

            self._save_to_disk()
            return dict(current), prev_copy

    def save_student_profile(self, student_dict: dict, actor_id: Optional[str] = None) -> dict:
        """Upsert student without strict OCC (e.g. during initial onboarding)."""
        with self._lock:
            s_id = student_dict.get("id")
            if not s_id:
                s_id = f"std_{uuid.uuid4().hex[:6]}"
                student_dict["id"] = s_id

            existing = self.students.get(s_id)
            now = time.time()
            if existing:
                curr_ver = existing.get("version", 1)
                new_ver = curr_ver + 1
                for k, v in student_dict.items():
                    if k not in ["id", "version", "created_at"]:
                        existing[k] = v
                existing["version"] = new_ver
                existing["updated_at"] = now
                existing["profile_completion"] = self.calculate_profile_completion(existing)
                target = existing
            else:
                student_dict["version"] = 1
                student_dict["created_at"] = now
                student_dict["updated_at"] = now
                student_dict["deleted_at"] = None
                student_dict["profile_completion"] = self.calculate_profile_completion(student_dict)
                self.students[s_id] = student_dict
                target = student_dict

            self._save_to_disk()
            return dict(target)

    def save_student_registration(self, reg_dict: dict) -> dict:
        with self._lock:
            s_id = reg_dict.get("student_id", "std_1")
            self.student_registrations[s_id] = dict(reg_dict)
            self._save_to_disk()
            return dict(self.student_registrations[s_id])

    def get_student_registration(self, student_id: str) -> Optional[dict]:
        with self._lock:
            reg = self.student_registrations.get(student_id)
            return dict(reg) if reg else None

    def update_student_skills(
        self,
        student_id: str,
        skills_update: dict,
        actor_id: Optional[str] = None
    ) -> Tuple[dict, dict]:
        """Atomically updates student skills, recalculates verified score and invalidates match cache."""
        with self._lock:
            student = self.students.get(student_id)
            if not student or student.get("deleted_at"):
                raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")

            curr_ver = student.get("version", 1)
            prev_copy = dict(student)
            new_ver = curr_ver + 1

            if "skills" not in student:
                student["skills"] = {}

            for skill_name, skill_info in skills_update.items():
                student["skills"][skill_name] = skill_info

            all_scores = [v.get("score", 70) if isinstance(v, dict) else v for v in student["skills"].values()]
            student["verified_score"] = round(sum(all_scores) / max(1, len(all_scores))) if all_scores else 70
            student["version"] = new_ver
            student["updated_at"] = time.time()
            student["profile_completion"] = self.calculate_profile_completion(student)

            self.record_audit_log(
                actor_id=actor_id or student_id,
                action="STUDENT_SKILLS_UPDATED",
                entity_type="student",
                entity_id=student_id,
                from_value={"skills_count": len(prev_copy.get("skills", {})), "version": curr_ver},
                to_value={"skills_count": len(student["skills"]), "version": new_ver, "updated_skills": list(skills_update.keys())}
            )

            self._invalidate_matches_for_student(student_id)
            self._save_to_disk()
            return dict(student), prev_copy

    def update_company(
        self,
        company_id: str,
        updates: dict,
        expected_version: Optional[int] = None,
        actor_id: Optional[str] = None
    ) -> Tuple[dict, dict]:
        with self._lock:
            comp = self.companies.get(company_id)
            if not comp or comp.get("deleted_at"):
                raise HTTPException(status_code=404, detail=f"Company '{company_id}' not found.")

            curr_ver = comp.get("version", 1)
            if expected_version is not None and expected_version != curr_ver:
                raise ConcurrencyConflictException("Company", company_id, curr_ver, expected_version)

            prev_copy = dict(comp)
            new_ver = curr_ver + 1

            for k, v in updates.items():
                if k not in ["id", "version", "created_at"]:
                    comp[k] = v

            comp["version"] = new_ver
            comp["updated_at"] = time.time()

            # Cascade company name/logo update to active opportunities
            new_name = comp.get("name")
            if new_name:
                for opp in self.opportunities.values():
                    if opp.get("company_id") == company_id:
                        opp["company"] = new_name
                        opp["version"] = opp.get("version", 1) + 1
                        opp["updated_at"] = time.time()

            self.record_audit_log(
                actor_id=actor_id or "recruiter",
                action="COMPANY_UPDATED",
                entity_type="company",
                entity_id=company_id,
                from_value={"version": curr_ver},
                to_value={"version": new_ver, "keys": list(updates.keys())}
            )

            self._save_to_disk()
            return dict(comp), prev_copy

    def get_recruiter(self, recruiter_id: str) -> Optional[dict]:
        with self._lock:
            rec = self.recruiters.get(recruiter_id)
            if not rec and recruiter_id in ["recruiter_1", "rec_1"]:
                alt_id = "rec_1" if recruiter_id == "recruiter_1" else "recruiter_1"
                rec = self.recruiters.get(alt_id)
            if rec and not rec.get("deleted_at"):
                return dict(rec)
            return None

    def get_all_recruiters(self) -> List[dict]:
        with self._lock:
            return [dict(r) for r in self.recruiters.values() if not r.get("deleted_at")]

    def get_academician(self, academician_id: str) -> Optional[dict]:
        with self._lock:
            acad = self.academicians.get(academician_id)
            if not acad and academician_id in ["academician_1", "acad_1"]:
                alt_id = "acad_1" if academician_id == "academician_1" else "academician_1"
                acad = self.academicians.get(alt_id)
            if acad and not acad.get("deleted_at"):
                return dict(acad)
            return None

    def get_all_academicians(self) -> List[dict]:
        with self._lock:
            return [dict(a) for a in self.academicians.values() if not a.get("deleted_at")]

    def update_recruiter(
        self,
        recruiter_id: str,
        updates: dict,
        expected_version: Optional[int] = None,
        actor_id: Optional[str] = None
    ) -> Tuple[dict, dict]:
        with self._lock:
            rec = self.recruiters.get(recruiter_id)
            if not rec and recruiter_id in ["recruiter_1", "rec_1"]:
                alt_id = "rec_1" if recruiter_id == "recruiter_1" else "recruiter_1"
                rec = self.recruiters.get(alt_id)
                if rec:
                    recruiter_id = alt_id

            if not rec or rec.get("deleted_at"):
                raise HTTPException(status_code=404, detail=f"Recruiter '{recruiter_id}' not found.")

            curr_ver = rec.get("version", 1)
            if expected_version is not None and expected_version != curr_ver:
                raise ConcurrencyConflictException("Recruiter", recruiter_id, curr_ver, expected_version)

            prev_copy = dict(rec)
            new_ver = curr_ver + 1

            for k, v in updates.items():
                if k not in ["id", "version", "created_at"]:
                    rec[k] = v

            rec["version"] = new_ver
            rec["updated_at"] = time.time()

            self.record_audit_log(
                actor_id=actor_id or recruiter_id,
                action="RECRUITER_UPDATED",
                entity_type="recruiter",
                entity_id=recruiter_id,
                from_value={"version": curr_ver},
                to_value={"version": new_ver}
            )

            self._save_to_disk()
            return dict(rec), prev_copy

    def update_academician(
        self,
        academician_id: str,
        updates: dict,
        expected_version: Optional[int] = None,
        actor_id: Optional[str] = None
    ) -> Tuple[dict, dict]:
        with self._lock:
            acad = self.academicians.get(academician_id)
            if not acad or acad.get("deleted_at"):
                raise HTTPException(status_code=404, detail=f"Academician '{academician_id}' not found.")

            curr_ver = acad.get("version", 1)
            if expected_version is not None and expected_version != curr_ver:
                raise ConcurrencyConflictException("Academician", academician_id, curr_ver, expected_version)

            prev_copy = dict(acad)
            new_ver = curr_ver + 1

            for k, v in updates.items():
                if k not in ["id", "version", "created_at"]:
                    acad[k] = v

            acad["version"] = new_ver
            acad["updated_at"] = time.time()

            self.record_audit_log(
                actor_id=actor_id or academician_id,
                action="ACADEMICIAN_UPDATED",
                entity_type="academician",
                entity_id=academician_id,
                from_value={"version": curr_ver},
                to_value={"version": new_ver}
            )

            self._save_to_disk()
            return dict(acad), prev_copy

    def update_institution(
        self,
        inst_id: str,
        updates: dict,
        expected_version: Optional[int] = None,
        actor_id: Optional[str] = None
    ) -> Tuple[dict, dict]:
        with self._lock:
            inst = self.institutions.get(inst_id)
            if not inst or inst.get("deleted_at"):
                raise HTTPException(status_code=404, detail=f"Institution '{inst_id}' not found.")

            curr_ver = inst.get("version", 1)
            if expected_version is not None and expected_version != curr_ver:
                raise ConcurrencyConflictException("Institution", inst_id, curr_ver, expected_version)

            prev_copy = dict(inst)
            new_ver = curr_ver + 1

            for k, v in updates.items():
                if k not in ["id", "version", "created_at"]:
                    inst[k] = v

            inst["version"] = new_ver
            inst["updated_at"] = time.time()

            self.record_audit_log(
                actor_id=actor_id or "admin",
                action="INSTITUTION_UPDATED",
                entity_type="institution",
                entity_id=inst_id,
                from_value={"version": curr_ver},
                to_value={"version": new_ver}
            )

            self._save_to_disk()
            return dict(inst), prev_copy

    # -------------------------------------------------------------
    # OPPORTUNITIES / JOBS (OCC + VERSIONING)
    # -------------------------------------------------------------
    def get_opportunity(self, opp_id: str) -> Optional[dict]:
        with self._lock:
            opp = self.opportunities.get(opp_id)
            if opp and not opp.get("deleted_at"):
                return dict(opp)
            return None

    def get_all_opportunities(self) -> List[dict]:
        with self._lock:
            return [dict(o) for o in self.opportunities.values() if not o.get("deleted_at")]

    def create_opportunity(self, opp_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            opp_id = opp_dict.get("id") or f"opp_{uuid.uuid4().hex[:6]}"
            now = time.time()
            opp_record = {
                **opp_dict,
                "id": opp_id,
                "version": 1,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None
            }
            self.opportunities[opp_id] = opp_record

            self.record_audit_log(
                actor_id=actor_id or "recruiter",
                action="OPPORTUNITY_CREATED",
                entity_type="opportunity",
                entity_id=opp_id,
                from_value=None,
                to_value={"title": opp_record.get("title"), "company": opp_record.get("company")}
            )

            # Invalidate matches for this new opportunity
            self._invalidate_matches_for_opportunity(opp_id)

            self._save_to_disk()
            return dict(opp_record)

    def update_opportunity(
        self,
        opp_id: str,
        updates: dict,
        expected_version: Optional[int] = None,
        actor_id: Optional[str] = None
    ) -> Tuple[dict, dict]:
        with self._lock:
            current = self.opportunities.get(opp_id)
            if not current or current.get("deleted_at"):
                raise HTTPException(status_code=404, detail=f"Opportunity '{opp_id}' not found.")

            curr_ver = current.get("version", 1)
            if expected_version is not None and expected_version != curr_ver:
                raise ConcurrencyConflictException("Opportunity", opp_id, curr_ver, expected_version)

            prev_copy = dict(current)
            new_ver = curr_ver + 1

            for k, v in updates.items():
                if k not in ["id", "version", "created_at"]:
                    current[k] = v

            current["version"] = new_ver
            current["updated_at"] = time.time()

            self.record_audit_log(
                actor_id=actor_id or "recruiter",
                action="OPPORTUNITY_UPDATED",
                entity_type="opportunity",
                entity_id=opp_id,
                from_value={"version": curr_ver},
                to_value={"version": new_ver, "keys": list(updates.keys())}
            )

            self._invalidate_matches_for_opportunity(opp_id)
            self._save_to_disk()
            return dict(current), prev_copy

    # -------------------------------------------------------------
    # APPLICATIONS (OCC + VERSIONING + STATUS LOOP)
    # -------------------------------------------------------------
    def get_application(self, app_id: str) -> Optional[dict]:
        with self._lock:
            a = self.applications.get(app_id)
            if a and not a.get("deleted_at"):
                return dict(a)
            return None

    def get_applications(self, filter_fn=None) -> List[dict]:
        with self._lock:
            res = [dict(a) for a in self.applications.values() if not a.get("deleted_at")]
            if filter_fn:
                res = [a for a in res if filter_fn(a)]
            return res

    def create_application(self, app_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            s_id = app_dict.get("student_id")
            o_id = app_dict.get("opportunity_id")

            # Duplicate check
            existing = any(
                a.get("student_id") == s_id and a.get("opportunity_id") == o_id and not a.get("deleted_at")
                for a in self.applications.values()
            )
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail=f"Duplicate Application: You have already applied for this opportunity."
                )

            app_id = app_dict.get("id") or f"app_{uuid.uuid4().hex[:8]}"
            now = time.time()
            iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

            record = {
                **app_dict,
                "id": app_id,
                "version": 1,
                "status": app_dict.get("status", "Applied"),
                "applied_at": iso_now,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None,
                "status_history": [
                    {"status": app_dict.get("status", "Applied"), "updated_at": iso_now, "note": "Application submitted"}
                ]
            }
            self.applications[app_id] = record

            self.record_audit_log(
                actor_id=actor_id or s_id,
                action="APPLICATION_CREATED",
                entity_type="application",
                entity_id=app_id,
                from_value=None,
                to_value={"status": "Applied", "opportunity_id": o_id, "student_id": s_id}
            )

            # Create notification for recruiter
            opp = self.opportunities.get(o_id, {})
            self.create_notification(
                recipient_id=opp.get("recruiter_id", "recruiter_general"),
                notif_type="NEW_APPLICANT",
                title=f"New Candidate Applied for {opp.get('title', 'Role')}",
                message=f"Student {app_dict.get('student_name', s_id)} applied with match score {app_dict.get('match_percentage', 80)}%.",
                entity_type="application",
                entity_id=app_id
            )

            self._save_to_disk()
            return dict(record)

    def update_application_status(
        self,
        app_id: str,
        new_status: str,
        note: Optional[str] = None,
        expected_version: Optional[int] = None,
        actor_id: Optional[str] = None
    ) -> Tuple[dict, dict]:
        with self._lock:
            app_item = self.applications.get(app_id)
            if not app_item or app_item.get("deleted_at"):
                raise HTTPException(status_code=404, detail=f"Application '{app_id}' not found.")

            curr_ver = app_item.get("version", 1)
            if expected_version is not None and expected_version != curr_ver:
                raise ConcurrencyConflictException("Application", app_id, curr_ver, expected_version)

            prev_copy = dict(app_item)
            old_status = app_item.get("status", "Applied")
            new_ver = curr_ver + 1

            iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            app_item["status"] = new_status
            app_item["version"] = new_ver
            app_item["updated_at"] = time.time()

            if "status_history" not in app_item:
                app_item["status_history"] = []

            app_item["status_history"].append({
                "status": new_status,
                "updated_at": iso_now,
                "note": note or f"Status changed from {old_status} to {new_status}."
            })

            # Record Audit Log
            self.record_audit_log(
                actor_id=actor_id or "recruiter",
                action="APPLICATION_STATUS_CHANGED",
                entity_type="application",
                entity_id=app_id,
                from_value={"status": old_status, "version": curr_ver},
                to_value={"status": new_status, "version": new_ver}
            )

            # Create notification for student
            self.create_notification(
                recipient_id=app_item.get("student_id", ""),
                notif_type="APPLICATION_STATUS_UPDATE",
                title=f"Application Status: {new_status}",
                message=f"Your application for {app_item.get('title')} at {app_item.get('company')} is now {new_status}.",
                entity_type="application",
                entity_id=app_id
            )

            self._save_to_disk()
            return dict(app_item), prev_copy

    # -------------------------------------------------------------
    # COURSE RECOMMENDATIONS (ACADEMICIAN -> STUDENT)
    # -------------------------------------------------------------
    def create_recommendation(self, rec_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            rec_id = rec_dict.get("id") or f"rec_{uuid.uuid4().hex[:8]}"
            now = time.time()
            record = {
                **rec_dict,
                "id": rec_id,
                "version": 1,
                "created_at": now,
                "updated_at": now,
                "deleted_at": None
            }
            self.recommendations[rec_id] = record

            self.record_audit_log(
                actor_id=actor_id or "academician",
                action="COURSE_RECOMMENDED",
                entity_type="recommendation",
                entity_id=rec_id,
                from_value=None,
                to_value={"skill": rec_dict.get("skill"), "target": rec_dict.get("target_label")}
            )

            # Notify student if target is individual student
            if rec_dict.get("target_student_id"):
                self.create_notification(
                    recipient_id=rec_dict["target_student_id"],
                    notif_type="COURSE_RECOMMENDATION",
                    title="Faculty Recommended Course",
                    message=f"{rec_dict.get('academician_name', 'Professor')} recommended '{rec_dict.get('course_title')}' to strengthen your {rec_dict.get('skill')} skills.",
                    entity_type="recommendation",
                    entity_id=rec_id
                )

            self._save_to_disk()
            return dict(record)

    def get_recommendations(self, filter_fn=None) -> List[dict]:
        with self._lock:
            res = [dict(r) for r in self.recommendations.values() if not r.get("deleted_at")]
            if filter_fn:
                res = [r for r in res if filter_fn(r)]
            return res

    # -------------------------------------------------------------
    # DERIVED OPPORTUNITY MATCH FRESHNESS ENGINE
    # -------------------------------------------------------------
    def _invalidate_matches_for_student(self, student_id: str):
        """Invalidates calculated match cache for a student when their skills change."""
        keys_to_del = [k for k in self.match_cache.keys() if k.startswith(f"{student_id}:")]
        for k in keys_to_del:
            del self.match_cache[k]

    def _invalidate_matches_for_opportunity(self, opp_id: str):
        """Invalidates calculated match cache for an opportunity when requirements change."""
        keys_to_del = [k for k in self.match_cache.keys() if k.endswith(f":{opp_id}")]
        for k in keys_to_del:
            del self.match_cache[k]

    def get_or_calculate_match(self, student: dict, opp: dict, calculate_fn) -> dict:
        """
        Retrieves cached match or computes fresh match, recording version tracking metadata.
        """
        s_id = student.get("id", "std_anon")
        o_id = opp.get("id", "opp_anon")
        cache_key = f"{s_id}:{o_id}"
        s_ver = student.get("version", 1)
        o_ver = opp.get("version", 1)

        with self._lock:
            cached = self.match_cache.get(cache_key)
            if cached and cached.get("student_version") == s_ver and cached.get("opportunity_version") == o_ver:
                return dict(cached)

            # Fresh calculation
            res = calculate_fn(student, opp)
            entry = {
                **res,
                "match_score": res.get("match_percentage", 80),
                "calculated_at": time.time(),
                "student_version": s_ver,
                "opportunity_version": o_ver,
                "matching_model_version": "v3.2_ridge_semantic",
                "is_stale": False
            }
            self.match_cache[cache_key] = entry
            return dict(entry)

    # -------------------------------------------------------------
    # SKILL REVIEW & ADAPTIVE ASSESSMENT PERSISTENCE
    # -------------------------------------------------------------
    def get_skill_reviews(self, student_id: str) -> List[dict]:
        with self._lock:
            prefix = f"{student_id}:"
            return [dict(v) for k, v in self.skill_reviews.items() if k.startswith(prefix)]

    def get_skill_review(self, student_id: str, skill_id: str) -> Optional[dict]:
        with self._lock:
            key = f"{student_id}:{skill_id.lower()}"
            item = self.skill_reviews.get(key)
            return dict(item) if item else None

    def save_skill_review(self, record: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            student_id = record.get("student_id", "std_1")
            skill_id = record.get("skill_id", "").lower()
            key = f"{student_id}:{skill_id}"
            now = time.time()
            existing = self.skill_reviews.get(key, {})
            merged = {
                **existing,
                **record,
                "student_id": student_id,
                "skill_id": skill_id,
                "updated_at": now,
                "created_at": existing.get("created_at", now)
            }
            self.skill_reviews[key] = merged
            self._save_to_disk()
            return dict(merged)

    def save_assessment_question(self, q_dict: dict) -> dict:
        with self._lock:
            q_id = q_dict.get("id") or f"q_{uuid.uuid4().hex[:8]}"
            now = time.time()
            record = {
                **q_dict,
                "id": q_id,
                "created_at": q_dict.get("created_at", now)
            }
            self.assessment_questions[q_id] = record
            self._save_to_disk()
            return dict(record)

    def get_assessment_question_by_hash(self, q_hash: str) -> Optional[dict]:
        with self._lock:
            for q in self.assessment_questions.values():
                if q.get("question_hash") == q_hash:
                    return dict(q)
            return None

    def get_student_seen_hashes(self, student_id: str, skill_id: str) -> Set[str]:
        with self._lock:
            key = f"{student_id}:{skill_id.lower()}"
            return set(self.student_seen_questions.get(key, []))

    def record_student_seen_question(self, student_id: str, skill_id: str, q_hash: str):
        with self._lock:
            key = f"{student_id}:{skill_id.lower()}"
            if key not in self.student_seen_questions:
                self.student_seen_questions[key] = []
            if q_hash not in self.student_seen_questions[key]:
                self.student_seen_questions[key].append(q_hash)
            self._save_to_disk()

    def create_assessment_attempt(self, attempt_dict: dict) -> dict:
        with self._lock:
            att_id = attempt_dict.get("id") or f"att_{uuid.uuid4().hex[:8]}"
            now = time.time()
            record = {
                **attempt_dict,
                "id": att_id,
                "created_at": now,
                "status": attempt_dict.get("status", "in_progress")
            }
            self.assessment_attempts[att_id] = record
            self._save_to_disk()
            return dict(record)

    def get_assessment_attempt(self, attempt_id: str) -> Optional[dict]:
        with self._lock:
            att = self.assessment_attempts.get(attempt_id)
            return dict(att) if att else None

    def update_assessment_attempt(self, attempt_id: str, updates: dict) -> dict:
        with self._lock:
            att = self.assessment_attempts.get(attempt_id)
            if not att:
                raise HTTPException(status_code=404, detail=f"Assessment attempt '{attempt_id}' not found.")
            for k, v in updates.items():
                att[k] = v
            att["updated_at"] = time.time()
            self._save_to_disk()
            return dict(att)

    def get_student_attempts_for_skill(self, student_id: str, skill_id: str) -> List[dict]:
        with self._lock:
            s_id_lower = skill_id.lower()
            return [
                dict(a) for a in self.assessment_attempts.values()
                if a.get("student_id") == student_id and a.get("skill_id", "").lower() == s_id_lower
            ]

    # -------------------------------------------------------------
    # CURRICULUM MAPPING (ACADEMIA <-> INDUSTRY SKILL ALIGNMENT)
    # -------------------------------------------------------------
    def get_curriculum_mappings(self, inst_id: Optional[str] = None, dept_id: Optional[str] = None) -> List[dict]:
        with self._lock:
            mappings = list(self.curriculum_mappings.values())
            if inst_id:
                mappings = [m for m in mappings if m.get("institution_id") == inst_id]
            if dept_id:
                mappings = [m for m in mappings if m.get("department_id") == dept_id]
            return [dict(m) for m in mappings]

    def save_curriculum_mapping(self, cur_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            c_id = cur_dict.get("id") or f"cur_{uuid.uuid4().hex[:8]}"
            now = time.time()
            existing = self.curriculum_mappings.get(c_id, {})
            curr_ver = existing.get("version", 0)
            record = {
                **existing,
                **cur_dict,
                "id": c_id,
                "version": curr_ver + 1,
                "updated_at": now,
                "created_at": existing.get("created_at", now)
            }
            self.curriculum_mappings[c_id] = record
            self.record_audit_log(
                actor_id=actor_id or "academician",
                action="CURRICULUM_MAPPING_UPDATED",
                entity_type="curriculum_mapping",
                entity_id=c_id,
                from_value={"version": curr_ver},
                to_value={"version": record["version"], "subject": record.get("subject")}
            )
            self._save_to_disk()
            return dict(record)

    # -------------------------------------------------------------
    # ACADEMIC ASSIGNMENTS & SUBMISSION LIFECYCLE
    # -------------------------------------------------------------
    def get_academic_assignments(
        self,
        inst_id: Optional[str] = None,
        dept_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[dict]:
        with self._lock:
            asgs = list(self.academic_assignments.values())
            if inst_id:
                asgs = [a for a in asgs if a.get("institution_id") == inst_id]
            if dept_id:
                asgs = [a for a in asgs if a.get("department_id") == dept_id]
            if status and status != "All":
                asgs = [a for a in asgs if a.get("status", "").lower() == status.lower()]
            return [dict(a) for a in asgs]

    def get_academic_assignment(self, asg_id: str) -> Optional[dict]:
        with self._lock:
            a = self.academic_assignments.get(asg_id)
            return dict(a) if a else None

    def create_academic_assignment(self, asg_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            asg_id = asg_dict.get("id") or f"asg_{uuid.uuid4().hex[:8]}"
            now = time.time()
            record = {
                **asg_dict,
                "id": asg_id,
                "status": asg_dict.get("status", "Assigned"),
                "total_assigned": asg_dict.get("total_assigned", 8),
                "completed_count": asg_dict.get("completed_count", 0),
                "average_score": asg_dict.get("average_score", 0.0),
                "version": 1,
                "created_at": now,
                "updated_at": now
            }
            self.academic_assignments[asg_id] = record

            self.record_audit_log(
                actor_id=actor_id or "academician",
                action="ASSIGNMENT_CREATED",
                entity_type="academic_assignment",
                entity_id=asg_id,
                from_value=None,
                to_value={"title": record.get("title"), "skill": record.get("skill")}
            )

            # Notify students in target cohort
            target_student_id = asg_dict.get("target_student_id")
            if target_student_id:
                self.create_notification(
                    recipient_id=target_student_id,
                    notif_type="ACADEMIC_ASSIGNMENT",
                    title=f"New Assignment: {record.get('title')}",
                    message=f"Faculty assigned '{record.get('title')}' for {record.get('skill')} skill development.",
                    entity_type="academic_assignment",
                    entity_id=asg_id
                )
            else:
                # Notify students in cohort
                target_cohort_id = asg_dict.get("target_id", "dept_comp")
                for s_id, s in self.students.items():
                    if s.get("department_id") == asg_dict.get("department_id", "dept_comp"):
                        self.create_notification(
                            recipient_id=s_id,
                            notif_type="ACADEMIC_ASSIGNMENT",
                            title=f"Cohort Assignment: {record.get('title')}",
                            message=f"New {record.get('skill')} assessment challenge posted by Faculty.",
                            entity_type="academic_assignment",
                            entity_id=asg_id
                        )

            self._save_to_disk()
            return dict(record)

    def update_academic_assignment(
        self,
        asg_id: str,
        updates: dict,
        expected_version: Optional[int] = None,
        actor_id: Optional[str] = None
    ) -> Tuple[dict, dict]:
        with self._lock:
            current = self.academic_assignments.get(asg_id)
            if not current:
                raise HTTPException(status_code=404, detail=f"Assignment '{asg_id}' not found.")

            curr_ver = current.get("version", 1)
            if expected_version is not None and curr_ver != expected_version:
                raise ConcurrencyConflictException("academic_assignment", asg_id, curr_ver, expected_version)

            prev_copy = dict(current)
            for k, v in updates.items():
                if k not in ["id", "version", "created_at"]:
                    current[k] = v

            current["version"] = curr_ver + 1
            current["updated_at"] = time.time()

            self.record_audit_log(
                actor_id=actor_id or "academician",
                action="ASSIGNMENT_UPDATED",
                entity_type="academic_assignment",
                entity_id=asg_id,
                from_value={"version": curr_ver},
                to_value={"version": current["version"]}
            )

            self._save_to_disk()
            return dict(current), prev_copy

    def get_assignment_submissions(
        self,
        assignment_id: Optional[str] = None,
        student_id: Optional[str] = None
    ) -> List[dict]:
        with self._lock:
            subs = list(self.assignment_submissions.values())
            if assignment_id:
                subs = [s for s in subs if s.get("assignment_id") == assignment_id]
            if student_id:
                subs = [s for s in subs if s.get("student_id") == student_id]
            return [dict(s) for s in subs]

    def submit_assignment(self, sub_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            sub_id = sub_dict.get("id") or f"sub_{uuid.uuid4().hex[:8]}"
            now = time.time()
            iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
            asg_id = sub_dict.get("assignment_id")

            # Check if student already submitted
            std_id = sub_dict.get("student_id", "std_1")
            existing_sub = next(
                (s for s in self.assignment_submissions.values()
                 if s.get("assignment_id") == asg_id and s.get("student_id") == std_id),
                None
            )

            if existing_sub:
                existing_sub.update({
                    "status": sub_dict.get("status", "Completed"),
                    "score": sub_dict.get("score", existing_sub.get("score", 85)),
                    "submitted_at": iso_now,
                    "updated_at": now,
                    "version": existing_sub.get("version", 1) + 1
                })
                self._save_to_disk()
                return dict(existing_sub)

            record = {
                **sub_dict,
                "id": sub_id,
                "status": sub_dict.get("status", "Completed"),
                "submitted_at": iso_now,
                "version": 1,
                "created_at": now,
                "updated_at": now
            }
            self.assignment_submissions[sub_id] = record

            # Update parent assignment completion count and average score
            if asg_id and asg_id in self.academic_assignments:
                asg = self.academic_assignments[asg_id]
                asg_subs = [s for s in self.assignment_submissions.values() if s.get("assignment_id") == asg_id]
                asg["completed_count"] = len(asg_subs)
                scores = [s.get("score", 0) for s in asg_subs if "score" in s]
                if scores:
                    asg["average_score"] = round(sum(scores) / len(scores), 1)
                asg["updated_at"] = now
                asg["version"] = asg.get("version", 1) + 1

            self.record_audit_log(
                actor_id=actor_id or std_id,
                action="ASSIGNMENT_SUBMITTED",
                entity_type="assignment_submission",
                entity_id=sub_id,
                from_value=None,
                to_value={"assignment_id": asg_id, "student_id": std_id}
            )

            self._save_to_disk()
            return dict(record)

    def evaluate_assignment_submission(
        self,
        submission_id: str,
        score: float,
        feedback: str,
        actor_id: Optional[str] = None
    ) -> dict:
        with self._lock:
            sub = self.assignment_submissions.get(submission_id)
            if not sub:
                raise HTTPException(status_code=404, detail=f"Submission '{submission_id}' not found.")

            now = time.time()
            iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
            sub["score"] = score
            sub["feedback"] = feedback
            sub["status"] = "Evaluated"
            sub["updated_at"] = now
            sub["version"] = sub.get("version", 1) + 1

            # Update student skill if associated with an assignment
            asg = self.academic_assignments.get(sub.get("assignment_id", ""))
            if asg and asg.get("skill"):
                skill_name = asg["skill"]
                std_id = sub.get("student_id")
                if std_id:
                    self.update_student_skill_canonical(
                        student_id=std_id,
                        skill_name=skill_name,
                        proficiency_level="Advanced" if score >= 80 else "Intermediate" if score >= 60 else "Beginner",
                        score=score,
                        verification_status="ASSESSED",
                        source="Academician Assignment",
                        evidence_type="academic_assignment",
                        evidence_id=asg["id"],
                        verified_by=actor_id or asg.get("created_by", "Faculty"),
                        actor_id=actor_id
                    )
                    sub["skill_updated"] = True

                    # Record in skill timeline
                    self.record_skill_timeline_event(
                        student_id=std_id,
                        skill=skill_name,
                        score=score,
                        event=f"Academic Assignment Evaluated: {asg.get('title')}",
                        source="Academician Assignment"
                    )

            self.create_notification(
                recipient_id=sub.get("student_id", ""),
                notif_type="ASSIGNMENT_EVALUATED",
                title="Assignment Graded",
                message=f"Your submission for '{asg.get('title') if asg else 'Assignment'}' was graded: {score}%.",
                entity_type="assignment_submission",
                entity_id=submission_id
            )

            self._save_to_disk()
            return dict(sub)

    # -------------------------------------------------------------
    # ACADEMIC INTERVENTIONS (TARGETED STUDENT SUPPORT)
    # -------------------------------------------------------------
    def get_academic_interventions(
        self,
        inst_id: Optional[str] = None,
        dept_id: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[dict]:
        with self._lock:
            ints = list(self.academic_interventions.values())
            if priority and priority != "All":
                ints = [i for i in ints if i.get("priority", "").upper() == priority.upper()]
            if status and status != "All":
                ints = [i for i in ints if i.get("status", "").lower() == status.lower()]
            return [dict(i) for i in ints]

    def create_academic_intervention(self, int_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            int_id = int_dict.get("id") or f"int_{uuid.uuid4().hex[:8]}"
            now = time.time()
            iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
            record = {
                **int_dict,
                "id": int_id,
                "status": int_dict.get("status", "pending"),
                "created_at": iso_now,
                "updated_at": iso_now,
                "version": 1
            }
            self.academic_interventions[int_id] = record

            self.record_audit_log(
                actor_id=actor_id or "academician",
                action="INTERVENTION_CREATED",
                entity_type="academic_intervention",
                entity_id=int_id,
                from_value=None,
                to_value={"student_id": record.get("student_id"), "priority": record.get("priority")}
            )

            std_id = record.get("student_id")
            if std_id:
                self.create_notification(
                    recipient_id=std_id,
                    notif_type="ACADEMIC_INTERVENTION",
                    title="Faculty Guidance & Improvement Plan",
                    message=f"Faculty scheduled targeted support: {record.get('suggested_action')}",
                    entity_type="academic_intervention",
                    entity_id=int_id
                )

            self._save_to_disk()
            return dict(record)

    def update_intervention_status(
        self,
        int_id: str,
        status: str,
        notes: Optional[str] = None,
        actor_id: Optional[str] = None
    ) -> dict:
        with self._lock:
            item = self.academic_interventions.get(int_id)
            if not item:
                raise HTTPException(status_code=404, detail=f"Intervention '{int_id}' not found.")

            now = time.time()
            iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
            old_status = item.get("status")
            item["status"] = status
            if notes:
                item["resolution_notes"] = notes
            item["updated_at"] = iso_now
            item["version"] = item.get("version", 1) + 1

            self.record_audit_log(
                actor_id=actor_id or "academician",
                action="INTERVENTION_STATUS_CHANGED",
                entity_type="academic_intervention",
                entity_id=int_id,
                from_value={"status": old_status},
                to_value={"status": status}
            )

            self._save_to_disk()
            return dict(item)

    # -------------------------------------------------------------
    # CAMPUS HIRING DRIVES
    # -------------------------------------------------------------
    def get_campus_drives(
        self,
        inst_id: Optional[str] = None,
        dept_id: Optional[str] = None,
        recruiter_id: Optional[str] = None
    ) -> List[dict]:
        with self._lock:
            drives = list(self.campus_drives.values())
            if inst_id:
                drives = [d for d in drives if d.get("institution_id") == inst_id]
            if dept_id:
                drives = [d for d in drives if d.get("department_id") == dept_id]
            if recruiter_id:
                drives = [d for d in drives if d.get("recruiter_id") == recruiter_id]
            return [dict(d) for d in drives]

    def get_campus_drive(self, drive_id: str) -> Optional[dict]:
        with self._lock:
            d = self.campus_drives.get(drive_id)
            return dict(d) if d else None

    def create_campus_drive(self, drive_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            drv_id = drive_dict.get("id") or f"drv_{uuid.uuid4().hex[:8]}"
            now = time.time()
            record = {
                **drive_dict,
                "id": drv_id,
                "current_round": drive_dict.get("current_round", "Eligibility & Screening"),
                "status": drive_dict.get("status", "active"),
                "created_at": now,
                "updated_at": now,
                "version": 1
            }
            if "stages" not in record or not record["stages"]:
                record["stages"] = [
                    {"name": "Eligibility & Screening", "candidates_count": 0, "status": "in_progress"},
                    {"name": "Online Skill Assessment", "candidates_count": 0, "status": "pending"},
                    {"name": "Shortlisting", "candidates_count": 0, "status": "pending"},
                    {"name": "Technical Interview", "candidates_count": 0, "status": "pending"},
                    {"name": "HR Interview", "candidates_count": 0, "status": "pending"},
                    {"name": "Offer Release", "candidates_count": 0, "status": "pending"},
                    {"name": "Joined", "candidates_count": 0, "status": "pending"}
                ]
            self.campus_drives[drv_id] = record

            self.record_audit_log(
                actor_id=actor_id or "recruiter",
                action="CAMPUS_DRIVE_CREATED",
                entity_type="campus_drive",
                entity_id=drv_id,
                from_value=None,
                to_value={"title": record.get("title"), "company": record.get("company")}
            )

            self._save_to_disk()
            return dict(record)

    def update_campus_drive_stage(
        self,
        drive_id: str,
        current_round: str,
        stages: Optional[List[dict]] = None,
        actor_id: Optional[str] = None
    ) -> dict:
        with self._lock:
            d = self.campus_drives.get(drive_id)
            if not d:
                raise HTTPException(status_code=404, detail=f"Campus drive '{drive_id}' not found.")

            d["current_round"] = current_round
            if stages:
                d["stages"] = stages
            d["updated_at"] = time.time()
            d["version"] = d.get("version", 1) + 1

            self.record_audit_log(
                actor_id=actor_id or "recruiter",
                action="CAMPUS_DRIVE_STAGE_UPDATED",
                entity_type="campus_drive",
                entity_id=drive_id,
                from_value=None,
                to_value={"current_round": current_round}
            )

            self._save_to_disk()
            return dict(d)

    # -------------------------------------------------------------
    # RECRUITER ASSESSMENTS & ISOLATED RESULTS
    # -------------------------------------------------------------
    def get_recruiter_assessments(
        self,
        recruiter_id: Optional[str] = None,
        job_id: Optional[str] = None
    ) -> List[dict]:
        with self._lock:
            asgs = list(self.recruiter_assessments.values())
            if recruiter_id:
                asgs = [a for a in asgs if a.get("recruiter_id") == recruiter_id]
            if job_id:
                asgs = [a for a in asgs if a.get("target_job_id") == job_id]
            return [dict(a) for a in asgs]

    def create_recruiter_assessment(self, rec_asg_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            asg_id = rec_asg_dict.get("id") or f"rec_asg_{uuid.uuid4().hex[:8]}"
            now = time.time()
            record = {
                **rec_asg_dict,
                "id": asg_id,
                "created_at": now,
                "updated_at": now,
                "version": 1
            }
            self.recruiter_assessments[asg_id] = record

            self.record_audit_log(
                actor_id=actor_id or "recruiter",
                action="RECRUITER_ASSESSMENT_CREATED",
                entity_type="recruiter_assessment",
                entity_id=asg_id,
                from_value=None,
                to_value={"title": record.get("title"), "company": record.get("company")}
            )

            self._save_to_disk()
            return dict(record)

    def get_recruiter_assessment_results(
        self,
        assessment_id: Optional[str] = None,
        student_id: Optional[str] = None,
        job_id: Optional[str] = None
    ) -> List[dict]:
        with self._lock:
            res = list(self.recruiter_assessment_results.values())
            if assessment_id:
                res = [r for r in res if r.get("assessment_id") == assessment_id]
            if student_id:
                res = [r for r in res if r.get("student_id") == student_id]
            if job_id:
                res = [r for r in res if r.get("job_id") == job_id]
            return [dict(r) for r in res]

    def submit_recruiter_assessment_result(self, result_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            res_id = result_dict.get("id") or f"res_{uuid.uuid4().hex[:8]}"
            now = time.time()
            iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
            record = {
                **result_dict,
                "id": res_id,
                "completed_at": iso_now,
                "is_platform_verification": False,  # Strict isolation from universal verification!
                "version": 1
            }
            self.recruiter_assessment_results[res_id] = record

            # Update taker metrics on assessment
            asg_id = result_dict.get("assessment_id")
            if asg_id and asg_id in self.recruiter_assessments:
                asg = self.recruiter_assessments[asg_id]
                existing_res = [r for r in self.recruiter_assessment_results.values() if r.get("assessment_id") == asg_id]
                asg["total_takers"] = len(existing_res)
                all_scores = [r.get("overall_score", 0) for r in existing_res]
                if all_scores:
                    asg["avg_score"] = round(sum(all_scores) / len(all_scores), 1)

            self.record_audit_log(
                actor_id=actor_id or "student",
                action="RECRUITER_ASSESSMENT_SUBMITTED",
                entity_type="recruiter_assessment_result",
                entity_id=res_id,
                from_value=None,
                to_value={"score": record.get("overall_score"), "passed": record.get("passed")}
            )

            self._save_to_disk()
            return dict(record)

    # -------------------------------------------------------------
    # CANDIDATE FEEDBACK (STRUCTURED RECRUITER -> STUDENT GUIDANCE)
    # -------------------------------------------------------------
    def get_candidate_feedbacks(
        self,
        student_id: Optional[str] = None,
        recruiter_id: Optional[str] = None,
        job_id: Optional[str] = None
    ) -> List[dict]:
        with self._lock:
            fbs = list(self.candidate_feedbacks.values())
            if student_id:
                fbs = [f for f in fbs if f.get("student_id") == student_id]
            if recruiter_id:
                fbs = [f for f in fbs if f.get("recruiter_id") == recruiter_id]
            if job_id:
                fbs = [f for f in fbs if f.get("job_id") == job_id]
            return [dict(f) for f in fbs]

    def create_candidate_feedback(self, feedback_dict: dict, actor_id: Optional[str] = None) -> dict:
        with self._lock:
            fb_id = feedback_dict.get("id") or f"fb_{uuid.uuid4().hex[:8]}"
            now = time.time()
            iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
            record = {
                **feedback_dict,
                "id": fb_id,
                "created_at": iso_now,
                "version": 1
            }
            self.candidate_feedbacks[fb_id] = record

            # Notify student with supportive learning recommendation
            std_id = feedback_dict.get("student_id")
            if std_id:
                rec_action = feedback_dict.get("recommended_student_action", "Review interview performance feedback.")
                self.create_notification(
                    recipient_id=std_id,
                    notif_type="INTERVIEW_FEEDBACK",
                    title="Interview Performance & Feedback",
                    message=f"Recruiter shared structured feedback: {rec_action}",
                    entity_type="candidate_feedback",
                    entity_id=fb_id
                )

            self.record_audit_log(
                actor_id=actor_id or "recruiter",
                action="CANDIDATE_FEEDBACK_CREATED",
                entity_type="candidate_feedback",
                entity_id=fb_id,
                from_value=None,
                to_value={"student_id": std_id, "round": feedback_dict.get("round")}
            )

            self._save_to_disk()
            return dict(record)

    # -------------------------------------------------------------
    # SKILL IMPROVEMENT TIMELINE
    # -------------------------------------------------------------
    def get_skill_timeline(self, student_id: str, skill: Optional[str] = None) -> List[dict]:
        with self._lock:
            history = self.skill_timelines.get(student_id, [])
            if skill:
                history = [h for h in history if h.get("skill", "").lower() == skill.lower()]
            return [dict(h) for h in history]

    def record_skill_timeline_event(
        self,
        student_id: str,
        skill: str,
        score: float,
        event: str,
        source: str
    ) -> dict:
        with self._lock:
            if student_id not in self.skill_timelines:
                self.skill_timelines[student_id] = []

            month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            cur_month = month_names[time.gmtime().tm_mon - 1]
            iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

            entry = {
                "skill": skill,
                "month": cur_month,
                "score": round(score),
                "event": event,
                "source": source,
                "timestamp": iso_now
            }
            self.skill_timelines[student_id].append(entry)
            self._save_to_disk()
            return entry

    # -------------------------------------------------------------
    # CANONICAL SKILL RECORD ENGINE (PROVENANCE & VALID TRANSITIONS)
    # -------------------------------------------------------------
    def update_student_skill_canonical(
        self,
        student_id: str,
        skill_name: str,
        proficiency_level: str,
        score: float,
        verification_status: str,
        source: str,
        evidence_type: str,
        evidence_id: Optional[str] = None,
        verified_by: Optional[str] = None,
        actor_id: Optional[str] = None
    ) -> dict:
        """
        Updates student's canonical skill record enforcing provenance and valid status transitions.
        Statuses: SELF_DECLARED -> ASSESSED / DEMONSTRATED -> VERIFIED.
        Rejects jumping from SELF_DECLARED directly to VERIFIED without verified evidence.
        """
        with self._lock:
            student = self.students.get(student_id)
            if not student or student.get("deleted_at"):
                raise HTTPException(status_code=404, detail=f"Student '{student_id}' not found.")

            skills = student.setdefault("skills", {})
            current_skill = skills.get(skill_name, {})
            current_status = current_skill.get("verification_status", "SELF_DECLARED")

            # Validate transitions
            target_status = verification_status.upper()
            if target_status == "VERIFIED":
                has_evidence = evidence_type in ["assessment", "project", "code_lab", "faculty_verification", "academic_assignment"]
                if not has_evidence and current_status == "SELF_DECLARED":
                    raise HTTPException(
                        status_code=400,
                        detail=f"Cannot transition skill '{skill_name}' from SELF_DECLARED directly to VERIFIED without verified assessment or project evidence."
                    )

            now = time.time()
            iso_now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now))
            skill_ver = current_skill.get("version", 0) + 1

            updated_skill_record = {
                "skill_name": skill_name,
                "level": proficiency_level,
                "score": round(score, 1),
                "confidence": 0.95 if target_status == "VERIFIED" else 0.85 if target_status in ["ASSESSED", "DEMONSTRATED"] else 0.50,
                "verification_status": target_status,
                "verified": target_status == "VERIFIED",
                "source": source,
                "evidence_type": evidence_type,
                "evidence_id": evidence_id,
                "verified_by": verified_by if target_status == "VERIFIED" else None,
                "verified_at": iso_now if target_status == "VERIFIED" else current_skill.get("verified_at"),
                "last_assessed_at": iso_now if target_status in ["ASSESSED", "VERIFIED"] else current_skill.get("last_assessed_at"),
                "updated_at": iso_now,
                "version": skill_ver
            }

            skills[skill_name] = updated_skill_record

            # Recalculate student verified_score
            verified_scores = [
                s["score"] for s in skills.values()
                if isinstance(s, dict) and s.get("score") is not None
            ]
            if verified_scores:
                student["verified_score"] = round(sum(verified_scores) / len(verified_scores), 1)

            student["profile_completion"] = self.calculate_profile_completion(student)
            student["version"] = student.get("version", 1) + 1
            student["updated_at"] = now

            # Invalidate cached opportunity matches
            self._invalidate_matches_for_student(student_id)

            self.record_audit_log(
                actor_id=actor_id or student_id,
                action="STUDENT_SKILL_UPDATED",
                entity_type="student_skill",
                entity_id=f"{student_id}:{skill_name}",
                from_value={"status": current_status, "score": current_skill.get("score")},
                to_value={"status": target_status, "score": updated_skill_record["score"]}
            )

            self._save_to_disk()
            return dict(updated_skill_record)


# Global singleton canonical store
canonical_store = CanonicalStore()
