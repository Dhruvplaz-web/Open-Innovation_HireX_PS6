import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, Plus, Users, Award, Clock, CheckCircle2, XCircle, 
  Sparkles, Search, Filter, ExternalLink, ArrowRight, ShieldCheck, 
  Building, BookOpen, AlertCircle, RefreshCw, Send, ChevronRight,
  TrendingUp, MessageSquare, Check, Eye, UserCheck, Star, Layers
} from 'lucide-react';
import { 
  Role, CollaborationProject, ProjectMilestone, ProjectEvidence, 
  ProjectJoinRequest, ProjectTeamMember, ProjectSponsorshipInterest 
} from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CollaborationHubViewProps {
  currentRole?: Role;
  onNavigateTab?: (tab: string) => void;
  onOpenAssessment?: () => void;
}

export const CollaborationHubView: React.FC<CollaborationHubViewProps> = ({
  currentRole = 'student',
  onNavigateTab,
  onOpenAssessment
}) => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'my-projects' | 'create' | 'scout' | 'analytics'>(
    currentRole === 'academician' ? 'my-projects' : currentRole === 'recruiter' ? 'scout' : 'browse'
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<CollaborationProject[]>([]);
  const [recommendedProjects, setRecommendedProjects] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<CollaborationProject | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinMessage, setJoinMessage] = useState<string>('');
  const [joinRole, setJoinRole] = useState<string>('Developer / ML Engineer');
  const [joiningProjectId, setJoiningProjectId] = useState<string | null>(null);

  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [evidenceTitle, setEvidenceTitle] = useState<string>('');
  const [evidenceDesc, setEvidenceDesc] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string>('');
  const [evidenceSkills, setEvidenceSkills] = useState<string>('Python, Machine Learning');

  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [evalStudentId, setEvalStudentId] = useState<string>('');
  const [evalStudentName, setEvalStudentName] = useState<string>('');
  const [evalSkills, setEvalSkills] = useState<string[]>(['Python', 'Machine Learning', 'FastAPI']);
  const [evalComments, setEvalComments] = useState<string>('Demonstrated high proficiency in core algorithms and API integrations.');
  const [evalGrade, setEvalGrade] = useState<string>('A+ (Distinction)');

  const [showSponsorshipModal, setShowSponsorshipModal] = useState<boolean>(false);
  const [sponsorMsg, setSponsorMsg] = useState<string>('');
  const [sponsorType, setSponsorType] = useState<string>('Technical Mentorship & Hiring Pipeline');

  // Create Project Form
  const [createForm, setCreateForm] = useState({
    title: '',
    project_type: 'Research Project' as any,
    problem_statement: '',
    description: '',
    research_area: 'Applied AI & Systems',
    domain: 'Computer Science & Engineering',
    required_skills: ['Python', 'Machine Learning', 'FastAPI'],
    preferred_skills: ['Docker', 'React'],
    max_team_size: 4,
    start_date: '2026-10-15',
    expected_end_date: '2026-12-30',
    difficulty_level: 'Intermediate' as any,
    expected_deliverables: 'Working prototype & REST API with full test coverage.',
    mentor_name: userProfile?.displayName || 'Dr. Rajesh Kulkarni',
    mentor_email: userProfile?.email || 'dr.kulkarni@jspmrscoe.edu.in',
    mentor_designation: 'Associate Professor & AI Lab Lead',
    department: 'Computer Engineering',
    institution: 'JSPM RSCOE, Pune'
  });

  const [skillTagInput, setSkillTagInput] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const studentId = userProfile?.uid || 'std_1';
      const [allProjRes, recProjRes, analyticsRes] = await Promise.all([
        apiService.getProjects(),
        currentRole === 'student' ? apiService.getRecommendedProjects(studentId) : Promise.resolve({ recommended_projects: [] }),
        currentRole === 'academician' 
          ? apiService.getAcademicianCollaborationAnalytics() 
          : currentRole === 'admin' 
          ? apiService.getAdminCollaborationAnalytics() 
          : Promise.resolve(null)
      ]);

      setProjects(allProjRes.projects || []);
      setRecommendedProjects(recProjRes.recommended_projects || []);
      if (analyticsRes) setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Failed to load collaboration hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRole]);

  // Handle Join Project
  const handleJoinProject = async () => {
    if (!joiningProjectId) return;
    try {
      const res = await apiService.joinProject(joiningProjectId, {
        role: joinRole,
        message: joinMessage
      });
      if (res.status === 'success') {
        showToast('Join request submitted to project mentor/academician!', 'success');
        setShowJoinModal(false);
        setJoinMessage('');
        loadData();
      } else {
        showToast(res.message || 'Failed to submit join request', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to join project', 'error');
    }
  };

  // Handle Submit Evidence
  const handleSubmitEvidence = async () => {
    if (!selectedProject) return;
    try {
      const res = await apiService.submitProjectEvidence(selectedProject.id, {
        student_id: userProfile?.uid || 'std_1',
        title: evidenceTitle,
        description: evidenceDesc || 'Verified milestone code deliverable and artifact documentation.',
        github_url: evidenceUrl
      });
      if (res.status === 'success') {
        showToast('Project evidence submitted for mentor review!', 'success');
        setShowEvidenceModal(false);
        setEvidenceTitle('');
        setEvidenceDesc('');
        setEvidenceUrl('');
        loadData();
      } else {
        showToast(res.message || 'Failed to submit evidence', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit evidence', 'error');
    }
  };

  // Handle Academician Evaluate Student Contribution
  const handleEvaluateStudent = async () => {
    if (!selectedProject || !evalStudentId) return;
    try {
      const res = await apiService.evaluateProjectContribution(selectedProject.id, {
        student_id: evalStudentId,
        skills_verified: evalSkills,
        grade: evalGrade,
        feedback: evalComments
      });
      if (res.status === 'success') {
        showToast(`Contribution evaluated! Verified skills directly credited to student's Skill Passport.`, 'success');
        setShowEvaluationModal(false);
        loadData();
      } else {
        showToast(res.message || 'Failed to record evaluation', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to evaluate', 'error');
    }
  };

  // Handle Recruiter Sponsorship / Interest
  const handleSponsorProject = async () => {
    if (!selectedProject) return;
    try {
      const res = await apiService.submitProjectSponsorshipInterest(selectedProject.id, {
        sponsorship_type: sponsorType,
        message: sponsorMsg,
        company_name: userProfile?.companyName || 'Barclays India Innovation Centre'
      });
      if (res.status === 'success') {
        showToast('Collaboration interest dispatched to academician lead!', 'success');
        setShowSponsorshipModal(false);
        setSponsorMsg('');
        loadData();
      } else {
        showToast(res.message || 'Failed to express interest', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit', 'error');
    }
  };

  // Handle Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.createAcademicianProject(createForm as any);
      if (res.status === 'success') {
        showToast('Collaboration Project created and live in campus hub!', 'success');
        setActiveTab('my-projects');
        loadData();
      } else {
        showToast(res.message || 'Failed to create project', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create project', 'error');
    }
  };

  // Handle Milestone Progress Update
  const handleUpdateMilestone = async (milestoneId: string, newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (!selectedProject) return;
    try {
      const res = await apiService.updateProjectMilestone(selectedProject.id, milestoneId, {
        status: newStatus
      });
      if (res.status === 'success') {
        showToast(`Milestone updated to ${newStatus}`, 'success');
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update milestone', 'error');
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.problem_statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.required_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'All' || p.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-75 hover:opacity-100 underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                Differentiating Pillar #2: Project & Research Hub
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Live Ecosystem
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Project & Research Collaboration Hub
            </h1>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Connects <strong className="text-slate-900 dark:text-white">Academicians</strong> (creating capstone & research challenges), <strong className="text-slate-900 dark:text-white">Students</strong> (producing verified project evidence), and <strong className="text-slate-900 dark:text-white">Industry Recruiters</strong> (scouting anonymized project talent & sponsoring R&D).
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentRole === 'academician' && (
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-sm transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Project</span>
              </button>
            )}

            {currentRole === 'recruiter' && (
              <button
                onClick={() => setActiveTab('scout')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Scout Project Talent</span>
              </button>
            )}

            <button
              onClick={loadData}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
              title="Refresh project feeds"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Closed Loop Visual Breadcrumb */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            1. Verified Skill
          </span>
          <ArrowRight className="w-3 h-3 shrink-0 text-slate-300" />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            2. Collaboration Project
          </span>
          <ArrowRight className="w-3 h-3 shrink-0 text-slate-300" />
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            3. Mentor Evaluation
          </span>
          <ArrowRight className="w-3 h-3 shrink-0 text-slate-300" />
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            4. Project Evidence Passport
          </span>
          <ArrowRight className="w-3 h-3 shrink-0 text-slate-300" />
          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            5. Incognito Talent Match
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-x-auto">
        <button
          onClick={() => { setActiveTab('browse'); setSelectedProject(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'browse'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Explore Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('my-projects'); setSelectedProject(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'my-projects'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>{currentRole === 'academician' ? 'My Managed Projects' : 'My Team Workspaces'}</span>
        </button>

        {currentRole === 'academician' && (
          <button
            onClick={() => { setActiveTab('create'); setSelectedProject(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}

        <button
          onClick={() => { setActiveTab('scout'); setSelectedProject(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'scout'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Project Talent Scouting</span>
        </button>

        <button
          onClick={() => { setActiveTab('analytics'); setSelectedProject(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Collaboration Analytics</span>
        </button>
      </div>

      {/* TAB 1: BROWSE PROJECTS (Student / Universal) */}
      {activeTab === 'browse' && !selectedProject && (
        <div className="space-y-6">
          {/* AI Recommended Projects Section (For Students) */}
          {currentRole === 'student' && recommendedProjects.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-slate-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>AI Recommended Research & Capstone Projects</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ranked by your verified skills, assessment scores, and targeted career role.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-300">
                  {recommendedProjects.length} Matched
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedProjects.map((rec) => {
                  const proj = rec.project;
                  return (
                    <div key={proj.id} className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-indigo-100 dark:border-indigo-900/60 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {proj.project_type}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {rec.match_score}% Match
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {proj.title}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {proj.problem_statement}
                        </p>

                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Matched Skills</span>
                          <div className="flex flex-wrap gap-1">
                            {rec.matched_skills?.map((s: string, idx: number) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                                ✓ {s}
                              </span>
                            ))}
                            {rec.missing_skills?.map((s: string, idx: number) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200">
                                Gap: {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">
                          Mentor: {proj.mentor_name.split(' ')[0]}
                        </span>
                        <button
                          onClick={() => setSelectedProject(proj)}
                          className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1"
                        >
                          <span>Workspace</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search project title, problem statement, required skills..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Project Types</option>
                <option value="Research Project">Research Project</option>
                <option value="Capstone Project">Capstone Project</option>
                <option value="Industry Project">Industry Project</option>
                <option value="Innovation Project">Innovation Project</option>
                <option value="Open Challenge">Open Challenge</option>
                <option value="Internship Project">Internship Project</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Recruiting">Recruiting Members</option>
                <option value="In Progress">Active / In Progress</option>
                <option value="Completed">Completed & Verified</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-semibold">
              Showing <strong>{filteredProjects.length}</strong> active projects
            </span>
          </div>

          {/* Projects Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((proj) => {
              const currentMembers = proj.team?.length || 0;
              const isFull = currentMembers >= proj.team_size;

              return (
                <div 
                  key={proj.id} 
                  className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-600 transition"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {proj.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        proj.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        proj.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                        'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {proj.problem_statement}
                      </p>
                    </div>

                    {/* Required skills */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">Required Skills</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proj.required_skills?.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar & Team Capacity */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>Milestones Progress:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{proj.progress_percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full" 
                          style={{ width: `${proj.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{currentMembers} / {proj.team_size} members</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentRole === 'student' && proj.status === 'ACTIVE' && !isFull && (
                        <button
                          onClick={() => {
                            setJoiningProjectId(proj.id);
                            setShowJoinModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition"
                        >
                          Join Team
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedProject(proj)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition flex items-center gap-1"
                      >
                        <span>Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PROJECT WORKSPACE DETAIL VIEW (When a project is selected) */}
      {selectedProject && (
        <div className="space-y-6">
          {/* Top Bar Back Action */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedProject(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              ← Back to Project Hub
            </button>

            <div className="flex items-center gap-2">
              {currentRole === 'academician' && (
                <button
                  onClick={() => setShowEvaluationModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Award className="w-4 h-4" />
                  <span>Evaluate Student Contribution</span>
                </button>
              )}

              {currentRole === 'student' && (
                <button
                  onClick={() => setShowEvidenceModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Project Evidence</span>
                </button>
              )}

              {currentRole === 'recruiter' && (
                <button
                  onClick={() => setShowSponsorshipModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Building className="w-4 h-4" />
                  <span>Express Sponsorship / Hiring Interest</span>
                </button>
              )}
            </div>
          </div>

          {/* Project Header Dossier */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {selectedProject.type}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {selectedProject.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedProject.id}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                  {selectedProject.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lead Mentor: <strong>{selectedProject.academician_name || 'Faculty Mentor'}</strong> • {selectedProject.department}
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {selectedProject.progress_percentage}%
                </span>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Overall Progress</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
              {selectedProject.problem_statement}
            </p>
          </div>

          {/* Main Workspace Layout: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Milestones & Project Deliverables */}
            <div className="lg:col-span-8 space-y-6">
              {/* Milestones Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Project Milestones & Deliverables Roadmap</span>
                </h3>

                <div className="space-y-3">
                  {(selectedProject.milestones || []).map((m, idx) => (
                    <div key={m.id || idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            Milestone {idx + 1}: {m.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            m.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                        {m.deliverable && (
                          <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                            Deliverable: {m.deliverable}
                          </p>
                        )}
                      </div>

                      {/* Status switch actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateMilestone(m.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                          >
                            Mark Done
                          </button>
                        )}
                        {m.status === 'NOT_STARTED' && (
                          <button
                            onClick={() => handleUpdateMilestone(m.id, 'IN_PROGRESS')}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submitted Project Evidence & Mentor Evaluations */}
              <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Verified Project Evidence & Evaluations</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Feeds directly to Skill Passport
                  </span>
                </div>

                <div className="space-y-3">
                  {(selectedProject.evidence_submissions || []).length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-2xl">
                      No project evidence uploaded yet. Team members can upload GitHub repos and execution logs.
                    </div>
                  ) : (
                    (selectedProject.evidence_submissions || []).map((ev: ProjectEvidence, idx: number) => (
                      <div key={ev.id || idx} className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{ev.title}</h4>
                            <p className="text-[11px] text-slate-500">{ev.description}</p>
                          </div>
                        </div>

                        {ev.github_url && (
                          <a 
                            href={ev.github_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-mono"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{ev.github_url}</span>
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Team Members & Industry Sponsors */}
            <div className="lg:col-span-4 space-y-6">
              {/* Participating Team Members (Anonymous Talent IDs for Recruiters) */}
              <div className="p-5 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Team Members ({selectedProject.team?.length || 0})
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Max: {selectedProject.team_size}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(selectedProject.team || []).map((tm: ProjectTeamMember, idx: number) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{currentRole === 'recruiter' ? (tm.talent_id || 'SB-TALENT-10482') : (tm.student_name || tm.talent_id)}</span>
                            {currentRole === 'recruiter' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-100 text-indigo-800">
                                Incognito
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500">{tm.role}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {(tm.verified_skills_awarded || []).map((sk: string, sidx: number) => (
                          <span key={sidx} className="px-1.5 py-0.2 rounded text-[9px] bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {sk}
                          </span>
                        ))}
                      </div>

                      {/* Recruiter direct invite action */}
                      {currentRole === 'recruiter' && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                          <button
                            onClick={() => {
                              showToast(`Talent invitation sent to ${tm.talent_id || 'SB-TALENT-10482'}!`, 'success');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Invite to Apply</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Industry Sponsorship & Collaboration Requests */}
              <div className="p-5 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                  Industry Collaboration & Sponsors
                </h3>

                {(selectedProject.sponsorship_interests || []).length === 0 ? (
                  <p className="text-[11px] text-slate-400">
                    No corporate sponsorship requests yet. Recruiters can express hiring and mentorship interest.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(selectedProject.sponsorship_interests || []).map((sp: ProjectSponsorshipInterest, idx: number) => (
                      <div key={idx} className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white">
                          <span>{sp.company}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800">
                            {sp.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{sp.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY PROJECTS (Workspaces) */}
      {activeTab === 'my-projects' && !selectedProject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {currentRole === 'academician' ? 'Managed Research & Capstone Cohorts' : 'My Active Team Workspaces'}
            </h3>
            {currentRole === 'academician' && (
              <button
                onClick={() => setActiveTab('create')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(proj => (
              <div key={proj.id} className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                        {proj.type}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-slate-500">{proj.domain} • {proj.difficulty_level}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {proj.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {proj.problem_statement}
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Progress</span>
                      <span className="font-bold">{proj.progress_percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${proj.progress_percentage}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Team: {proj.team?.length || 0} / {proj.team_size} members
                  </span>
                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CREATE PROJECT FORM (Academician) */}
      {activeTab === 'create' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs max-w-4xl mx-auto">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-indigo-600" />
              <span>Create Research or Capstone Collaboration Project</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Projects utilize the HireX normalized skill taxonomy. High-performing students will automatically receive AI project recommendations.
            </p>
          </div>

          <form onSubmit={handleCreateProject} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-based Crop Disease Detection, High-Throughput Matching Engine"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Type *
                </label>
                <select
                  value={createForm.project_type}
                  onChange={(e) => setCreateForm({ ...createForm, project_type: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Research Project">Research Project</option>
                  <option value="Capstone Project">Capstone Project</option>
                  <option value="Industry Project">Industry Project</option>
                  <option value="Innovation Project">Innovation Project</option>
                  <option value="Open Challenge">Open Challenge</option>
                  <option value="Internship Project">Internship Project</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Problem Statement & Research Objective *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Detail the technical challenge, dataset, and target solution..."
                value={createForm.problem_statement}
                onChange={(e) => setCreateForm({ ...createForm, problem_statement: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Research Area / Domain
                </label>
                <input
                  type="text"
                  value={createForm.domain}
                  onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Max Student Team Size
                </label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={createForm.max_team_size}
                  onChange={(e) => setCreateForm({ ...createForm, max_team_size: parseInt(e.target.value) || 4 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={createForm.difficulty_level}
                  onChange={(e) => setCreateForm({ ...createForm, difficulty_level: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced (Tier-1)</option>
                </select>
              </div>
            </div>

            {/* Required Skills from HireX Taxonomy */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Required Technical Skills (From Taxonomy) *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Python, FastAPI, Docker, Machine Learning)..."
                  value={skillTagInput}
                  onChange={(e) => setSkillTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (skillTagInput.trim() && !createForm.required_skills.includes(skillTagInput.trim())) {
                        setCreateForm({
                          ...createForm,
                          required_skills: [...createForm.required_skills, skillTagInput.trim()]
                        });
                        setSkillTagInput('');
                      }
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (skillTagInput.trim() && !createForm.required_skills.includes(skillTagInput.trim())) {
                      setCreateForm({
                        ...createForm,
                        required_skills: [...createForm.required_skills, skillTagInput.trim()]
                      });
                      setSkillTagInput('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                >
                  Add Skill
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 min-h-12 items-center">
                {createForm.required_skills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 flex items-center gap-1.5">
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => setCreateForm({
                        ...createForm,
                        required_skills: createForm.required_skills.filter(sk => sk !== s)
                      })}
                      className="hover:text-rose-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Project to Collaboration Hub</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PROJECT TALENT SCOUTING (Recruiter / Academician) */}
      {activeTab === 'scout' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Project & Research Talent Scouting</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Discover verified anonymous candidate contributions directly from live capstone projects and research prototypes. Send direct invitations to apply.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(proj => (
              <div key={proj.id} className="p-6 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {proj.type}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {proj.progress_percentage}% Done
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {proj.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {proj.problem_statement}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Contributing Anonymous Talent ({proj.team?.length || 0})
                    </span>
                    <div className="space-y-1.5">
                      {(proj.team || []).map((tm: ProjectTeamMember, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            <span>{tm.talent_id || 'SB-TALENT-10482'}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{tm.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline"
                  >
                    View Project →
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProject(proj);
                      setShowSponsorshipModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                  >
                    Sponsor / Hire
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COLLABORATION ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Projects</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{analytics?.total_projects || projects.length}</p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">Active Hub</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Student Participation</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{analytics?.participating_students || 38}</p>
              <span className="text-[10px] text-indigo-600 font-semibold mt-1 inline-block">Cross-Department</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Verified Contributions</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{analytics?.verified_evaluations || 24}</p>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">Passport Credited</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Industry Sponsorships</span>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{analytics?.sponsorship_requests || 5}</p>
              <span className="text-[10px] text-purple-600 font-semibold mt-1 inline-block">Hiring Pipeline</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: JOIN PROJECT REQUEST */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Request to Join Project Team
            </h3>
            <p className="text-xs text-slate-500">
              The project mentor will review your verified skills and approve your membership.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Proposed Role</label>
              <input
                type="text"
                value={joinRole}
                onChange={(e) => setJoinRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pitch / Relevant Experience</label>
              <textarea
                rows={3}
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder="I have verified Python & ML scores of 92% and built FastAPI services..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinProject}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Submit Join Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT PROJECT EVIDENCE */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Submit Project Evidence & Artifacts
            </h3>
            <p className="text-xs text-slate-500">
              Provide verifiable GitHub repository, model weights, or API documentation for mentor sign-off.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deliverable Title *</label>
              <input
                type="text"
                placeholder="e.g. Model Training Pipeline & FastAPI Endpoint"
                value={evidenceTitle}
                onChange={(e) => setEvidenceTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Repository / Deployment URL</label>
              <input
                type="text"
                placeholder="https://github.com/student/crop-disease-ml"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Demonstrated Skills (Comma separated)</label>
              <input
                type="text"
                value={evidenceSkills}
                onChange={(e) => setEvidenceSkills(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEvidence}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Submit Evidence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ACADEMICIAN EVALUATION MODAL */}
      {showEvaluationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <span>Evaluate Student Project Contribution</span>
            </h3>
            <p className="text-xs text-slate-500">
              Approved evaluations automatically credit verified skills to the student's HireX Verified Passport and update recruiter AI matching.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Student Member</label>
              <select
                value={evalStudentId}
                onChange={(e) => setEvalStudentId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              >
                <option value="">Select a student...</option>
                {(selectedProject?.team || []).map((tm: ProjectTeamMember) => (
                  <option key={tm.student_id || tm.talent_id} value={tm.student_id || tm.talent_id}>
                    {tm.student_name || tm.talent_id} ({tm.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contribution Grade</label>
              <select
                value={evalGrade}
                onChange={(e) => setEvalGrade(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              >
                <option value="A+ (Distinction)">A+ (Distinction — 90%+ Score Awarded)</option>
                <option value="A (Excellent)">A (Excellent — 85% Score Awarded)</option>
                <option value="B+ (Proficient)">B+ (Proficient — 75% Score Awarded)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mentor Evaluation Comments</label>
              <textarea
                rows={3}
                value={evalComments}
                onChange={(e) => setEvalComments(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEvaluationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleEvaluateStudent}
                disabled={!evalStudentId}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
              >
                Sign & Award Verified Skill Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RECRUITER SPONSORSHIP REQUEST */}
      {showSponsorshipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card-dark rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              <span>Express Industry Sponsorship Interest</span>
            </h3>
            <p className="text-xs text-slate-500">
              Send a collaboration or hiring interest request to the academician lead and participating student cohort.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Collaboration Type</label>
              <select
                value={sponsorType}
                onChange={(e) => setSponsorType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              >
                <option value="Technical Mentorship & Hiring Pipeline">Technical Mentorship & Hiring Pipeline</option>
                <option value="Industry Project Sponsorship">Industry Project Sponsorship</option>
                <option value="Direct Pre-Placement Interview (PPO) Fast-Track">Direct Pre-Placement Interview (PPO) Fast-Track</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message to Mentor</label>
              <textarea
                rows={3}
                value={sponsorMsg}
                onChange={(e) => setSponsorMsg(e.target.value)}
                placeholder="We would like to mentor this team and consider the contributors for our upcoming fintech campus drives..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSponsorshipModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSponsorProject}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
              >
                Dispatch Collaboration Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
