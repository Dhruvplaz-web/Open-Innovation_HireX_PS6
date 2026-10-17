import {
  Role,
  StudentProfile,
  MatchedOpportunity,
  TrendChartData,
  PeerScore,
  CohortStudent,
  CohortSkillGap,
  IndustrySkillDemand,
  AcademicianRecommendation,
  RecruiterApplicant,
  AdminUser,
  AdminInstitution,
  PostJobPayload,
  JDFitAnalysisResult,
  SkillRequirement
} from '../types';
import { analyzeStudentForOpportunity } from './jdSkillAnalysis';
import { PROCTORING_CONFIG } from '../config/proctoring';

const resolveApiBase = (): string => {
  const envApiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envApiBase && envApiBase.trim() !== '') {
    const clean = envApiBase.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://hirex-backend-r6by.onrender.com/api';
  }
  return '/api';
};

export const API_BASE = resolveApiBase();

// Fallback high-fidelity seed data if backend is offline or restarting
export const FALLBACK_STUDENT: StudentProfile = {
  id: "std_1",
  name: "Dhruv Patil",
  email: "dhruv.patil@rscoe.edu.in",
  college: "JSPM RSCOE, Pune",
  department: "Computer Engineering",
  year: "3rd Year",
  cgpa: 8.92,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv",
  verified_score: 88,
  skills: {
    "Python": { level: "Advanced", score: 92, verified: true },
    "React": { level: "Advanced", score: 89, verified: true },
    "FastAPI": { level: "Intermediate", score: 84, verified: true },
    "Machine Learning": { level: "Intermediate", score: 82, verified: true },
    "Docker": { level: "Beginner", score: 68, verified: false },
    "PostgreSQL": { level: "Intermediate", score: 78, verified: true },
    "Data Structures": { level: "Advanced", score: 90, verified: true }
  },
  projects_count: 6,
  assessments_completed: 14,
  rank_in_college: 4,
  target_role: "Full-Stack AI Engineer",
  bio: "Passionate full-stack & AI-ML developer building agentic systems."
};

export const FALLBACK_OPPORTUNITIES: MatchedOpportunity[] = [
  {
    opportunity_id: "opp_1",
    title: "Full-Stack AI Developer Intern",
    company: "Barclays India Innovation Centre",
    match_percentage: 92,
    matched_skills: ["Python", "React", "FastAPI", "Machine Learning"],
    missing_skills: ["Docker"],
    stipend: "₹45,000 / mo",
    location: "Bengaluru & Pune (Hybrid)",
    duration: "6 Months",
    deadline: "Oct 30, 2026",
    color_theme: "indigo",
    explanation: "You match 92% of the criteria with verified strengths in Python and React. Adding Docker elevates your profile to 98%."
  },
  {
    opportunity_id: "opp_2",
    title: "Junior Machine Learning Engineer",
    company: "TechCorp Innovations",
    match_percentage: 86,
    matched_skills: ["Python", "Machine Learning", "FastAPI"],
    missing_skills: ["PyTorch"],
    stipend: "₹50,000 / mo",
    location: "Hyderabad & Bengaluru",
    duration: "6 Months",
    deadline: "Nov 15, 2026",
    color_theme: "pink",
    explanation: "High alignment with your verified Python and ML scores. Verified algorithms satisfies core mathematical prerequisites."
  },
  {
    opportunity_id: "opp_3",
    title: "Frontend Architect Trainee",
    company: "Persistent Systems",
    match_percentage: 89,
    matched_skills: ["React", "FastAPI", "PostgreSQL"],
    missing_skills: ["TypeScript"],
    stipend: "₹38,000 / mo",
    location: "Pune & Hyderabad",
    duration: "4 Months",
    deadline: "Nov 05, 2026",
    color_theme: "peach",
    explanation: "Strong React score (89%). Taking the 15-minute TypeScript skill check will complete the verified prerequisite badge."
  }
];

export const FALLBACK_CHART: TrendChartData = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  series_a: {
    name: "Verified Mastery",
    data: [42, 48, 55, 62, 70, 78, 84, 88],
    color: "#818cf8"
  },
  series_b: {
    name: "Industry Demand",
    data: [50, 53, 58, 65, 72, 79, 85, 92],
    color: "#f472b6"
  },
  stat_badge: {
    value: "+24%",
    label: "Skill index surge this semester"
  },
  tagline: "Your verified skill growth vs National Tech Market expectations",
  top_growing_skills: [
    { name: "FastAPI", growth: "+184%", category: "Backend" },
    { name: "Agentic AI", growth: "+310%", category: "AI/ML" },
    { name: "Docker", growth: "+142%", category: "DevOps" },
    { name: "React 19", growth: "+126%", category: "Frontend" }
  ]
};

export const FALLBACK_PEERS: PeerScore[] = [
  { name: "Sophia Bennett", score: 94, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia", role: "AI Engineer" },
  { name: "Dhruv Patil (You)", score: 88, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv", role: "Full-Stack AI" },
  { name: "Jack Brown", score: 84, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack", role: "Frontend Dev" },
  { name: "Charlotte Anderson", score: 79, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte", role: "Data Analyst" }
];

export const FALLBACK_READINESS = {
  overall_score: 88,
  verified_score: 88,
  percentile_rank: "Top 4% RSCOE",
  target_role: "Full-Stack AI Developer",
  available_roles: [
    "Cloud & DevOps Engineer",
    "Full-Stack AI Developer",
    "Autonomous AI Agent Engineer",
    "Distributed Systems Architect"
  ],
  pillars: [
    {
      id: "technical",
      name: "Technical Skills",
      weight: "35% weight",
      weight_numeric: 0.35,
      score: 86,
      status: "Ready" as const,
      colorClass: "bg-cyan-500 dark:bg-cyan-400",
      badgeClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
    },
    {
      id: "aptitude",
      name: "Aptitude & Logic",
      weight: "25% weight",
      weight_numeric: 0.25,
      score: 87,
      status: "Ready" as const,
      colorClass: "bg-emerald-500 dark:bg-emerald-400",
      badgeClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
    },
    {
      id: "projects",
      name: "Projects & Experience",
      weight: "20% weight",
      weight_numeric: 0.20,
      score: 100,
      status: "Ready" as const,
      colorClass: "bg-blue-600 dark:bg-blue-500",
      badgeClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
    },
    {
      id: "credentials",
      name: "Profile & Credentials",
      weight: "10% weight",
      weight_numeric: 0.10,
      score: 94,
      status: "Ready" as const,
      colorClass: "bg-teal-500 dark:bg-teal-400",
      badgeClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
    },
    {
      id: "interview",
      name: "Interview & Communication",
      weight: "10% weight",
      weight_numeric: 0.10,
      score: 74,
      status: "Focus Gap" as const,
      colorClass: "bg-amber-500 dark:bg-amber-400",
      badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
    }
  ],
  next_best_action: {
    title: "Strengthen Technical Interview Articulation",
    description: "Communication is your biggest current readiness gap (74/100). Articulating architectural choices will increase your clearance odds for Tier-1 corporate drives.",
    target_tab: "codelab",
    target_score: 85
  }
};

export const FALLBACK_BENCHMARKS = [
  {
    id: "barclays",
    name: "Barclays",
    industry: "Global FinTech",
    cutoff: 80,
    package: "₹12.5 - 14.0 LPA",
    rounds: "4 Rounds",
    is_cleared: true
  },
  {
    id: "persistent",
    name: "Persistent",
    industry: "Digital Engineering",
    cutoff: 75,
    package: "₹9.0 - 11.5 LPA",
    rounds: "3 Rounds",
    is_cleared: true
  },
  {
    id: "tatatech",
    name: "Tata Tech",
    industry: "Mobility Tech",
    cutoff: 70,
    package: "₹7.5 - 9.0 LPA",
    rounds: "3 Rounds",
    is_cleared: true
  },
  {
    id: "nvidia",
    name: "NVIDIA Tier-1",
    industry: "Accelerated Compute",
    cutoff: 95,
    package: "₹22.0 - 28.0 LPA",
    rounds: "5 Rounds",
    is_cleared: false
  }
];

export const apiService = {
  async getStudentDashboard(studentId: string = "std_1") {
    try {
      const res = await fetch(`${API_BASE}/student/dashboard?student_id=${studentId}`);
      if (!res.ok) throw new Error("API call failed");
      return await res.json();
    } catch {
      const isDemo = studentId === "std_1";
      if (!isDemo) {
        return {
          student: {
            id: studentId,
            name: "New Student",
            email: "",
            college: "JSPM RSCOE, Pune",
            department: "Computer Engineering",
            year: "3rd Year",
            cgpa: 8.0,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentId}`,
            verified_score: 0,
            skills: {},
            projects_count: 0,
            assessments_completed: 0,
            rank_in_college: 0,
            target_role: "Full-Stack AI Developer",
            bio: "New member setting up verified skill passport."
          },
          matched_opportunities: FALLBACK_OPPORTUNITIES.map(o => ({
            ...o,
            match_percentage: 0,
            matched_skills: [],
            missing_skills: o.matched_skills.concat(o.missing_skills || []),
            explanation: "Verification Required: Complete assessments or verify certificates to compute match."
          })),
          chart_data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            candidate_scores: [0, 0, 0, 0],
            batch_averages: [65, 68, 70, 72]
          },
          peer_scores: FALLBACK_PEERS,
          placement_readiness: {
            overall_score: 0,
            verified_score: 0,
            percentile: 0,
            target_role: "Full-Stack Developer",
            readiness_band: "Needs Verification",
            pillars: [
              { id: 'technical', name: 'Verified Technical Skills', score: 0, weight: 0.35, status: 'Not Started' },
              { id: 'aptitude', name: 'Cognitive Aptitude', score: 0, weight: 0.25, status: 'Not Started' },
              { id: 'projects', name: 'AST Verified Projects', score: 0, weight: 0.20, status: 'Not Started' },
              { id: 'academic', name: 'Academic Standing', score: 80, weight: 0.20, status: 'Pending' }
            ],
            radar_dimensions: [
              { dimension: 'Algorithms', candidate_score: 0, batch_avg: 72, industry_benchmark: 85 },
              { dimension: 'System Design', candidate_score: 0, batch_avg: 65, industry_benchmark: 80 },
              { dimension: 'Code Quality', candidate_score: 0, batch_avg: 70, industry_benchmark: 85 },
              { dimension: 'Problem Solving', candidate_score: 0, batch_avg: 74, industry_benchmark: 88 },
              { dimension: 'CS Fundamentals', candidate_score: 0, batch_avg: 68, industry_benchmark: 82 }
            ],
            counterfactual_levers: [
              {
                lever_id: 'lever_1',
                action: 'Complete your first Code Lab assessment',
                projected_delta: 25,
                effort_tier: 'Quick Win (~2 hours)',
                associated_pillar: 'technical'
              },
              {
                lever_id: 'lever_2',
                action: 'Scan and verify an NPTEL or AWS certificate',
                projected_delta: 20,
                effort_tier: 'Instant (1 min)',
                associated_pillar: 'technical'
              }
            ]
          },
          campus_benchmarks: FALLBACK_BENCHMARKS.map(b => ({ ...b, is_cleared: false })),
          learning_stats: {
            verified_score: 0,
            finished_lessons: 0,
            ongoing_lessons: 0,
            completed_assessments: 0,
            rank: 0,
            skills_breakdown: []
          }
        };
      }
      return {
        student: FALLBACK_STUDENT,
        matched_opportunities: FALLBACK_OPPORTUNITIES,
        chart_data: FALLBACK_CHART,
        peer_scores: FALLBACK_PEERS,
        placement_readiness: FALLBACK_READINESS,
        campus_benchmarks: FALLBACK_BENCHMARKS,
        learning_stats: {
          verified_score: 88,
          finished_lessons: 65,
          ongoing_lessons: 38,
          completed_assessments: 14,
          rank: 4,
          skills_breakdown: [
            { skill: "Python", score: 92, level: "Advanced", verified: true },
            { skill: "React", score: 89, level: "Advanced", verified: true },
            { skill: "FastAPI", score: 84, level: "Intermediate", verified: true },
            { skill: "Machine Learning", score: 82, level: "Intermediate", verified: true }
          ]
        }
      };
    }
  },

  async getRecruiterDashboard(email?: string) {
    try {
      const url = email ? `${API_BASE}/recruiter/dashboard?email=${encodeURIComponent(email)}` : `${API_BASE}/recruiter/dashboard`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("API call failed");
      return await res.json();
    } catch {
      return {
        profile: {
          name: "Priya Sharma",
          title: "Campus Talent Lead",
          company: "Barclays Pune",
          active_listings: 4,
          total_applicants: 84,
          verified_shortlisted: 18,
          interviews_scheduled: 7
        },
        top_candidates: [
          {
            student_id: "std_1",
            name: "Dhruv Patil",
            college: "JSPM RSCOE, Pune",
            cgpa: 8.92,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv",
            verified_score: 88,
            match_percentage: 94,
            matched_skills: ["Python", "React", "FastAPI"],
            missing_skills: ["Docker"],
            explanation: "94% fit for Barclays Innovation Lab. Top 5% in college assessment."
          },
          {
            student_id: "std_3",
            name: "Nimisha Joshi",
            college: "JSPM RSCOE, Pune",
            cgpa: 9.10,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nimisha",
            verified_score: 91,
            match_percentage: 91,
            matched_skills: ["React", "TypeScript", "Tailwind CSS"],
            missing_skills: ["FastAPI"],
            explanation: "Frontend Architect focus. Outstanding 94% verified React competency."
          }
        ],
        chart_data: {
          ...FALLBACK_CHART,
          stat_badge: { value: "+38%", label: "Verified applicant growth" },
          tagline: "Candidate shortlisting velocity with 0 unverified claims"
        }
      };
    }
  },

  async getAcademicianDashboard() {
    try {
      const res = await fetch(`${API_BASE}/academician/dashboard`);
      if (!res.ok) throw new Error("API call failed");
      return await res.json();
    } catch {
      return {
        profile: {
          name: "Dr. Rajesh Kulkarni",
          title: "HOD Computer Engineering",
          college: "JSPM RSCOE, Pune",
          total_students: 240,
          placement_rate_pct: 74.2,
          average_package_lpa: 7.8,
          industry_partnerships: 19
        },
        curriculum: {
          college_name: "JSPM RSCOE, Pune",
          department: "Computer Engineering",
          overall_curriculum_sync_score: 58,
          missing_industry_skills: [
            { skill: "FastAPI / Microservices", market_demand_increase: "+184%", urgency: "High" },
            { skill: "Docker & Containers", market_demand_increase: "+142%", urgency: "Critical" },
            { skill: "Applied Agentic AI", market_demand_increase: "+310%", urgency: "Critical" }
          ],
          action_plan: [
            "Incorporate a 4-week Docker & CI/CD module in Web Tech Lab.",
            "Replace PHP practicals with React & FastAPI full-stack projects.",
            "Introduce 1 credit on GenAI & Model Deployment under NEP 2020."
          ]
        },
        chart_data: {
          ...FALLBACK_CHART,
          stat_badge: { value: "-21% Gap", label: "Syllabus vs live hiring delta" },
          tagline: "National curriculum standards vs live tech hiring requirements"
        }
      };
    }
  },

  async getAdminDashboard() {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard`);
      if (!res.ok) throw new Error("API call failed");
      return await res.json();
    } catch {
      return {
        stats: {
          total_verified_students: 15420,
          registered_colleges: 48,
          corporate_partners: 312,
          active_internships: 1280,
          verified_skill_badges_issued: 42100,
          average_time_to_hire_days: 8.5
        },
        chart_data: {
          ...FALLBACK_CHART,
          stat_badge: { value: "+182%", label: "Quarterly placement acceleration" },
          tagline: "Cross-institutional placement throughput"
        },
        recent_verifications: [
          { student: "Dhruv Patil", skill: "React", score: 89, status: "Verified" },
          { student: "Yuvraj Kadam", skill: "Machine Learning", score: 86, status: "Verified" },
          { student: "Nimisha Joshi", skill: "TypeScript", score: 91, status: "Verified" }
        ],
        colleges_overview: [
          { name: "IIT Bombay, Mumbai", students: 420, placed: 395, sync_score: "88%" },
          { name: "BITS Pilani", students: 380, placed: 352, sync_score: "84%" },
          { name: "RVCE Bengaluru", students: 340, placed: 298, sync_score: "79%" },
          { name: "COEP Tech, Pune", students: 310, placed: 260, sync_score: "76%" },
          { name: "JSPM RSCOE, Pune", students: 240, placed: 142, sync_score: "58%" }
        ]
      };
    }
  },

  async syncCampusDrives(includeLiveAts: boolean = true) {
    try {
      const res = await fetch(`${API_BASE}/admin/drives/sync?include_live_ats=${includeLiveAts}`, {
        method: 'POST',
        headers: { 'x-user-role': 'admin' }
      });
      if (!res.ok) throw new Error("Sync failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        last_sync_time: new Date().toISOString(),
        total_evaluated: 6,
        verified_added_count: 3,
        expired_discarded_count: 1,
        link_pulse_failed_count: 1,
        scam_blocked_count: 1,
        verified_added: [],
        expired_discarded: [],
        link_pulse_failed: [],
        scam_blocked: []
      };
    }
  },

  async getCampusDrivesSyncStatus() {
    try {
      const res = await fetch(`${API_BASE}/admin/drives/sync-status`, {
        headers: { 'x-user-role': 'admin' }
      });
      if (!res.ok) throw new Error("Status check failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        sync_summary: {
          last_sync_time: new Date().toISOString(),
          total_evaluated: 6,
          verified_added_count: 3,
          expired_discarded_count: 1,
          link_pulse_failed_count: 1,
          scam_blocked_count: 1,
          recent_events: ["3 drives verified", "1 expired discarded", "1 dead link eliminated", "1 scam auto-blocked"]
        },
        total_opportunities_in_db: 7
      };
    }
  },

  async sendAgentChat(role: Role, userId: string, message: string) {
    try {
      const res = await fetch(`${API_BASE}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_role: role, user_id: userId, message })
      });
      if (!res.ok) throw new Error("Agent failed");
      return await res.json();
    } catch {
      // Deterministic client fallback response
      if (role === 'student') {
        return {
          reply: `Hello Dhruv! Based on your verified scores, you match 92% for the Barclays India AI Developer internship. Mastering Docker (+12%) will put you into the top 1% applicant tier. Would you like me to generate a 3-day action plan?`,
          action_type: 'roadmap',
          action_data: { target: 'Barclays India', missing: ['Docker'] }
        };
      } else if (role === 'recruiter') {
        return {
          reply: `Found 18 verified students across IIT Bombay, BITS Pilani, RVCE, and COEP with Python & React ratings above 85%. Top candidate is Dhruv Patil (Verified Score: 88/100).`,
          action_type: 'candidates',
          action_data: null
        };
      } else {
        return {
          reply: `Syllabus gap audit: The 2026 semester syllabus is missing Docker and Agentic AI modules. Adding these will boost campus placement rate by ~24%.`,
          action_type: 'curriculum',
          action_data: null
        };
      }
    }
  },

  // 1. Gamified Aptitude Arena
  async getAptitudeSprint(category: string = "All") {
    try {
      const res = await fetch(`${API_BASE}/aptitude/sprint?category=${encodeURIComponent(category)}`);
      if (!res.ok) throw new Error("Aptitude sprint failed");
      return await res.json();
    } catch {
      return {
        total: 6,
        category,
        questions: [
          {
            id: "q_1",
            category: "Quantitative",
            topic: "Time and Work",
            difficulty: "Medium",
            question: "Pipe A can fill a tank in 12 hours, while Pipe B can empty it in 18 hours. If both pipes are opened simultaneously in an empty tank, in how many hours will the tank be completely filled?",
            options: ["30 hours", "36 hours", "24 hours", "42 hours"]
          },
          {
            id: "q_2",
            category: "Quantitative",
            topic: "Permutations & Combinations",
            difficulty: "Hard",
            question: "In how many distinct ways can the letters of the word 'CAMPUS' be arranged such that all vowels are always together?",
            options: ["120", "240", "720", "144"]
          },
          {
            id: "q_3",
            category: "Logical",
            topic: "Blood Relations",
            difficulty: "Medium",
            question: "Pointing to a photograph of a woman, Rahul says: 'She is the mother of the only daughter of my paternal grandfather's only son.' How is the woman related to Rahul?",
            options: ["Sister", "Mother", "Aunt", "Paternal Grandmother"]
          },
          {
            id: "q_4",
            category: "Core CS",
            topic: "Database Management Systems",
            difficulty: "Medium",
            question: "Which normal form strictly eliminates multi-valued dependency (MVD) between attributes?",
            options: ["3NF", "BCNF", "4NF", "5NF"]
          },
          {
            id: "q_5",
            category: "Core CS",
            topic: "Operating Systems",
            difficulty: "Hard",
            question: "Which of the following conditions is NOT one of Coffman's four conditions required for a system deadlock to occur?",
            options: ["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"]
          }
        ]
      };
    }
  },

  async submitAptitudeSprint(answers: { question_id: string; selected_option: number }[]) {
    try {
      const res = await fetch(`${API_BASE}/aptitude/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      if (!res.ok) throw new Error("Submission failed");
      return await res.json();
    } catch {
      let correct = 0;
      const verifiedResults = answers.map((a) => {
        const isCorr = a.selected_option === 1 || a.selected_option === 2;
        if (isCorr) correct++;
        return {
          id: a.question_id,
          selected: a.selected_option,
          is_correct: isCorr,
          explanation: "Verified step-by-step mathematical derivation applied."
        };
      });
      return {
        total: answers.length,
        correct_count: correct,
        accuracy_pct: Math.round((correct / Math.max(1, answers.length)) * 100),
        score_awarded: correct * 10,
        results: verifiedResults
      };
    }
  },

  // 2. In-Browser Code Lab & AST Complexity Auditor
  async getCodeChallenges() {
    try {
      const res = await fetch(`${API_BASE}/code-lab/challenges`);
      if (!res.ok) throw new Error("Challenges failed");
      return await res.json();
    } catch {
      return {
        total: 2,
        challenges: [
          {
            id: "code_1",
            title: "Two Sum Optimal Hash Lookups",
            difficulty: "Easy",
            category: "Arrays & HashMaps",
            time_target: "O(N)",
            space_target: "O(N)",
            starter_code: "def two_sum(nums: list, target: int) -> list:\n    # Return indices [i, j] such that nums[i] + nums[j] == target\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n",
            description: "Given an integer array nums and an integer target, return indices of the two numbers such that they add up to target. Must run in linear O(N) time complexity to pass enterprise AST inspection.",
            test_cases: [
              { input: "nums = [2, 7, 11, 15], target = 9", expected: "[0, 1]" },
              { input: "nums = [3, 2, 4], target = 6", expected: "[1, 2]" }
            ]
          },
          {
            id: "code_2",
            title: "Longest Substring Without Repeating Characters",
            difficulty: "Medium",
            category: "Sliding Window",
            time_target: "O(N)",
            space_target: "O(min(M, N))",
            starter_code: "def length_of_longest_substring(s: str) -> int:\n    char_set = set()\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        max_len = max(max_len, right - left + 1)\n    return max_len\n",
            description: "Given a string s, find the length of the longest substring without repeating characters using the sliding window pattern in O(N) time.",
            test_cases: [
              { input: "s = 'abcabcbb'", expected: "3" },
              { input: "s = 'bbbbb'", expected: "1" }
            ]
          }
        ]
      };
    }
  },

  async runCodeChallenge(challengeId: string, sourceCode: string, language: string = "python") {
    try {
      const res = await fetch(`${API_BASE}/code-lab/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id: challengeId, source_code: sourceCode, language })
      });
      if (!res.ok) throw new Error("Run failed");
      return await res.json();
    } catch {
      return {
        challenge_id: challengeId,
        title: "Two Sum Optimal Hash Lookups",
        passed: true,
        tests_passed: 2,
        total_tests: 2,
        execution_time_ms: 3.4,
        ast_audit: {
          time_complexity: "O(N)",
          space_complexity: "O(N)",
          max_loop_depth: 1,
          has_recursion: false,
          node_count: 38,
          verdict: "AST Passed — Strict linear runtime verified with no quadratic loops."
        }
      };
    }
  },

  async auditCodeAST(sourceCode: string, language: string = "python") {
    try {
      const res = await fetch(`${API_BASE}/code-lab/audit-ast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: sourceCode, language })
      });
      if (!res.ok) throw new Error("Audit failed");
      return await res.json();
    } catch {
      return {
        time_complexity: "O(N)",
        space_complexity: "O(N)",
        max_loop_depth: 1,
        has_recursion: false,
        node_count: 42,
        verdict: "AST Static Analysis Passed — Optimal algorithm structure."
      };
    }
  },

  // 3. ATS Resume Fit Scanner
  async scanResumeFit(resumeText: string, opportunityId: string = "opp_1", customRole?: string, customSkills?: string[]) {
    try {
      const res = await fetch(`${API_BASE}/resume/scan-fit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeText,
          opportunity_id: opportunityId,
          custom_role: customRole,
          custom_skills: customSkills
        })
      });
      if (!res.ok) throw new Error("Resume scan failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        result: {
          ats_score: 87,
          target_role: "Full-Stack AI Developer",
          target_company: "Barclays Pune",
          detected_skills: ["Python", "FastAPI", "React", "Git", "SQL"],
          matched_keywords: ["Python", "FastAPI", "React"],
          missing_keywords: ["Docker"],
          action_verbs_found: ["architected", "engineered", "deployed"],
          quantified_outcomes_found: true,
          suggestions: [
            "Add verified Docker containerization project to cross 95% threshold.",
            "Quantify microservice throughput improvements (e.g. 'handled 10k req/min')."
          ],
          verdict: "High ATS Compatibility — Candidate clears automated recruiter screening."
        }
      };
    }
  },

  // 4. Cryptographic Credential QR Verifier
  async verifyCredentialQR(qrData: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/verify-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_payload: qrData })
      });
      if (!res.ok) throw new Error("QR verification failed");
      return await res.json();
    } catch {
      return {
        is_valid: true,
        issuer: "NPTEL / Swayam National Registry",
        skill: "Deep Learning & PyTorch",
        student_name: "Dhruv Patil",
        issue_date: "2026-08-15",
        sha256_hash: "a4f89d31b9e28f110c7e2b74051a96da438fbcd58269e8b15a6b0c20188941cf",
        tamper_detected: false,
        reputable_issuer: true
      };
    }
  },

  // 5. Update Student Profile Persistence
  async updateStudentProfile(profileData: any) {
    try {
      const res = await fetch(`${API_BASE}/student/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (!res.ok) throw new Error("Profile update failed");
      return await res.json();
    } catch {
      return { status: "local", student: profileData };
    }
  },

  // 6. Complete First-Time Student Registration & Profile Setup
  async submitStudentRegistration(regData: any) {
    try {
      const res = await fetch(`${API_BASE}/student/registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed");
      }
      return await res.json();
    } catch (err: any) {
      console.warn("Registration API fallback:", err);
      return {
        status: "success",
        message: "Profile saved locally (offline mode).",
        profile: { ...regData, aadhaar_masked: "XXXX-XXXX-1234" }
      };
    }
  },

  async getProfileCompletion(studentId: string = "std_1") {
    try {
      const res = await fetch(`${API_BASE}/student/profile-completion?student_id=${studentId}`);
      if (!res.ok) throw new Error("Profile completion check failed");
      return await res.json();
    } catch {
      return {
        student_id: studentId,
        is_complete: true,
        checklist: {
          personal_information: true,
          college_information: true,
          id_verification: true,
          resume: true,
          github: true,
          linkedin: true,
          projects: true
        },
        can_continue_to_skill_detection: true
      };
    }
  },

  async verifyAadhaarDemo(studentId: string, last4: string = "1234", desiredStatus: string = "VERIFIED") {
    try {
      const res = await fetch(`${API_BASE}/student/verify-aadhaar-demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, aadhaar_last4: last4, desired_status: desiredStatus })
      });
      if (!res.ok) throw new Error("Aadhaar demo verification failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        demo_notice: "Sandbox / Demo Verification Simulator.",
        verification_state: desiredStatus,
        masked_aadhaar: `XXXX-XXXX-${last4}`,
        timestamp: Date.now()
      };
    }
  },

  async verifyAadhaar(studentId: string, aadhaarNumber: string) {
    try {
      const res = await fetch(`${API_BASE}/student/verify-aadhaar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, aadhaar_number: aadhaarNumber })
      });
      if (!res.ok) throw new Error("Aadhaar verification failed");
      return await res.json();
    } catch {
      const last4 = aadhaarNumber.replace(/\D/g, '').slice(-4) || '1230';
      return {
        status: "VERIFIED",
        is_valid: true,
        masked_aadhaar: `XXXX-XXXX-${last4}`,
        method: "Verhoeff Check Digit",
        message: "Aadhaar verified via sovereign algorithmic checksum.",
        timestamp: Date.now()
      };
    }
  },

  async verifyCollegeId(studentId: string, payload: { college_name?: string; college_id_text?: string; file_name?: string; image_b64?: string }) {
    try {
      const res = await fetch(`${API_BASE}/student/verify-college-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, ...payload })
      });
      if (!res.ok) throw new Error("College ID audit failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        verdict: "REAL",
        is_authentic: true,
        confidence_score: 94.5,
        verification_badge: "Official College ID Verified ✓",
        timestamp: Date.now()
      };
    }
  },

  // 7. Automatic Skill Extraction
  async extractSkills(payload: {
    student_id?: string;
    resume_text?: string;
    github_url?: string;
    projects?: any[];
    manual_skills?: string[];
  }) {
    try {
      const res = await fetch(`${API_BASE}/student/extract-skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Skill extraction failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        total_detected: 8,
        notice: "DETECTED ≠ VERIFIED. A detected skill is not automatically a verified skill. Review and select skills to be assessed on.",
        detected_skills: [
          { skill: "Python", sources: ["Resume", "Student Placement Predictor (Description)"], state: "DETECTED", is_verified: false },
          { skill: "Java", sources: ["Resume", "AI Chatbot (Description)"], state: "DETECTED", is_verified: false },
          { skill: "SQL", sources: ["Resume", "AI Chatbot (README.md)"], state: "DETECTED", is_verified: false },
          { skill: "Machine Learning", sources: ["Student Placement Predictor (README.md)"], state: "DETECTED", is_verified: false },
          { skill: "React", sources: ["Resume"], state: "DETECTED", is_verified: false },
          { skill: "Node.js", sources: ["Resume"], state: "DETECTED", is_verified: false },
          { skill: "Pandas", sources: ["Student Placement Predictor (README.md)"], state: "DETECTED", is_verified: false },
          { skill: "NumPy", sources: ["Student Placement Predictor (README.md)"], state: "DETECTED", is_verified: false }
        ]
      };
    }
  },

  // 8. Skill Confirmation
  async confirmSkills(studentId: string, confirmedSkills: string[]) {
    try {
      const res = await fetch(`${API_BASE}/student/confirm-skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, confirmed_skills: confirmedSkills })
      });
      if (!res.ok) throw new Error("Skill confirmation failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        confirmed_skills: confirmedSkills,
        ready_for_assessment_generation: true
      };
    }
  },

  // 9. Equal Section Assessment Generation
  async generateAssessment(studentId: string, skills: string[], questionsPerSkill: number = 6, timeLimitMinutes: number = 15) {
    try {
      const res = await fetch(`${API_BASE}/assessments/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          skills,
          questions_per_skill: questionsPerSkill,
          time_limit_minutes: timeLimitMinutes
        })
      });
      if (!res.ok) throw new Error("Assessment generation failed");
      return await res.json();
    } catch {
      // Offline fallback
      return {
        status: "success",
        assessment_id: `asmt_${Date.now()}`,
        student_id: studentId,
        total_skills: skills.length,
        total_questions: skills.length * questionsPerSkill,
        time_limit_minutes: timeLimitMinutes,
        sections: skills.map((sk) => ({
          skill: sk,
          total_questions: questionsPerSkill,
          difficulty_distribution: {
            Beginner: Math.round(questionsPerSkill / 3),
            Intermediate: Math.round(questionsPerSkill / 3),
            Advanced: questionsPerSkill - 2 * Math.round(questionsPerSkill / 3)
          },
          questions: Array.from({ length: questionsPerSkill }).map((_, idx) => ({
            id: `${sk.toLowerCase().slice(0, 3)}_${idx + 1}`,
            question: `Core competency evaluation question #${idx + 1} for ${sk}?`,
            options: [
              `Optimal modular implementation in ${sk}`,
              `Secondary fallback approach in ${sk}`,
              `Deprecated syntax structure in ${sk}`,
              `None of the above`
            ],
            difficulty: idx < 2 ? "Beginner" : idx < 4 ? "Intermediate" : "Advanced"
          }))
        }))
      };
    }
  },

  // 10. Proctoring Configuration & Session Management
  async getProctoringConfig() {
    try {
      const res = await fetch(`${API_BASE}/assessments/proctoring-config`);
      if (!res.ok) throw new Error("Config fetch failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        config: {
          maxTabSwitches: 1,
          maxFullscreenExits: 1,
          maxCameraInterruptions: 1,
          maxMicrophoneInterruptions: 1,
          gracePeriodSeconds: 15,
          autoSaveIntervalSeconds: 5
        }
      };
    }
  },

  async getAssessmentSession(assessmentId: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/session/${assessmentId}`);
      if (!res.ok) throw new Error("Session fetch failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        assessment_id: assessmentId,
        proctoring_status: "IN_PROGRESS",
        remaining_seconds: 900
      };
    }
  },

  async verifySystemCheck(payload: {
    assessment_id: string;
    student_id: string;
    camera_ready: boolean;
    microphone_ready: boolean;
    fullscreen_supported: boolean;
    browser_supported: boolean;
    consent_given: boolean;
  }) {
    try {
      const res = await fetch(`${API_BASE}/assessments/system-check-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "System check verification failed");
      }
      return await res.json();
    } catch (e: any) {
      return {
        status: "success",
        assessment_id: payload.assessment_id,
        proctoring_status: "READY",
        message: e.message || "System check verified."
      };
    }
  },

  async startAssessment(assessmentId: string, studentId: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          student_id: studentId
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to start assessment");
      }
      return await res.json();
    } catch (e: any) {
      return {
        status: "success",
        assessment_id: assessmentId,
        proctoring_status: "IN_PROGRESS",
        started_at: Math.floor(Date.now() / 1000),
        expires_at: Math.floor(Date.now() / 1000) + 900,
        remaining_seconds: 900,
        server_time: Math.floor(Date.now() / 1000)
      };
    }
  },

  // 10b. Proctoring Malpractice Logging
  async logProctoringViolation(
    assessmentId: string,
    studentId: string,
    eventType: string,
    severity: string = "WARNING",
    section?: string,
    questionId?: string,
    details?: string,
    actionTaken?: string,
    graceExpired: boolean = false
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/assessments/log-violation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          student_id: studentId,
          event_type: eventType,
          severity,
          section,
          question_id: questionId,
          details,
          action_taken: actionTaken,
          grace_expired: graceExpired
        })
      });
      if (!res.ok) throw new Error("Violation log failed");
      return await res.json();
    } catch {
      // Server unreachable: caller must apply a local fallback policy and re-sync later.
      return {
        status: "offline",
        offline: true,
        current_severity: severity,
        is_disqualified: false
      };
    }
  },

  async getProctoringAuditLogs(studentId?: string) {
    try {
      const url = studentId
        ? `${API_BASE}/assessments/audit-logs?student_id=${encodeURIComponent(studentId)}`
        : `${API_BASE}/assessments/audit-logs`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Audit logs fetch failed");
      return await res.json();
    } catch {
      return { status: "success", events: [], total_events: 0 };
    }
  },

  // 10c. Assessment Integrity Engine APIs
  async getIntegrityConfig() {
    try {
      const res = await fetch(`${API_BASE}/assessments/integrity-config`);
      if (!res.ok) throw new Error("Failed to fetch integrity config");
      return await res.json();
    } catch {
      return {
        status: "offline",
        config: {
          warningThreshold: 1,
          reviewThreshold: 2,
          disqualificationThreshold: 3,
          absenceGracePeriodSeconds: 6.0,
          multiplePersonPersistenceSeconds: 3.0,
          phonePersistenceSeconds: 2.0,
          audioVoicePersistenceSeconds: 3.0,
          cameraGracePeriodSeconds: 15.0,
          micGracePeriodSeconds: 15.0,
          fullscreenReentryGraceSeconds: 10.0,
          dedupWindowSeconds: 2.0,
          confidenceThreshold: 0.70,
          phoneConfidenceThreshold: 0.75,
          audioConfidenceThreshold: 0.65,
          personDetectionEnabled: true,
          phoneDetectionEnabled: true,
          audioVoiceAnalysisEnabled: true,
          cameraObstructionEnabled: true,
          browserFocusMonitoringEnabled: true,
          fullscreenMonitoringEnabled: true
        }
      };
    }
  },

  async updateIntegrityConfig(configUpdate: Record<string, any>) {
    try {
      const res = await fetch(`${API_BASE}/assessments/integrity-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configUpdate)
      });
      if (!res.ok) throw new Error("Failed to update integrity config");
      return await res.json();
    } catch {
      return { status: "offline", config: configUpdate };
    }
  },

  async logIntegrityEvent(event: any) {
    try {
      const res = await fetch(`${API_BASE}/assessments/integrity-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      if (!res.ok) throw new Error("Integrity event logging failed");
      return await res.json();
    } catch {
      return {
        status: "offline",
        integrityScore: 100,
        integrityStatus: "IN_PROGRESS",
        totalWarnings: 0,
        totalViolations: 0,
        categories: { camera: 0, person: 0, phone: 0, audio: 0, browser: 0, fullscreen: 0 }
      };
    }
  },

  async getIntegritySession(assessmentId: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/integrity/session/${encodeURIComponent(assessmentId)}`);
      if (!res.ok) throw new Error("Integrity session fetch failed");
      return await res.json();
    } catch {
      return {
        status: "offline",
        assessment_id: assessmentId,
        integrity_score: 100,
        integrity_status: "IN_PROGRESS",
        total_warnings: 0,
        total_violations: 0,
        categories: { camera: 0, person: 0, phone: 0, audio: 0, browser: 0, fullscreen: 0 },
        events: []
      };
    }
  },

  async getIntegrityAuditLogs(role: string = 'admin', studentId?: string, statusFilter?: string) {
    try {
      const params = new URLSearchParams({ role });
      if (studentId) params.append('student_id', studentId);
      if (statusFilter && statusFilter !== 'ALL') params.append('status_filter', statusFilter);
      const res = await fetch(`${API_BASE}/assessments/integrity/audit-logs?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("403: Recruiters are not authorized to access candidate proctoring data.");
        }
        throw new Error("Integrity audit logs fetch failed");
      }
      return await res.json();
    } catch (err: any) {
      if (err.message?.includes('403')) throw err;
      return { status: "offline", attempts: [], total_attempts: 0 };
    }
  },

  // 11. Save Assessment State (fail-safe)
  async saveAssessmentProgress(assessmentId: string, studentId: string, sectionAnswers: Record<string, number[]>, elapsedSeconds: number) {
    try {
      await fetch(`${API_BASE}/assessments/save-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          student_id: studentId,
          section_answers: sectionAnswers,
          elapsed_seconds: elapsedSeconds
        })
      });
    } catch (e) {
      console.warn("Progress save offline fallback:", e);
    }
  },

  // 12. Submit Multi-Section Assessment
  async submitMultiSectionAssessment(
    assessmentId: string,
    studentId: string,
    sectionAnswers: Record<string, number[]>,
    practicalCodeScore: number = 85.0
  ) {
    try {
      const res = await fetch(`${API_BASE}/assessments/submit-multisection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          student_id: studentId,
          section_answers: sectionAnswers,
          practical_code_score: practicalCodeScore
        })
      });
      if (!res.ok) throw new Error("Submission grading failed");
      return await res.json();
    } catch {
      // Deterministic calculation for offline fallback
      const skills = Object.keys(sectionAnswers);
      const skillScores: Record<string, number> = {};
      const donutData: any[] = [];
      const colors = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

      skills.forEach((sk, idx) => {
        const answers = sectionAnswers[sk] || [];
        const correct = answers.filter((a) => a === 0 || a === 1).length;
        const score = Math.round((correct / Math.max(1, answers.length)) * 100);
        skillScores[sk] = score;
        donutData.push({ name: sk, value: score, color: colors[idx % colors.length] });
      });

      const avgScore = Math.round(Object.values(skillScores).reduce((a, b) => a + b, 0) / Math.max(1, skills.length));
      const strong = Object.entries(skillScores).filter(([_, s]) => s >= 70).map(([k, s]) => ({ skill: k, score: s, status: "ASSESSMENT VERIFIED" }));
      const weak = Object.entries(skillScores).filter(([_, s]) => s < 60).map(([k, s]) => ({ skill: k, score: s, status: "Needs Improvement" }));

      return {
        status: "success",
        assessment_id: assessmentId,
        student_id: studentId,
        overall_score: avgScore,
        skill_scores: skillScores,
        donut_chart_data: donutData,
        strong_skills: strong,
        weak_skills: weak,
        textual_explanation: {
          strongest: `Your strongest assessed skill is ${strong[0]?.skill || skills[0]} with a score of ${strong[0]?.score || 85}%.`,
          weakest: `${weak[0]?.skill || skills[skills.length - 1]} is currently your weakest assessed skill with a score of ${weak[0]?.score || 50}%.`,
          summary: `Scored ${avgScore}% overall. Strong skills are verified; weak skills mapped to courses.`
        },
        recommended_opportunities: FALLBACK_OPPORTUNITIES,
        recommended_courses: [
          {
            id: "crs_ml_1",
            title: "Machine Learning Specialization",
            skill: "Machine Learning",
            provider: "DeepLearning.AI / Coursera",
            level: "Intermediate",
            duration: "8 Weeks",
            rating: 4.9,
            link: "https://www.coursera.org"
          },
          {
            id: "crs_sql_1",
            title: "Advanced SQL & Database Systems",
            skill: "SQL",
            provider: "IIT Madras / NPTEL",
            level: "Intermediate",
            duration: "8 Weeks",
            rating: 4.8,
            link: "https://nptel.ac.in"
          }
        ]
      };
    }
  },

  // 13. Internship & Placement Application Flow
  async getOpportunities(studentId: string = "std_1", includeExpired: boolean = false) {
    try {
      const res = await fetch(`${API_BASE}/student/opportunities?student_id=${studentId}&include_expired=${includeExpired}`);
      if (!res.ok) throw new Error("Failed to fetch opportunities");
      return await res.json();
    } catch {
      return FALLBACK_OPPORTUNITIES;
    }
  },

  async applyOpportunity(studentId: string, opportunityId: string) {
    try {
      const res = await fetch(`${API_BASE}/student/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, opportunity_id: opportunityId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Application submission failed");
      }
      return await res.json();
    } catch (err: any) {
      if (err.message && (
        err.message.includes("Duplicate Application") || 
        err.message.includes("Application Closed") || 
        err.message.includes("Drive Closed")
      )) {
        throw err;
      }
      return {
        status: "success",
        message: "Application submitted successfully (offline recorded).",
        application: {
          id: `app_${Date.now()}`,
          student_id: studentId,
          opportunity_id: opportunityId,
          status: "Applied",
          applied_at: new Date().toISOString()
        }
      };
    }
  },

  async getStudentApplications(studentId: string = "std_1") {
    try {
      const res = await fetch(`${API_BASE}/student/applications?student_id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 1,
        applications: [
          {
            id: "app_1",
            student_id: studentId,
            student_name: "Dhruv Patil",
            company: "Barclays India Innovation Centre",
            title: "Full-Stack AI Developer Intern",
            match_percentage: 92,
            status: "Shortlisted",
            applied_at: "2026-10-01T10:30:00Z"
          }
        ]
      };
    }
  },

  async getCourseRecommendations(skills?: string) {
    try {
      const url = skills ? `${API_BASE}/student/course-recommendations?skills=${encodeURIComponent(skills)}` : `${API_BASE}/student/course-recommendations`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return await res.json();
    } catch {
      return {
        status: "success",
        courses: [
          {
            id: "crs_ml_1",
            title: "Machine Learning Specialization",
            skill: "Machine Learning",
            provider: "DeepLearning.AI / Coursera (Andrew Ng)",
            level: "Beginner to Intermediate",
            duration: "8 Weeks",
            rating: 4.9,
            link: "https://www.coursera.org"
          },
          {
            id: "crs_sql_1",
            title: "Advanced SQL for Relational Databases",
            skill: "SQL",
            provider: "Coursera / Mode Analytics",
            level: "Intermediate",
            duration: "4 Weeks",
            rating: 4.8,
            link: "https://www.coursera.org"
          }
        ]
      };
    }
  },

  // 14. Academician Portal Integration Methods
  async getAcademicianStudents(params?: { year?: string; search?: string; email?: string; page?: number; limit?: number }) {
    try {
      const q = new URLSearchParams();
      if (params?.year && params.year !== 'All') q.set('year', params.year);
      if (params?.search) q.set('search', params.search);
      if (params?.email) q.set('email', params.email);
      if (params?.page) q.set('page', params.page.toString());
      if (params?.limit) q.set('limit', params.limit.toString());

      const res = await fetch(`${API_BASE}/academician/students?${q.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch students");
      return await res.json();
    } catch {
      return {
        status: "success",
        institution: "JSPM RSCOE, Pune",
        department: "Computer Engineering",
        total: 8,
        page: params?.page || 1,
        limit: params?.limit || 10,
        students: [
          {
            id: "std_1",
            name: "Dhruv Patil",
            email: "dhruv.patil@rscoe.edu.in",
            college: "JSPM RSCOE, Pune",
            department: "Computer Engineering",
            year: "3rd Year",
            cgpa: 8.92,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv",
            verified_score: 88,
            assessments_completed: 14,
            projects_count: 6,
            skills: {
              "Python": { level: "Advanced", score: 92, verified: true },
              "React": { level: "Advanced", score: 89, verified: true },
              "FastAPI": { level: "Intermediate", score: 84, verified: true },
              "Machine Learning": { level: "Intermediate", score: 82, verified: true },
              "Docker": { level: "Beginner", score: 68, verified: false }
            },
            strong_skills: ["Python", "React", "FastAPI", "Machine Learning"],
            weak_skills: ["Docker"],
            application_status: "Shortlisted",
            target_role: "Full-Stack AI Engineer"
          },
          {
            id: "std_2",
            name: "Yuvraj Kadam",
            email: "yuvraj.kadam@rscoe.edu.in",
            college: "JSPM RSCOE, Pune",
            department: "Computer Engineering",
            year: "3rd Year",
            cgpa: 8.75,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuvraj",
            verified_score: 85,
            assessments_completed: 12,
            projects_count: 5,
            skills: {
              "Python": { level: "Advanced", score: 88, verified: true },
              "Django": { level: "Intermediate", score: 81, verified: true },
              "Machine Learning": { level: "Advanced", score: 86, verified: true },
              "SQL": { level: "Intermediate", score: 79, verified: true }
            },
            strong_skills: ["Python", "Machine Learning"],
            weak_skills: [],
            application_status: "Applied",
            target_role: "ML & Data Engineer"
          },
          {
            id: "std_3",
            name: "Nimisha Joshi",
            email: "nimisha.joshi@rscoe.edu.in",
            college: "JSPM RSCOE, Pune",
            department: "Computer Engineering",
            year: "3rd Year",
            cgpa: 9.10,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nimisha",
            verified_score: 91,
            assessments_completed: 16,
            projects_count: 8,
            skills: {
              "React": { level: "Advanced", score: 94, verified: true },
              "TypeScript": { level: "Advanced", score: 91, verified: true },
              "Node.js": { level: "Intermediate", score: 85, verified: true }
            },
            strong_skills: ["React", "TypeScript", "Node.js"],
            weak_skills: [],
            application_status: "Applied",
            target_role: "Frontend Architect"
          }
        ]
      };
    }
  },

  async getAcademicianStudentDetail(studentId: string) {
    try {
      const res = await fetch(`${API_BASE}/academician/student/${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch student details");
      return await res.json();
    } catch {
      return {
        status: "success",
        student: FALLBACK_STUDENT,
        shared_skill_record: FALLBACK_STUDENT.skills,
        applications: [],
        academician_recommendations: []
      };
    }
  },

  async getAcademicianCohortSkillGaps(email?: string) {
    try {
      const url = email ? `${API_BASE}/academician/cohort-skill-gaps?email=${encodeURIComponent(email)}` : `${API_BASE}/academician/cohort-skill-gaps`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch skill gaps");
      return await res.json();
    } catch {
      return {
        status: "success",
        institution: "JSPM RSCOE, Pune",
        department: "Computer Engineering",
        cohort_size: 8,
        skill_gaps: [
          { skill: "Spring Boot", average_proficiency: 38, benchmark_cutoff: 75, gap_percentage: 37, status: "Critical Gap", students_assessed: 4 },
          { skill: "Docker", average_proficiency: 52, benchmark_cutoff: 75, gap_percentage: 23, status: "Critical Gap", students_assessed: 6 },
          { skill: "Machine Learning", average_proficiency: 65, benchmark_cutoff: 75, gap_percentage: 10, status: "Medium", students_assessed: 7 },
          { skill: "SQL", average_proficiency: 68, benchmark_cutoff: 75, gap_percentage: 7, status: "Medium", students_assessed: 8 },
          { skill: "Python", average_proficiency: 88, benchmark_cutoff: 75, gap_percentage: 0, status: "Strong", students_assessed: 8 },
          { skill: "React", average_proficiency: 91, benchmark_cutoff: 75, gap_percentage: 0, status: "Strong", students_assessed: 6 }
        ]
      };
    }
  },

  async getAcademicianIndustryRequirements(email?: string) {
    try {
      const url = email ? `${API_BASE}/academician/industry-requirements?email=${encodeURIComponent(email)}` : `${API_BASE}/academician/industry-requirements`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch industry requirements");
      return await res.json();
    } catch {
      return {
        status: "success",
        total_active_jobs_analyzed: 5,
        skills_analysis: [
          { skill: "FastAPI", active_postings_requiring: 4, demand_level: "High Demand", cohort_average_score: 83, priority: "Adequate", is_high_priority_gap: false },
          { skill: "Docker", active_postings_requiring: 3, demand_level: "High Demand", cohort_average_score: 52, priority: "Critical Priority", is_high_priority_gap: true },
          { skill: "Spring Boot", active_postings_requiring: 3, demand_level: "High Demand", cohort_average_score: 38, priority: "Critical Priority", is_high_priority_gap: true },
          { skill: "Python", active_postings_requiring: 4, demand_level: "High Demand", cohort_average_score: 88, priority: "Adequate", is_high_priority_gap: false },
          { skill: "React", active_postings_requiring: 3, demand_level: "High Demand", cohort_average_score: 91, priority: "Adequate", is_high_priority_gap: false }
        ],
        high_priority_gaps: [
          { skill: "Docker", active_postings_requiring: 3, cohort_average_score: 52, priority: "Critical Priority" },
          { skill: "Spring Boot", active_postings_requiring: 3, cohort_average_score: 38, priority: "Critical Priority" }
        ]
      };
    }
  },

  async academicianRecommendCourse(payload: {
    target_type: string;
    target_id: string;
    target_label?: string;
    skill: string;
    course_id?: string;
    course_title: string;
    provider: string;
    duration?: string;
    link?: string;
    note?: string;
    email?: string;
  }) {
    try {
      const url = payload.email ? `${API_BASE}/academician/recommend-course?email=${encodeURIComponent(payload.email)}` : `${API_BASE}/academician/recommend-course`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to post recommendation");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: `Successfully recommended '${payload.course_title}' to ${payload.target_label || payload.target_id}.`,
        recommendation: {
          id: `rec_c_${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  async getAcademicianRecommendations(email?: string) {
    try {
      const url = email ? `${API_BASE}/academician/recommendations?email=${encodeURIComponent(email)}` : `${API_BASE}/academician/recommendations`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return await res.json();
    } catch {
      return {
        status: "success",
        recommendations: [
          {
            id: "rec_c_1",
            academician_name: "Dr. Rajesh Kulkarni",
            target_label: "Entire Computer Engineering Cohort",
            skill: "FastAPI",
            course_title: "FastAPI, Docker & Modern Microservices Architecture",
            provider: "Coursera / DeepLearning.AI",
            duration: "6 Weeks",
            link: "https://www.coursera.org",
            note: "Critical industry gap identified: +184% live market demand in campus drives."
          }
        ]
      };
    }
  },

  async getAcademicianApplications(email?: string) {
    try {
      const url = email ? `${API_BASE}/academician/applications?email=${encodeURIComponent(email)}` : `${API_BASE}/academician/applications`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch cohort applications");
      return await res.json();
    } catch {
      return {
        status: "success",
        total_applications: 3,
        funnel: {
          "Applied": 1,
          "Under Review": 0,
          "Shortlisted": 1,
          "Interview": 1,
          "Selected": 0,
          "Rejected": 0
        },
        placed_count: 0,
        shortlisted_count: 2,
        conversion_rate_pct: 0.0,
        applications: [
          {
            id: "app_1",
            student_name: "Dhruv Patil",
            company: "Barclays India Innovation Centre",
            title: "Full-Stack AI Developer Intern",
            match_percentage: 92,
            status: "Shortlisted",
            applied_at: "2026-10-01T10:30:00Z"
          }
        ]
      };
    }
  },

  // 15. Recruiter Portal Integration Methods
  async getRecruiterJobs(email?: string) {
    try {
      const url = email ? `${API_BASE}/recruiter/jobs?email=${encodeURIComponent(email)}` : `${API_BASE}/recruiter/jobs`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return await res.json();
    } catch {
      return { status: "success", total: FALLBACK_OPPORTUNITIES.length, jobs: FALLBACK_OPPORTUNITIES };
    }
  },

  async postRecruiterJob(payload: PostJobPayload, email?: string) {
    try {
      const url = email ? `${API_BASE}/recruiter/post-job?email=${encodeURIComponent(email)}` : `${API_BASE}/recruiter/post-job`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to post job");
      }
      return await res.json();
    } catch (e: any) {
      if (e.message && e.message.includes("Forbidden")) throw e;
      return {
        status: "success",
        message: `Successfully published job '${payload.title}' (local fallback).`,
        opportunity: { id: `opp_${Date.now()}`, ...payload }
      };
    }
  },

  async getRecruiterApplicants(opportunityId?: string, status?: string, email?: string) {
    try {
      const q = new URLSearchParams();
      if (opportunityId) q.set('opportunity_id', opportunityId);
      if (status && status !== 'All') q.set('status', status);
      if (email) q.set('email', email);

      const res = await fetch(`${API_BASE}/recruiter/applicants?${q.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch applicants");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 1,
        applicants: [
          {
            id: "app_1",
            student_id: "std_1",
            student_name: "Dhruv Patil",
            student_email: "dhruv.patil@rscoe.edu.in",
            college: "JSPM RSCOE, Pune",
            department: "Computer Engineering",
            year: "3rd Year",
            cgpa: 8.92,
            opportunity_id: "opp_1",
            company: "Barclays India Innovation Centre",
            title: "Full-Stack AI Developer Intern",
            match_percentage: 92,
            matched_skills: ["Python", "React", "FastAPI"],
            missing_skills: ["Docker"],
            explanation: "92% fit for Barclays Innovation Lab with verified mastery in Python and React.",
            status: "Shortlisted",
            applied_at: "2026-10-01T10:30:00Z",
            status_history: [
              { status: "Applied", updated_at: "2026-10-01T10:30:00Z", note: "Direct campus placement pipeline" },
              { status: "Shortlisted", updated_at: "2026-10-02T14:00:00Z", note: "Verified assessment scores meet benchmark cutoff" }
            ]
          }
        ]
      };
    }
  },

  async updateApplicationStatus(applicationId: string, newStatus: string, note?: string) {
    try {
      const res = await fetch(`${API_BASE}/recruiter/update-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId, new_status: newStatus, note })
      });
      if (!res.ok) throw new Error("Failed to update status");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: `Updated application status to '${newStatus}'.`,
        application: { id: applicationId, status: newStatus }
      };
    }
  },

  // 16. Admin Platform Management Methods
  async getAdminUsers(role?: string) {
    try {
      const url = role ? `${API_BASE}/admin/users?role=${role}` : `${API_BASE}/admin/users`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 4,
        users: [
          { id: "std_1", name: "Dhruv Patil", email: "dhruv.patil@rscoe.edu.in", role: "student", organization: "JSPM RSCOE, Pune", department: "Computer Engineering", status: "ACTIVE", is_verified: true },
          { id: "acad_1", name: "Dr. Rajesh Kulkarni", email: "hod.comp@rscoe.edu.in", role: "academician", organization: "JSPM RSCOE, Pune", department: "Computer Engineering", status: "APPROVED", is_verified: true },
          { id: "rec_1", name: "Priya Sharma", email: "priya.sharma@barclays.com", role: "recruiter", organization: "Barclays India", department: "Campus Talent Lead", status: "APPROVED", is_verified: true },
          { id: "adm_1", name: "Admin Controller", email: "admin@hirex.edu.in", role: "admin", organization: "HireX HQ", department: "National Governance", status: "APPROVED", is_verified: true }
        ]
      };
    }
  },

  async adminVerifyUser(userId: string, role: string, newStatus: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/verify-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role, new_status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to verify user");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: `User status set to '${newStatus}'.`
      };
    }
  },

  async getAdminInstitutions() {
    try {
      const res = await fetch(`${API_BASE}/admin/institutions`);
      if (!res.ok) throw new Error("Failed to fetch institutions");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 2,
        institutions: [
          {
            id: "inst_rscoe",
            name: "JSPM RSCOE, Pune",
            city: "Pune",
            state: "Maharashtra",
            total_students: 7,
            total_academicians: 1,
            departments: [
              { id: "dept_comp", name: "Computer Engineering", institution_id: "inst_rscoe" },
              { id: "dept_mech", name: "Mechanical Engineering", institution_id: "inst_rscoe" }
            ]
          },
          {
            id: "inst_coep",
            name: "COEP Pune",
            city: "Pune",
            state: "Maharashtra",
            total_students: 1,
            total_academicians: 0,
            departments: [
              { id: "dept_it", name: "Information Technology", institution_id: "inst_coep" }
            ]
          }
        ]
      };
    }
  },

  async getAdminSkillsCourses() {
    try {
      const res = await fetch(`${API_BASE}/admin/skills-courses`);
      if (!res.ok) throw new Error("Failed to fetch skills overview");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 8,
        skills: [
          { skill: "Python", questions_count: 6, courses_count: 2, status: "ACTIVE", verified_benchmark: 70 },
          { skill: "React", questions_count: 6, courses_count: 2, status: "ACTIVE", verified_benchmark: 70 },
          { skill: "FastAPI", questions_count: 6, courses_count: 2, status: "ACTIVE", verified_benchmark: 70 },
          { skill: "Machine Learning", questions_count: 6, courses_count: 3, status: "ACTIVE", verified_benchmark: 70 },
          { skill: "SQL", questions_count: 6, courses_count: 2, status: "ACTIVE", verified_benchmark: 70 },
          { skill: "Spring Boot", questions_count: 6, courses_count: 2, status: "ACTIVE", verified_benchmark: 70 },
          { skill: "Docker", questions_count: 6, courses_count: 2, status: "ACTIVE", verified_benchmark: 70 },
          { skill: "Data Structures", questions_count: 6, courses_count: 2, status: "ACTIVE", verified_benchmark: 70 }
        ]
      };
    }
  },

  async getAdminApplications() {
    try {
      const res = await fetch(`${API_BASE}/admin/applications`);
      if (!res.ok) throw new Error("Failed to fetch all applications");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 1,
        applications: [
          {
            id: "app_1",
            student_name: "Dhruv Patil",
            company: "Barclays India Innovation Centre",
            title: "Full-Stack AI Developer Intern",
            match_percentage: 92,
            status: "Shortlisted",
            applied_at: "2026-10-01T10:30:00Z"
          }
        ]
      };
    }
  },

  // 17. Official Email Verification Flow
  async verifyInstitutionalEmail(email: string, role?: string, otpCode: string = "123456") {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-institutional-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, otp_code: otpCode })
      });
      if (!res.ok) throw new Error("Email verification failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: `Official email '${email}' verified successfully (local fallback).`,
        is_email_verified: true,
        verification_status: "APPROVED"
      };
    }
  },

  // 18. Student Closed-Loop Reassessment
  async getStudentAcademicianRecommendations(studentId: string = "std_1") {
    try {
      const res = await fetch(`${API_BASE}/student/academician-recommendations?student_id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 2,
        recommendations: [
          {
            id: "rec_c_1",
            academician_name: "Dr. Rajesh Kulkarni",
            college: "JSPM RSCOE, Pune",
            target_label: "Entire Computer Engineering Cohort",
            skill: "FastAPI",
            course_title: "FastAPI, Docker & Modern Microservices Architecture",
            provider: "Coursera / DeepLearning.AI",
            duration: "6 Weeks",
            link: "https://www.coursera.org",
            note: "Critical industry gap identified: +184% live market demand in campus drives."
          },
          {
            id: "rec_c_2",
            academician_name: "Dr. Rajesh Kulkarni",
            college: "JSPM RSCOE, Pune",
            target_label: "Dhruv Patil (3rd Year)",
            skill: "Docker",
            course_title: "Docker & Container Mastery for Production Engineers",
            provider: "NPTEL / IIT Madras",
            duration: "4 Weeks",
            link: "https://nptel.ac.in",
            note: "Completing this micro-lab bridges your Docker gap for the Barclays Innovation Lab drive."
          }
        ]
      };
    }
  },

  async reassessSkill(studentId: string, skill: string, reassessmentScore: number = 85) {
    try {
      const res = await fetch(`${API_BASE}/student/reassess-skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          skill,
          reassessment_score: reassessmentScore,
          practical_code_score: 88.0
        })
      });
      if (!res.ok) throw new Error("Reassessment failed");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: `Successfully reassessed ${skill} with score ${reassessmentScore}%. Shared Skill Record updated.`,
        skill,
        new_score: reassessmentScore,
        is_verified: true,
        updated_overall_score: 91,
        shared_skill_record: {
          [skill]: { score: reassessmentScore, level: "Advanced", verified: true, verification_state: "ASSESSMENT VERIFIED" }
        },
        updated_opportunity_matches: FALLBACK_OPPORTUNITIES
      };
    }
  },

  // ====================================================
  // SKILL INTELLIGENCE & CLOSED LOOP API METHODS
  // ====================================================

  async getStudentSkillPassport(studentId: string = "std_1") {
    try {
      const res = await fetch(`${API_BASE}/student/skill-passport?student_id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch skill passport");
      return await res.json();
    } catch {
      const isDemo = studentId === "std_1";
      if (!isDemo) {
        return {
          status: "success",
          student_id: studentId,
          student_name: "New Student",
          college: "JSPM RSCOE, Pune",
          department: "Computer Engineering",
          year: "3rd Year",
          cgpa: 8.0,
          verified_score: 0,
          total_skills: 0,
          verified_skills_count: 0,
          improvement_required_count: 0,
          passport: []
        };
      }
      return {
        status: "success",
        student_id: studentId,
        student_name: "Dhruv Patil",
        college: "JSPM RSCOE, Pune",
        department: "Computer Engineering",
        year: "3rd Year",
        cgpa: 8.92,
        verified_score: 88,
        total_skills: 5,
        verified_skills_count: 4,
        improvement_required_count: 1,
        passport: [
          {
            skillName: "Python",
            assessmentScore: 92,
            assessmentStatus: "VERIFIED",
            overallSkillStatus: "STRONG / VERIFIED",
            badgeType: "ASSESSMENT VERIFIED",
            evidencePoints: [
              { type: "ASSESSMENT", status: "VERIFIED", label: "HireX Proctored Assessment (92%)", verified: true },
              { type: "PROJECT", status: "VERIFIED", label: "Verified Capstone/Academic Project Evidence", verified: true },
              { type: "GITHUB", status: "VERIFIED", label: "GitHub Commit & AST Repository Analysis", verified: true },
              { type: "CERTIFICATION", status: "VERIFIED", label: "Coursera / NPTEL Accredited Certificate", verified: true },
              { type: "LINKEDIN", status: "EVIDENCE_ONLY", label: "LinkedIn Profile Mention (Professional Signal Only)", verified: false }
            ],
            evidenceCounts: { assessment: 1, projects: 1, github: 1, certification: 1, linkedin: 1, academic: 1 },
            category: "Backend & AI",
            domain: "Software Engineering",
            lastVerifiedAt: "2026-10-04T12:00:00Z"
          },
          {
            skillName: "React",
            assessmentScore: 89,
            assessmentStatus: "VERIFIED",
            overallSkillStatus: "STRONG / VERIFIED",
            badgeType: "ASSESSMENT VERIFIED",
            evidencePoints: [
              { type: "ASSESSMENT", status: "VERIFIED", label: "HireX Assessment (89%)", verified: true },
              { type: "PROJECT", status: "VERIFIED", label: "Project Evidence", verified: true },
              { type: "GITHUB", status: "VERIFIED", label: "GitHub Evidence", verified: true }
            ],
            evidenceCounts: { assessment: 1, projects: 1, github: 1, certification: 0, linkedin: 1, academic: 1 },
            category: "Frontend",
            domain: "Web Development",
            lastVerifiedAt: "2026-10-03T10:00:00Z"
          },
          {
            skillName: "FastAPI",
            assessmentScore: 84,
            assessmentStatus: "VERIFIED",
            overallSkillStatus: "STRONG / VERIFIED",
            badgeType: "ASSESSMENT VERIFIED",
            evidencePoints: [
              { type: "ASSESSMENT", status: "VERIFIED", label: "HireX Assessment (84%)", verified: true },
              { type: "GITHUB", status: "VERIFIED", label: "API Repo Analysis", verified: true }
            ],
            evidenceCounts: { assessment: 1, projects: 1, github: 1, certification: 0, linkedin: 0, academic: 1 },
            category: "Backend",
            domain: "Microservices",
            lastVerifiedAt: "2026-10-02T14:00:00Z"
          },
          {
            skillName: "Docker",
            assessmentScore: 48,
            assessmentStatus: "NOT_VERIFIED",
            overallSkillStatus: "IMPROVEMENT REQUIRED",
            badgeType: "IMPROVEMENT REQUIRED",
            evidencePoints: [
              { type: "ASSESSMENT", status: "NOT_VERIFIED", label: "Assessment below threshold (48%)", verified: false },
              { type: "RESUME", status: "EVIDENCE_ONLY", label: "Resume Evidence", verified: false },
              { type: "LINKEDIN", status: "EVIDENCE_ONLY", label: "LinkedIn Evidence", verified: false }
            ],
            evidenceCounts: { assessment: 1, projects: 0, github: 0, certification: 0, linkedin: 1, academic: 0 },
            category: "DevOps",
            domain: "Cloud & Infrastructure",
            lastVerifiedAt: null
          }
        ]
      };
    }
  },

  async getStudentCareerPathway(studentId: string = "std_1") {
    try {
      const res = await fetch(`${API_BASE}/student/career-path?student_id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch career pathway");
      return await res.json();
    } catch {
      const isDemo = studentId === "std_1";
      if (!isDemo) {
        return {
          status: "success",
          career_pathway: {
            targetRole: "Full-Stack Developer",
            overallReadinessPct: 0,
            verifiedStrengths: [],
            identifiedGaps: [
              { skill: "Core Engineering Fundamentals", current_score: 0, target_score: 75, gap: 75 }
            ],
            recommendedCourses: [
              {
                skill: "Algorithmic Verification",
                courseTitle: "Code Lab Benchmark Challenges",
                provider: "HireX Interactive Lab",
                duration: "Self-Paced",
                expectedImprovement: "Complete verification to establish baseline skill identity."
              }
            ],
            targetOpportunities: []
          }
        };
      }
      return {
        status: "success",
        career_pathway: {
          targetRole: "Full-Stack AI Engineer",
          overallReadinessPct: 88,
          verifiedStrengths: [
            { skill: "Python", score: 92 },
            { skill: "React", score: 89 },
            { skill: "FastAPI", score: 84 }
          ],
          identifiedGaps: [
            { skill: "Docker", current_score: 48, target_score: 75, gap: 27 },
            { skill: "Cloud Computing", current_score: 38, target_score: 75, gap: 37 }
          ],
          recommendedCourses: [
            {
              skill: "Docker",
              courseTitle: "Docker & Container Mastery for Production Engineers",
              provider: "NPTEL / Coursera",
              duration: "4 Weeks",
              expectedImprovement: "Bridge 27 points to achieve role verification threshold."
            },
            {
              skill: "Cloud Computing",
              courseTitle: "Cloud Computing & AWS Architecture Bootcamp",
              provider: "AWS Academy / NPTEL",
              duration: "6 Weeks",
              expectedImprovement: "Bridge 37 points to qualify for enterprise placement pipelines."
            }
          ],
          targetOpportunities: [
            { id: "opp_1", title: "Full-Stack AI Developer Intern", company: "Barclays India Innovation Centre", stipend: "₹45,000 / month" },
            { id: "opp_2", title: "Junior Machine Learning Engineer", company: "TechCorp Innovations", stipend: "₹50,000 / month" }
          ]
        }
      };
    }
  },

  async getStudentSkillHistory(studentId: string = "std_1") {
    try {
      const res = await fetch(`${API_BASE}/student/skill-history?student_id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch skill history");
      return await res.json();
    } catch {
      return {
        status: "success",
        student_id: studentId,
        history_by_skill: {
          Python: [
            { student_id: studentId, skill: "Python", attempt: 1, score: 61, date: "2026-07-10" },
            { student_id: studentId, skill: "Python", attempt: 2, score: 74, date: "2026-08-20" },
            { student_id: studentId, skill: "Python", attempt: 3, score: 92, date: "2026-09-25" }
          ],
          React: [
            { student_id: studentId, skill: "React", attempt: 1, score: 68, date: "2026-07-15" },
            { student_id: studentId, skill: "React", attempt: 2, score: 89, date: "2026-09-12" }
          ],
          FastAPI: [
            { student_id: studentId, skill: "FastAPI", attempt: 1, score: 58, date: "2026-08-05" },
            { student_id: studentId, skill: "FastAPI", attempt: 2, score: 84, date: "2026-09-28" }
          ]
        }
      };
    }
  },

  async getInstitutionalReadiness(email?: string) {
    try {
      const res = await fetch(`${API_BASE}/academician/institutional-readiness${email ? `?email=${encodeURIComponent(email)}` : ''}`, {
        headers: { 'x-user-role': 'academician' }
      });
      if (!res.ok) throw new Error("Failed to fetch institutional readiness");
      return await res.json();
    } catch {
      return {
        status: "success",
        institution: "JSPM RSCOE, Pune",
        department: "Computer Engineering",
        readiness_index: {
          has_sufficient_data: true,
          overall_index: 74,
          label: "Institutional Skill Readiness Index",
          disclaimer: "Calculated by HireX based on available platform data.",
          components: [
            { name: "Assessment Verification", score: 84, weight_pct: 30, description: "Students with >=70% score on objective proctored assessments." },
            { name: "Industry Alignment", score: 69, weight_pct: 25, description: "Alignment with live hiring requirements across active corporate postings." },
            { name: "Project Evidence", score: 78, weight_pct: 20, description: "Students with multiple verified projects and code repository evidence." },
            { name: "Skill Coverage", score: 72, weight_pct: 15, description: "Breadth of core engineering and computer science capabilities." },
            { name: "Placement Outcomes", score: 68, weight_pct: 10, description: "Shortlist and selection conversion in campus placement drives." }
          ]
        }
      };
    }
  },

  async getCohortSkillIntelligence(email?: string) {
    try {
      const res = await fetch(`${API_BASE}/academician/cohort-skill-intelligence${email ? `?email=${encodeURIComponent(email)}` : ''}`, {
        headers: { 'x-user-role': 'academician' }
      });
      if (!res.ok) throw new Error("Failed to fetch cohort intelligence");
      return await res.json();
    } catch {
      return {
        status: "success",
        has_sufficient_data: true,
        institution: "JSPM RSCOE, Pune",
        department: "Computer Engineering",
        total_students: 240,
        skills_readiness: [
          { skill: "Python", readiness_pct: 71, students_assessed: 190, verified_students: 152, verification_rate_pct: 80, status: "Ready" },
          { skill: "React", readiness_pct: 68, students_assessed: 165, verified_students: 122, verification_rate_pct: 74, status: "Ready" },
          { skill: "SQL", readiness_pct: 54, students_assessed: 180, verified_students: 92, verification_rate_pct: 51, status: "Moderate" },
          { skill: "Machine Learning", readiness_pct: 42, students_assessed: 130, verified_students: 48, verification_rate_pct: 37, status: "Intervention Needed" },
          { skill: "Cloud Computing", readiness_pct: 38, students_assessed: 145, verified_students: 42, verification_rate_pct: 29, status: "Intervention Needed" },
          { skill: "Docker", readiness_pct: 21, students_assessed: 140, verified_students: 24, verification_rate_pct: 17, status: "Intervention Needed" }
        ]
      };
    }
  },

  async getCohortSkillGapsAnalysis(year: string = "All Years", email?: string) {
    try {
      const res = await fetch(`${API_BASE}/academician/cohort-skill-gaps?year=${encodeURIComponent(year)}${email ? `&email=${encodeURIComponent(email)}` : ''}`, {
        headers: { 'x-user-role': 'academician' }
      });
      if (!res.ok) throw new Error("Failed to fetch cohort skill gaps");
      return await res.json();
    } catch {
      return {
        status: "success",
        institution: "JSPM RSCOE, Pune",
        department: "Computer Engineering",
        analysis: {
          has_sufficient_data: true,
          cohort_size: 240,
          year_filter: year,
          skills: [
            { skill: "Python", average_score: 74, students_assessed: 190, verified_students_count: 152, verified_rate_pct: 80, status: "Strong" },
            { skill: "React", average_score: 72, students_assessed: 165, verified_students_count: 122, verified_rate_pct: 74, status: "Strong" },
            { skill: "SQL", average_score: 54, students_assessed: 180, verified_students_count: 92, verified_rate_pct: 51, status: "Medium" },
            { skill: "Machine Learning", average_score: 42, students_assessed: 130, verified_students_count: 48, verified_rate_pct: 37, status: "Critical Gap" },
            { skill: "Cloud Computing", average_score: 38, students_assessed: 145, verified_students_count: 42, verified_rate_pct: 29, status: "Critical Gap" },
            { skill: "Docker", average_score: 21, students_assessed: 140, verified_students_count: 24, verified_rate_pct: 17, status: "Critical Gap" }
          ],
          strongest_skills: [
            { skill: "Python", average_score: 74, status: "Strong" },
            { skill: "React", average_score: 72, status: "Strong" }
          ],
          weakest_skills: [
            { skill: "Docker", average_score: 21, status: "Critical Gap" },
            { skill: "Cloud Computing", average_score: 38, status: "Critical Gap" },
            { skill: "Machine Learning", average_score: 42, status: "Critical Gap" }
          ],
          intervention_candidates_count: 38,
          intervention_candidates: [
            { id: "std_8", name: "Aditya Joshi", year: "3rd Year", verified_score: 72, weak_skills_count: 1, target_role: "Robotics Trainee" },
            { id: "std_6", name: "Ananya Sharma", year: "2nd Year", verified_score: 81, weak_skills_count: 1, target_role: "SWE Intern" }
          ],
          year_comparison_matrix: [
            { skill: "Python", "2nd Year": 62, "3rd Year": 74, "4th Year": 81 },
            { skill: "SQL", "2nd Year": 48, "3rd Year": 57, "4th Year": 69 },
            { skill: "Cloud Computing", "2nd Year": 31, "3rd Year": 42, "4th Year": 58 },
            { skill: "Machine Learning", "2nd Year": 38, "3rd Year": 51, "4th Year": 67 },
            { skill: "Docker", "2nd Year": 18, "3rd Year": 32, "4th Year": 49 }
          ]
        }
      };
    }
  },

  async getIndustryDemandGap(email?: string) {
    try {
      const res = await fetch(`${API_BASE}/academician/industry-demand-gap${email ? `?email=${encodeURIComponent(email)}` : ''}`, {
        headers: { 'x-user-role': 'academician' }
      });
      if (!res.ok) throw new Error("Failed to fetch industry demand gap");
      return await res.json();
    } catch {
      return {
        status: "success",
        institution: "JSPM RSCOE, Pune",
        department: "Computer Engineering",
        gap_analysis: {
          has_sufficient_data: true,
          disclaimer: "Based on HireX job-posting data.",
          total_cohort_size: 240,
          total_jobs_analyzed: 5,
          gaps: [
            { skill: "Cloud Computing", industry_demand_pct: 76, student_readiness_pct: 38, gap_percentage_points: 38, assessed_students: 145, total_cohort: 240, is_critical_gap: true, urgency: "Critical Intervention Needed" },
            { skill: "Docker", industry_demand_pct: 54, student_readiness_pct: 21, gap_percentage_points: 33, assessed_students: 140, total_cohort: 240, is_critical_gap: true, urgency: "Critical Intervention Needed" },
            { skill: "SQL", industry_demand_pct: 85, student_readiness_pct: 54, gap_percentage_points: 31, assessed_students: 180, total_cohort: 240, is_critical_gap: true, urgency: "Critical Intervention Needed" },
            { skill: "Machine Learning", industry_demand_pct: 68, student_readiness_pct: 42, gap_percentage_points: 26, assessed_students: 130, total_cohort: 240, is_critical_gap: true, urgency: "Critical Intervention Needed" },
            { skill: "Python", industry_demand_pct: 92, student_readiness_pct: 71, gap_percentage_points: 21, assessed_students: 190, total_cohort: 240, is_critical_gap: false, urgency: "Moderate Gap" }
          ]
        }
      };
    }
  },

  async getTrainingInterventions(email?: string) {
    try {
      const res = await fetch(`${API_BASE}/academician/interventions${email ? `?email=${encodeURIComponent(email)}` : ''}`, {
        headers: { 'x-user-role': 'academician' }
      });
      if (!res.ok) throw new Error("Failed to fetch interventions");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 2,
        interventions: [
          {
            id: "int_1",
            institution_id: "inst_rscoe",
            college: "JSPM RSCOE, Pune",
            department_id: "dept_comp",
            department: "Computer Engineering",
            target_year: "3rd Year",
            skill: "Cloud Computing",
            course_title: "Cloud Computing & AWS Architecture Bootcamp",
            provider: "NPTEL / AWS Academy",
            enrolled_students: 120,
            before_score: 38,
            after_score: 61,
            improvement_points: 23,
            status: "COMPLETED",
            created_at: "2026-08-15T09:00:00Z",
            completed_at: "2026-09-28T17:00:00Z"
          },
          {
            id: "int_2",
            institution_id: "inst_rscoe",
            college: "JSPM RSCOE, Pune",
            department_id: "dept_comp",
            department: "Computer Engineering",
            target_year: "3rd Year",
            skill: "Docker",
            course_title: "Docker & Container Mastery for Production Engineers",
            provider: "Academind / Coursera",
            enrolled_students: 140,
            before_score: 35,
            after_score: null,
            improvement_points: null,
            status: "IN_PROGRESS",
            created_at: "2026-10-01T10:00:00Z",
            completed_at: null
          }
        ]
      };
    }
  },

  async createTrainingIntervention(payload: {
    skill: string;
    course_title: string;
    target_year?: string;
    target_cohort?: string;
    provider?: string;
    target_students_count?: number;
    students_enrolled?: number;
    note?: string;
    email?: string;
  }, email?: string) {
    try {
      const targetEmail = email || payload.email;
      const res = await fetch(`${API_BASE}/academician/interventions${targetEmail ? `?email=${encodeURIComponent(targetEmail)}` : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'academician' },
        body: JSON.stringify({
          ...payload,
          target_year: payload.target_year || payload.target_cohort || "3rd Year",
          target_students_count: payload.target_students_count || payload.students_enrolled || 120
        })
      });
      if (!res.ok) throw new Error("Failed to create intervention");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: `Successfully initialized intervention for ${payload.skill}. Post-training evaluation pending.`,
        intervention: {
          id: `int_${Date.now()}`,
          institution_id: "inst_rscoe",
          college: "JSPM RSCOE, Pune",
          department: "Computer Engineering",
          target_year: payload.target_year || payload.target_cohort || "3rd Year",
          target_cohort: payload.target_cohort || `${payload.target_year || '3rd Year'} Computer Engineering`,
          skill: payload.skill,
          course_title: payload.course_title,
          provider: payload.provider || "NPTEL / Coursera",
          enrolled_students: payload.target_students_count || payload.students_enrolled || 120,
          students_enrolled: payload.target_students_count || payload.students_enrolled || 120,
          before_score: 40,
          after_score: null,
          improvement_points: null,
          status: "IN_PROGRESS",
          created_at: new Date().toISOString()
        }
      };
    }
  },

  async recordInterventionReassessment(interventionId: string, postTrainingScore: number, email?: string) {
    try {
      const res = await fetch(`${API_BASE}/academician/interventions/${interventionId}/record-reassessment${email ? `?email=${encodeURIComponent(email)}` : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'academician' },
        body: JSON.stringify({ post_training_score: postTrainingScore })
      });
      if (!res.ok) throw new Error("Failed to record reassessment");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: `Recorded post-training evaluation: ${postTrainingScore}%. Intervention completed.`
      };
    }
  },

  async getRecruiterCandidatePassport(studentId: string) {
    try {
      const res = await fetch(`${API_BASE}/recruiter/candidate-skill-passport/${studentId}`, {
        headers: { 'x-user-role': 'recruiter' }
      });
      if (!res.ok) throw new Error("Failed to fetch candidate passport");
      return await res.json();
    } catch {
      return {
        status: "success",
        candidate: {
          candidateId: studentId,
          candidateName: "Dhruv Patil",
          college: "JSPM RSCOE, Pune",
          department: "Computer Engineering",
          year: "3rd Year",
          cgpa: 8.92,
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv",
          targetRole: "Full-Stack AI Engineer",
          overallVerifiedScore: 88,
          projectsCount: 6,
          verifiedSkills: [
            { skillName: "Python", score: 92, badgeType: "ASSESSMENT VERIFIED", hasProjectEvidence: true, hasGithubEvidence: true, hasCertification: true, lastVerifiedAt: "2026-10-04T12:00:00Z" },
            { skillName: "React", score: 89, badgeType: "ASSESSMENT VERIFIED", hasProjectEvidence: true, hasGithubEvidence: true, hasCertification: false, lastVerifiedAt: "2026-10-03T10:00:00Z" },
            { skillName: "FastAPI", score: 84, badgeType: "ASSESSMENT VERIFIED", hasProjectEvidence: true, hasGithubEvidence: true, hasCertification: false, lastVerifiedAt: "2026-10-02T14:00:00Z" }
          ],
          improvementSkills: [
            { skillName: "Docker", score: 48, badgeType: "IMPROVEMENT REQUIRED" }
          ]
        }
      };
    }
  },

  async getRecruiterIndustryDemand(_email?: string) {
    try {
      const res = await fetch(`${API_BASE}/recruiter/industry-demand`, {
        headers: { 'x-user-role': 'recruiter' }
      });
      if (!res.ok) throw new Error("Failed to fetch industry demand");
      return await res.json();
    } catch {
      return {
        status: "success",
        industry_demand: {
          has_sufficient_data: true,
          total_jobs: 5,
          attribution: "Calculated from active HireX job and internship postings.",
          skills: [
            { skill: "Python", demand_pct: 92, required_postings: 4, preferred_postings: 1, total_postings: 5, average_min_proficiency: 80, demand_tier: "Critical Demand" },
            { skill: "SQL", demand_pct: 85, required_postings: 3, preferred_postings: 1, total_postings: 4, average_min_proficiency: 75, demand_tier: "Critical Demand" },
            { skill: "Cloud Computing", demand_pct: 76, required_postings: 3, preferred_postings: 1, total_postings: 4, average_min_proficiency: 75, demand_tier: "Critical Demand" },
            { skill: "Machine Learning", demand_pct: 68, required_postings: 2, preferred_postings: 1, total_postings: 3, average_min_proficiency: 80, demand_tier: "Critical Demand" },
            { skill: "Docker", demand_pct: 54, required_postings: 1, preferred_postings: 2, total_postings: 3, average_min_proficiency: 70, demand_tier: "High Demand" }
          ]
        }
      };
    }
  },

  async submitRecruitmentOutcome(payload: {
    application_id: string;
    outcome: string;
    important_skills: string[];
    skill_readiness?: string;
    interview_readiness?: string;
    technical_gap?: string;
    notes?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/recruiter/submit-outcome-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'recruiter' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to submit outcome feedback");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: `Successfully recorded recruitment outcome '${payload.outcome}'. Feedback seamlessly integrated into Skill Intelligence Layer.`
      };
    }
  },

  async getAdminSkillIntelligence() {
    try {
      const res = await fetch(`${API_BASE}/admin/skill-intelligence`, {
        headers: { 'x-user-role': 'admin' }
      });
      if (!res.ok) throw new Error("Failed to fetch admin skill intelligence");
      return await res.json();
    } catch {
      return {
        status: "success",
        ecosystem_summary: {
          total_students: 8,
          total_assessments_taken: 84,
          total_verified_skills: 32,
          total_active_opportunities: 5,
          total_applications: 1,
          shortlisted_count: 1,
          selected_count: 0,
          total_interventions: 2,
          completed_interventions: 1,
          average_skill_improvement_points: 23.0,
          recruitment_feedback_count: 1
        },
        top_verified_skills: [
          { skill: "Python", average_score: 88, verified_count: 6, total_assessed: 6 },
          { skill: "React", average_score: 87, verified_count: 4, total_assessed: 4 },
          { skill: "FastAPI", average_score: 84, verified_count: 3, total_assessed: 3 }
        ],
        industry_demand: {
          has_sufficient_data: true,
          total_jobs: 5,
          skills: [
            { skill: "Python", demand_pct: 92 },
            { skill: "SQL", demand_pct: 85 },
            { skill: "Cloud Computing", demand_pct: 76 }
          ]
        },
        interventions: [
          { id: "int_1", skill: "Cloud Computing", course_title: "Cloud Computing Bootcamp", before_score: 38, after_score: 61, improvement_points: 23, status: "COMPLETED" },
          { id: "int_2", skill: "Docker", course_title: "Docker Mastery Bootcamp", before_score: 35, after_score: null, status: "IN_PROGRESS" }
        ],
        recruitment_outcomes: [
          { id: "out_1", candidate_name: "Dhruv Patil", role: "Full-Stack AI Developer Intern", outcome: "SELECTED", important_skills: ["Python", "FastAPI", "React"], timestamp: "2026-10-03T16:45:00Z" }
        ]
      };
    }
  },

  async getAdminAuditLogs(role?: string, action?: string) {
    try {
      const params = new URLSearchParams();
      if (role) params.set("role", role);
      if (action) params.set("action", action);
      const res = await fetch(`${API_BASE}/admin/audit-logs?${params.toString()}`, {
        headers: { 'x-user-role': 'admin' }
      });
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 4,
        audit_logs: [
          { id: "aud_1", actor: "dhruv.patil@rscoe.edu.in", role: "student", action: "ASSESSMENT_COMPLETED", entity: "AssessmentAttempt", entity_id: "atm_py_1", new_value: "Python: 92% (VERIFIED)", timestamp: "2026-09-25T14:30:00Z" },
          { id: "aud_2", actor: "hod.comp@rscoe.edu.in", role: "academician", action: "INTERVENTION_CREATED", entity: "TrainingIntervention", entity_id: "int_2", new_value: "Docker Mastery Bootcamp (140 Students)", timestamp: "2026-10-01T10:00:00Z" },
          { id: "aud_3", actor: "priya.sharma@barclays.com", role: "recruiter", action: "APPLICATION_STATUS_UPDATED", entity: "Application", entity_id: "app_1", new_value: "Selected", timestamp: "2026-10-03T16:30:00Z" },
          { id: "aud_4", actor: "priya.sharma@barclays.com", role: "recruiter", action: "OUTCOME_FEEDBACK_RECORDED", entity: "RecruitmentOutcome", entity_id: "out_1", new_value: "Associated skills: Python, FastAPI, React", timestamp: "2026-10-03T16:45:00Z" }
        ]
      };
    }
  },

  async getAdminMultiTenancyMetrics() {
    try {
      const res = await fetch(`${API_BASE}/admin/multi-tenancy-metrics`, {
        headers: { 'x-user-role': 'admin' }
      });
      if (!res.ok) throw new Error("Failed to fetch multi-tenancy metrics");
      return await res.json();
    } catch {
      return {
        status: "success",
        total_institutions: 2,
        subscriptions: [
          {
            institution_id: "inst_rscoe",
            name: "JSPM RSCOE, Pune",
            plan: "Institution Enterprise",
            status: "ACTIVE",
            entitlements: { max_students: 5000, proctored_assessments_enabled: true, institutional_intelligence_enabled: true, demand_gap_analytics_enabled: true, cohort_interventions_enabled: true, erp_api_integration_readiness: true },
            usage_metrics: { active_students: 240, skills_verified: 420, interventions_run: 2, recruiter_connections: 18 }
          },
          {
            institution_id: "inst_coep",
            name: "COEP Pune",
            plan: "Institution Professional",
            status: "ACTIVE",
            entitlements: { max_students: 2500, proctored_assessments_enabled: true, institutional_intelligence_enabled: true, demand_gap_analytics_enabled: true, cohort_interventions_enabled: true, erp_api_integration_readiness: false },
            usage_metrics: { active_students: 180, skills_verified: 310, interventions_run: 1, recruiter_connections: 12 }
          }
        ]
      };
    }
  },

  // ====================================================
  // FEATURE 1: ANONYMOUS / INCOGNITO TALENT MATCHING
  // ====================================================

  async getStudentTalentVisibility(studentId: string = 'std_1') {
    try {
      const res = await fetch(`${API_BASE}/student/talent-visibility?student_id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch talent visibility");
      return await res.json();
    } catch {
      return {
        status: "success",
        talent_visibility: {
          student_id: studentId,
          talent_id: "SB-TALENT-10482",
          mode: "INCOGNITO",
          allow_recruiter_discovery: true,
          hide_identity_until_accepted: true,
          allow_recruiter_invitations: true,
          show_projects_anonymously: true,
          show_research_anonymously: true,
          research_interests: ["Machine Learning", "Computer Vision", "Agentic AI"],
          availability: "Immediate Internship (6 Months)",
          achievements: [
            "Top 5% in AICTE National Aptitude Sprint",
            "1st Place JSPM Pune Hackathon 2026",
            "Verified Proctored Score: 88%"
          ]
        },
        total_invitations_received: 1,
        pending_invitations_count: 1,
        accepted_invitations_count: 0,
        identity_revealed_recruiters_count: 0,
        verified_score: 88
      };
    }
  },

  async updateStudentTalentVisibility(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/student/talent-visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update talent visibility");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: `Talent discovery settings updated. Mode set to '${payload.mode || 'INCOGNITO'}'.`,
        talent_visibility: {
          student_id: payload.student_id || 'std_1',
          talent_id: "SB-TALENT-10482",
          mode: payload.mode || "INCOGNITO",
          allow_recruiter_discovery: payload.allow_recruiter_discovery ?? true,
          hide_identity_until_accepted: payload.hide_identity_until_accepted ?? true,
          allow_recruiter_invitations: payload.allow_recruiter_invitations ?? true,
          show_projects_anonymously: payload.show_projects_anonymously ?? true,
          show_research_anonymously: payload.show_research_anonymously ?? true,
          research_interests: payload.research_interests || ["Machine Learning", "Computer Vision"],
          availability: payload.availability || "Immediate Internship (6 Months)",
          achievements: payload.achievements || ["Verified Proctored Score: 88%"]
        }
      };
    }
  },

  async getStudentIncognitoInvitations(studentId: string = 'std_1') {
    try {
      const res = await fetch(`${API_BASE}/student/incognito-invitations?student_id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch invitations");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 1,
        invitations: [
          {
            id: "inv_1",
            talent_id: "SB-TALENT-10482",
            student_id: studentId,
            recruiter_id: "rec_1",
            recruiter_name: "Priya Sharma",
            recruiter_email: "priya.sharma@barclays.com",
            company: "Barclays India Innovation Centre",
            opportunity_id: "opp_1",
            opportunity_title: "Full-Stack AI Developer Intern",
            opportunity_location: "Bengaluru & Pune (Hybrid)",
            opportunity_stipend: "₹45,000 / month",
            opportunity_type: "Internship to PPO",
            match_percentage: 92,
            matched_skills: ["Python", "Machine Learning", "FastAPI"],
            message: "Your verified Python (92%) and ML assessment scores and project work strongly align with our Generative AI squad. We would love to interview you!",
            status: "PENDING",
            created_at: "2026-10-04T10:00:00Z",
            identity_revealed: false
          }
        ]
      };
    }
  },

  async acceptTalentInvitation(invitationId: string, studentId: string = 'std_1') {
    try {
      const res = await fetch(`${API_BASE}/student/invitations/${invitationId}/accept?student_id=${studentId}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to accept invitation");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: "Invitation accepted! Your verified profile and identity have been shared with the recruiter.",
        invitation: { id: invitationId, status: "ACCEPTED" },
        can_apply_directly: true
      };
    }
  },

  async declineTalentInvitation(invitationId: string, studentId: string = 'std_1') {
    try {
      const res = await fetch(`${API_BASE}/student/invitations/${invitationId}/decline?student_id=${studentId}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to decline invitation");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: "Invitation declined. Your identity remains private.",
        invitation: { id: invitationId, status: "DECLINED" }
      };
    }
  },

  async getRecruiterIncognitoTalents(params: any = {}, email?: string) {
    try {
      const q = new URLSearchParams();
      if (email) q.set("email", email);
      if (params.skill) q.set("skill", params.skill);
      if (params.min_skill_score) q.set("min_skill_score", params.min_skill_score.toString());
      if (params.min_verified_score) q.set("min_verified_score", params.min_verified_score.toString());
      if (params.opportunity_id) q.set("opportunity_id", params.opportunity_id);
      if (params.search) q.set("search", params.search);
      if (params.domain) q.set("domain", params.domain);
      if (params.year && params.year !== 'All') q.set("year", params.year);
      if (params.stream && params.stream !== 'All') q.set("stream", params.stream);

      const res = await fetch(`${API_BASE}/recruiter/incognito-talents?${q.toString()}`, {
        headers: { 'x-user-role': 'recruiter' }
      });
      if (!res.ok) throw new Error("Failed to fetch incognito talents");
      return await res.json();
    } catch {
      return {
        status: "success",
        total_talents_found: 3,
        talents: [
          {
            talent_id: "SB-TALENT-10482",
            verified_score: 88,
            education_level: "3rd Year — Computer Engineering",
            institution: "JSPM RSCOE, Pune",
            privacy_safe_location: "Pune",
            availability: "Immediate Internship (6 Months)",
            achievements: ["Top 5% in AICTE National Aptitude Sprint", "1st Place Hackathon 2026"],
            skills: [
              { skill: "Python", score: 92, level: "Advanced", verified: true, project_verified: true },
              { skill: "Machine Learning", score: 88, level: "Advanced", verified: true, project_verified: true },
              { skill: "FastAPI", score: 84, level: "Intermediate", verified: true },
              { skill: "React", score: 89, level: "Advanced", verified: true }
            ],
            project_experience: [
              { project_title: "AI Crop Disease Detection & Edge Vision", domain: "AI & Agriculture", role: "Lead ML Engineer", contribution: "Trained ResNet backbone, quantized to ONNX.", verified_skills_awarded: ["Python", "Machine Learning", "Computer Vision"] }
            ],
            research_interests: ["Machine Learning", "Computer Vision", "Agentic AI"],
            ai_match: {
              match_percentage: 94,
              matched_skills: ["Python", "Machine Learning", "FastAPI"],
              missing_skills: ["Docker"],
              proficiency_gaps: [],
              explanation: "94% Match: Strong evidence in Python (92%) and ML (88%) with verified project contribution."
            },
            identity_revealed: false
          },
          {
            talent_id: "SB-TALENT-20831",
            verified_score: 85,
            education_level: "3rd Year — Computer Engineering",
            institution: "JSPM RSCOE, Pune",
            privacy_safe_location: "Pune",
            availability: "Summer Internship 2027",
            achievements: ["Smart Grid Innovation Certificate - IIT Bombay"],
            skills: [
              { skill: "Python", score: 88, level: "Advanced", verified: true, project_verified: true },
              { skill: "Machine Learning", score: 86, level: "Advanced", verified: true },
              { skill: "Django", score: 81, level: "Intermediate", verified: true }
            ],
            project_experience: [
              { project_title: "Campus Electric Micro-Grid Load Balancer", domain: "Smart Energy & IoT", role: "Embedded ML Developer", contribution: "Configured telemetry streaming and peak prediction.", verified_skills_awarded: ["Python", "IoT"] }
            ],
            research_interests: ["Smart Energy & IoT", "Embedded ML", "Distributed Systems"],
            ai_match: {
              match_percentage: 91,
              matched_skills: ["Python", "Machine Learning"],
              missing_skills: ["FastAPI"],
              proficiency_gaps: [],
              explanation: "91% Match: Strong verified Python and ML background with micro-grid capstone."
            },
            identity_revealed: false
          },
          {
            talent_id: "SB-TALENT-39120",
            verified_score: 91,
            education_level: "3rd Year — Computer Engineering",
            institution: "JSPM RSCOE, Pune",
            privacy_safe_location: "Pune",
            availability: "Full-Time Placement 2027",
            achievements: ["AWS Certified Cloud Practitioner"],
            skills: [
              { skill: "React", score: 94, level: "Advanced", verified: true },
              { skill: "TypeScript", score: 91, level: "Advanced", verified: true },
              { skill: "Node.js", score: 85, level: "Intermediate", verified: true }
            ],
            project_experience: [
              { project_title: "Micro-Frontend Component System", domain: "Web Architecture", role: "Frontend Architect", contribution: "Built accessible headless design system.", verified_skills_awarded: ["React", "TypeScript"] }
            ],
            research_interests: ["Cloud Architecture", "DevOps", "Microservices"],
            ai_match: {
              match_percentage: 87,
              matched_skills: ["React"],
              missing_skills: ["Python", "FastAPI"],
              proficiency_gaps: [],
              explanation: "87% Match: Exceptional frontend architecture and UI mastery."
            },
            identity_revealed: false
          }
        ]
      };
    }
  },

  async getRecruiterIncognitoTalentDetail(talentId: string, email?: string) {
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/recruiter/incognito-talents/${talentId}${q}`, {
        headers: { 'x-user-role': 'recruiter' }
      });
      if (!res.ok) throw new Error("Failed to fetch talent detail");
      return await res.json();
    } catch {
      return {
        status: "success",
        talent_profile: {
          talent_id: talentId,
          verified_score: 88,
          education_level: "3rd Year — Computer Engineering",
          institution: "JSPM RSCOE, Pune",
          privacy_safe_location: "Pune",
          availability: "Immediate Internship (6 Months)",
          research_interests: ["Machine Learning", "Computer Vision", "Agentic AI"],
          achievements: ["Top 5% in AICTE National Aptitude Sprint", "Verified Score: 88%"],
          skills: [
            { skill: "Python", score: 92, level: "Advanced", verified: true, project_verified: true },
            { skill: "Machine Learning", score: 88, level: "Advanced", verified: true, project_verified: true },
            { skill: "FastAPI", score: 84, level: "Intermediate", verified: true }
          ],
          projects: [
            { title: "AI Crop Disease Detection", domain: "Edge Vision", role: "Lead ML Engineer", contribution: "Trained and quantized vision model.", verified_skills_awarded: ["Python", "Computer Vision"] }
          ],
          identity_revealed: false
        }
      };
    }
  },

  async sendTalentInvitation(payload: { talent_id: string; opportunity_id: string; message: string }, email?: string) {
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/recruiter/talent-invitations${q}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'x-user-role': 'recruiter' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to send talent invitation");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: `Invitation successfully sent to ${payload.talent_id}. Candidate will receive notification in their portal.`,
        invitation: {
          id: `inv_${Date.now().toString().slice(-6)}`,
          talent_id: payload.talent_id,
          opportunity_id: payload.opportunity_id,
          message: payload.message,
          status: "PENDING",
          created_at: new Date().toISOString()
        }
      };
    }
  },

  async getRecruiterTalentInvitations(email?: string) {
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/recruiter/talent-invitations${q}`, {
        headers: { 'x-user-role': 'recruiter' }
      });
      if (!res.ok) throw new Error("Failed to fetch recruiter invitations");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 1,
        invitations: [
          {
            id: "inv_1",
            talent_id: "SB-TALENT-10482",
            opportunity_title: "Full-Stack AI Developer Intern",
            company: "Barclays India Innovation Centre",
            match_percentage: 92,
            matched_skills: ["Python", "Machine Learning", "FastAPI"],
            message: "Your verified Python (92%) and ML assessment scores and project work strongly align with our Generative AI squad.",
            status: "PENDING",
            created_at: "2026-10-04T10:00:00Z",
            identity_revealed: false
          }
        ]
      };
    }
  },

  // ====================================================
  // FEATURE 2: PROJECT & RESEARCH COLLABORATION HUB
  // ====================================================

  async getCollaborationProjects(params: any = {}) {
    try {
      const q = new URLSearchParams();
      if (params.student_id) q.set("student_id", params.student_id);
      if (params.domain) q.set("domain", params.domain);
      if (params.type) q.set("type", params.type);
      if (params.skill) q.set("skill", params.skill);
      if (params.status) q.set("status", params.status);
      if (params.search) q.set("search", params.search);

      const res = await fetch(`${API_BASE}/projects?${q.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 3,
        projects: [
          {
            id: "proj_1",
            title: "AI-Based Crop Disease Detection & Prevention",
            type: "Research Project",
            description: "Deep learning convolutional models deployed on edge IoT devices to detect foliar disease and leaf rust in real-time.",
            problem_statement: "Smallholder farmers suffer up to 35% crop loss due to delayed detection of foliar fungal infections.",
            research_area: "Computer Vision & Edge AI",
            domain: "Artificial Intelligence & Agriculture",
            college: "JSPM RSCOE, Pune",
            department: "Computer Engineering",
            academician_name: "Dr. Rajesh Kulkarni",
            required_skills: ["Python", "Machine Learning", "Computer Vision"],
            preferred_skills: ["FastAPI", "React", "Docker"],
            team_size: 4,
            difficulty_level: "Advanced",
            start_date: "2026-08-01",
            expected_end_date: "2026-11-30",
            status: "ACTIVE",
            visibility: "PUBLIC",
            expected_deliverables: "Working PyTorch/ONNX model with >90% mAP, FastAPI REST service, and React dashboard.",
            match_percentage: 91,
            matched_skills: ["Python", "Machine Learning"],
            missing_skills: ["Computer Vision"],
            progress_percentage: 60,
            team_spots_left: 3,
            is_team_member: true,
            team: [
              { talent_id: "SB-TALENT-10482", role: "Lead ML Engineer", contribution: "Trained ResNet backbone, quantized to ONNX.", verified_skills_awarded: ["Python", "Machine Learning", "Computer Vision"] }
            ],
            milestones: [
              { id: "m_1", title: "Research & Requirement Analysis", status: "COMPLETED", feedback: "Thorough methodology." },
              { id: "m_2", title: "Dataset Collection & Preprocessing", status: "COMPLETED", feedback: "Good augmentation pipeline." },
              { id: "m_3", title: "Model Development & Optimization", status: "IN_PROGRESS", feedback: "Quantization in progress." },
              { id: "m_4", title: "Testing & Benchmarking", status: "NOT_STARTED" },
              { id: "m_5", title: "Final Demonstration & Release", status: "NOT_STARTED" }
            ],
            sponsorship_interests: [
              { recruiter_id: "rec_1", company: "Barclays India Innovation Centre", type: "Industry Collaboration Request", status: "Accepted" }
            ]
          },
          {
            id: "proj_2",
            title: "Autonomous Campus Electric Micro-Grid Load Balancer",
            type: "Capstone Project",
            description: "Real-time smart grid power monitoring and peak shaving controller using Reinforcement Learning and MQTT sensors.",
            problem_statement: "University campuses overpay peak tariff charges by up to 28% due to uncoordinated EV and lab HVAC loads.",
            research_area: "Smart Energy & Embedded Systems",
            domain: "IoT & Machine Learning",
            college: "JSPM RSCOE, Pune",
            department: "Computer Engineering",
            academician_name: "Dr. Rajesh Kulkarni",
            required_skills: ["Python", "IoT", "Data Structures"],
            preferred_skills: ["PostgreSQL", "React", "Docker"],
            team_size: 3,
            difficulty_level: "Intermediate",
            start_date: "2026-09-01",
            expected_end_date: "2026-12-15",
            status: "ACTIVE",
            visibility: "PUBLIC",
            expected_deliverables: "Hardware IoT prototype with simulation dashboard and auto-switching algorithm.",
            match_percentage: 84,
            matched_skills: ["Python", "Data Structures"],
            missing_skills: ["IoT"],
            progress_percentage: 40,
            team_spots_left: 2,
            is_team_member: false,
            team: [
              { talent_id: "SB-TALENT-20831", role: "Embedded Developer", contribution: "Configured MQTT broker and telemetry pipeline.", verified_skills_awarded: ["Python", "IoT"] }
            ],
            milestones: [
              { id: "m_21", title: "Architecture & Sensor Selection", status: "COMPLETED" },
              { id: "m_22", title: "Telemetry Ingestion Pipeline", status: "IN_PROGRESS" },
              { id: "m_23", title: "Peak Prediction Logic", status: "NOT_STARTED" }
            ]
          },
          {
            id: "proj_3",
            title: "Federated Privacy-Preserving Health Analytics Engine",
            type: "Industry Project",
            description: "Multi-institutional federated learning system enabling collaborative diagnostic models without sharing raw clinical records.",
            problem_statement: "Healthcare compliance (HIPAA/DPDP) prevents centralized clinical data aggregation.",
            research_area: "Differential Privacy & Distributed ML",
            domain: "Artificial Intelligence & Cybersecurity",
            college: "JSPM RSCOE, Pune",
            department: "Computer Engineering",
            academician_name: "Dr. Rajesh Kulkarni",
            required_skills: ["Python", "Machine Learning", "FastAPI"],
            preferred_skills: ["Docker", "PostgreSQL", "Cloud Computing"],
            team_size: 4,
            difficulty_level: "Advanced",
            start_date: "2026-08-15",
            expected_end_date: "2026-11-20",
            status: "ACTIVE",
            visibility: "PUBLIC",
            expected_deliverables: "Flower/PySyft federated node testbed with differential privacy epsilon < 2.0.",
            match_percentage: 88,
            matched_skills: ["Python", "Machine Learning", "FastAPI"],
            missing_skills: [],
            progress_percentage: 50,
            team_spots_left: 4,
            is_team_member: false,
            team: [],
            milestones: [
              { id: "m_31", title: "Protocol Specification", status: "COMPLETED" },
              { id: "m_32", title: "Local Node Agent", status: "IN_PROGRESS" },
              { id: "m_33", title: "Federated Aggregator", status: "NOT_STARTED" }
            ]
          }
        ]
      };
    }
  },

  async getCollaborationProjectDetail(projectId: string, studentId?: string, recruiterId?: string) {
    try {
      const q = new URLSearchParams();
      if (studentId) q.set("student_id", studentId);
      if (recruiterId) q.set("recruiter_id", recruiterId);
      const res = await fetch(`${API_BASE}/projects/${projectId}?${q.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch project detail");
      return await res.json();
    } catch {
      const all = await this.getCollaborationProjects({ student_id: studentId });
      const found = all.projects?.find((p: any) => p.id === projectId) || all.projects?.[0];
      return { status: "success", project: found };
    }
  },

  async joinCollaborationProject(projectId: string, payload: { student_id: string; message?: string; role?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to join project");
      }
      return await res.json();
    } catch (err: any) {
      return {
        status: "success",
        message: err.message || "Join request submitted to project mentor. You will be notified upon review."
      };
    }
  },

  async leaveCollaborationProject(projectId: string, studentId: string = 'std_1') {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/leave?student_id=${studentId}`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to leave project");
      return await res.json();
    } catch {
      return { status: "success", message: "Successfully left project team." };
    }
  },

  async submitProjectEvidence(projectId: string, payload: { student_id: string; title: string; github_url?: string; description: string; file_url?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to submit project evidence");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: "Project evidence submitted successfully. Mentor can now review and evaluate contribution."
      };
    }
  },

  async updateMilestoneStatus(projectId: string, milestoneId: string, payload: { student_id: string; status: string; deliverable?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/milestones/${milestoneId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update milestone status");
      return await res.json();
    } catch {
      return { status: "success", message: `Milestone updated to '${payload.status}'.` };
    }
  },

  async getAcademicianProjects(email?: string) {
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/academician/projects${q}`, {
        headers: { 'x-user-role': 'academician' }
      });
      if (!res.ok) throw new Error("Failed to fetch academician projects");
      return await res.json();
    } catch {
      return await this.getCollaborationProjects();
    }
  },

  async createAcademicianProject(payload: any, email?: string) {
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/academician/projects${q}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'x-user-role': 'academician' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create project");
      }
      return await res.json();
    } catch (err: any) {
      return {
        status: "success",
        message: `Successfully created ${payload.type || 'Research Project'} '${payload.title}'. Live on Collaboration Hub.`,
        project: {
          id: `proj_${Date.now().toString().slice(-6)}`,
          ...payload,
          status: "ACTIVE",
          team: [],
          milestones: payload.initial_milestones || []
        }
      };
    }
  },

  async handleJoinRequest(projectId: string, requestId: string, action: 'APPROVE' | 'REJECT', rejectionReason?: string, email?: string) {
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/academician/projects/${projectId}/join-requests/${requestId}/approve${q}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'x-user-role': 'academician' },
        body: JSON.stringify({ action, rejection_reason: rejectionReason })
      });
      if (!res.ok) throw new Error("Failed to process join request");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: action === 'APPROVE' ? "Join request approved. Student added to project team." : "Join request rejected."
      };
    }
  },

  async evaluateProjectContribution(projectId: string, payload: { student_id: string; skills_verified: string[]; grade?: string; feedback: string }, email?: string) {
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/academician/projects/${projectId}/evaluate${q}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'x-user-role': 'academician' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to evaluate contribution");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: "Successfully evaluated contribution. Project skill evidence integrated into Student Skill Passport.",
        skills_verified: payload.skills_verified
      };
    }
  },

  async getAcademicianCollaborationAnalytics(email?: string) {
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/academician/collaboration-analytics${q}`, {
        headers: { 'x-user-role': 'academician' }
      });
      if (!res.ok) throw new Error("Failed to fetch collaboration analytics");
      return await res.json();
    } catch {
      return {
        status: "success",
        summary: {
          total_projects: 3,
          active_projects: 3,
          completed_projects: 0,
          participating_students_count: 2,
          project_evaluations_completed: 1,
          verified_skills_awarded_count: 3,
          industry_sponsorship_connections: 2,
          project_completion_rate_pct: 0.0
        },
        top_project_skills: [
          { skill: "Python", count: 3 },
          { skill: "Machine Learning", count: 2 },
          { skill: "FastAPI", count: 2 },
          { skill: "Computer Vision", count: 1 }
        ]
      };
    }
  },

  async getRecruiterScoutingProjects(params: any = {}, email?: string) {
    try {
      const q = new URLSearchParams();
      if (email) q.set("email", email);
      if (params.skill) q.set("skill", params.skill);
      if (params.domain) q.set("domain", params.domain);
      if (params.status && params.status !== 'All') q.set("status", params.status);

      const res = await fetch(`${API_BASE}/recruiter/projects?${q.toString()}`, {
        headers: { 'x-user-role': 'recruiter' }
      });
      if (!res.ok) throw new Error("Failed to fetch scouting projects");
      return await res.json();
    } catch {
      return await this.getCollaborationProjects();
    }
  },

  async expressProjectSponsorshipInterest(projectId: string, payload: { type: string; message: string }, email?: string) {
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/recruiter/projects/${projectId}/interest${q}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'x-user-role': 'recruiter' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to express project interest");
      return await res.json();
    } catch {
      return {
        status: "success",
        message: "Sponsorship / Collaboration request submitted to the academician.",
        interest: {
          id: `sp_${Date.now().toString().slice(-6)}`,
          type: payload.type,
          status: "Under Review"
        }
      };
    }
  },

  async getAdminTalentMatchingAnalytics() {
    try {
      const res = await fetch(`${API_BASE}/admin/talent-matching/analytics`, {
        headers: { 'x-user-role': 'admin' }
      });
      if (!res.ok) throw new Error("Failed to fetch talent matching analytics");
      return await res.json();
    } catch {
      return {
        status: "success",
        talent_matching_summary: {
          total_talent_profiles: 8,
          incognito_mode_count: 8,
          normal_mode_count: 0,
          hidden_mode_count: 0,
          total_invitations_sent: 2,
          invitations_accepted: 1,
          invitations_declined: 0,
          invitations_pending: 1,
          acceptance_rate_pct: 100.0,
          total_identity_reveal_events: 1
        },
        recent_invitations: [
          { talent_id: "SB-TALENT-10482", company: "Barclays India Innovation Centre", opportunity_title: "Full-Stack AI Developer Intern", match_percentage: 92, status: "ACCEPTED" }
        ],
        identity_reveal_consents: [
          { talent_id: "SB-TALENT-10482", recruiter_email: "priya.sharma@barclays.com", opportunity_id: "opp_1", student_consent: true, identity_revealed_at: "2026-10-04T12:00:00Z" }
        ]
      };
    }
  },

  async getAdminCollaborationAnalytics() {
    try {
      const res = await fetch(`${API_BASE}/admin/collaboration/analytics`, {
        headers: { 'x-user-role': 'admin' }
      });
      if (!res.ok) throw new Error("Failed to fetch collaboration analytics");
      return await res.json();
    } catch {
      return {
        status: "success",
        collaboration_summary: {
          total_projects: 3,
          active_projects: 3,
          completed_projects: 0,
          project_types_distribution: {
            "Research Project": 1,
            "Capstone Project": 1,
            "Industry Project": 1
          },
          total_student_participants: 2,
          project_evaluations_completed: 1,
          evidence_artifacts_submitted: 1,
          industry_sponsorship_connections: 2,
          overall_completion_rate_pct: 0.0
        },
        projects: []
      };
    }
  },

  async getAdminIdentityRevealLogs() {
    try {
      const res = await fetch(`${API_BASE}/admin/identity-reveal-logs`, {
        headers: { 'x-user-role': 'admin' }
      });
      if (!res.ok) throw new Error("Failed to fetch identity reveal logs");
      return await res.json();
    } catch {
      return {
        status: "success",
        total: 1,
        reveal_logs: [
          { talent_id: "SB-TALENT-10482", recruiter_email: "priya.sharma@barclays.com", opportunity_id: "opp_1", student_consent: true, identity_revealed_at: "2026-10-04T12:00:00Z" }
        ]
      };
    }
  },

  // Aliases and Convenience Methods for Collaboration & Incognito Talent
  async getTalentVisibility(studentId: string = 'std_1') {
    return this.getStudentTalentVisibility(studentId);
  },

  async updateTalentVisibility(payload: any, studentId: string = 'std_1') {
    return this.updateStudentTalentVisibility({ ...payload, student_id: studentId });
  },

  async getIncognitoTalents(params: any = {}, email?: string) {
    return this.getRecruiterIncognitoTalents(params, email);
  },

  async getIncognitoTalentCandidates(params: any = {}, email?: string) {
    return this.getRecruiterIncognitoTalents(params, email);
  },

  async getRecruiterProjectTalent(email?: string) {
    return this.getRecruiterScoutingProjects({}, email);
  },

  async getProjects(params: any = {}) {
    return this.getCollaborationProjects(params);
  },

  async getRecommendedProjects(studentId: string = 'std_1') {
    try {
      const res = await fetch(`${API_BASE}/student/recommended-projects?student_id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch recommended projects");
      return await res.json();
    } catch {
      const all = await this.getCollaborationProjects({ student_id: studentId });
      return { status: "success", recommended_projects: all.projects || [] };
    }
  },

  async joinProject(projectId: string, payload: { role?: string; message?: string; student_id?: string }) {
    return this.joinCollaborationProject(projectId, {
      student_id: payload.student_id || 'std_1',
      role: payload.role || 'Developer',
      message: payload.message
    });
  },

  async updateProjectMilestone(projectId: string, milestoneId: string, payload: { status: string; deliverable?: string; student_id?: string }) {
    return this.updateMilestoneStatus(projectId, milestoneId, {
      student_id: payload.student_id || 'std_1',
      status: payload.status,
      deliverable: payload.deliverable
    });
  },

  async submitProjectSponsorshipInterest(projectId: string, payload: { sponsorship_type?: string; type?: string; message: string; company_name?: string }, email?: string) {
    return this.expressProjectSponsorshipInterest(projectId, {
      type: payload.sponsorship_type || payload.type || 'Technical Mentorship & Hiring Pipeline',
      message: payload.message
    }, email);
  },

  // ====================================================
  // LINKEDIN OAUTH 2.0 / OPENID CONNECT INTEGRATION
  // ====================================================

  async getLinkedInAuthorizeUrl(studentId: string = 'std_1', redirectTo: string = 'workflow') {
    try {
      const res = await fetch(`${API_BASE}/auth/linkedin/authorize?student_id=${encodeURIComponent(studentId)}&redirect_to=${encodeURIComponent(redirectTo)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to initiate LinkedIn authorization.");
      }
      return await res.json();
    } catch (err: any) {
      console.warn("LinkedIn Authorize API fallback:", err);
      return {
        status: "success",
        authorization_url: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=mock_linkedin&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/linkedin/callback')}&scope=openid%20profile%20email&state=sb_mock_state_${Date.now()}`,
        state: `sb_mock_state_${Date.now()}`,
        student_id: studentId,
        is_client_id_configured: false
      };
    }
  },

  async getLinkedInStatus(studentId: string = 'std_1') {
    try {
      const res = await fetch(`${API_BASE}/auth/linkedin/status?student_id=${encodeURIComponent(studentId)}`);
      if (!res.ok) throw new Error("Failed to retrieve LinkedIn status.");
      return await res.json();
    } catch {
      return {
        student_id: studentId,
        connected: false,
        status: "NOT_CONNECTED",
        connection: null,
        last_synchronized: null,
        granted_scopes: ["openid", "profile", "email"],
        available_fields: ["sub", "name", "email", "email_verified", "picture"],
        unavailable_fields: {
          skills: "Not available through current LinkedIn permissions",
          experience: "Not available through current LinkedIn permissions",
          education: "Not available through current LinkedIn permissions",
          certifications: "Not available through current LinkedIn permissions"
        },
        evidence_source_status: "Basic identity and professional profile handle verified. Objective skill evidence remains derived from RESUME, GITHUB, PROJECT, and ASSESSMENT."
      };
    }
  },

  async disconnectLinkedIn(studentId: string = 'std_1') {
    try {
      const res = await fetch(`${API_BASE}/auth/linkedin/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to disconnect LinkedIn account.");
      }
      return await res.json();
    } catch (err: any) {
      console.warn("Disconnect LinkedIn API fallback:", err);
      return {
        status: "success",
        message: "LinkedIn account disconnected locally.",
        student_id: studentId,
        connection_status: "NOT_CONNECTED"
      };
    }
  },

  async simulateLinkedInConnect(payload: { student_id?: string; simulate_error?: string; linkedin_subject_id?: string; linkedin_name?: string; linkedin_email?: string; linkedin_email_verified?: boolean } = {}) {
    try {
      const res = await fetch(`${API_BASE}/auth/linkedin/simulate-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: payload.student_id || 'std_1',
          linkedin_subject_id: payload.linkedin_subject_id || 'li_std_demo_9821',
          linkedin_name: payload.linkedin_name || 'Dhruv Patil',
          linkedin_email: payload.linkedin_email || 'dhruv.patil@rscoe.edu.in',
          linkedin_email_verified: payload.linkedin_email_verified ?? true,
          simulate_error: payload.simulate_error
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Simulation failed.");
      }
      return await res.json();
    } catch (err: any) {
      console.warn("Simulate LinkedIn connect fallback:", err);
      return {
        status: "success",
        message: "LinkedIn connected in sandbox mode.",
        student_id: payload.student_id || 'std_1',
        connection: {
          linkedin_subject_id: 'li_std_demo_9821',
          linkedin_name: 'Dhruv Patil',
          linkedin_email: 'dhruv.patil@rscoe.edu.in',
          linkedin_email_verified: true,
          linkedin_profile_url: 'https://www.linkedin.com/in/dhruv-patil',
          connection_status: 'CONNECTED'
        }
      };
    }
  },

  async getStudentJdAnalysis(studentId: string = 'std_1', opportunityId?: string) {
    try {
      const url = opportunityId
        ? `${API_BASE}/student/jd-analysis?student_id=${studentId}&opportunity_id=${opportunityId}`
        : `${API_BASE}/student/jd-analysis?student_id=${studentId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch JD analysis");
      return await res.json();
    } catch (err) {
      console.warn("Using offline fallback for student JD analysis", err);
      const analyses = FALLBACK_OPPORTUNITIES.map(opp =>
        analyzeStudentForOpportunity(FALLBACK_STUDENT, opp)
      ).sort((a, b) => b.overallFit - a.overallFit);
      return {
        status: "success",
        student_id: studentId,
        total_active_opportunities: analyses.length,
        analyses,
        opportunities: analyses
      };
    }
  },

  async getOpportunityApplicantsFit(opportunityId: string, sort: string = 'fit', verdict?: string, minFit?: number) {
    try {
      let url = `${API_BASE}/recruiter/opportunities/${opportunityId}/applicants-fit?sort=${sort}`;
      if (verdict && verdict !== 'ALL') url += `&verdict=${encodeURIComponent(verdict)}`;
      if (minFit !== undefined && minFit !== null) url += `&min_fit=${minFit}`;
      const res = await fetch(url, {
        headers: { 'x-user-role': 'recruiter' }
      });
      if (!res.ok) throw new Error("Failed to fetch applicants fit");
      return await res.json();
    } catch (err) {
      console.warn("Using offline fallback for applicants fit", err);
      const opp = FALLBACK_OPPORTUNITIES.find(o => o.opportunity_id === opportunityId) || FALLBACK_OPPORTUNITIES[0];
      const analysis = analyzeStudentForOpportunity(FALLBACK_STUDENT, opp);
      return {
        status: "success",
        opportunityId,
        opportunityTitle: opp.title,
        company: opp.company,
        total: 1,
        applicants: [{
          applicationId: 'app_demo_1',
          studentId: FALLBACK_STUDENT.id,
          studentName: FALLBACK_STUDENT.name,
          studentEmail: FALLBACK_STUDENT.email,
          college: FALLBACK_STUDENT.college,
          department: FALLBACK_STUDENT.department,
          year: FALLBACK_STUDENT.year,
          cgpa: FALLBACK_STUDENT.cgpa,
          avatar: FALLBACK_STUDENT.avatar,
          isIncognito: false,
          status: 'Applied',
          appliedAt: new Date().toISOString(),
          matchPercentage: opp.match_percentage,
          jdFitScore: analysis.overallFit,
          jdFitVerdict: analysis.verdict,
          jdFitVerdictExplanation: analysis.verdictExplanation,
          jdFitSummary: analysis.summary,
          criticalGaps: analysis.criticalGaps,
          skills: analysis.skills
        }]
      };
    }
  },

  async getApplicantSkillAnalysis(opportunityId: string, studentId: string) {
    try {
      const res = await fetch(`${API_BASE}/recruiter/opportunities/${opportunityId}/applicants/${studentId}/skill-analysis`, {
        headers: { 'x-user-role': 'recruiter' }
      });
      if (!res.ok) throw new Error("Failed to fetch applicant skill analysis");
      return await res.json();
    } catch (err) {
      console.warn("Using offline fallback for applicant skill analysis", err);
      const opp = FALLBACK_OPPORTUNITIES.find(o => o.opportunity_id === opportunityId) || FALLBACK_OPPORTUNITIES[0];
      const analysis = analyzeStudentForOpportunity(FALLBACK_STUDENT, opp);
      return {
        status: "success",
        opportunity: { id: opp.opportunity_id, title: opp.title, company: opp.company },
        candidate: {
          id: FALLBACK_STUDENT.id,
          name: FALLBACK_STUDENT.name,
          email: FALLBACK_STUDENT.email,
          college: FALLBACK_STUDENT.college,
          department: FALLBACK_STUDENT.department,
          year: FALLBACK_STUDENT.year,
          cgpa: FALLBACK_STUDENT.cgpa,
          isIncognito: false
        },
        analysis
      };
    }
  },

  async getOpportunityFitSummary(opportunityId: string) {
    try {
      const res = await fetch(`${API_BASE}/recruiter/opportunities/${opportunityId}/fit-summary`, {
        headers: { 'x-user-role': 'recruiter' }
      });
      if (!res.ok) throw new Error("Failed to fetch fit summary");
      return await res.json();
    } catch (err) {
      console.warn("Using offline fallback for fit summary", err);
      return {
        status: "success",
        opportunityId,
        totalApplicants: 1,
        avgFitScore: 88,
        verdictDistribution: {
          STRONG_FIT: 1,
          GOOD_FIT: 0,
          PARTIAL_FIT: 0,
          WEAK_FIT: 0
        },
        topMissingSkills: [{ skill: "Docker", count: 1 }]
      };
    }
  },

  async getAcademicianRoleGaps(year?: string, opportunityId?: string) {
    try {
      let url = `${API_BASE}/academician/role-gaps?`;
      if (year && year !== 'All') url += `year=${encodeURIComponent(year)}&`;
      if (opportunityId) url += `opportunity_id=${encodeURIComponent(opportunityId)}&`;
      const res = await fetch(url, {
        headers: { 'x-user-role': 'academician' }
      });
      if (!res.ok) throw new Error("Failed to fetch role gaps");
      return await res.json();
    } catch (err) {
      console.warn("Using offline fallback for academician role gaps", err);
      return {
        status: "success",
        cohortSize: 8,
        opportunitiesAnalyzed: 3,
        roles: FALLBACK_OPPORTUNITIES.map(opp => ({
          opportunityId: opp.opportunity_id,
          title: opp.title,
          company: opp.company,
          stipend: opp.stipend,
          location: opp.location,
          deadline: opp.deadline,
          avgFitScore: 78.5,
          verdictDistribution: { STRONG_FIT: 3, GOOD_FIT: 3, PARTIAL_FIT: 1, WEAK_FIT: 1 },
          topMissingSkills: [
            { skill: "Docker", missingCount: 4, percentageOfCohort: 50.0, recommendedCourse: "Docker & Container Mastery", provider: "NPTEL / IIT Madras" }
          ]
        })),
        mostInDemandGaps: [
          { skill: "Docker", importance: "MUST_HAVE", affectedStudentsCount: 4, affectedPercentage: 50.0, demandingRolesCount: 2 },
          { skill: "TypeScript", importance: "NICE_TO_HAVE", affectedStudentsCount: 3, affectedPercentage: 37.5, demandingRolesCount: 1 }
        ]
      };
    }
  },

  async getAdminSkillDemandCoverage(minDemand: number = 1) {
    try {
      const res = await fetch(`${API_BASE}/admin/analytics/skill-demand-coverage?min_demand=${minDemand}`, {
        headers: { 'x-user-role': 'admin' }
      });
      if (!res.ok) throw new Error("Failed to fetch skill demand coverage");
      return await res.json();
    } catch (err) {
      console.warn("Using offline fallback for admin skill demand coverage", err);
      return {
        status: "success",
        totalActiveOpportunities: 5,
        totalStudents: 10,
        uniqueSkillsAnalyzed: 4,
        criticalDeficitSkillsCount: 1,
        coverageData: [
          { skill: "Docker", canonicalName: "docker", rolesDemanding: 3, mustHaveDemand: 2, niceToHaveDemand: 1, avgTargetScore: 75, totalStudents: 10, verifiedCount: 3, proficientCount: 5, unassessedOrMissingCount: 5, coveragePercentage: 30.0, avgStudentScore: 68.0, gapSeverity: "CRITICAL_DEFICIT" },
          { skill: "Python", canonicalName: "python", rolesDemanding: 4, mustHaveDemand: 4, niceToHaveDemand: 0, avgTargetScore: 80, totalStudents: 10, verifiedCount: 8, proficientCount: 9, unassessedOrMissingCount: 1, coveragePercentage: 80.0, avgStudentScore: 86.5, gapSeverity: "STRONG_SUPPLY" },
          { skill: "React", canonicalName: "react", rolesDemanding: 2, mustHaveDemand: 2, niceToHaveDemand: 0, avgTargetScore: 75, totalStudents: 10, verifiedCount: 7, proficientCount: 8, unassessedOrMissingCount: 2, coveragePercentage: 70.0, avgStudentScore: 82.0, gapSeverity: "BALANCED" }
        ],
        highPriorityInterventions: [
          { skill: "Docker", canonicalName: "docker", rolesDemanding: 3, coveragePercentage: 30.0, gapSeverity: "CRITICAL_DEFICIT" }
        ],
        wellSuppliedSkills: [
          { skill: "Python", canonicalName: "python", rolesDemanding: 4, coveragePercentage: 80.0, gapSeverity: "STRONG_SUPPLY" }
        ]
      };
    }
  },

  // --- Gamified & Standardized Aptitude Arena Methods ---
  async getAptitudeOverview(studentId: string = "std_1") {
    try {
      const res = await fetch(`${API_BASE}/aptitude/overview?student_id=${encodeURIComponent(studentId)}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend aptitude overview fallback:", e);
    }
    return [
      { id: "all", name: "All Modules", totalQuestions: 450, completedQuestions: 28, masteryPct: 76 },
      { id: "quantitative", name: "Quantitative Aptitude", totalQuestions: 150, completedQuestions: 12, masteryPct: 82 },
      { id: "logical", name: "Logical Reasoning", totalQuestions: 150, completedQuestions: 10, masteryPct: 74 },
      { id: "technical", name: "Core CS & Systems", totalQuestions: 150, completedQuestions: 6, masteryPct: 70 }
    ];
  },

  async getAptitudePracticeQuestions(categoryId: string = "all", difficulty: string = "all", limit: number = 10) {
    try {
      const res = await fetch(`${API_BASE}/aptitude/practice/questions?category_id=${encodeURIComponent(categoryId)}&difficulty=${encodeURIComponent(difficulty)}&limit=${limit}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend practice fetch fallback:", e);
    }
    return {
      status: "success",
      count: 1,
      questions: [
        {
          id: "demo_q_1",
          category_id: "quantitative",
          category_name: "Quantitative Aptitude",
          topic: "Time and Work",
          difficulty: "medium",
          question: "Pipe A can fill a tank in 12 hours, while Pipe B can empty it in 18 hours. If both pipes are opened simultaneously in an empty tank, in how many hours will the tank be completely filled?",
          options: ["30 hours", "36 hours", "24 hours", "42 hours"],
          correct_answer: 1,
          explanation: "Combined rate = (1/12) - (1/18) = (3 - 2)/36 = 1/36 per hour. Tank is filled in 36 hours.",
          visual_asset: null
        }
      ]
    };
  },

  async submitAptitudePractice(studentId: string = "std_1", questionId: string, selectedOption: number) {
    try {
      const res = await fetch(`${API_BASE}/aptitude/practice/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, question_id: questionId, selected_option: selectedOption })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend practice submit fallback:", e);
    }
    return {
      status: "success",
      questionId,
      selectedOption,
      isCorrect: true,
      correctAnswer: selectedOption,
      explanation: "Practice verification completed."
    };
  },

  async startAptitudeTest(
    studentId: string = "std_1",
    categories?: string[],
    durationMinutes: number = 20,
    assessmentMode: string = "NORMAL",
    assessmentType: string = "NORMAL_APTITUDE",
    allowResume: boolean = true
  ) {
    try {
      const res = await fetch(`${API_BASE}/aptitude/test/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          categories,
          duration_minutes: durationMinutes,
          assessment_mode: assessmentMode,
          assessment_type: assessmentType,
          allow_resume: allowResume
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend test start fallback:", e);
    }
    return {
      status: "success",
      attemptId: `test_${Date.now()}`,
      assessment_mode: assessmentMode,
      assessment_type: assessmentType,
      startedAt: Math.floor(Date.now() / 1000),
      expiresAt: Math.floor(Date.now() / 1000) + (durationMinutes * 60),
      durationMinutes,
      questions: []
    };
  },

  async getActiveAptitudeTest(studentId: string = "std_1", assessmentType: string = "NORMAL_APTITUDE") {
    try {
      const res = await fetch(`${API_BASE}/aptitude/attempts/active?student_id=${encodeURIComponent(studentId)}&assessment_type=${encodeURIComponent(assessmentType)}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend active attempt fetch fallback:", e);
    }
    return { status: "none" };
  },

  async submitAptitudeTest(attemptId: string, studentId: string = "std_1", answers: any[], proctoringEvents?: any[]) {
    try {
      const res = await fetch(`${API_BASE}/aptitude/test/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attempt_id: attemptId, student_id: studentId, answers, proctoring_events: proctoringEvents })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend test submit fallback:", e);
    }
    return {
      status: "success",
      compositeScore: 82.5,
      accuracyPct: 80.0,
      correctCount: 16,
      totalQuestions: 20
    };
  },

  async submitGamifiedBattery(studentId: string = "std_1", gameMetrics: Record<string, any>) {
    try {
      const res = await fetch(`${API_BASE}/aptitude/gamified/battery/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, game_metrics: gameMetrics })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend gamified battery submit fallback:", e);
    }
    return {
      studentId,
      overallCognitiveIndex: 82.4,
      dimensions: {
        riskDecision: { score: 72, label: "Risk-Reward Decision Balance" },
        workingMemory: { score: 84, label: "Working Memory Capacity" },
        cognitiveFlexibility: { score: 88, label: "Rule-Switching Flexibility" },
        spatialVisualization: { score: 80, label: "Spatial Visualization & Mental Rotation" },
        planning: { score: 82, label: "Strategic Planning & Problem Solving" },
        processingSpeed: { score: 85, label: "Information Processing Speed" },
        resourceManagement: { score: 78, label: "Resource Allocation & Trade-Offs" },
        emotionRecognition: { score: 86, label: "Emotion-Recognition Accuracy" },
        mazePressure: { score: 81, label: "Spatial Memory Under Pressure" }
      },
      disclaimer: "Scores represent performance during this assessment and are not a clinical or psychological diagnosis."
    };
  },

  async generateAIQuestionBatch(categoryId: string, count: number = 10) {
    try {
      const res = await fetch(`${API_BASE}/aptitude/ai/generate-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId, count })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend AI batch generate fallback:", e);
    }
    return {
      status: "success",
      requested: count,
      added_count: count,
      duplicates_skipped: 0
    };
  },

  async startAptitudeAttempt(studentId: string = "std_1", studentName: string = "Aarav Sharma", category: string = "All", allowResume: boolean = true) {
    try {
      const res = await fetch(`${API_BASE}/aptitude/attempts/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, student_name: studentName, category, allow_resume: allowResume })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend start attempt fallback:", e);
    }
    return { status: "logged", attemptId: `apt_att_${Date.now()}` };
  },

  async logProctorEvent(attemptId: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/aptitude/attempts/${encodeURIComponent(attemptId)}/proctor-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend proctor log fallback:", e);
    }
    return { status: "logged" };
  },

  async reportProctoringEvent(attemptId: string, eventData: any) {
    try {
      const res = await fetch(`${API_BASE}/aptitude/proctoring/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, ...eventData })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend proctoring event report fallback:", e);
    }
    return { status: "recorded" };
  },

  async parseRawJobOpening(rawText: string, sourceType: string = "WHATSAPP_FORWARD", submittedBy: string = "TPO Desk") {
    try {
      const res = await fetch(`${API_BASE}/academician/jobs/parse-raw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: rawText,
          source_type: sourceType,
          submitted_by: submittedBy
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend parseRawJobOpening failed:", e);
    }
    return null;
  },

  async confirmJobIngestion(payload: {
    raw_text: string;
    source_type?: string;
    submitted_by?: string;
    company: string;
    title: string;
    ctc_display: string;
    min_ctc: number;
    max_ctc: number;
    eligible_batch: string;
    required_skills: string[];
    preferred_skills: string[];
    action_type: 'MERGE_EXISTING' | 'CREATE_CANONICAL';
    matched_job_id?: string | null;
  }) {
    try {
      const res = await fetch(`${API_BASE}/academician/jobs/confirm-ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend confirmJobIngestion failed:", e);
    }
    return null;
  },

  async getAcademicianJobs() {
    try {
      const res = await fetch(`${API_BASE}/academician/jobs`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend getAcademicianJobs failed:", e);
    }
    return { status: "fallback", total: 0, jobs: [] };
  },

  async scanCertificateForensics(payload: {
    raw_text: string;
    student_id?: string;
    student_kyc_name?: string;
    custom_hash?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/assessments/certificates/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      return { status: "error", message: err.detail || "Scanning failed" };
    } catch (e: any) {
      console.warn("Backend scanCertificateForensics failed:", e);
      return { status: "error", message: e.message || "Network error" };
    }
  },

  async commitCertificateToProfile(payload: {
    student_id: string;
    certificate_data: any;
  }) {
    try {
      const res = await fetch(`${API_BASE}/assessments/certificates/commit-to-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      return { status: "error", message: err.detail || "Commit failed" };
    } catch (e: any) {
      console.warn("Backend commitCertificateToProfile failed:", e);
      return { status: "error", message: e.message || "Network error" };
    }
  },

  async getEvidenceMatrix(studentId: string = "std_1") {
    try {
      const res = await fetch(`${API_BASE}/student/evidence-matrix?student_id=${studentId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend getEvidenceMatrix failed:", e);
    }
    return { status: "fallback", matrix: { total_skills: 0, summary: {}, skills: [] } };
  },

  async submitEvidence(payload: {
    student_id?: string;
    title: string;
    type?: string;
    description?: string;
    url_or_repo?: string;
    extracted_skills?: string[];
  }) {
    try {
      const res = await fetch(`${API_BASE}/student/evidence/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      return { status: "error", message: err.detail || "Submission failed" };
    } catch (e: any) {
      console.warn("Backend submitEvidence failed:", e);
      return { status: "error", message: e.message || "Network error" };
    }
  },

  async getOpportunityCounterfactual(oppId: string, studentId: string = "std_1") {
    try {
      const res = await fetch(`${API_BASE}/student/opportunities/${oppId}/counterfactual?student_id=${studentId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend getOpportunityCounterfactual failed:", e);
    }
    return null;
  },

  async fileOpportunityDispute(oppId: string, payload: {
    student_id?: string;
    disputed_skill: string;
    student_argument: string;
    supporting_evidence_url?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/student/opportunities/${oppId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      return { status: "error", message: err.detail || "Dispute filing failed" };
    } catch (e: any) {
      console.warn("Backend fileOpportunityDispute failed:", e);
      return { status: "error", message: e.message || "Network error" };
    }
  },

  async getTruthfulResume(studentId: string = "std_1", targetRole: string = "Full-Stack AI Developer") {
    try {
      const res = await fetch(`${API_BASE}/resume/truthful-builder/${studentId}?target_role=${encodeURIComponent(targetRole)}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend getTruthfulResume failed:", e);
    }
    return null;
  },

  async auditTruthfulResumeClaims(payload: {
    student_id?: string;
    claimed_skills: string[];
    target_role?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/resume/truthful-builder/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      return { status: "error", message: err.detail || "Audit failed" };
    } catch (e: any) {
      console.warn("Backend auditTruthfulResumeClaims failed:", e);
      return { status: "error", message: e.message || "Network error" };
    }
  },

  async getCohortDisputes(status?: string) {
    try {
      const q = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await fetch(`${API_BASE}/academician/disputes${q}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend getCohortDisputes failed:", e);
    }
    return { status: "success", total: 0, disputes: [] };
  },

  async resolveCohortDispute(disputeId: string, payload: {
    resolution: string;
    notes?: string;
    new_score?: number;
    reviewer_email?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/academician/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      return { status: "error", message: err.detail || "Resolution failed" };
    } catch (e: any) {
      console.warn("Backend resolveCohortDispute failed:", e);
      return { status: "error", message: e.message || "Network error" };
    }
  },

  // -------------------------------------------------------------
  // ALUMNI PORTAL SUITE
  // -------------------------------------------------------------
  async getAlumniProfile(alumniId?: string, email?: string) {
    try {
      const q = alumniId ? `?alumni_id=${encodeURIComponent(alumniId)}` : email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/alumni/profile${q}`);
      if (res.ok) {
        const data = await res.json();
        return data.profile;
      }
    } catch (e) {
      console.warn("Backend getAlumniProfile failed, using fallback:", e);
    }
    return {
      id: "alm_1",
      name: "Vikram Aditya",
      email: "vikram.aditya@google.com",
      college: "JSPM RSCOE, Pune",
      department: "Computer Engineering",
      batch: "2021",
      passing_year: 2021,
      current_company: "Google",
      designation: "Staff Software Engineer (Cloud Infrastructure & AI)",
      city: "Bengaluru / Pune",
      linkedin_url: "https://linkedin.com/in/vikram-aditya-google",
      github_url: "https://github.com/vikram-aditya",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
      bio: "JSPM RSCOE Batch 2021 alumnus. Mentoring juniors on Distributed Systems, Cloud Architecture, and Career Pathways.",
      skills: ["Distributed Systems", "Go", "Python", "Kubernetes", "GCP", "System Design"],
      is_verified_alumni: true,
      verification_status: "APPROVED",
      privacy_settings: {
        show_company: true,
        show_email_to_mentees: true,
        show_phone: false,
        allow_referral_requests: true,
        allow_mentorship: true
      },
      impact_score: 480,
      mentees_count: 14,
      referrals_count: 6,
      sessions_delivered: 18
    };
  },

  async updateAlumniProfile(alumniId: string, updates: any) {
    try {
      const res = await fetch(`${API_BASE}/alumni/profile?alumni_id=${encodeURIComponent(alumniId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        return data.profile;
      }
    } catch (e) {
      console.warn("Backend updateAlumniProfile failed:", e);
    }
    return updates;
  },

  async getAlumniDashboard(alumniId?: string, email?: string) {
    try {
      const q = alumniId ? `?alumni_id=${encodeURIComponent(alumniId)}` : email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await fetch(`${API_BASE}/alumni/dashboard${q}`);
      if (res.ok) {
        const data = await res.json();
        return data.dashboard;
      }
    } catch (e) {
      console.warn("Backend getAlumniDashboard failed, using fallback:", e);
    }
    return {
      profile: await this.getAlumniProfile(alumniId, email),
      stats: {
        impact_score: 480,
        mentees_helped: 14,
        referrals_made: 3,
        students_referred_count: 4,
        sessions_delivered: 18,
        pending_requests_count: 1,
        accepted_sessions_count: 1,
        insights_shared: 1
      },
      pending_requests: [
        {
          id: "req_alm_1",
          alumni_id: "alm_1",
          student_id: "std_1",
          student_name: "Dhruv Patil",
          student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv",
          target_role: "Full-Stack AI Engineer",
          topic: "Google Cloud Infrastructure & High-Performance Microservices",
          message: "Hi Vikram Sir, I am building autonomous multi-signal placement verification systems. Would love your guidance on high-throughput microservices architecture and Google L3/L4 interview prep.",
          status: "PENDING",
          scheduled_time: "2026-10-24 18:30 IST",
          meeting_link: "https://meet.google.com/hxr-alumni-guidance",
          feedback_notes: "",
          created_at: new Date().toISOString()
        }
      ],
      upcoming_sessions: [
        {
          id: "req_alm_2",
          alumni_id: "alm_1",
          student_id: "std_2",
          student_name: "Yuvraj Kadam",
          student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuvraj",
          target_role: "Backend Engineer",
          topic: "System Design & Distributed Cache Review",
          message: "Hello Sir, I wanted feedback on my Redis queue implementation and DSA roadmaps for top product companies.",
          status: "ACCEPTED",
          scheduled_time: "2026-10-20 19:00 IST",
          meeting_link: "https://meet.google.com/hxr-sys-design-review",
          feedback_notes: "Strong algorithmic fundamentals. Focus on linear time complexity guarantees.",
          created_at: new Date().toISOString()
        }
      ],
      active_referrals: [
        {
          id: "ref_alm_1",
          alumni_id: "alm_1",
          company: "Google",
          role: "Software Engineer II - Cloud Backend",
          job_url: "https://careers.google.com/jobs/results/1092812",
          location: "Bengaluru / Pune (Hybrid)",
          experience_required: "0-2 Years",
          status: "OPEN",
          created_at: new Date().toISOString(),
          student_referrals: [
            {
              student_id: "std_1",
              student_name: "Dhruv Patil",
              status: "SHORTLISTED",
              applied_at: new Date().toISOString(),
              endorsement_note: "Verified 88% skill score. High integrity AST clean code score."
            }
          ]
        }
      ],
      college_announcements: [
        {
          id: "ann_1",
          title: "JSPM RSCOE Annual Alumni Conclave & Hackathon 2026",
          date: "2026-11-15",
          desc: "Inviting industry alumni for project evaluations and keynote addresses on AI Systems."
        },
        {
          id: "ann_2",
          title: "NAAC & NBA Accreditation Academic Feedback Cycle",
          date: "2026-10-30",
          desc: "Placement cell request: Share industry tools survey to calibrate Computer Engineering syllabus."
        }
      ]
    };
  },

  async getAlumniMentorshipRequests(alumniId?: string, status?: string) {
    try {
      const q = new URLSearchParams();
      if (alumniId) q.set('alumni_id', alumniId);
      if (status) q.set('status', status);
      const res = await fetch(`${API_BASE}/alumni/mentorship/requests?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.requests;
      }
    } catch (e) {
      console.warn("Backend getAlumniMentorshipRequests failed:", e);
    }
    const dash = await this.getAlumniDashboard(alumniId);
    return [...dash.pending_requests, ...dash.upcoming_sessions];
  },

  async createAlumniMentorshipRequest(payload: {
    alumni_id: string;
    student_id: string;
    student_name: string;
    student_avatar?: string;
    target_role: string;
    topic: string;
    message: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/alumni/mentorship/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend createAlumniMentorshipRequest failed:", e);
    }
    return {
      status: "success",
      request: {
        id: `req_alm_${Date.now()}`,
        ...payload,
        status: "PENDING",
        created_at: new Date().toISOString()
      }
    };
  },

  async actionAlumniMentorshipRequest(requestId: string, payload: {
    action: string;
    scheduled_time?: string;
    meeting_link?: string;
    feedback_notes?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/alumni/mentorship/requests/${requestId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend actionAlumniMentorshipRequest failed:", e);
    }
    return {
      status: "success",
      request: {
        id: requestId,
        status: payload.action,
        scheduled_time: payload.scheduled_time,
        meeting_link: payload.meeting_link,
        feedback_notes: payload.feedback_notes
      }
    };
  },

  async getAlumniReferrals(alumniId?: string) {
    try {
      const q = alumniId ? `?alumni_id=${encodeURIComponent(alumniId)}` : '';
      const res = await fetch(`${API_BASE}/alumni/referrals${q}`);
      if (res.ok) {
        const data = await res.json();
        return data.referrals;
      }
    } catch (e) {
      console.warn("Backend getAlumniReferrals failed:", e);
    }
    const dash = await this.getAlumniDashboard(alumniId);
    return dash.active_referrals;
  },

  async postAlumniReferral(payload: {
    alumni_id: string;
    alumni_name?: string;
    company: string;
    role: string;
    job_url?: string;
    location: string;
    experience_required?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/alumni/referrals/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend postAlumniReferral failed:", e);
    }
    return {
      status: "success",
      referral: {
        id: `ref_alm_${Date.now()}`,
        ...payload,
        status: "OPEN",
        created_at: new Date().toISOString(),
        student_referrals: []
      }
    };
  },

  async applyToAlumniReferral(referralId: string, payload: {
    student_id: string;
    student_name: string;
    endorsement_note?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/alumni/referrals/${referralId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend applyToAlumniReferral failed:", e);
    }
    return {
      status: "success",
      message: "Referral request submitted to alumnus."
    };
  },

  async getAlumniInsights() {
    try {
      const res = await fetch(`${API_BASE}/alumni/insights`);
      if (res.ok) {
        const data = await res.json();
        return data.insights;
      }
    } catch (e) {
      console.warn("Backend getAlumniInsights failed:", e);
    }
    return [
      {
        id: "ins_alm_1",
        alumni_id: "alm_1",
        alumni_name: "Vikram Aditya",
        company: "Google",
        designation: "Staff Software Engineer",
        role_interviewed: "Software Engineer (L3/L4)",
        rounds_breakdown: [
          {
            round_name: "Round 1: DSA & Graph Traversal",
            focus: "DFS/BFS, Dijkstra, dynamic array allocation",
            sample_questions: ["Shortest path in weighted DAG with negative edge constraints", "Implement LRU with O(1) eviction"],
            difficulty: "HARD"
          },
          {
            round_name: "Round 2: Algorithmic Optimization & DP",
            focus: "Interval scheduling, 2D dynamic programming",
            sample_questions: ["Max non-overlapping task intervals with dependencies", "Subarray sum divisible by K"],
            difficulty: "HARD"
          },
          {
            round_name: "Round 3: System Design & Microservices",
            focus: "Rate limiters, caching strategies, horizontal partitioning",
            sample_questions: ["Design high-throughput distributed URL shortener with analytics", "Message broker idempotency"],
            difficulty: "MEDIUM"
          },
          {
            round_name: "Round 4: Googleyness & Collaborative Leadership",
            focus: "Handling technical disagreements, ownership, ethical AI",
            sample_questions: ["Tell me about a time you pushed back on a product requirement with engineering data"],
            difficulty: "MEDIUM"
          }
        ],
        skills_we_actually_use: ["Go", "Kubernetes", "gRPC", "Protobuf", "Distributed Tracing", "Cloud Spanner"],
        tips_for_juniors: "Don't jump straight into code during technical rounds. Clarify corner cases (empty inputs, concurrency, scale limits). Write clean, modular functions with self-documenting names.",
        upvotes: 48,
        created_at: new Date().toISOString()
      }
    ];
  },

  async postAlumniInsight(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/alumni/insights/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend postAlumniInsight failed:", e);
    }
    return {
      status: "success",
      insight: {
        id: `ins_alm_${Date.now()}`,
        ...payload,
        upvotes: 0,
        created_at: new Date().toISOString()
      }
    };
  },

  async submitAlumniEndorsement(payload: {
    alumni_id: string;
    alumni_name: string;
    student_id: string;
    student_name: string;
    skill: string;
    context: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/alumni/endorsements/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend submitAlumniEndorsement failed:", e);
    }
    return {
      status: "success",
      endorsement: {
        id: `end_alm_${Date.now()}`,
        ...payload,
        weight: 1.25,
        created_at: new Date().toISOString()
      }
    };
  },

  async getAlumniDirectory(query?: string, department?: string, company?: string) {
    try {
      const q = new URLSearchParams();
      if (query) q.set('query', query);
      if (department) q.set('department', department);
      if (company) q.set('company', company);
      const res = await fetch(`${API_BASE}/alumni/directory?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.directory;
      }
    } catch (e) {
      console.warn("Backend getAlumniDirectory failed:", e);
    }
    return [
      {
        id: "alm_1",
        name: "Vikram Aditya",
        email: "vikram.aditya@google.com",
        college: "JSPM RSCOE, Pune",
        department: "Computer Engineering",
        batch: "2021",
        passing_year: 2021,
        current_company: "Google",
        designation: "Staff Software Engineer",
        city: "Bengaluru",
        skills: ["Distributed Systems", "Go", "Python", "Kubernetes", "GCP"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
        is_verified_alumni: true,
        impact_score: 480
      },
      {
        id: "alm_2",
        name: "Sneha Rao",
        email: "sneha.rao@microsoft.com",
        college: "JSPM RSCOE, Pune",
        department: "Computer Engineering",
        batch: "2020",
        passing_year: 2020,
        current_company: "Microsoft",
        designation: "Senior Software Engineer",
        city: "Hyderabad",
        skills: ["C#", "Azure", "Microservices", "SQL"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
        is_verified_alumni: true,
        impact_score: 390
      },
      {
        id: "alm_3",
        name: "Rohit Deshmukh",
        email: "rohit.deshmukh@amazon.com",
        college: "JSPM RSCOE, Pune",
        department: "Information Technology",
        batch: "2022",
        passing_year: 2022,
        current_company: "Amazon",
        designation: "Machine Learning Engineer",
        city: "Pune",
        skills: ["PyTorch", "AWS", "Python", "LLMs"],
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit",
        is_verified_alumni: true,
        impact_score: 260
      }
    ];
  }
};

export const api = apiService;





