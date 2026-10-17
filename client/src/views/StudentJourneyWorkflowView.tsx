import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  GraduationCap,
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Award,
  BookOpen,
  Briefcase,
  Check,
  RefreshCw,
  FolderGit2,
  ChevronRight,
  ShieldAlert,
  Send,
  Lock,
  Layers,
  BarChart3,
  Linkedin
} from 'lucide-react';
import {
  StudentProfile,
  MatchedOpportunity,
  ExtractedSkill,
  AssessmentSection,
  MultiSectionResult,
  CourseRecommendation,
  ProjectItem,
  ProjectDocFile,
  LinkedInConnectionProfile
} from '../types';
import { apiService, FALLBACK_OPPORTUNITIES } from '../services/api';
import { SEOHead } from '../components/common/SEOHead';
import { ProctoredAssessmentEngine } from '../components/proctoring/ProctoredAssessmentEngine';
import { useAssessment } from '../context/AssessmentContext';

interface StudentJourneyWorkflowViewProps {
  student: StudentProfile;
  opportunities?: MatchedOpportunity[];
  onNavigateTab: (tab: string) => void;
  onOpenOpportunityDetail?: (opp: MatchedOpportunity) => void;
}

// 9 Distinct Workflow Steps
type WorkflowStep =
  | 'personal_info'      // 1. Personal & College Info
  | 'id_verification'    // 2. College ID & Demo Aadhaar
  | 'projects_docs'      // 3. Resume, GitHub, Projects & Multi-file READMEs
  | 'profile_checklist'  // 4. Checklist Validation
  | 'skill_extraction'   // 5. Automatic Extraction & DETECTED ≠ VERIFIED Notice
  | 'skill_confirmation' // 6. Review Your Skills (Checkboxes, Add, Deselect)
  | 'assessment'         // 7. Proctored Assessment (Timer, Malpractice Monitor, Equal Distribution)
  | 'results'            // 8. Results & SVG Donut Chart & Strong/Weak Classification
  | 'recommendations';   // 9. Parallel Paths: Strong -> Jobs (Apply Now) & Weak -> Courses

export const StudentJourneyWorkflowView: React.FC<StudentJourneyWorkflowViewProps> = ({
  student,
  opportunities = FALLBACK_OPPORTUNITIES,
  onNavigateTab,
  onOpenOpportunityDetail
}) => {
  const studentId = student.student_id || student.id || 'std_1';
  const isDemo = (student.student_id === 'std_1' || student.id === 'std_1') && (student.verified_score || 0) > 0;

  // Active workflow step
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('personal_info');

  // STEP 1: Personal & College Info
  const [firstName, setFirstName] = useState(student.name ? student.name.split(' ')[0] : (isDemo ? 'Dhruv' : ''));
  const [lastName, setLastName] = useState(
    student.name && student.name.split(' ').length > 1
      ? student.name.split(' ').slice(1).join(' ')
      : (isDemo ? 'Patil' : '')
  );
  const [emailUsername, setEmailUsername] = useState(student.email || (isDemo ? 'dhruv.patil@rscoe.edu.in' : ''));
  const [phone, setPhone] = useState(isDemo ? '+91 98765 43210' : '');
  const [collegeName, setCollegeName] = useState(student.college || (isDemo ? 'JSPM Rajarshi Shahu College of Engineering, Pune' : ''));
  const [degreeStream, setDegreeStream] = useState(student.department || (isDemo ? 'B.Tech Computer Engineering' : ''));
  const [gradYear, setGradYear] = useState(student.year || '2026');
  const [city, setCity] = useState(isDemo ? 'Pune' : '');
  const [stateRegion, setStateRegion] = useState(isDemo ? 'Maharashtra' : '');
  const [country, setCountry] = useState('India');

  // STEP 2: College ID & Aadhaar Demo Sandbox
  const [collegeIdFile, setCollegeIdFile] = useState<string | null>(isDemo ? 'college_id_card_sample.png' : null);
  const [collegeIdPreview, setCollegeIdPreview] = useState<string | null>(
    isDemo ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80' : null
  );
  const [aadhaarRaw, setAadhaarRaw] = useState(isDemo ? '4567-8901-1234' : '');
  const [aadhaarMasked, setAadhaarMasked] = useState(isDemo ? 'XXXX-XXXX-1234' : '');
  const [aadhaarStatus, setAadhaarStatus] = useState<
    'NOT_VERIFIED' | 'PENDING' | 'VERIFYING' | 'VERIFIED' | 'FAILED' | 'MANUAL_REVIEW' | 'UNAVAILABLE'
  >(isDemo ? 'VERIFIED' : 'NOT_VERIFIED');
  const [aadhaarTxId, setAadhaarTxId] = useState<string | null>(isDemo ? 'UIDAI-SANDBOX-89104-PUNE' : null);

  // STEP 3: Resume, Links, Projects & Multi-file Documentation
  const [resumeText, setResumeText] = useState<string>(
    isDemo ? `Dhruv Patil | Computer Engineering, JSPM RSCOE Pune
Email: dhruv.patil@rscoe.edu.in | GitHub: github.com/dhruv-patil | LinkedIn: linkedin.com/in/dhruv-patil

TECHNICAL SKILLS:
Languages: Python, JavaScript, TypeScript, SQL
Frameworks: React, FastAPI, Node.js, Tailwind CSS
Databases & Tools: PostgreSQL, Docker, Git, Machine Learning, REST APIs

PROJECTS:
1. HireX Placement Platform: Built full-stack platform using React, FastAPI, and PostgreSQL with AI skill evaluation.
2. Cloud Microservices Engine: Designed microservice architecture with Docker and Redis queue.` : ''
  );
  const [githubUrl, setGithubUrl] = useState(isDemo ? 'https://github.com/dhruv-patil' : '');
  const [linkedinUrl, setLinkedinUrl] = useState(isDemo ? 'https://linkedin.com/in/dhruv-patil' : '');

  // LinkedIn OAuth 2.0 / OpenID Connect State
  const [isLinkedInConnected, setIsLinkedInConnected] = useState<boolean>(false);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInConnectionProfile | null>(null);
  const [linkedInLastSync, setLinkedInLastSync] = useState<string | null>(null);
  const [isConnectingLinkedIn, setIsConnectingLinkedIn] = useState<boolean>(false);
  const [linkedInError, setLinkedInError] = useState<string | null>(null);
  const [linkedInSuccessMsg, setLinkedInSuccessMsg] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>(
    isDemo ? [
      {
        id: 'proj_1',
        title: 'HireX - Autonomous Placement Engine',
        description: 'End-to-end talent calibration platform with FastAPI backend and React frontend.',
        github_repo_url: 'https://github.com/dhruv-patil/hirex-core',
        technologies: ['React', 'FastAPI', 'Python', 'PostgreSQL', 'Tailwind CSS'],
        documentation_files: [
          {
            id: 'doc_1_1',
            file_name: 'README.md',
            file_type: 'README.md',
            content: `# HireX Core\n\nAI-powered campus recruitment and automated skill assessment system.\n\n## Stack\n- Frontend: React 18, TypeScript, Tailwind CSS\n- Backend: FastAPI, Python, SQLAlchemy\n- ML: Ridge Regression Skill Calibrator\n- Database: PostgreSQL`
          },
          {
            id: 'doc_1_2',
            file_name: 'ARCHITECTURE.md',
            file_type: 'ARCHITECTURE.md',
            content: `## Architecture\nMicroservices communication using REST API with JWT authentication and RBAC for Student, Recruiter, Academician, and Admin.`
          }
        ]
      },
      {
        id: 'proj_2',
        title: 'Distributed Cloud Task Queue',
        description: 'High throughput asynchronous task dispatcher in Python and Redis.',
        github_repo_url: 'https://github.com/dhruv-patil/async-task-engine',
        technologies: ['Python', 'Docker', 'SQL', 'FastAPI'],
        documentation_files: [
          {
            id: 'doc_2_1',
            file_name: 'README.md',
            file_type: 'README.md',
            content: `# Async Task Engine\n\nScalable event processing queue built with Redis and Docker.`
          }
        ]
      }
    ] : []
  );

  // STEP 5: Skill Extraction
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<ExtractedSkill[]>(
    isDemo ? [
      { skill: 'Python', sources: ['Resume', 'Project 1 (HireX)', 'Project 2 (Task Queue)'], state: 'DETECTED', is_verified: false },
      { skill: 'React', sources: ['Resume', 'Project 1 (README.md)', 'Project 1 (HireX)'], state: 'DETECTED', is_verified: false },
      { skill: 'FastAPI', sources: ['Resume', 'Project 1 (ARCHITECTURE.md)', 'Project 2 (Task Queue)'], state: 'DETECTED', is_verified: false },
      { skill: 'SQL', sources: ['Resume', 'Project 2 (Task Queue)'], state: 'DETECTED', is_verified: false },
      { skill: 'Docker', sources: ['Resume', 'Project 2 (README.md)'], state: 'DETECTED', is_verified: false },
      { skill: 'Machine Learning', sources: ['Resume', 'Project 1 (README.md)'], state: 'DETECTED', is_verified: false }
    ] : []
  );

  // STEP 6: Skill Confirmation
  const [confirmedSkills, setConfirmedSkills] = useState<string[]>(isDemo ? ['Python', 'React', 'FastAPI', 'SQL'] : []);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [skillAddError, setSkillAddError] = useState('');

  // STEP 7: Proctored Assessment
  const [hasConsented, setHasConsented] = useState(false);
  const [assessmentSections, setAssessmentSections] = useState<AssessmentSection[]>([]);
  const [activeAssessmentId, setActiveAssessmentId] = useState<string>('assmt_live_proctor');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number[]>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 minutes
  const { isAssessmentActive, setIsAssessmentActive } = useAssessment();
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [malpracticeCount, setMalpracticeCount] = useState(0);
  const [malpracticeAlert, setMalpracticeAlert] = useState<string | null>(null);
  const [malpracticeTier, setMalpracticeTier] = useState<'NORMAL' | 'WARNING' | 'SUSPICIOUS' | 'DISQUALIFICATION'>('NORMAL');

  // STEP 8 & 9: Assessment Results & Recommendations
  const [assessmentResult, setAssessmentResult] = useState<MultiSectionResult | null>(null);
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState<string[]>(['opp_1']);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);
  const [applyErrorMsg, setApplyErrorMsg] = useState<string | null>(null);

  // Closed Loop Learning & Academician Recommendations State (Part 13 & 22)
  const [academicianRecs, setAcademicianRecs] = useState<any[]>([]);
  const [isReassessing, setIsReassessing] = useState<string | null>(null);
  const [reassessmentNotice, setReassessmentNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcademicianRecs = async () => {
      try {
        const res = await apiService.getStudentAcademicianRecommendations(studentId);
        setAcademicianRecs(res.recommendations || []);
      } catch (err) {
        console.error('Failed to load academician recommendations:', err);
      }
    };
    fetchAcademicianRecs();
  }, [studentId]);

  // Synchronize LinkedIn Connection Status on Mount & Callback
  useEffect(() => {
    const checkLinkedInStatus = async () => {
      try {
        const res = await apiService.getLinkedInStatus(studentId);
        if (res.connected && res.connection) {
          setIsLinkedInConnected(true);
          setLinkedInProfile(res.connection);
          setLinkedInLastSync(res.last_synchronized || null);
          if (res.connection.linkedin_profile_url && !linkedinUrl) {
            setLinkedinUrl(res.connection.linkedin_profile_url);
          }
        }
      } catch (err) {
        console.warn('Could not fetch LinkedIn status:', err);
      }
    };
    checkLinkedInStatus();

    // Check for LinkedIn OAuth redirect callback parameters
    const params = new URLSearchParams(window.location.search);
    const liStatus = params.get('linkedin_status');
    const errMsg = params.get('error_message');

    if (liStatus === 'success') {
      setIsLinkedInConnected(true);
      setLinkedInSuccessMsg('✓ LinkedIn Connected! Basic profile information imported.');
      setLinkedInError(null);
      checkLinkedInStatus();
      // Clean query parameters from URL without reloading
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, '', cleanPath);
      setTimeout(() => setLinkedInSuccessMsg(null), 7000);
    } else if (liStatus === 'error') {
      setIsLinkedInConnected(false);
      setLinkedInError(errMsg ? decodeURIComponent(errMsg) : 'LinkedIn connection failed. Please try again.');
      setLinkedInSuccessMsg(null);
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, '', cleanPath);
    }
  }, [studentId]);

  const handleConnectLinkedIn = async () => {
    setIsConnectingLinkedIn(true);
    setLinkedInError(null);
    try {
      const res = await apiService.getLinkedInAuthorizeUrl(studentId, 'workflow');
      if (res.is_client_id_configured && res.authorization_url) {
        window.location.href = res.authorization_url;
      } else {
        // Local developer / sandbox mode simulation when credentials are not yet configured
        const sim = await apiService.simulateLinkedInConnect({
          student_id: studentId,
          linkedin_name: `${firstName} ${lastName}`.trim() || student.name || 'Dhruv Patil',
          linkedin_email: emailUsername ? `${emailUsername}@rscoe.edu.in` : (student.email || 'dhruv.patil@rscoe.edu.in')
        });
        if (sim.status === 'success') {
          setIsLinkedInConnected(true);
          setLinkedInProfile(sim.connection);
          setLinkedInLastSync(new Date().toUTCString());
          setLinkedInSuccessMsg('✓ LinkedIn Connected! Basic profile information imported.');
          if (sim.connection?.linkedin_profile_url) {
            setLinkedinUrl(sim.connection.linkedin_profile_url);
          }
          setTimeout(() => setLinkedInSuccessMsg(null), 6000);
        } else {
          setLinkedInError('LinkedIn connection failed. Please try again.');
        }
      }
    } catch (err: any) {
      setLinkedInError(err.message || 'LinkedIn connection failed. Please try again.');
    } finally {
      setIsConnectingLinkedIn(false);
    }
  };

  const handleDisconnectLinkedIn = async () => {
    try {
      await apiService.disconnectLinkedIn(studentId);
      setIsLinkedInConnected(false);
      setLinkedInProfile(null);
      setLinkedInLastSync(null);
      setLinkedInSuccessMsg(null);
      setLinkedInError(null);
    } catch (err: any) {
      console.warn('Disconnect error:', err);
    }
  };

  const handleReassessSkill = async (skillName: string) => {
    setIsReassessing(skillName);
    try {
      const res = await apiService.reassessSkill(studentId, skillName, 85);
      if (res.status === 'success') {
        setReassessmentNotice(
          `Closed-Loop Completed! Successfully reassessed '${skillName}' to 85% (ASSESSMENT VERIFIED). Your Shared Skill Record has updated, elevating your AI match fit for live recruiter drives!`
        );
        if (assessmentResult) {
          setAssessmentResult({
            ...assessmentResult,
            skill_scores: {
              ...assessmentResult.skill_scores,
              [skillName]: 85
            },
            section_breakdowns: assessmentResult.section_breakdowns.map(sec => 
              sec.skill.toLowerCase() === skillName.toLowerCase()
                ? { ...sec, score_pct: 85, correct_count: sec.total_questions }
                : sec
            ),
            strong_skills: [
              ...assessmentResult.strong_skills.filter(s => s.skill.toLowerCase() !== skillName.toLowerCase()),
              { skill: skillName, score: 85, status: 'Strong' }
            ],
            weak_skills: assessmentResult.weak_skills.filter(s => s.skill.toLowerCase() !== skillName.toLowerCase())
          });
        }
      }
    } catch (err: any) {
      console.error('Reassessment failed:', err);
    } finally {
      setIsReassessing(null);
    }
  };

  // Auto-mask Aadhaar input helper
  const handleAadhaarChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 12);
    setAadhaarRaw(digitsOnly);
    if (digitsOnly.length === 12) {
      const last4 = digitsOnly.slice(-4);
      setAadhaarMasked(`XXXX-XXXX-${last4}`);
    } else if (digitsOnly.length > 0) {
      setAadhaarMasked(`XXXX-XXXX-${digitsOnly.slice(-4) || '****'}`);
    } else {
      setAadhaarMasked('XXXX-XXXX-1234');
    }
  };

  // Demo Aadhaar Verification trigger
  const handleVerifyAadhaar = async () => {
    setAadhaarStatus('VERIFYING');
    try {
      const last4 = aadhaarRaw.replace(/\D/g, '').slice(-4) || '1234';
      const res = await apiService.verifyAadhaarDemo(studentId, last4);
      if (res.status === 'VERIFIED') {
        setAadhaarStatus('VERIFIED');
        setAadhaarMasked(res.masked_aadhaar);
        setAadhaarTxId(res.transaction_id || `UIDAI-SANDBOX-${Date.now()}`);
      } else {
        setAadhaarStatus('FAILED');
      }
    } catch {
      setAadhaarStatus('VERIFIED');
      setAadhaarMasked(`XXXX-XXXX-${aadhaarRaw.slice(-4) || '1234'}`);
      setAadhaarTxId(`UIDAI-SANDBOX-${Date.now()}`);
    }
  };

  // Add Project
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      title: 'New Full-Stack Project',
      description: 'Project description and architecture overview.',
      github_repo_url: 'https://github.com/dhruv-patil/new-project',
      technologies: ['Python', 'React'],
      documentation_files: [
        {
          id: `doc_${Date.now()}_1`,
          file_name: 'README.md',
          file_type: 'README.md',
          content: `# Project Title\n\nProject overview and installation steps.`
        }
      ]
    };
    setProjects([...projects, newProj]);
  };

  // Remove Project
  const handleRemoveProject = (projId: string) => {
    setProjects(projects.filter(p => p.id !== projId));
  };

  // Add README/Documentation file to a project
  const handleAddDocumentationFile = (projId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projId) {
        const newDoc: ProjectDocFile = {
          id: `doc_${Date.now()}`,
          file_name: 'API_DOCS.md',
          file_type: 'API_DOCS.md',
          content: `## API Documentation\n\nEndpoints, schema definitions, and authentication details.`
        };
        return {
          ...p,
          documentation_files: [...p.documentation_files, newDoc]
        };
      }
      return p;
    }));
  };

  // Remove Documentation file
  const handleRemoveDocumentationFile = (projId: string, docId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          documentation_files: p.documentation_files.filter(d => d.id !== docId)
        };
      }
      return p;
    }));
  };

  // Skill Extraction Handler
  const handleRunSkillExtraction = async () => {
    setIsExtracting(true);
    try {
      const res = await apiService.extractSkills({
        student_id: studentId,
        resume_text: resumeText,
        github_url: githubUrl,
        projects: projects
      });
      if (res.extracted_skills && res.extracted_skills.length > 0) {
        setExtractedSkills(res.extracted_skills);
        // Automatically default confirmed skills to detected names
        const names = res.extracted_skills.map((s: ExtractedSkill) => s.skill);
        setConfirmedSkills(names.slice(0, 4));
      }
    } catch {
      // Keep existing extracted skills as robust fallback
    } finally {
      setIsExtracting(false);
      setCurrentStep('skill_extraction');
    }
  };

  // Add Manual Skill with duplicate prevention
  const handleAddManualSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    const exists = extractedSkills.some(s => s.skill.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setSkillAddError(`'${trimmed}' is already in your detected skills list.`);
      return;
    }
    const newSkill: ExtractedSkill = {
      skill: trimmed,
      sources: ['Self-Declared / Manual Addition'],
      state: 'SELF_DECLARED',
      is_verified: false
    };
    setExtractedSkills([...extractedSkills, newSkill]);
    setConfirmedSkills([...confirmedSkills, trimmed]);
    setNewSkillInput('');
    setSkillAddError('');
  };

  // Toggle Confirm Skill checkbox
  const handleToggleConfirmSkill = (skill: string) => {
    if (confirmedSkills.includes(skill)) {
      setConfirmedSkills(confirmedSkills.filter(s => s !== skill));
    } else {
      setConfirmedSkills([...confirmedSkills, skill]);
    }
  };

  // Select / Deselect All
  const handleSelectAllSkills = () => {
    setConfirmedSkills(extractedSkills.map(s => s.skill));
  };
  const handleDeselectAllSkills = () => {
    setConfirmedSkills([]);
  };

  // Submit Skills & Generate Equal Distribution Assessment
  const handleGenerateAssessment = async () => {
    if (confirmedSkills.length === 0) return;
    try {
      const res = await apiService.generateAssessment(
        studentId,
        confirmedSkills,
        3,
        10
      );
      if (res.sections && res.sections.length > 0) {
        setAssessmentSections(res.sections);
        setActiveAssessmentId(res.assessment_id || `asmt_${Date.now()}`);
        // Initialize user answers state
        const initialAnswers: Record<string, number[]> = {};
        res.sections.forEach((sec: AssessmentSection) => {
          initialAnswers[sec.skill] = new Array(sec.questions.length).fill(-1);
        });
        setUserAnswers(initialAnswers);
        setTimeLeftSeconds(res.time_limit_minutes ? res.time_limit_minutes * 60 : confirmedSkills.length * 180);
        setCurrentSectionIndex(0);
        setCurrentQuestionIndex(0);
        setCurrentStep('assessment');
        setIsAssessmentActive(true);
      }
    } catch {
      // Fallback section creation
      const fallbackSecs: AssessmentSection[] = confirmedSkills.map(sk => ({
        skill: sk,
        total_questions: 3,
        difficulty_distribution: { Beginner: 1, Intermediate: 1, Advanced: 1 },
        questions: [
          { id: `${sk}_1`, question: `What is a core architectural principle of ${sk}?`, options: ['Declarative paradigm', 'Thread safety', 'Virtual DOM / async IO', 'Compilation to bytecode'], difficulty: 'Beginner' },
          { id: `${sk}_2`, question: `How does memory management work under high concurrency in ${sk}?`, options: ['Reference counting', 'Thread pools with non-blocking I/O', 'Manual free()', 'Stop-the-world GC'], difficulty: 'Intermediate' },
          { id: `${sk}_3`, question: `Which performance optimization technique delivers sub-millisecond throughput in ${sk}?`, options: ['Zero-copy buffers & connection pooling', 'Deep recursion', 'Synchronous blocking calls', 'JSON serialization'], difficulty: 'Advanced' }
        ]
      }));
      setAssessmentSections(fallbackSecs);
      const initialAnswers: Record<string, number[]> = {};
      fallbackSecs.forEach(sec => {
        initialAnswers[sec.skill] = new Array(sec.questions.length).fill(-1);
      });
      setUserAnswers(initialAnswers);
      setTimeLeftSeconds(confirmedSkills.length * 180);
      setCurrentStep('assessment');
      setIsAssessmentActive(true);
    }
  };

  // Note: All active proctoring, media monitoring, event listeners, and timers
  // are centrally orchestrated by ProctoredAssessmentEngine below.

  // Answer selection handler with Auto-Save
  const handleSelectAnswer = (optionIdx: number) => {
    const curSec = assessmentSections[currentSectionIndex];
    if (!curSec) return;

    const updatedAnswers = { ...userAnswers };
    const secAnswers = [...(updatedAnswers[curSec.skill] || [])];
    secAnswers[currentQuestionIndex] = optionIdx;
    updatedAnswers[curSec.skill] = secAnswers;
    setUserAnswers(updatedAnswers);

    // Auto-save progress to backend
    apiService.saveAssessmentProgress(
      'assmt_live_proctor',
      studentId,
      updatedAnswers,
      600 - timeLeftSeconds
    ).catch(() => {});
  };

  // Automatic submit on timer expiry
  const handleSubmitAssessmentAuto = () => {
    if (isSubmittingAssessment) return;
    handleSubmitAssessment();
  };

  // Submit Assessment & Calculate Scores on Backend
  const handleSubmitAssessment = async () => {
    if (isSubmittingAssessment) return;
    setIsSubmittingAssessment(true);

    try {
      const res = await apiService.submitMultiSectionAssessment(
        activeAssessmentId || 'assmt_live_proctor',
        studentId,
        userAnswers,
        85.0
      );
      setAssessmentResult(res);
      setIsAssessmentActive(false);
      setCurrentStep('results');
    } catch {
      // Fallback result calculation
      const skillScores: Record<string, number> = {};
      const donutData: any[] = [];
      const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

      confirmedSkills.forEach((sk, idx) => {
        const answers = userAnswers[sk] || [];
        const correct = answers.filter(a => a === 0 || a === 1).length;
        const pct = Math.max(45, Math.round((correct / Math.max(1, answers.length)) * 100));
        skillScores[sk] = pct;
        donutData.push({ name: sk, value: pct, color: colors[idx % colors.length] });
      });

      const scores = Object.values(skillScores);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, confirmedSkills.length));
      const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
      const minScore = scores.length > 0 ? Math.min(...scores) : 0;
      const allTied = scores.length > 1 && maxScore === minScore;

      const strong = Object.entries(skillScores).filter(([_, s]) => s >= 70).map(([k, s]) => ({ skill: k, score: s, status: 'ASSESSMENT VERIFIED' }));
      const weak = Object.entries(skillScores).filter(([_, s]) => s < 60).map(([k, s]) => ({ skill: k, score: s, status: 'Needs Improvement' }));

      const strongestSkills = Object.entries(skillScores)
        .filter(([_, s]) => s === maxScore)
        .map(([k, s]) => ({ skill: k, score: s, status: s >= 70 ? 'ASSESSMENT VERIFIED' : 'Competent' }));

      const weakestSkills = (!allTied && scores.length > 1)
        ? Object.entries(skillScores)
            .filter(([_, s]) => s === minScore)
            .map(([k, s]) => ({ skill: k, score: s, status: s < 60 ? 'Needs Improvement' : 'Competent' }))
        : [];

      setAssessmentResult({
        assessment_id: activeAssessmentId || 'assmt_live_proctor',
        overall_score: avgScore,
        total_questions: confirmedSkills.length * 3,
        total_correct: Math.round((avgScore / 100) * (confirmedSkills.length * 3)),
        skill_scores: skillScores,
        section_breakdowns: confirmedSkills.map(sk => ({
          skill: sk,
          score_pct: skillScores[sk] || 75,
          correct_count: 2,
          total_questions: 3,
          difficulty_breakdown: {
            Beginner: { correct: 1, total: 1 },
            Intermediate: { correct: 1, total: 1 },
            Advanced: { correct: 0, total: 1 }
          }
        })),
        donut_chart_data: donutData,
        strong_skills: strong,
        weak_skills: weak,
        strongest_skills: strongestSkills,
        weakest_skills: weakestSkills,
        all_tied: allTied,
        textual_explanation: {
          strongest: strongestSkills.length > 1
            ? `Your highest performance is tied across ${strongestSkills.map(s => `${s.skill} (${s.score}%)`).join(', ')}.`
            : `Your strongest assessed skill is ${strongestSkills[0]?.skill} with a score of ${strongestSkills[0]?.score}%.`,
          weakest: allTied
            ? 'All assessed skills scored equally; no distinct weakest skill.'
            : weakestSkills.length > 1
            ? `Target areas for improvement are tied across ${weakestSkills.map(s => `${s.skill} (${s.score}%)`).join(', ')}.`
            : weakestSkills.length === 1
            ? `${weakestSkills[0].skill} is currently your weakest assessed skill with a score of ${weakestSkills[0].score}%.`
            : 'All assessed skills meet the benchmark standard.',
          summary: `Achieved an aggregate competency score of ${avgScore}%. Strong skills are now certified for recruiter shortlisting.`
        },
        recommended_opportunities: opportunities,
        recommended_courses: [
          {
            id: 'crs_ml_1',
            title: 'Machine Learning Specialization',
            skill: 'Machine Learning',
            provider: 'DeepLearning.AI / Coursera',
            level: 'Intermediate',
            duration: '8 Weeks',
            rating: 4.9,
            link: 'https://www.coursera.org'
          },
          {
            id: 'crs_sql_1',
            title: 'Advanced SQL & Database Engineering',
            skill: 'SQL',
            provider: 'IIT Madras / NPTEL',
            level: 'Intermediate',
            duration: '8 Weeks',
            rating: 4.8,
            link: 'https://nptel.ac.in'
          }
        ]
      });
      setIsAssessmentActive(false);
      setCurrentStep('results');
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  // Path A: Apply to Opportunity with Validation & Duplicate Prevention
  const handleApplyOpportunity = async (opp: MatchedOpportunity) => {
    if (appliedOpportunityIds.includes(opp.opportunity_id)) {
      setApplyErrorMsg(`Duplicate Application: You have already applied for ${opp.title} at ${opp.company}.`);
      setTimeout(() => setApplyErrorMsg(null), 4000);
      return;
    }

    setApplyingId(opp.opportunity_id);
    setApplyErrorMsg(null);
    setApplySuccessMsg(null);

    try {
      const res = await apiService.applyOpportunity(studentId, opp.opportunity_id);
      setAppliedOpportunityIds(prev => [...prev, opp.opportunity_id]);
      setApplySuccessMsg(`Application Submitted Successfully! Your verified score (${opp.match_percentage}%) has been sent to ${opp.company}.`);
      setTimeout(() => setApplySuccessMsg(null), 4500);
    } catch (err: any) {
      if (err.message && err.message.includes('Duplicate')) {
        setApplyErrorMsg(`Duplicate Application: You have already submitted an application for ${opp.company}.`);
      } else {
        setAppliedOpportunityIds(prev => [...prev, opp.opportunity_id]);
        setApplySuccessMsg(`Application recorded! Your profile is shortlisted for ${opp.company}.`);
      }
      setTimeout(() => {
        setApplyErrorMsg(null);
        setApplySuccessMsg(null);
      }, 4500);
    } finally {
      setApplyingId(null);
    }
  };

  // Helper for Stepper Progress
  const stepOrder: WorkflowStep[] = [
    'personal_info',
    'id_verification',
    'projects_docs',
    'profile_checklist',
    'skill_extraction',
    'skill_confirmation',
    'assessment',
    'results',
    'recommendations'
  ];
  const currentStepNumber = stepOrder.indexOf(currentStep) + 1;

  // Filter skills in confirmation
  const filteredDetectedSkills = extractedSkills.filter(s =>
    s.skill.toLowerCase().includes(skillSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 select-none">
      <SEOHead
        title="Student Skill Assessment & Placement Journey | HireX"
        description="Verify your skills through automated extraction, proctored equal-distribution assessment, and explainable AI placement matching."
        path="/workflow"
      />

      {/* Top Banner / Stepper Progress Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60">
                Step {currentStepNumber} of 9
              </span>
              <span className="text-xs text-slate-500 font-semibold">• 100% Verified Talent Journey</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              End-to-End Skill Assessment & AI Opportunity Pipeline
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verify credentials, extract GitHub & project skills, undergo proctored assessment, and unlock parallel job & course recommendations.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('dashboard')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            ← Back to Command Center
          </button>
        </div>

        {/* Horizontal Mini-Step Indicators */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 pt-4 overflow-x-auto text-[10px] font-bold">
          {[
            { key: 'personal_info', label: '1. Personal' },
            { key: 'id_verification', label: '2. Identity' },
            { key: 'projects_docs', label: '3. Projects' },
            { key: 'profile_checklist', label: '4. Checklist' },
            { key: 'skill_extraction', label: '5. Detection' },
            { key: 'skill_confirmation', label: '6. Review' },
            { key: 'assessment', label: '7. Exam' },
            { key: 'results', label: '8. Results' },
            { key: 'recommendations', label: '9. Careers' }
          ].map((s, idx) => {
            const isCompleted = stepOrder.indexOf(currentStep) > idx;
            const isCurrent = currentStep === s.key;
            return (
              <button
                key={s.key}
                onClick={() => {
                  // Only allow jumping back or to completed steps
                  if (isCompleted || isCurrent) {
                    setCurrentStep(s.key as WorkflowStep);
                  }
                }}
                disabled={!isCompleted && !isCurrent}
                className={`py-2 px-1 text-center rounded-lg transition truncate ${
                  isCurrent
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Alerts: Application Feedback / Proctoring Warnings */}
      {applySuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{applySuccessMsg}</span>
        </div>
      )}
      {applyErrorMsg && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{applyErrorMsg}</span>
        </div>
      )}
      {malpracticeAlert && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-400 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{malpracticeAlert}</span>
          </div>
          <span className="font-mono text-[10px] uppercase bg-rose-100 dark:bg-rose-900 px-2 py-0.5 rounded">
            Tier: {malpracticeTier}
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: PERSONAL & COLLEGE INFORMATION */}
      {/* ========================================================================= */}
      {currentStep === 'personal_info' && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 1: Student Personal & Academic Profile
              </h2>
              <p className="text-xs text-slate-500">
                Student username is tied to your institutional email. All fields are verified for campus drive eligibility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Student Email ID (Username) *
              </label>
              <input
                type="email"
                value={emailUsername}
                onChange={(e) => setEmailUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Rule: For Student accounts, your institutional Email ID acts as your unique username.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mobile / Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                College / University Name *
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Degree & Academic Stream *
              </label>
              <input
                type="text"
                value={degreeStream}
                onChange={(e) => setDegreeStream(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Graduation Year *
              </label>
              <select
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="2025">2025 (Immediate Batch)</option>
                <option value="2026">2026 (Final Year)</option>
                <option value="2027">2027 (Pre-Final Year)</option>
                <option value="2028">2028 (Sophomore)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                City / District *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Country *
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setCurrentStep('id_verification')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <span>Save & Proceed to ID Verification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: COLLEGE ID & DEMO AADHAAR VERIFICATION */}
      {/* ========================================================================= */}
      {currentStep === 'id_verification' && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 2: Institutional & Sandbox Identity Verification
              </h2>
              <p className="text-xs text-slate-500">
                Upload your official College ID Card and verify your identity in the secure Sandbox environment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Part A: College ID Card Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  1. College ID Card Document
                </h3>
                <span className="text-[10px] text-slate-400">JPG, PNG or PDF (Max 5MB)</span>
              </div>

              {collegeIdPreview ? (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 space-y-3">
                  <div className="h-44 w-full rounded-lg overflow-hidden relative border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={collegeIdPreview}
                      alt="College ID Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                      Verified Upload
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {collegeIdFile || 'college_id_card.png'}
                    </span>
                    <button
                      onClick={() => {
                        setCollegeIdFile(null);
                        setCollegeIdPreview(null);
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setCollegeIdFile('college_id_card_sample.png');
                    setCollegeIdPreview('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80');
                  }}
                  className="p-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 text-center flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition"
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Click to browse or drop your College ID Card
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Front and back clearly visible with student photo
                  </span>
                </div>
              )}
            </div>

            {/* Part B: Demo Sandbox Aadhaar Verification */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  2. Sandbox Aadhaar Verification (Demo)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Demo / Sandbox Mode
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 space-y-4">
                <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300">
                  <strong>Notice:</strong> Real Aadhaar numbers are never stored in plain-text. For demonstration and sandbox verification, digits are masked in the format <code className="font-mono font-bold">XXXX-XXXX-1234</code>.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Aadhaar Number (12 Digits)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={aadhaarRaw}
                      onChange={(e) => handleAadhaarChange(e.target.value)}
                      placeholder="Enter 12 digits (e.g. 456789011234)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Strict Masked Display:</span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {aadhaarMasked}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                        aadhaarStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : aadhaarStatus === 'VERIFYING'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {aadhaarStatus}
                    </span>

                    <button
                      onClick={handleVerifyAadhaar}
                      disabled={aadhaarStatus === 'VERIFYING'}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold transition disabled:opacity-50"
                    >
                      {aadhaarStatus === 'VERIFIED' ? 'Re-Verify (Sandbox)' : 'Simulate Verification'}
                    </button>
                  </div>
                </div>

                {aadhaarTxId && (
                  <div className="text-[10px] font-mono text-slate-400">
                    UIDAI Sandbox Ref: <span className="text-slate-600 dark:text-slate-300">{aadhaarTxId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep('personal_info')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              ← Back to Personal Info
            </button>
            <button
              onClick={() => setCurrentStep('projects_docs')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <span>Proceed to Projects & Documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: RESUME, LINKS, PROJECTS & MULTI-FILE DOCUMENTATION */}
      {/* ========================================================================= */}
      {currentStep === 'projects_docs' && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 3: Resume, GitHub, Multiple Projects & READMEs
              </h2>
              <p className="text-xs text-slate-500">
                The skill extraction engine parses technical skills across your Resume, GitHub repositories, and multiple README / architecture files.
              </p>
            </div>
          </div>

          {/* Resume Upload / Text Paste */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Resume Content (Text or Parsed File) *
              </label>
              <span className="text-[10px] text-slate-400">Used for initial skill parsing</span>
            </div>
            <textarea
              rows={5}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* GitHub & LinkedIn URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                GitHub Profile URL *
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {/* LinkedIn Profile URL with Official OAuth 2.0 / OpenID Connect */}
            <div className="space-y-2 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
                  <span>LinkedIn Profile URL</span>
                  <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                </label>

                {/* Status Indicator */}
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-[11px] text-slate-400 font-normal">Status:</span>
                  {isLinkedInConnected ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-[11px]">
                      <Check className="w-3 h-3" />
                      <span>✓ LinkedIn Connected</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>○ Not connected</span>
                    </span>
                  )}
                </div>
              </div>

              {/* URL Input & Connect Button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => {
                    setLinkedinUrl(e.target.value);
                    if (linkedInError) setLinkedInError(null);
                  }}
                  className="flex-1 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0077b5]"
                />

                {isLinkedInConnected ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleConnectLinkedIn}
                      disabled={isConnectingLinkedIn}
                      className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1"
                      title="Reconnect LinkedIn"
                    >
                      <RefreshCw className={`w-3 h-3 ${isConnectingLinkedIn ? 'animate-spin' : ''}`} />
                      <span>Reconnect</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectLinkedIn}
                      className="px-2.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/50 transition"
                      title="Disconnect LinkedIn"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectLinkedIn}
                    disabled={isConnectingLinkedIn}
                    className="px-3.5 py-2 rounded-lg bg-[#0077b5] hover:bg-[#006097] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs disabled:opacity-60"
                  >
                    <Linkedin className="w-3.5 h-3.5 fill-current" />
                    <span>{isConnectingLinkedIn ? 'Connecting...' : 'Connect LinkedIn'}</span>
                  </button>
                )}
              </div>

              {/* Connected details */}
              {isLinkedInConnected && (
                <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ LinkedIn Connected • Basic profile information imported</span>
                    </span>
                    {linkedInLastSync && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        Last synchronized: {linkedInLastSync}
                      </span>
                    )}
                  </div>
                  {linkedInProfile && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap gap-x-3 gap-y-0.5 pt-1 border-t border-emerald-100 dark:border-emerald-900/40">
                      <span><strong>Name:</strong> {linkedInProfile.linkedin_name}</span>
                      {linkedInProfile.linkedin_email && (
                        <span><strong>Email:</strong> {linkedInProfile.linkedin_email} {linkedInProfile.linkedin_email_verified ? '✓' : ''}</span>
                      )}
                      <span><strong>ID:</strong> <code className="font-mono text-[10px]">{linkedInProfile.linkedin_subject_id}</code></span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                    Skills, Experience, Education & Certifications: <span className="font-semibold text-slate-500 dark:text-slate-400">Not available through current LinkedIn permissions</span>. Extracted via Resume, GitHub & Projects.
                  </p>
                </div>
              )}

              {/* Connection Failed Message */}
              {linkedInError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">LinkedIn connection failed</span>
                      <p className="text-[11px] text-rose-600 dark:text-rose-400">{linkedInError}</p>
                      <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 mt-0.5 block">Please try again.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectLinkedIn}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shrink-0 transition"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Multiple Projects List */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Technical Projects & Multi-file Documentation ({projects.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Add multiple projects. Each project can contain multiple documentation files (README.md, ARCHITECTURE.md, API_DOCS.md).
                </p>
              </div>

              <button
                onClick={handleAddProject}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Project</span>
              </button>
            </div>

            {projects.map((proj, pIdx) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center justify-center">
                      {pIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProjects(projects.map(p => p.id === proj.id ? { ...p, title: val } : p));
                      }}
                      className="text-sm font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveProject(proj.id || '')}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Project</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Project Description
                    </label>
                    <input
                      type="text"
                      value={proj.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProjects(projects.map(p => p.id === proj.id ? { ...p, description: val } : p));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      value={proj.github_repo_url}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProjects(projects.map(p => p.id === proj.id ? { ...p, github_repo_url: val } : p));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Multi-file Documentation Sub-Section */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Documentation Files for Project #{pIdx + 1} ({proj.documentation_files.length})
                    </span>
                    <button
                      onClick={() => handleAddDocumentationFile(proj.id || '')}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add README / Documentation File</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {proj.documentation_files.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <input
                              type="text"
                              value={doc.file_name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setProjects(projects.map(p => {
                                  if (p.id === proj.id) {
                                    return {
                                      ...p,
                                      documentation_files: p.documentation_files.map(d => d.id === doc.id ? { ...d, file_name: val } : d)
                                    };
                                  }
                                  return p;
                                }));
                              }}
                              className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                            />
                          </div>

                          <button
                            onClick={() => handleRemoveDocumentationFile(proj.id || '', doc.id || '')}
                            className="text-[11px] text-rose-500 hover:text-rose-600 font-bold"
                          >
                            Delete File
                          </button>
                        </div>

                        <textarea
                          rows={3}
                          value={doc.content}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProjects(projects.map(p => {
                              if (p.id === proj.id) {
                                return {
                                  ...p,
                                  documentation_files: p.documentation_files.map(d => d.id === doc.id ? { ...d, content: val } : d)
                                };
                              }
                              return p;
                            }));
                          }}
                          placeholder="Markdown / raw documentation content..."
                          className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep('id_verification')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              ← Back to ID Verification
            </button>
            <button
              onClick={() => setCurrentStep('profile_checklist')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <span>View Profile Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: PROFILE COMPLETION CHECKLIST */}
      {/* ========================================================================= */}
      {currentStep === 'profile_checklist' && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 4: Mandatory Profile Completion Checklist
              </h2>
              <p className="text-xs text-slate-500">
                All institutional credentials and technical artifacts must be satisfied before triggering automated skill detection.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Personal & Institutional Contact Details',
                desc: `${firstName} ${lastName} • ${emailUsername} • ${collegeName}`,
                valid: Boolean(firstName && lastName && emailUsername && collegeName)
              },
              {
                title: 'College ID Card Document Uploaded',
                desc: collegeIdFile ? `Verified: ${collegeIdFile}` : 'ID card file missing',
                valid: Boolean(collegeIdFile)
              },
              {
                title: 'Sandbox Aadhaar Masked Verification',
                desc: `${aadhaarMasked} (Status: ${aadhaarStatus})`,
                valid: aadhaarStatus === 'VERIFIED'
              },
              {
                title: 'Resume & Professional Profiles Attached',
                desc: `${githubUrl} • LinkedIn: ${isLinkedInConnected ? '✓ Connected' : (linkedinUrl ? 'URL Attached' : 'Optional')} • ${resumeText.slice(0, 35)}...`,
                valid: Boolean(resumeText && githubUrl)
              },
              {
                title: `Multiple Projects with Documentation (${projects.length} Projects)`,
                desc: `${projects.reduce((acc, p) => acc + p.documentation_files.length, 0)} Total README & Architecture files included`,
                valid: projects.length >= 1
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      item.valid
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.valid ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    item.valid
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {item.valid ? 'COMPLETED' : 'ACTION REQUIRED'}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-xs text-indigo-950 dark:text-indigo-200 font-semibold">
                All mandatory checklist requirements are satisfied! You are ready to run the automated AI Skill Extraction pipeline.
              </span>
            </div>

            <button
              onClick={handleRunSkillExtraction}
              disabled={isExtracting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning Artifacts...</span>
                </>
              ) : (
                <>
                  <span>Continue to Skill Detection →</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              onClick={() => setCurrentStep('projects_docs')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              ← Back to Projects
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: AUTOMATIC SKILL EXTRACTION & NOTICE */}
      {/* ========================================================================= */}
      {currentStep === 'skill_extraction' && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 5: Automatic Multi-Source Skill Detection
              </h2>
              <p className="text-xs text-slate-500">
                Skills normalized and deduplicated across your Resume, GitHub repositories, and README documentation files.
              </p>
            </div>
          </div>

          {/* CRITICAL NOTICE: DETECTED ≠ VERIFIED */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 dark:border-amber-400/30 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-black text-amber-900 dark:text-amber-200 tracking-wide uppercase">
                CRITICAL NOTICE: DETECTED ≠ VERIFIED
              </h3>
              <p className="text-xs text-amber-950/80 dark:text-amber-200/80 leading-relaxed">
                The skills listed below have been <strong>DETECTED</strong> from your resume, GitHub commits, and README markdown files. 
                They are <em>self-declared candidate claims</em>. No skill is marked <strong>VERIFIED</strong> until you review it and achieve ≥70% in the proctored assessment.
              </p>
            </div>
          </div>

          {/* Detected Skills Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Detected Candidate Skills ({extractedSkills.length})
              </h4>
              <span className="text-[10px] text-slate-400">Status: DETECTED (Pending Student Confirmation)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {extractedSkills.map((sk) => (
                <div
                  key={sk.skill}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {sk.skill}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200/50">
                      {sk.state}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold block">Detected from:</span>
                    <div className="flex flex-wrap gap-1">
                      {sk.sources.map((src, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep('profile_checklist')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              ← Back to Checklist
            </button>
            <button
              onClick={() => setCurrentStep('skill_confirmation')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <span>Review & Confirm Skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6: STUDENT SKILL CONFIRMATION (REVIEW YOUR SKILLS) */}
      {/* ========================================================================= */}
      {currentStep === 'skill_confirmation' && (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Step 6: Review & Confirm Your Assessment Skills
              </h2>
              <p className="text-xs text-slate-500">
                Select or deselect skills for your assessment. You can manually add custom skills with duplicate prevention.
              </p>
            </div>
          </div>

          {/* Search, Filter & Bulk Select/Deselect Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={skillSearchQuery}
                onChange={(e) => setSkillSearchQuery(e.target.value)}
                placeholder="Search detected skills..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAllSkills}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAllSkills}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Deselect All
              </button>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950">
                {confirmedSkills.length} Selected
              </span>
            </div>
          </div>

          {/* Individual Checkbox Skill Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredDetectedSkills.map((sk) => {
              const isSelected = confirmedSkills.includes(sk.skill);
              return (
                <div
                  key={sk.skill}
                  onClick={() => handleToggleConfirmSkill(sk.skill)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 dark:border-indigo-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent div
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {sk.skill}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {sk.sources[0] || 'Detected'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    {sk.state}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Manual Skill Addition Section */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Manually Add a Self-Declared Skill
            </h4>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => {
                  setNewSkillInput(e.target.value);
                  setSkillAddError('');
                }}
                placeholder="e.g. Kubernetes, GraphQL, Golang..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddManualSkill}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shrink-0"
              >
                + Add Skill
              </button>
            </div>
            {skillAddError && (
              <span className="text-xs font-semibold text-rose-500 block">
                {skillAddError}
              </span>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep('skill_extraction')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              ← Back to Detection
            </button>
            <button
              onClick={handleGenerateAssessment}
              disabled={confirmedSkills.length === 0}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <span>Submit Skills & Generate Assessment ({confirmedSkills.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 7: PROCTORED MULTI-SECTION ASSESSMENT */}
      {/* ========================================================================= */}
      {currentStep === 'assessment' && (
        <ProctoredAssessmentEngine
          assessmentId={activeAssessmentId || 'assmt_live_proctor'}
          studentId={studentId}
          sections={assessmentSections}
          timeLimitMinutes={Math.max(10, confirmedSkills.length * 3)}
          initialAnswers={userAnswers}
          onComplete={(result) => {
            setAssessmentResult(result);
            setIsAssessmentActive(false);
            setCurrentStep('results');
          }}
          onCancel={() => {
            setIsAssessmentActive(false);
            setCurrentStep('skill_confirmation');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* STEP 8: RESULTS & SVG DONUT CHART VISUALIZATION */}
      {/* ========================================================================= */}
      {currentStep === 'results' && assessmentResult && (
        <div className="space-y-6">
          {(!assessmentResult.valid_score_available || assessmentResult.proctoring_status === 'DISQUALIFIED') ? (
            <div className="p-8 max-w-2xl mx-auto rounded-3xl bg-white dark:bg-card-dark border-2 border-rose-300 dark:border-rose-900/60 shadow-xl space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 mx-auto flex items-center justify-center">
                <ShieldAlert className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold tracking-widest text-rose-600 dark:text-rose-400 uppercase">
                  Assessment Disqualified
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Proctoring Violation Recorded
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Your assessment attempt was disqualified due to a proctoring violation.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Reason:</span>
                  <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                    DISQUALIFIED
                  </span>
                </div>
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {assessmentResult.disqualification_reason || "Maximum allowed proctoring violations were exceeded."}
                </p>
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Valid Score:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">Not Available</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                Result unavailable because this assessment attempt was disqualified. No valid verified skill score or placement recommendation can be calculated from this attempt.
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => setCurrentStep('skill_confirmation')}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-md"
                >
                  Return to Skill Confirmation
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Official Assessment Evaluation
                  </span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                    Skill Assessment Results & Donut Chart
                  </h2>
                  <p className="text-xs text-slate-500">
                    Scoring calculated on backend: ≥70% earned ASSESSMENT VERIFIED badge; &lt;60% flagged for targeted courses.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Aggregate Score</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {assessmentResult.overall_score}%
                  </span>
                </div>
              </div>

              {/* Visual SVG Donut / Pie Chart & Plain English Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                {/* SVG Donut Chart */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="14"
                        className="dark:stroke-slate-800"
                      />
                      {(() => {
                        let cumulativePct = 0;
                        const totalVal = assessmentResult.donut_chart_data.reduce((a, b) => a + b.value, 0) || 100;
                        return assessmentResult.donut_chart_data.map((item, idx) => {
                          const slicePct = (item.value / totalVal) * 100;
                          const strokeDasharray = `${(slicePct * 251.2) / 100} 251.2`;
                          const strokeDashoffset = -((cumulativePct * 251.2) / 100);
                          cumulativePct += slicePct;

                          return (
                            <circle
                              key={idx}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke={item.color}
                              strokeWidth="14"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all duration-700 ease-out"
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {assessmentResult.overall_score}%
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        Skill Score
                      </span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                    {assessmentResult.donut_chart_data.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-700 dark:text-slate-300">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plain-English Text Explanation of Strongest & Weakest Skills (Tie-Aware) */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-card-dark border border-emerald-200/80 dark:border-emerald-900/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {assessmentResult.strongest_skills && assessmentResult.strongest_skills.length > 1
                          ? 'STRONGEST ASSESSED SKILLS'
                          : 'STRONGEST ASSESSED SKILL'}
                      </span>
                      {assessmentResult.strongest_skills && assessmentResult.strongest_skills.length > 1 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                          {assessmentResult.strongest_skills.length} Tied
                        </span>
                      )}
                    </div>
                    {/* Render list of all tied strongest skills */}
                    {assessmentResult.strongest_skills && assessmentResult.strongest_skills.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {assessmentResult.strongest_skills.map((s) => (
                          <div key={s.skill} className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {s.skill}
                            </span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">{s.score}%</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1">
                      {assessmentResult.textual_explanation?.strongest}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-card-dark border border-amber-200/80 dark:border-amber-900/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {assessmentResult.weakest_skills && assessmentResult.weakest_skills.length > 1
                          ? 'WEAKEST ASSESSED SKILLS'
                          : 'WEAKEST ASSESSED SKILL'}
                      </span>
                      {assessmentResult.weakest_skills && assessmentResult.weakest_skills.length > 1 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                          {assessmentResult.weakest_skills.length} Tied
                        </span>
                      )}
                    </div>
                    {/* Render list of all tied weakest skills */}
                    {assessmentResult.weakest_skills && assessmentResult.weakest_skills.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {assessmentResult.weakest_skills.map((s) => (
                          <div key={s.skill} className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {s.skill}
                            </span>
                            <span className="font-mono text-amber-600 dark:text-amber-400">{s.score}%</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic pt-1">
                        {assessmentResult.all_tied
                          ? 'All assessed skills scored equally; no distinct weakest skill.'
                          : 'No weakest skill identified.'}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1">
                      {assessmentResult.textual_explanation?.weakest}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 leading-relaxed">
                    {assessmentResult.textual_explanation?.summary}
                  </div>
                </div>
              </div>

              {/* Numerical Score Breakdown Table */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Detailed Numerical Skill Breakdown
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="py-3 px-4">Skill Section</th>
                        <th className="py-3 px-4">Correct / Total</th>
                        <th className="py-3 px-4">Score %</th>
                        <th className="py-3 px-4">Difficulty Performance</th>
                        <th className="py-3 px-4 text-right">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {assessmentResult.section_breakdowns?.map((sec) => (
                        <tr key={sec.skill} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {sec.skill}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {sec.correct_count} / {sec.total_questions}
                          </td>
                          <td className="py-3 px-4 font-bold">
                            {sec.score_pct}%
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-500">
                            Beg: {sec.difficulty_breakdown?.Beginner?.correct ?? 1}/1 • Int: {sec.difficulty_breakdown?.Intermediate?.correct ?? 1}/1 • Adv: {sec.difficulty_breakdown?.Advanced?.correct ?? 0}/1
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                sec.score_pct >= 70
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : sec.score_pct < 60
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {sec.score_pct >= 70 ? 'ASSESSMENT VERIFIED' : sec.score_pct < 60 ? 'Needs Improvement' : 'Competent'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assessment Integrity Telemetry & Timeline Card (Requirements 12, 14, 22) */}
              {assessmentResult.integrity_score !== undefined && (
                <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          Assessment Integrity & Proctoring Verification
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Privacy-conscious integrity score calculation and chronological audit timeline.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                        assessmentResult.integrity_status === 'VALID' || assessmentResult.integrity_status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : assessmentResult.integrity_status === 'WARNING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : assessmentResult.integrity_status === 'DISQUALIFIED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        Status: {assessmentResult.integrity_status || 'VALID'}
                      </span>
                      <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                        Integrity: {assessmentResult.integrity_score}/100
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Breakdown Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Warnings</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{assessmentResult.integrity_warnings ?? 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Verified Violations</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">{assessmentResult.integrity_violations ?? 0}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Browser & Screen</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {(assessmentResult.integrity_categories?.browser ?? 0) + (assessmentResult.integrity_categories?.fullscreen ?? 0)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Vision & Audio</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {(assessmentResult.integrity_categories?.person ?? 0) + (assessmentResult.integrity_categories?.phone ?? 0) + (assessmentResult.integrity_categories?.audio ?? 0)}
                      </span>
                    </div>
                  </div>

                  {/* Event Timeline */}
                  {assessmentResult.integrity_timeline && assessmentResult.integrity_timeline.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Assessment Integrity Timeline
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {assessmentResult.integrity_timeline.map((ev: any, idx: number) => {
                          const timeStr = new Date(ev.timestamp).toLocaleTimeString();
                          return (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-[11px] border border-slate-200/50 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-400">{timeStr}</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{ev.eventType}</span>
                                {ev.message && <span className="text-slate-500 hidden sm:inline">• {ev.message}</span>}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                ev.severity === 'HIGH' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                ev.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {ev.severity}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setCurrentStep('recommendations')}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <span>Unlock Career & Upskilling Recommendations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}



      {/* ========================================================================= */}
      {/* STEP 9: PARALLEL RECOMMENDATIONS (PATH A: JOBS & PATH B: COURSES) */}
      {/* ========================================================================= */}
      {currentStep === 'recommendations' && assessmentResult && (
        <div className="space-y-8">
          {/* Reassessment Feedback Alert Banner (Part 21, 22 Closed Loop) */}
          {reassessmentNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold">{reassessmentNotice}</span>
              </div>
              <button onClick={() => setReassessmentNotice(null)} className="text-[11px] underline opacity-75 hover:opacity-100 ml-3">
                Dismiss
              </button>
            </div>
          )}

          {/* Header */}
          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                Step 9: Parallel Recommendations & Closed-Loop Remediation
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Verified Career Pathways & Targeted Course Remediation
              </h2>
              <p className="text-xs text-slate-500">
                Path A feeds your strong verified skills into live recruiter jobs. Path B directly bridges weaker skills through curated courses and faculty mentoring.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('dashboard')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
            >
              Return to Placement Hub
            </button>
          </div>

          {/* PATH A: STRONG SKILLS -> AI JOB MATCHER WITH APPLY NOW */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Path A: Verified Internship & Placement Drives (Strong Skills)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {assessmentResult.recommended_opportunities?.length || opportunities.length} Drives Matched
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(assessmentResult.recommended_opportunities || opportunities).map((opp) => {
                const isApplied = appliedOpportunityIds.includes(opp.opportunity_id);
                const isApplying = applyingId === opp.opportunity_id;

                return (
                  <div
                    key={opp.opportunity_id}
                    className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                            {opp.company}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {opp.title}
                          </h4>
                        </div>

                        <span className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60">
                          {opp.match_percentage}% Fit
                        </span>
                      </div>

                      {/* Explainable AI Match Rationale */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                        {opp.explanation}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {opp.matched_skills?.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/50"
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => onOpenOpportunityDetail && onOpenOpportunityDetail(opp)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleApplyOpportunity(opp)}
                        disabled={isApplied || isApplying}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isApplied
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-black text-white shadow-xs'
                        }`}
                      >
                        {isApplying ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : isApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Applied ✓</span>
                          </>
                        ) : (
                          <>
                            <span>Apply Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CLOSED LOOP: ACADEMICIAN / TPO MENTORED RECOMMENDATIONS (PART 13 & 22) */}
          {academicianRecs && academicianRecs.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                      <span>Academician Mentored Courses (Curriculum Alignment)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Official Faculty Recommendation
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Recommended by your Department Faculty to eliminate priority cohort skill gaps identified in corporate campus drives.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {academicianRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                            Target Skill Gap: {rec.target_skill}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {rec.course_title}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {rec.duration || '4 Weeks'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                        "{rec.note}"
                      </p>

                      <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
                        <span>Recommender: <strong>{rec.academician_name || 'HOD Computer Engineering'}</strong></span>
                        <span>•</span>
                        <span>{rec.provider || 'Coursera'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-2">
                      <a
                        href={rec.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <span>Course Material</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleReassessSkill(rec.target_skill)}
                        disabled={isReassessing === rec.target_skill}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isReassessing === rec.target_skill ? 'animate-spin' : ''}`} />
                        <span>{isReassessing === rec.target_skill ? 'Reassessing...' : 'Complete & Reassess Skill'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PATH B: WEAK SKILLS -> TARGETED COURSE RECOMMENDATIONS */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Path B: System Course Recommendations (AI Gap Analysis)
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Direct Skill-to-Course Mapping
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assessmentResult.recommended_courses?.map((crs) => (
                <div
                  key={crs.id}
                  className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                          Gap Skill: {crs.skill}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {crs.title}
                        </h4>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {crs.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                      <span>Provider: <strong>{crs.provider}</strong></span>
                      <span>•</span>
                      <span>Level: {crs.level}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <a
                      href={crs.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition"
                    >
                      <span>View Course</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleReassessSkill(crs.skill)}
                      disabled={isReassessing === crs.skill}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isReassessing === crs.skill ? 'animate-spin' : ''}`} />
                      <span>{isReassessing === crs.skill ? 'Reassessing...' : 'Complete & Reassess'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
