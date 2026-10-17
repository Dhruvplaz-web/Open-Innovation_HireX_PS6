import React, { useState, useEffect } from 'react';
import {
  Award,
  Users,
  Briefcase,
  Share2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building,
  Search,
  Filter,
  Plus,
  Send,
  MessageSquare,
  Lock,
  Eye,
  Sliders,
  ChevronRight,
  TrendingUp,
  FileCheck,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Video,
  Star,
  Layers,
  FileText
} from 'lucide-react';
import { AlumniProfile, AlumniMentorshipRequest, AlumniReferralItem, AlumniInsightItem } from '../types';
import { apiService } from '../services/api';
import { SEOHead } from '../components/common/SEOHead';
import { useAuth } from '../context/AuthContext';

interface AlumniPortalViewProps {
  onNavigateTab: (tab: string) => void;
  alumniEmail?: string;
  initialTab?: AlumniTab;
}

type AlumniTab = 'overview' | 'mentorship' | 'referrals' | 'endorsements' | 'insights' | 'curriculum' | 'masterclasses';

export const AlumniPortalView: React.FC<AlumniPortalViewProps> = ({
  onNavigateTab,
  alumniEmail = 'vikram.aditya@google.com',
  initialTab
}) => {
  const { userProfile, switchDemoRole } = useAuth();
  const effectiveAlumniId = (userProfile?.role === 'alumni' && userProfile.uid) ? userProfile.uid : 'alm_1';
  const effectiveEmail = userProfile?.email || alumniEmail;

  const [activeTab, setActiveTab] = useState<AlumniTab>(initialTab || 'overview');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [loading, setLoading] = useState<boolean>(true);

  // Core Data States
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [requests, setRequests] = useState<AlumniMentorshipRequest[]>([]);
  const [referrals, setReferrals] = useState<AlumniReferralItem[]>([]);
  const [insights, setInsights] = useState<AlumniInsightItem[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);

  // Search & Filter States
  const [directorySearch, setDirectorySearch] = useState<string>('');
  const [directoryCompanyFilter, setDirectoryCompanyFilter] = useState<string>('All');
  const [mentorshipStatusFilter, setMentorshipStatusFilter] = useState<string>('ALL');

  // Modals & Interactive Drawers
  const [showPostReferralModal, setShowPostReferralModal] = useState<boolean>(false);
  const [showPostInsightModal, setShowPostInsightModal] = useState<boolean>(false);
  const [showEndorsementModal, setShowEndorsementModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState<boolean>(false);
  const [showMasterclassModal, setShowMasterclassModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Curriculum & Masterclass States
  const [curriculumSummary, setCurriculumSummary] = useState<any | null>(null);
  const [masterclasses, setMasterclasses] = useState<any[]>([]);

  // Curriculum Form States
  const [currCourse, setCurrCourse] = useState<string>('Web Technologies & Distributed Cloud Services');
  const [currTopic, setCurrTopic] = useState<string>('SOAP APIs & XML RPC');
  const [currVerdict, setCurrVerdict] = useState<string>('OBSOLETE_DEPRECATE');
  const [currReplacement, setCurrReplacement] = useState<string>('RESTful Microservices, gRPC & Protobuf');
  const [currPriority, setCurrPriority] = useState<string>('CRITICAL');
  const [currNotes, setCurrNotes] = useState<string>('Industry standard distributed microservices use gRPC and Protobuf rather than legacy SOAP.');

  // Masterclass Form States
  const [mstTitle, setMstTitle] = useState<string>('Production Microservices & Distributed Caching with Go & Kubernetes');
  const [mstDateTime, setMstDateTime] = useState<string>('2026-10-28 17:00 IST');
  const [mstMeetLink, setMstMeetLink] = useState<string>('https://meet.google.com/hxr-masterclass-cloud');
  const [mstDesc, setMstDesc] = useState<string>('Deep dive on building low-latency microservices, cache invalidation, and cracking tier-1 engineering interviews.');
  const [mstCapacity, setMstCapacity] = useState<number>(150);

  // New Referral Form
  const [refCompany, setRefCompany] = useState<string>('Google');
  const [refRole, setRefRole] = useState<string>('Software Engineer II - Cloud Backend');
  const [refLocation, setRefLocation] = useState<string>('Bengaluru / Pune (Hybrid)');
  const [refJobUrl, setRefJobUrl] = useState<string>('https://careers.google.com');
  const [refExp, setRefExp] = useState<string>('0-2 Years');

  // New Insight Form
  const [insRole, setInsRole] = useState<string>('Software Engineer (L3/L4)');
  const [insSkills, setInsSkills] = useState<string>('Go, Kubernetes, gRPC, Cloud Spanner');
  const [insTips, setInsTips] = useState<string>('Focus on clean linear-time algorithms and clear communication of trade-offs.');
  const [insRound1Focus, setInsRound1Focus] = useState<string>('DSA & Graph Traversals');
  const [insRound1Questions, setInsRound1Questions] = useState<string>('Shortest path in DAG, LRU Cache with O(1) eviction');

  // Endorsement Form
  const [endStudentName, setEndStudentName] = useState<string>('Dhruv Patil');
  const [endSkill, setEndSkill] = useState<string>('Python');
  const [endContext, setEndContext] = useState<string>('Reviewed student repository for HireX sovereign AST auditor and verified O(N) complexity.');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const dash = await apiService.getAlumniDashboard(effectiveAlumniId, effectiveEmail);
      if (dash) {
        setProfile(dash.profile);
        setStats(dash.stats);
        setAnnouncements(dash.college_announcements || []);
        setRequests(await apiService.getAlumniMentorshipRequests(effectiveAlumniId));
        setReferrals(await apiService.getAlumniReferrals(effectiveAlumniId));
        setInsights(await apiService.getAlumniInsights());
        setDirectory(await apiService.getAlumniDirectory());
        setCurriculumSummary(await apiService.getCurriculumSummary(dash.profile?.department));
        setMasterclasses(await apiService.getMasterclasses());
      }
    } catch (e) {
      console.warn('Error loading alumni portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveAlumniId, effectiveEmail]);

  // Handle Mentorship Action
  const handleActionMentorship = async (reqId: string, action: 'ACCEPTED' | 'DECLINED' | 'COMPLETED') => {
    const meetingLink = action === 'ACCEPTED' ? 'https://meet.google.com/hxr-mentorship-live' : undefined;
    const res = await apiService.actionAlumniMentorshipRequest(reqId, {
      action,
      meeting_link: meetingLink,
      scheduled_time: '2026-10-25 18:30 IST',
      feedback_notes: action === 'COMPLETED' ? 'Session successfully delivered.' : undefined
    });
    if (res?.status === 'success') {
      showToast(`Mentorship request marked as ${action}`);
      loadData();
    }
  };

  // Handle Post Referral
  const handlePostReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiService.postAlumniReferral({
      alumni_id: profile?.id || effectiveAlumniId,
      alumni_name: profile?.name || userProfile?.displayName || 'Vikram Aditya',
      company: refCompany,
      role: refRole,
      location: refLocation,
      job_url: refJobUrl,
      experience_required: refExp
    });
    if (res?.status === 'success') {
      showToast(`Referral opening for ${refRole} at ${refCompany} published!`);
      setShowPostReferralModal(false);
      loadData();
    }
  };

  // Handle Post Insight
  const handlePostInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiService.postAlumniInsight({
      alumni_id: profile?.id || effectiveAlumniId,
      alumni_name: profile?.name || userProfile?.displayName || 'Vikram Aditya',
      company: profile?.current_company || userProfile?.companyName || 'Google',
      designation: profile?.designation || userProfile?.designation || 'Staff Software Engineer',
      role_interviewed: insRole,
      rounds_breakdown: [
        {
          round_name: 'Technical Round 1',
          focus: insRound1Focus,
          sample_questions: insRound1Questions.split(',').map((s) => s.trim()),
          difficulty: 'HARD'
        }
      ],
      skills_we_actually_use: insSkills.split(',').map((s) => s.trim()),
      tips_for_juniors: insTips
    });
    if (res?.status === 'success') {
      showToast('Interview breakdown & insights shared with juniors!');
      setShowPostInsightModal(false);
      loadData();
    }
  };

  // Handle Endorsement Submit
  const handleEndorsementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiService.submitAlumniEndorsement({
      alumni_id: profile?.id || effectiveAlumniId,
      alumni_name: profile?.name || userProfile?.displayName || 'Vikram Aditya',
      student_id: 'std_1',
      student_name: endStudentName,
      skill: endSkill,
      context: endContext
    });
    if (res?.status === 'success') {
      showToast(`Verified skill endorsement added for ${endStudentName} (+1.25x trust signal)!`);
      setShowEndorsementModal(false);
      loadData();
    }
  };

  // Handle Curriculum Feedback Submit
  const handleCurriculumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiService.submitCurriculumFeedback({
      alumni_id: profile?.id || effectiveAlumniId,
      alumni_name: profile?.name || 'Vikram Aditya',
      current_company: profile?.current_company || 'Google',
      department: profile?.department || 'Computer Engineering',
      course_name: currCourse,
      syllabus_topic: currTopic,
      status_verdict: currVerdict,
      suggested_modern_replacement: currReplacement,
      industry_priority: currPriority,
      notes: currNotes
    });
    if (res?.status === 'success') {
      showToast("Syllabus advisory submitted to Academician Planning! (+35 Pts)");
      setShowCurriculumModal(false);
      loadData();
    }
  };

  // Handle Masterclass Submit
  const handleMasterclassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiService.createMasterclass({
      title: mstTitle,
      speaker_id: profile?.id || effectiveAlumniId,
      speaker_name: profile?.name || 'Vikram Aditya',
      speaker_company: profile?.current_company || 'Google',
      speaker_role: profile?.designation || 'Staff Software Engineer',
      department: profile?.department || 'Computer Engineering',
      target_year: '3rd & 4th Year',
      date_time: mstDateTime,
      meeting_link: mstMeetLink,
      description: mstDesc,
      capacity: mstCapacity
    });
    if (res?.status === 'success') {
      showToast("Industry Masterclass scheduled & published to students! (+75 Pts)");
      setShowMasterclassModal(false);
      loadData();
    }
  };

  const filteredDirectory = directory.filter((item) => {
    const matchQuery =
      directorySearch === '' ||
      item.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
      item.current_company.toLowerCase().includes(directorySearch.toLowerCase()) ||
      item.skills.some((s: string) => s.toLowerCase().includes(directorySearch.toLowerCase()));
    const matchCompany = directoryCompanyFilter === 'All' || item.current_company.toLowerCase() === directoryCompanyFilter.toLowerCase();
    return matchQuery && matchCompany;
  });

  const filteredRequests = requests.filter((r) => {
    if (mentorshipStatusFilter === 'ALL') return true;
    return r.status === mentorshipStatusFilter;
  });

  return (
    <div className="flex-1 h-full overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-porcelain-100 dark:bg-porcelain-950 text-slate-800 dark:text-slate-100 select-none">
      <SEOHead
        title="Distinguished Alumni Portal | HireX JSPM RSCOE"
        description="Connect with juniors, share verified referrals, conduct mock interviews, and endorse real engineering skills."
        path="/alumni"
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header with Profile Capsule */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profile?.avatar || userProfile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram'}
              alt={profile?.name || userProfile?.displayName || 'Alumni'}
              className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border-2 border-indigo-500/30"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] ring-2 ring-white dark:ring-slate-900 shadow-xs">
              ✓
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {profile?.name || userProfile?.displayName || 'Vikram Aditya'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                VERIFIED ALUMNI (BATCH {profile?.batch || userProfile?.year?.replace('Batch ', '') || '2021'})
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {profile?.designation || userProfile?.designation || 'Staff Software Engineer'} • <span className="font-semibold text-slate-700 dark:text-slate-300">{profile?.current_company || userProfile?.companyName || 'Google'}</span> ({profile?.city || 'Bengaluru / Pune'})
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(profile?.skills || ['Distributed Systems', 'Go', 'Python', 'Kubernetes', 'System Design']).slice(0, 5).map((sk) => (
                <span key={sk} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls: Impact Pill & Post Referral */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-end">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Alumni Impact Score</span>
            <span className="text-lg font-black text-amber-500 flex items-center justify-end gap-1">
              <Sparkles className="w-4 h-4 fill-current" />
              {stats?.impact_score || 480} Pts
            </span>
          </div>

          <button
            onClick={() => setShowPostReferralModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Post Company Referral</span>
          </button>
        </div>
      </div>

      {/* 7 High-Impact Modern Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview' as AlumniTab, label: 'Overview & Impact', icon: Award },
          { id: 'mentorship' as AlumniTab, label: `Mentorship Hub (${requests.filter((r) => r.status === 'PENDING').length} Pending)`, icon: Users },
          { id: 'referrals' as AlumniTab, label: `Referrals & Jobs (${referrals.length})`, icon: Briefcase },
          { id: 'curriculum' as AlumniTab, label: 'Syllabus Advisory (Faculty)', icon: GraduationCap },
          { id: 'masterclasses' as AlumniTab, label: `Masterclasses & Clinics (${masterclasses.length})`, icon: Video },
          { id: 'endorsements' as AlumniTab, label: 'Skill Endorsements', icon: ShieldCheck },
          { id: 'insights' as AlumniTab, label: 'Insights & Network', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & IMPACT */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Bento Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Mentees Guided</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {stats?.mentees_helped || 14}
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +3 this semester
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Referrals Made</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                {referrals.length || 2} Active
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                {stats?.students_referred_count || 1} candidates shortlisted
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Sessions Delivered</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {stats?.sessions_delivered || 18} Hrs
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold mt-1 block">
                100% positive feedback
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Trust Status</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                College Verified ✓
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Roll No: 72153921K • 2021
              </span>
            </div>
          </div>

          {/* Quick Pending Requests & College Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Requests Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Pending Mentorship Inquiries</span>
                </h3>
                <button
                  onClick={() => setActiveTab('mentorship')}
                  className="text-xs text-indigo-500 hover:text-indigo-400 font-bold flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {requests.filter((r) => r.status === 'PENDING').length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No pending requests right now. Your availability slots are visible to juniors.
                </div>
              ) : (
                <div className="space-y-3">
                  {requests
                    .filter((r) => r.status === 'PENDING')
                    .slice(0, 2)
                    .map((req) => (
                      <div key={req.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img src={req.student_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv'} alt={req.student_name} className="w-8 h-8 rounded-lg bg-slate-200" />
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">{req.student_name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{req.target_role}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                            PENDING
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{req.message}"</p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleActionMentorship(req.id, 'DECLINED')}
                            className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleActionMentorship(req.id, 'ACCEPTED')}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                          >
                            Accept &amp; Meet
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Placement Cell & TPO Announcements */}
            <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-500" />
                  <span>JSPM RSCOE Placement Cell Notices</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">TPO Connected</span>
              </div>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{ann.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{ann.date}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{ann.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENTORSHIP HUB */}
      {activeTab === 'mentorship' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Filter Pill */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">1:1 Student Mentorship &amp; Mock Sessions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Empower juniors with mock interviews, architecture reviews, and career direction.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Filter:</span>
              {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setMentorshipStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    mentorshipStatusFilter === st
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Mentorship Requests List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map((req) => (
              <div key={req.id} className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={req.student_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv'} alt={req.student_name} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-white block">{req.student_name}</span>
                        {(req as any).verified_score && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                            {(req as any).verified_score}% Verified
                          </span>
                        )}
                        {(req as any).teacher_endorsed && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold flex items-center gap-1">
                            ⭐ Faculty Recommended
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-indigo-500 font-semibold">{req.target_role}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                      req.status === 'ACCEPTED'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : req.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Topic: {req.topic}</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    "{req.message}"
                  </p>
                </div>

                {req.scheduled_time && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Slot: {req.scheduled_time}</span>
                  </div>
                )}

                {req.status === 'ACCEPTED' && req.meeting_link && (
                  <a
                    href={req.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Join Google Meet Session</span>
                  </a>
                )}

                {req.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleActionMentorship(req.id, 'DECLINED')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleActionMentorship(req.id, 'ACCEPTED')}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      Accept Slot
                    </button>
                  </div>
                )}

                {req.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleActionMentorship(req.id, 'COMPLETED')}
                    className="w-full py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                  >
                    Mark Session Delivered (+30 Impact Pts)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REFERRALS & JOBS */}
      {activeTab === 'referrals' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Active Referral Openings &amp; Applicants</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Post verified internal opportunities at your company with placement cell duplicate protection.</p>
            </div>
            <button
              onClick={() => setShowPostReferralModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Opening</span>
            </button>
          </div>

          <div className="space-y-4">
            {referrals.map((ref) => (
              <div key={ref.id} className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{ref.role}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                        {ref.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {ref.company} • {ref.location} • Experience: {ref.experience_required}
                    </p>
                  </div>
                  {ref.job_url && (
                    <a
                      href={ref.job_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold flex items-center gap-1"
                    >
                      <span>Careers Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Candidate Applications */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Applicant Skill Passports ({ref.student_referrals?.length || 0})
                  </span>

                  {(!ref.student_referrals || ref.student_referrals.length === 0) ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No junior applications received yet. Qualified students with matched skill passports will appear here.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ref.student_referrals.map((app) => (
                        <div key={app.student_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <img src={app.student_avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv"} alt={app.student_name} className="w-8 h-8 rounded-lg bg-slate-200" />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{app.student_name}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                                  {app.verified_score || 88}% Verified
                                </span>
                                {(app.teacher_endorsed || app.student_id === 'std_1') && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold flex items-center gap-0.5">
                                    ⭐ Faculty Recommended ({app.teacher_endorser_name || 'Prof. Kulkarni'})
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{app.endorsement_note}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold">
                              {app.status}
                            </span>
                            {app.status !== 'SUBMITTED_TO_HR' ? (
                              <button
                                onClick={async () => {
                                  await apiService.reviewReferralApplication(ref.id, {
                                    student_id: app.student_id,
                                    decision: 'SUBMITTED_TO_HR',
                                    notes: `Referred directly to ${ref.company} engineering hiring pipeline.`
                                  });
                                  showToast(`Referral submitted to ${ref.company} internal hiring portal for ${app.student_name}! (+60 Impact Pts)`);
                                  loadData();
                                }}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                              >
                                Submit to Company ATS
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                ✓ Referred
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SKILL ENDORSEMENTS */}
      {activeTab === 'endorsements' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Alumni Institutional Skill Endorsements</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Endorsements from alumni carry a 1.25x weight in the Ridge Regression skill verifier.
              </p>
            </div>
            <button
              onClick={() => setShowEndorsementModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Endorse Student Skill</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Your Recent Institutional Endorsements</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Dhruv Patil</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold">
                      Skill: Python (1.25x Multiplier)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    "Reviewed HireX sovereign AST auditor implementation and verified linear O(N) algorithmic guarantees."
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">Oct 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INSIGHTS & NETWORK */}
      {activeTab === 'insights' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Industry Insights &amp; Verified Alumni Directory</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Share interview round structures, tools actually used in production, and network with fellow graduates.</p>
            </div>
            <button
              onClick={() => setShowPostInsightModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Share Interview Experience</span>
            </button>
          </div>

          {/* Interview Breakdown Feed */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Production Tools &amp; Interview Experiences</span>
            </h3>

            {insights.map((ins) => (
              <div key={ins.id} className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {ins.company} — {ins.role_interviewed}
                    </span>
                    <span className="text-xs text-slate-400">
                      Shared by {ins.alumni_name} ({ins.designation})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                    {ins.upvotes || 48} Helpful Votes
                  </span>
                </div>

                {/* Production Tools List */}
                <div>
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tools We Actually Use in Production:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ins.skills_we_actually_use?.map((sk) => (
                      <span key={sk} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rounds Breakdown */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Interview Rounds Breakdown:
                  </span>
                  {ins.rounds_breakdown?.map((rnd, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{rnd.round_name}</span>
                        <span className="text-[10px] font-mono text-amber-500">{rnd.difficulty}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">Focus: {rnd.focus}</p>
                      {rnd.sample_questions && rnd.sample_questions.length > 0 && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                          Sample Questions: {rnd.sample_questions.join(' • ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {ins.tips_for_juniors && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-bold">Advice for Juniors:</span> {ins.tips_for_juniors}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Searchable Alumni Directory */}
          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Search Verified JSPM RSCOE Alumni Directory</span>
              </h3>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    placeholder="Search by name, company, skill..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredDirectory.map((alm) => (
                <div key={alm.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={alm.avatar} alt={alm.name} className="w-10 h-10 rounded-xl bg-slate-200" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{alm.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{alm.designation}</span>
                      <span className="text-[10px] font-mono text-indigo-500 font-semibold">{alm.current_company}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {alm.skills?.slice(0, 3).map((s: string) => (
                      <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => showToast(`Connected with ${alm.name} on sovereign Alumni sync broker!`)}
                    className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition shadow-xs"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SYLLABUS ADVISORY (FACULTY <-> ALUMNI BRIDGE) */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Curriculum &amp; Industry Syllabus Modernizer</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help professors calibrate university coursework against production tech stacks at {profile?.current_company || 'top tech companies'}.
              </p>
            </div>
            <button
              onClick={() => setShowCurriculumModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Syllabus Feedback</span>
            </button>
          </div>

          {/* Alignment Radar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Industry Alignment Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {curriculumSummary?.curriculum_industry_alignment_score || 82}%
                </span>
                <span className="text-[11px] font-semibold text-emerald-500">Above State Average</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Calibrated from alumni at Google, Microsoft, and Amazon.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Obsolete Topics Flagged</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-rose-500">
                  {curriculumSummary?.obsolete_topics_flagged || 1} Topics
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Legacy protocols recommended for syllabus sunset.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Modern Skills To Integrate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-500">
                  {curriculumSummary?.critical_skills_to_add || 2} Production Skills
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Directly delivered to Academician Curriculum Planning.</p>
            </div>
          </div>

          {/* Priority Modernization Recommendations */}
          <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span>Priority Syllabus Modernization Directives</span>
            </h3>

            <div className="space-y-3">
              {(curriculumSummary?.priority_recommendations || []).map((rec: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-500 line-through">{rec.topic_to_modernize}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{rec.modern_alternative}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">Recommended by: {rec.recommended_by}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold uppercase">
                    {rec.priority || 'CRITICAL'} PRIORITY
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MASTERCLASSES & CAPSTONE CLINICS */}
      {activeTab === 'masterclasses' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Alumni Masterclasses &amp; Capstone Clinics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deliver interactive technical masterclasses and co-mentor final-year student capstone projects.
              </p>
            </div>
            <button
              onClick={() => setShowMasterclassModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Host a Masterclass</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {masterclasses.map((mst) => (
              <div key={mst.id} className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-500 uppercase block mb-1">
                      {mst.target_year} • {mst.department}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{mst.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Speaker: {mst.speaker_name} ({mst.speaker_role} at {mst.speaker_company})</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                    {mst.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {mst.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{mst.date_time}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    {mst.enrolled_students?.length || 0} Students Enrolled
                  </span>
                </div>

                {mst.meeting_link && (
                  <a
                    href={mst.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Launch Google Meet Live Room</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POST REFERRAL MODAL */}
      {showPostReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Post Company Referral Opening</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              This opening will be mirrored to the TPO Academician portal and current students as an ALUMNI_REFERRAL source.
            </p>

            <form onSubmit={handlePostReferral} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={refCompany}
                  onChange={(e) => setRefCompany(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={refRole}
                  onChange={(e) => setRefRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={refLocation}
                    onChange={(e) => setRefLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Experience</label>
                  <input
                    type="text"
                    required
                    value={refExp}
                    onChange={(e) => setRefExp(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Careers Job URL</label>
                <input
                  type="url"
                  value={refJobUrl}
                  onChange={(e) => setRefJobUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPostReferralModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs"
                >
                  Publish Referral (+50 Pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST INSIGHT MODAL */}
      {showPostInsightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Share Interview Experience &amp; Tools</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Help pre-final and final year juniors prepare for real production environments.
            </p>

            <form onSubmit={handlePostInsight} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Role Interviewed</label>
                <input
                  type="text"
                  required
                  value={insRole}
                  onChange={(e) => setInsRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Round 1 Focus</label>
                <input
                  type="text"
                  required
                  value={insRound1Focus}
                  onChange={(e) => setInsRound1Focus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Sample Questions</label>
                <input
                  type="text"
                  required
                  value={insRound1Questions}
                  onChange={(e) => setInsRound1Questions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tools We Actually Use (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={insSkills}
                  onChange={(e) => setInsSkills(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tips for Juniors</label>
                <textarea
                  rows={2}
                  required
                  value={insTips}
                  onChange={(e) => setInsTips(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPostInsightModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs"
                >
                  Share Insight (+40 Pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENDORSEMENT MODAL */}
      {showEndorsementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Endorse Junior Student Skill</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add your institutional endorsement signal directly to a junior's verified skill passport.
            </p>

            <form onSubmit={handleEndorsementSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={endStudentName}
                  onChange={(e) => setEndStudentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Endorsed Skill</label>
                <input
                  type="text"
                  required
                  value={endSkill}
                  onChange={(e) => setEndSkill(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Interaction &amp; Evidence Context</label>
                <textarea
                  rows={2}
                  required
                  value={endContext}
                  onChange={(e) => setEndContext(e.target.value)}
                  placeholder="e.g. Reviewed student's pull request on microservices repository..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEndorsementModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
                >
                  Submit Endorsement (+25 Pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CURRICULUM FEEDBACK MODAL */}
      {showCurriculumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Submit Syllabus &amp; Curriculum Advisory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Your feedback is directly synthesized on the Academician Department Dashboard for syllabus revision.
            </p>

            <form onSubmit={handleCurriculumSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Course / Subject Name</label>
                <input
                  type="text"
                  required
                  value={currCourse}
                  onChange={(e) => setCurrCourse(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Syllabus Topic Flagged</label>
                <input
                  type="text"
                  required
                  value={currTopic}
                  onChange={(e) => setCurrTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Verdict Recommendation</label>
                  <select
                    value={currVerdict}
                    onChange={(e) => setCurrVerdict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    <option value="OBSOLETE_DEPRECATE">Deprecate / Sunset (Outdated)</option>
                    <option value="CRITICAL_ADD">Critical Addition (Production Need)</option>
                    <option value="KEEP_THEORY">Keep Foundation Theory</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Industry Priority</label>
                  <select
                    value={currPriority}
                    onChange={(e) => setCurrPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    <option value="CRITICAL">Critical (Immediate Gap)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Suggested Modern Industrial Replacement</label>
                <input
                  type="text"
                  required
                  value={currReplacement}
                  onChange={(e) => setCurrReplacement(e.target.value)}
                  placeholder="e.g. RESTful Microservices, gRPC & Protocol Buffers"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Faculty Advisory Notes</label>
                <textarea
                  rows={2}
                  required
                  value={currNotes}
                  onChange={(e) => setCurrNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCurriculumModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs"
                >
                  Submit to Faculty (+35 Pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MASTERCLASS HOSTING MODAL */}
      {showMasterclassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Host an Alumni Masterclass or Capstone Clinic</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Schedule a 1-hour interactive technical workshop or final-year project guidance session for your alma mater.
            </p>

            <form onSubmit={handleMasterclassSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={mstTitle}
                  onChange={(e) => setMstTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date &amp; Time (IST)</label>
                  <input
                    type="text"
                    required
                    value={mstDateTime}
                    onChange={(e) => setMstDateTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Max Student Capacity</label>
                  <input
                    type="number"
                    required
                    value={mstCapacity}
                    onChange={(e) => setMstCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Meeting Link (Google Meet / Zoom)</label>
                <input
                  type="url"
                  required
                  value={mstMeetLink}
                  onChange={(e) => setMstMeetLink(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Session Description &amp; Takeaways</label>
                <textarea
                  rows={3}
                  required
                  value={mstDesc}
                  onChange={(e) => setMstDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMasterclassModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs"
                >
                  Publish Masterclass (+75 Pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
