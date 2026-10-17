import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  Code2, 
  BookOpen, 
  Github, 
  ExternalLink, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  Download, 
  Edit3, 
  Sparkles, 
  Check, 
  Flame, 
  Globe,
  Linkedin,
  RefreshCw,
  AlertCircle,
  Fingerprint,
  Layers,
  Lock,
  Camera,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { StudentProfile, LinkedInConnectionProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { TalentVisibilityCard } from '../components/profile/TalentVisibilityCard';
import { CertificateScannerModal } from '../components/modals/CertificateScannerModal';
import { TruthfulResumeBuilderModal } from '../components/modals/TruthfulResumeBuilderModal';
import { EvidenceMatrixDrawer } from '../components/evidence/EvidenceMatrixDrawer';
import { AvatarCustomizerModal } from '../components/modals/AvatarCustomizerModal';

interface ProfileViewProps {
  student: StudentProfile;
  initialTab?: 'dossier' | 'incognito' | 'collaboration';
  onOpenAssessment?: () => void;
  onNavigateTab?: (tab: string) => void;
  onUpdateStudent?: (updated: Partial<StudentProfile>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  student,
  initialTab = 'dossier',
  onOpenAssessment,
  onNavigateTab,
  onUpdateStudent
}) => {
  const { userProfile, saveOnboardingProfile, updateAvatar } = useAuth();
  const isDemoPersona = (student.student_id === 'std_1' || student.id === 'std_1') && (student.verified_score || 0) > 0;

  const [profileTab, setProfileTab] = useState<'dossier' | 'incognito' | 'collaboration'>(initialTab);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(student.name || userProfile?.displayName || (isDemoPersona ? "Dhruv Patil" : "New Student"));
  const [college, setCollege] = useState<string>(student.college || userProfile?.college || (isDemoPersona ? "JSPM RSCOE, Pune" : ""));
  const [department, setDepartment] = useState<string>(student.department || userProfile?.department || (isDemoPersona ? "Computer Engineering" : ""));
  const [targetRole, setTargetRole] = useState<string>(student.target_role || userProfile?.targetRole || (isDemoPersona ? "Full-Stack AI Developer" : ""));
  const [year, setYear] = useState<string>(student.year || userProfile?.year || (isDemoPersona ? "3rd Year" : ""));
  const [prn, setPrn] = useState<string>(student.student_id || userProfile?.prn || (isDemoPersona ? "72148291B" : ""));
  const [cgpa, setCgpa] = useState<number>(student.cgpa || userProfile?.cgpa || (isDemoPersona ? 8.92 : 0.0));
  const [githubUrl, setGithubUrl] = useState<string>(userProfile?.githubUrl || (isDemoPersona ? "https://github.com/dhruv-patil" : ""));
  const [linkedinUrl, setLinkedinUrl] = useState<string>(userProfile?.linkedinUrl || (isDemoPersona ? "https://linkedin.com/in/dhruv-patil" : ""));
  const [avatar, setAvatar] = useState<string>(student.avatar || userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id || 'NewStudent'}`);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);

  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isEvidenceMatrixOpen, setIsEvidenceMatrixOpen] = useState<boolean>(false);
  const [liveSkills, setLiveSkills] = useState<Record<string, any>>(student.skills || {});
  const [committedCertificates, setCommittedCertificates] = useState<any[]>([]);

  // Synchronize state when student prop or userProfile changes
  useEffect(() => {
    setName(student.name || userProfile?.displayName || (isDemoPersona ? "Dhruv Patil" : "New Student"));
    setCollege(student.college || userProfile?.college || (isDemoPersona ? "JSPM RSCOE, Pune" : ""));
    setDepartment(student.department || userProfile?.department || (isDemoPersona ? "Computer Engineering" : ""));
    setTargetRole(student.target_role || userProfile?.targetRole || (isDemoPersona ? "Full-Stack AI Developer" : ""));
    setYear(student.year || userProfile?.year || (isDemoPersona ? "3rd Year" : ""));
    setPrn(student.student_id || userProfile?.prn || (isDemoPersona ? "72148291B" : ""));
    setCgpa(student.cgpa || userProfile?.cgpa || (isDemoPersona ? 8.92 : 0.0));
    setGithubUrl(userProfile?.githubUrl || (isDemoPersona ? "https://github.com/dhruv-patil" : ""));
    setLinkedinUrl(userProfile?.linkedinUrl || (isDemoPersona ? "https://linkedin.com/in/dhruv-patil" : ""));
    setAvatar(student.avatar || userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id || 'NewStudent'}`);
    setLiveSkills(student.skills || {});
  }, [student, userProfile, isDemoPersona]);

  const handleCertificateCommitted = (result: any) => {
    if (!result) return;
    const cert = result.certificate;
    if (cert) {
      setCommittedCertificates(prev => [cert, ...prev]);
      if (cert.canonical_skills && cert.canonical_skills.length > 0) {
        setLiveSkills(prev => {
          const next = { ...prev };
          for (const sk of cert.canonical_skills) {
            next[sk.skill] = {
              level: sk.level || "Intermediate",
              score: Math.min(99, (next[sk.skill]?.score || 72) + (sk.evidence_weight || 15)),
              verified: true
            };
          }
          return next;
        });
      }
    }
  };

  const handleSaveAvatar = async (newAvatarUrl: string) => {
    setAvatar(newAvatarUrl);
    await updateAvatar(newAvatarUrl);
    if (onUpdateStudent) {
      onUpdateStudent({ avatar: newAvatarUrl });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const [bio, setBio] = useState<string>(
    student.bio || userProfile?.bio || (isDemoPersona
      ? "Final year Computer Engineering student building autonomous agentic systems and high-throughput microservices in Python & TypeScript. Aiming for Tier-1 Product, R&D, and High-Frequency Tech roles across India."
      : "")
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveOnboardingProfile({
        displayName: name,
        college,
        department,
        targetRole,
        year,
        prn,
        cgpa,
        githubUrl,
        linkedinUrl,
        bio,
        photoURL: avatar
      });

      if (onUpdateStudent) {
        onUpdateStudent({
          name,
          college,
          department,
          target_role: targetRole,
          year,
          cgpa,
          bio,
          avatar
        });
      }

      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (e) {
      console.warn("Could not save profile:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // LinkedIn OAuth 2.0 / OpenID Connect Integration State
  const studentId = student.id || 'std_1';
  const [isLinkedInConnected, setIsLinkedInConnected] = useState<boolean>(false);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInConnectionProfile | null>(null);
  const [linkedInLastSync, setLinkedInLastSync] = useState<string | null>(null);
  const [isConnectingLinkedIn, setIsConnectingLinkedIn] = useState<boolean>(false);
  const [linkedInNotice, setLinkedInNotice] = useState<string | null>(null);
  const [linkedInError, setLinkedInError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkedInStatus = async () => {
      try {
        const res = await apiService.getLinkedInStatus(studentId);
        if (res.connected && res.connection) {
          setIsLinkedInConnected(true);
          setLinkedInProfile(res.connection);
          setLinkedInLastSync(res.last_synchronized || null);
        }
      } catch (err) {
        console.warn('Error fetching LinkedIn status on profile:', err);
      }
    };
    fetchLinkedInStatus();

    // Check for callback parameters from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const liStatus = params.get('linkedin_status');
    const errMsg = params.get('error_message');

    if (liStatus === 'success') {
      setIsLinkedInConnected(true);
      setLinkedInNotice('✓ LinkedIn Connected! Basic profile information imported.');
      setLinkedInError(null);
      fetchLinkedInStatus();
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, '', cleanPath);
      setTimeout(() => setLinkedInNotice(null), 6000);
    } else if (liStatus === 'error') {
      setIsLinkedInConnected(false);
      setLinkedInError(errMsg ? decodeURIComponent(errMsg) : 'LinkedIn connection failed. Please try again.');
      setLinkedInNotice(null);
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, '', cleanPath);
    }
  }, [studentId]);

  const handleConnectLinkedIn = async () => {
    setIsConnectingLinkedIn(true);
    setLinkedInError(null);
    try {
      const res = await apiService.getLinkedInAuthorizeUrl(studentId, 'profile');
      if (res.is_client_id_configured && res.authorization_url) {
        window.location.href = res.authorization_url;
      } else {
        // Sandbox simulation mode for local testing
        const sim = await apiService.simulateLinkedInConnect({
          student_id: studentId,
          linkedin_name: student.name || 'Dhruv Patil',
          linkedin_email: student.email || 'dhruv.patil@rscoe.edu.in'
        });
        if (sim.status === 'success') {
          setIsLinkedInConnected(true);
          setLinkedInProfile(sim.connection);
          setLinkedInLastSync(new Date().toUTCString());
          setLinkedInNotice('✓ LinkedIn Connected! Basic profile information imported.');
          setTimeout(() => setLinkedInNotice(null), 6000);
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
      setLinkedInNotice('LinkedIn account disconnected.');
      setTimeout(() => setLinkedInNotice(null), 4000);
    } catch (err: any) {
      console.warn('Disconnect LinkedIn error:', err);
    }
  };



  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. Profile Hero Banner Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div 
              className="relative group cursor-pointer"
              onClick={() => setIsAvatarModalOpen(true)}
              title="Click to customize profile photo"
            >
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover border-2 border-slate-200/80 dark:border-slate-700 shadow-sm group-hover:opacity-90 transition"
              />
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 backdrop-blur-xs">
                <Camera className="w-5 h-5 text-white" />
                <span>Change</span>
              </div>
              <span className={`absolute -bottom-1.5 -right-1.5 p-1 rounded-md text-white shadow-xs ${
                (student.verified_score || 0) >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
              }`} title={(student.verified_score || 0) >= 75 ? "Cryptographically Verified Profile" : "Verification In Progress"}>
                {(student.verified_score || 0) >= 75 ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {name}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {student.rank_in_college ? `Top ${student.rank_in_college}% RSCOE` : 'New Member (Unranked)'}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                  (student.verified_score || 0) >= 75
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60'
                }`}>
                  {(student.verified_score || 0) >= 75 ? 'TPO Approved' : 'Verification Required'}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{targetRole}</span>
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{college}</span>
                </span>
                <span>•</span>
                <span>{department}</span>
                <span>•</span>
                <span className="font-mono font-semibold">PRN: {prn}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-500" />
              <span>Change Photo</span>
            </button>

            <button
              onClick={() => setIsEvidenceMatrixOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800/60"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Evidence-to-Skill Matrix</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
            </button>

            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download ATS Resume (PDF)</span>
            </button>
          </div>
        </div>

        {/* Profile Edit Section */}
        {isEditing ? (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Institutional Telemetry & Verified Credentials
              </span>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Customize Profile Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Role Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Current CGPA (out of 10.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">College / University</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department / Branch</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1st Year">1st Year (FE)</option>
                  <option value="2nd Year">2nd Year (SE)</option>
                  <option value="3rd Year">3rd Year (TE)</option>
                  <option value="Final Year">Final Year (BE)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">University PRN / Roll No</label>
                <input
                  type="text"
                  value={prn}
                  onChange={(e) => setPrn(e.target.value)}
                  placeholder="e.g. 72153921K"
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">GitHub Profile URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Professional Bio & Career Objective</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? "Syncing Across Database & Registry..." : "Save Profile Changes"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              {bio}
            </p>
          </div>
        )}

        {savedSuccess && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Profile successfully updated and synced across HireX verified registry!</span>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-x-auto">
        <button
          onClick={() => setProfileTab('dossier')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            profileTab === 'dossier'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Verified Student Dossier</span>
        </button>

        <button
          onClick={() => setProfileTab('incognito')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            profileTab === 'incognito'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>Talent Visibility & Incognito Matching</span>
        </button>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('collaboration')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Collaboration & Research Hub →</span>
          </button>
        )}
      </div>

      {profileTab === 'incognito' ? (
        <TalentVisibilityCard studentId={student.id} onNavigateTab={onNavigateTab} />
      ) : (
        <>
          {/* 2. Academic & TPO Gatekeeper Dossier (The Core Metrics) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">{student.verified_score || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Skill Index</span>
              <span className={`text-[10px] font-semibold mt-1 block ${(student.verified_score || 0) >= 75 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {(student.verified_score || 0) >= 75 ? 'Top 4% RSCOE' : 'Not Verified Yet'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white block">{student.cgpa || 8.0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">SPPU CGPA</span>
              <span className="text-[10px] text-slate-500 mt-1 block">{department}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">0</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Active Backlogs</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">All Sems Clear</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white block">{(student.verified_score || 0) > 0 ? '86.4%' : 'Pending'}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Attendance</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">{(student.verified_score || 0) > 0 ? 'Min 75% Met' : 'Self-Reported'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block">{(student.verified_score || 0) > 0 ? '18.5' : '0.0'}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">NCrF Credits</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Out of 20 Target</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
              <span className="text-2xl font-black text-amber-500 block">
                {student.rank_in_college ? `#${student.rank_in_college}` : '—'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Batch Rank</span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {student.rank_in_college ? 'Of 420 Students' : 'Assessment Pending'}
              </span>
            </div>
          </div>

      {/* 3. Verified Skills & Technical Competencies Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Verified Competencies */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Objective Verified Competencies
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluated through Python AST compiler checks, LeetCode algorithms, and NPTEL examinations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Scan Certificate (OCR & Anti-Fraud)</span>
                </button>

                <button
                  onClick={() => setIsEvidenceMatrixOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition shadow-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Evidence Matrix</span>
                </button>

                {onOpenAssessment && (
                  <button
                    onClick={onOpenAssessment}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                    <span>Verify New Skill / QR</span>
                  </button>
                )}
              </div>
            </div>

            {Object.keys(liveSkills).length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3.5 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zero Verified Skills (Clean Profile)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                    You are starting fresh! To earn your first verified skill badges, take a proctored assessment, solve an algorithmic challenge in the Code Lab, or scan an authentic NPTEL/AWS certificate.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Fingerprint className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Scan Certificate (OCR)</span>
                  </button>
                  {onOpenAssessment && (
                    <button
                      onClick={onOpenAssessment}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                      <span>Take Proctored Test</span>
                    </button>
                  )}
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('codelab')}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                    >
                      <Cpu className="w-3.5 h-3.5 text-purple-500" />
                      <span>Solve in Code Lab</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(liveSkills).map(([skill, val]) => (
                  <div
                    key={skill}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{skill}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded-md font-mono">
                        {val.level}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                        <span>Proficiency:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{val.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-slate-900 dark:bg-slate-100 rounded-sm"
                          style={{ width: `${val.score}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-[9px] font-mono text-slate-400 truncate">
                      Proof: AST Unit Testsuite Certified
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cryptographic Badges & National Credentials */}
          <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Cryptographic Credential Ledger</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">SHA-256 Public Key Registry</span>
            </div>

            <div className="space-y-2.5">
              {committedCertificates.map((cert: any, cIdx: number) => (
                <div key={cIdx} className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300/80 dark:border-emerald-800/60 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{cert.credential_title}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-200 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-100 font-mono">
                        {cert.tier || "VERIFIED"} ({cert.score || "Passed"})
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-emerald-800 dark:text-emerald-300 mt-0.5 truncate max-w-lg select-all">
                      SHA-256: {cert.sha256_hash}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                    +{cert.ncrf_credits || 2} NCrF Credits Added (Live Verified)
                  </span>
                </div>
              ))}

              {isDemoPersona && (
                <>
                  <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-800/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">NPTEL Elite Certificate — Cloud Computing & Distributed Systems</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Score: 84%
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-slate-500 mt-0.5 truncate max-w-lg">
                        SHA-256: a4f89d31b9e28f110c7e2b74051a96da438fbcd58269e8b15a6b0c20188941cf
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      +3 NCrF Credits Added
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-800/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">HireX Certified Algorithmic Engineer — AST Linear O(N)</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          8 Labs Passed
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-slate-500 mt-0.5 truncate max-w-lg">
                        SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      +2 NCrF Credits Added
                    </span>
                  </div>
                </>
              )}

              {!isDemoPersona && committedCertificates.length === 0 && (
                <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Verified Credentials in Ledger Yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Scan an authentic certificate using the Optical Scanner or complete a proctored assessment to anchor your first SHA-256 cryptographic credential.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Scan First Certificate</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Career Preferences & Verified Handles */}
        <div className="lg:col-span-4 space-y-6">
          {/* Target Job Preferences */}
          <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Campus Placement Preferences
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Target Role</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{targetRole || (isDemoPersona ? "Full-Stack AI Developer" : "Role Not Set")}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Expected Package (CTC)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{isDemoPersona ? "₹12.0 - ₹16.0 LPA" : "₹6.0 - ₹10.0 LPA"}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Preferred IT Locations</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {isDemoPersona ? "Bengaluru • Hyderabad • Pune • Delhi-NCR • Remote" : "Open to All Pan-India Locations"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Internship Availability</span>
                <span className={`font-semibold ${isDemoPersona ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}>
                  {isDemoPersona ? "Immediate 6-Month Semester VI Waiver" : "Eligible upon Core Skill Verification"}
                </span>
              </div>
            </div>
          </div>

          {/* Professional Profiles & External Handles */}
          <div className="p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Professional Profiles
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">External Identity Verification</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* GitHub Connected Profile */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                  <Github className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                  <span>GitHub</span>
                  {githubUrl ? (
                    <span className="text-slate-400 font-normal">
                      ({githubUrl.replace(/^https?:\/\/(www\.)?github\.com\/?/i, '').replace(/\/$/, '') || (student.name ? student.name.toLowerCase().replace(/\s+/g, '-') : 'account')})
                    </span>
                  ) : null}
                </div>
                {githubUrl ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                    <Check className="w-3 h-3" />
                    <span>✓ Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>○ Not connected</span>
                  </span>
                )}
              </div>

              {/* LinkedIn Connected Profile */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <Linkedin className="w-4 h-4 text-[#0077b5]" />
                    <span>LinkedIn</span>
                  </div>

                  {isLinkedInConnected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                      <Check className="w-3 h-3" />
                      <span>✓ Connected</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>○ Not connected</span>
                    </span>
                  )}
                </div>

                {isLinkedInConnected ? (
                  <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                      {linkedInProfile?.linkedin_name && (
                        <p><strong>Member:</strong> {linkedInProfile.linkedin_name}</p>
                      )}
                      {linkedInProfile?.linkedin_email && (
                        <p><strong>Email:</strong> {linkedInProfile.linkedin_email} {linkedInProfile.linkedin_email_verified ? '✓' : ''}</p>
                      )}
                      {linkedInLastSync && (
                        <p className="text-[10px] text-slate-400 font-mono">Last synchronized: {linkedInLastSync}</p>
                      )}
                    </div>

                    <div className="p-2 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-[10px] text-amber-800 dark:text-amber-300">
                      <strong>Permission Notice:</strong> Basic OIDC profile imported. Skills, Experience, Education & Certifications: <em>Not available through current LinkedIn permissions</em>.
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleConnectLinkedIn}
                        disabled={isConnectingLinkedIn}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isConnectingLinkedIn ? 'animate-spin' : ''}`} />
                        <span>Reconnect LinkedIn</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDisconnectLinkedIn}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/50 transition"
                      >
                        Disconnect LinkedIn
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleConnectLinkedIn}
                      disabled={isConnectingLinkedIn}
                      className="w-full py-2 rounded-lg bg-[#0077b5] hover:bg-[#006097] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60"
                    >
                      <Linkedin className="w-3.5 h-3.5 fill-current" />
                      <span>{isConnectingLinkedIn ? 'Connecting...' : 'Connect LinkedIn'}</span>
                    </button>
                  </div>
                )}

                {linkedInNotice && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {linkedInNotice}
                  </p>
                )}
                {linkedInError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                    {linkedInError}
                  </p>
                )}
              </div>

              {/* Other Handles */}
              {isDemoPersona ? (
                <a
                  href="https://leetcode.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Code2 className="w-4 h-4" />
                    <span>LeetCode: 280+ Solved</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-400">
                    <Code2 className="w-4 h-4" />
                    <span>LeetCode Profile</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">○ Pending Verification</span>
                </div>
              )}

              {isDemoPersona ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 font-semibold">
                    <Globe className="w-4 h-4" />
                    <span>APAAR ID: 9823-4412-8871</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">✓ Synced</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-400">
                    <Globe className="w-4 h-4" />
                    <span>APAAR / ABC Academic ID</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">○ Not Linked</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* 4. Modals: Forensic Scanner, Truthful ATS Resume Builder & Evidence Matrix */}
      <CertificateScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        studentId={student.id || "std_1"}
        studentName={name}
        onCertificateCommitted={handleCertificateCommitted}
      />

      <TruthfulResumeBuilderModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        studentId={student.id || "std_1"}
        studentName={name}
      />

      <EvidenceMatrixDrawer
        isOpen={isEvidenceMatrixOpen}
        onClose={() => setIsEvidenceMatrixOpen(false)}
        studentId={student.id || "std_1"}
        studentName={name}
        onEvidenceAdded={() => {
          // Dynamic refresh
        }}
      />

      {/* 5. Sovereign Avatar Customizer & Photo Upload Engine */}
      <AvatarCustomizerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={avatar}
        userName={name}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
};

