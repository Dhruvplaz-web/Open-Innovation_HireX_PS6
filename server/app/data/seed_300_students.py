"""
HireX 300-Student Benchmark Cohort Seed Engine
Generates realistic Pan-India engineering cohort data for Academician Intelligence,
Placement Readiness, and Recruiter Sourcing across CSE, IT, AI&DS, and ENTC.
"""

import random
from typing import List, Dict, Any
import time

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Shaurya", "Atharva", "Advik", "Pranav", "Advaith", "Aryan", "Dhruv", "Kabir", "Rohan", "Siddharth",
    "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Chiara", "Myra", "Isha", "Anvi", "Prisha",
    "Rhea", "Tara", "Kiara", "Tanvi", "Shruti", "Sneha", "Pooja", "Meera", "Neha", "Riddhi",
    "Kunal", "Sameer", "Varun", "Gaurav", "Yash", "Tejas", "Omkar", "Swapnil", "Sayali", "Manasi",
    "Mayur", "Akash", "Tushar", "Sanket", "Pratik", "Shubham", "Abhishek", "Nikhil", "Vishal", "Suraj",
    "Komal", "Priyanka", "Aishwarya", "Pallavi", "Shweta", "Monika", "Dipali", "Ashwini", "Madhuri", "Sonali"
]

LAST_NAMES = [
    "Patil", "Kulkarni", "Deshmukh", "Joshi", "Shinde", "Pawar", "More", "Gaikwad", "Jadhav", "Chavan",
    "Kadam", "Bhosale", "Wagh", "Kale", "Jagtap", "Sonawane", "Tambe", "Mane", "Salunkhe", "Bhandari",
    "Sharma", "Verma", "Gupta", "Malhotra", "Bhatia", "Saxena", "Mehta", "Shah", "Agarwal", "Reddy"
]

DEPARTMENTS = [
    {"id": "dept_comp", "name": "Computer Engineering", "weight": 40},
    {"id": "dept_it", "name": "Information Technology", "weight": 28},
    {"id": "dept_aids", "name": "Artificial Intelligence & Data Science", "weight": 20},
    {"id": "dept_entc", "name": "Electronics & Telecommunication", "weight": 12}
]

YEAR_BATCHES = [
    {"year": "4th Year", "batch": "2024", "weight": 15},
    {"year": "4th Year", "batch": "2025", "weight": 25},
    {"year": "3rd Year", "batch": "2026", "weight": 40}, # Active Placement Batch
    {"year": "2nd Year", "batch": "2027", "weight": 20}
]

TECHNICAL_SKILLS = {
    "dept_comp": [
        ("Python", 85), ("Data Structures", 80), ("SQL", 75), ("React", 70),
        ("FastAPI", 65), ("Docker", 55), ("Java", 70), ("PostgreSQL", 60), ("Git", 80)
    ],
    "dept_it": [
        ("React", 85), ("TypeScript", 75), ("Node.js", 70), ("SQL", 80),
        ("Python", 70), ("Cloud Computing", 60), ("Tailwind CSS", 80), ("MongoDB", 65)
    ],
    "dept_aids": [
        ("Python", 90), ("Machine Learning", 80), ("SQL", 80), ("PyTorch", 70),
        ("Deep Learning", 65), ("Data Analytics", 85), ("Scikit-Learn", 75), ("NLP", 60)
    ],
    "dept_entc": [
        ("C++", 80), ("Embedded C", 75), ("Python", 70), ("IoT", 75),
        ("Signal Processing", 65), ("Microcontrollers", 70), ("Verilog", 60)
    ]
}

TARGET_ROLES = {
    "dept_comp": ["Full-Stack AI Developer", "Backend Systems Engineer", "Cloud & DevOps Engineer"],
    "dept_it": ["Full-Stack Web Architect", "Frontend Engineer", "Enterprise Cloud Specialist"],
    "dept_aids": ["MLOps & Data Engineer", "AI Application Developer", "Computer Vision Specialist"],
    "dept_entc": ["Embedded Firmware Engineer", "IoT Systems Architect", "Hardware-Software Integrator"]
}

OPPORTUNITIES_LIST = [
    {"id": "opp_1", "company": "Barclays India Innovation Centre", "title": "Full-Stack AI Developer Intern"},
    {"id": "opp_2", "company": "Tata Technologies", "title": "Software Engineering Trainee"},
    {"id": "opp_3", "company": "Persistent Systems", "title": "Cloud Platform Associate"},
    {"id": "opp_4", "company": "Infosys InStep", "title": "AI Systems Intern"},
    {"id": "opp_5", "company": "TechCorp Global", "title": "Associate Software Engineer"}
]

APPLICATION_STATUSES = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"]
STATUS_WEIGHTS = [35, 25, 18, 12, 6, 4]


def generate_300_students(start_idx: int = 1, end_idx: int = 300) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Generates student profiles and realistic campus applications.
    Deterministic random seed guarantees stability across restarts.
    """
    rng = random.Random(42)
    students = []
    applications = []
    
    dept_choices = []
    for d in DEPARTMENTS:
        dept_choices.extend([d] * d["weight"])

    year_choices = []
    for y in YEAR_BATCHES:
        year_choices.extend([y] * y["weight"])

    used_emails = set()

    for idx in range(start_idx, end_idx + 1):
        std_id = f"std_{idx}"
        first = rng.choice(FIRST_NAMES)
        last = rng.choice(LAST_NAMES)
        full_name = f"{first} {last}"
        
        email_base = f"{first.lower()}.{last.lower()}"
        email = f"{email_base}@rscoe.edu.in"
        counter = 1
        while email in used_emails:
            email = f"{email_base}{counter}@rscoe.edu.in"
            counter += 1
        used_emails.add(email)

        dept = rng.choice(dept_choices)
        year_info = rng.choice(year_choices)

        # CGPA normal distribution 8.2 mean, 0.7 stddev, clipped [6.2, 9.85]
        raw_cgpa = round(rng.gauss(8.2, 0.7), 2)
        cgpa = max(6.2, min(9.85, raw_cgpa))

        # Skill profile generation
        skill_pool = TECHNICAL_SKILLS[dept["id"]]
        student_skills = {}
        verified_scores_list = []

        # Determine tier: 20% Top, 50% Mid, 30% Foundation
        tier_roll = rng.random()
        if tier_roll < 0.20:
            num_skills = rng.randint(4, 6)
            base_score = rng.randint(82, 95)
        elif tier_roll < 0.70:
            num_skills = rng.randint(2, 4)
            base_score = rng.randint(68, 81)
        else:
            num_skills = rng.randint(1, 3)
            base_score = rng.randint(45, 67)

        selected_skills = rng.sample(skill_pool, min(num_skills, len(skill_pool)))
        for s_name, market_weight in selected_skills:
            score = max(40, min(98, int(rng.gauss(base_score, 6))))
            is_verified = score >= 70
            level = "Advanced" if score >= 85 else ("Intermediate" if score >= 70 else "Beginner")
            student_skills[s_name] = {
                "level": level,
                "score": score,
                "verified": is_verified
            }
            if is_verified:
                verified_scores_list.append(score)

        avg_verified = round(sum(verified_scores_list) / len(verified_scores_list)) if verified_scores_list else 0

        # Claimed skills from resume (without assessment yet)
        extra_claimed = [s[0] for s in skill_pool if s[0] not in student_skills][:rng.randint(1, 3)]

        target_role = rng.choice(TARGET_ROLES[dept["id"]])

        student = {
            "id": std_id,
            "name": full_name,
            "email": email,
            "college": "JSPM RSCOE, Pune",
            "institution_id": "inst_rscoe",
            "department": dept["name"],
            "department_id": dept["id"],
            "year": year_info["year"],
            "batch": year_info["batch"],
            "cgpa": cgpa,
            "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={first}_{last}",
            "verified_score": avg_verified,
            "placement_readiness_score": avg_verified,
            "skills": student_skills,
            "claimed_skills": extra_claimed,
            "projects_count": rng.randint(1, 6) if avg_verified > 0 else 0,
            "assessments_completed": len(verified_scores_list),
            "rank_in_college": idx,
            "target_role": target_role,
            "bio": f"{dept['name']} undergraduate at JSPM RSCOE aiming for {target_role}.",
            "academic_kyc": {
                "ssc_10th": round(rng.uniform(75.0, 95.0), 1),
                "hsc_12th": round(rng.uniform(70.0, 93.0), 1),
                "cgpa": cgpa,
                "active_backlogs": 0 if cgpa >= 7.0 else rng.randint(0, 1)
            }
        }
        students.append(student)

        # Generate realistic applications for eligible 3rd and 4th years (~180 applications)
        if year_info["batch"] in ["2025", "2026"] and rng.random() < 0.75:
            num_apps = rng.randint(1, 2)
            applied_opps = rng.sample(OPPORTUNITIES_LIST, num_apps)
            for opp in applied_opps:
                status = rng.choices(APPLICATION_STATUSES, weights=STATUS_WEIGHTS)[0]
                match_pct = min(98, max(50, avg_verified + rng.randint(-8, 10))) if avg_verified else rng.randint(45, 65)
                app_id = f"app_seed_{len(applications)+1}"
                applications.append({
                    "id": app_id,
                    "student_id": std_id,
                    "student_name": full_name,
                    "student_email": email,
                    "student_college": "JSPM RSCOE, Pune",
                    "opportunity_id": opp["id"],
                    "company": opp["company"],
                    "title": opp["title"],
                    "match_percentage": match_pct,
                    "matched_skills": [s for s, v in student_skills.items() if v.get("verified")],
                    "status": status,
                    "applied_at": "2026-10-12T09:30:00Z",
                    "jdFitScore": match_pct,
                    "jdFitVerdict": "STRONG_FIT" if match_pct >= 80 else ("POTENTIAL_FIT" if match_pct >= 65 else "GAP_IDENTIFIED")
                })

    return students, applications


if __name__ == "__main__":
    stds, apps = generate_300_students()
    print(f"Generated {len(stds)} students and {len(apps)} applications successfully.")
    comp_count = sum(1 for s in stds if s["department_id"] == "dept_comp")
    it_count = sum(1 for s in stds if s["department_id"] == "dept_it")
    aids_count = sum(1 for s in stds if s["department_id"] == "dept_aids")
    entc_count = sum(1 for s in stds if s["department_id"] == "dept_entc")
    print(f"Distribution: CSE={comp_count}, IT={it_count}, AI&DS={aids_count}, ENTC={entc_count}")
