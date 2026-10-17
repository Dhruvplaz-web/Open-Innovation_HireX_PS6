import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  Shield, 
  GraduationCap, 
  Briefcase, 
  Lock, 
  Mail, 
  CheckCircle2, 
  LogOut, 
  ArrowRight,
  School,
  Building2,
  Sparkles,
  AlertCircle,
  Award
} from 'lucide-react';
import { Role } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ResumeOnboardingSection, extractSkillsFromText } from '../auth/ResumeOnboardingSection';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: Role) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSelectRole }) => {
  const { 
    currentUser, 
    userProfile, 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    logout, 
    saveOnboardingProfile, 
    switchDemoRole 
  } = useAuth();

  // Mode: 'auth' | 'onboarding' | 'demo'
  const [activeTab, setActiveTab] = useState<'auth' | 'demo'>('auth');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Onboarding wizard form states
  const [selectedRole, setSelectedRole] = useState<Role>(userProfile?.role || 'student');
  const [college, setCollege] = useState(userProfile?.college || 'JSPM RSCOE, Pune');
  const [department, setDepartment] = useState(userProfile?.department || 'Computer Engineering');
  const [year, setYear] = useState(userProfile?.year || '3rd Year');
  const [cgpa, setCgpa] = useState<number>(userProfile?.cgpa || 8.5);
  const [prn, setPrn] = useState(userProfile?.prn || '');
  const [targetRole, setTargetRole] = useState(userProfile?.targetRole || 'Full-Stack AI Engineer');
  const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
  const [designation, setDesignation] = useState(userProfile?.designation || '');

  // Resume & ATS Skill Ingestion State
  const [resumeText, setResumeText] = useState(userProfile?.resumeText || '');
  const [resumeFileName, setResumeFileName] = useState(userProfile?.resumeFileName || '');
  const [githubUrl, setGithubUrl] = useState(userProfile?.githubUrl || 'https://github.com/dhruv-patil');
  const [linkedinUrl, setLinkedinUrl] = useState(userProfile?.linkedinUrl || '');
  const [detectedSkills, setDetectedSkills] = useState<string[]>(() => {
    return userProfile?.detectedSkills || extractSkillsFromText(userProfile?.resumeText || '');
  });

  // Step 2 profile setup screen flag
  const [showProfileSetup, setShowProfileSetup] = useState(!userProfile?.isOnboarded && !!currentUser);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const profile = await loginWithGoogle();
      if (!profile?.isOnboarded) {
        setShowProfileSetup(true);
      } else {
        onSelectRole(profile.role);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in with Google. Check popup permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        const profile = await loginWithEmail(email, password);
        if (!profile?.isOnboarded) {
          setShowProfileSetup(true);
        } else {
          onSelectRole(profile.role);
          onClose();
        }
      } else {
        await registerWithEmail(email, password, name);
        setShowProfileSetup(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'student' && !resumeText.trim()) {
      setErrorMsg('Please upload your resume file or paste your resume text to complete onboarding.');
      return;
    }
    setIsSubmitting(true);
    try {
      await saveOnboardingProfile({
        role: selectedRole,
        college,
        department,
        year,
        cgpa,
        prn,
        targetRole,
        companyName,
        designation,
        resumeText,
        resumeFileName,
        githubUrl,
        linkedinUrl,
        detectedSkills
      });
      onSelectRole(selectedRole);
      setShowProfileSetup(false);
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to save profile details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoUsers = [
    {
      role: 'student' as Role,
      name: 'Dhruv Patil',
      title: '3rd Year Computer Engineering • JSPM RSCOE, Pune',
      icon: GraduationCap,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhruv',
      badge: 'Verified Student',
      score: '88% Score'
    },
    {
      role: 'recruiter' as Role,
      name: 'Priya Sharma',
      title: 'Campus Talent Partner • Barclays India (Bengaluru & Pune)',
      icon: Briefcase,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      badge: 'Corporate Recruiter',
      score: '4 Active Drives'
    },
    {
      role: 'academician' as Role,
      name: 'Dr. Rajesh Kulkarni',
      title: 'Head of Department • Institutional Academic Lead',
      icon: Shield,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
      badge: 'College HOD',
      score: 'NBA / NAAC Accredited'
    },
    {
      role: 'admin' as Role,
      name: 'Admin Controller',
      title: 'National Platform & AICTE Governance Lead',
      icon: Lock,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      badge: 'System Admin',
      score: 'Master Access'
    },
    {
      role: 'alumni' as Role,
      name: 'Vikram Aditya',
      title: 'Staff Software Engineer • Google (JSPM RSCOE 2021)',
      icon: Award,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
      badge: 'Distinguished Alumni',
      score: '480 Impact Pts'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="hub-card w-full max-w-xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            {showProfileSetup ? (
              <Sparkles className="w-5 h-5 text-emerald-400" />
            ) : (
              <UserCheck className="w-5 h-5 text-white" />
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {showProfileSetup 
              ? 'Complete Your Placement Profile' 
              : currentUser 
                ? 'Your Verified Account' 
                : 'Sign In to HireX'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {showProfileSetup
              ? 'Personalize your college affiliation, academic telemetry, and career targets.'
              : currentUser
                ? `Signed in as ${currentUser.email}`
                : 'Access verified skill assessments, campus drives, and AST code audits.'}
          </p>
        </div>

        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* VIEW 1: Progressive Profile Setup (Onboarding Wizard) */}
        {showProfileSetup ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Persona Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedRole === 'student'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-xs font-bold">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('recruiter')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedRole === 'recruiter'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-xs font-bold">Recruiter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('academician')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    selectedRole === 'academician'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <School className="w-5 h-5" />
                  <span className="text-xs font-bold">College HOD</span>
                </button>
              </div>
            </div>

            {/* Student Specific Fields */}
            {selectedRole === 'student' && (
              <div className="space-y-4">
                {/* Resume Upload & Live ATS Telemetry Section */}
                <ResumeOnboardingSection
                  resumeText={resumeText}
                  setResumeText={setResumeText}
                  resumeFileName={resumeFileName}
                  setResumeFileName={setResumeFileName}
                  detectedSkills={detectedSkills}
                  setDetectedSkills={setDetectedSkills}
                  githubUrl={githubUrl}
                  setGithubUrl={setGithubUrl}
                  linkedinUrl={linkedinUrl}
                  setLinkedinUrl={setLinkedinUrl}
                  isDark={true}
                />

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Academic & Institutional Credentials
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono">TPO Clearance</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      College / Institute
                    </label>
                    <select
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="IIT Bombay, Mumbai">IIT Bombay, Mumbai</option>
                      <option value="BITS Pilani">BITS Pilani</option>
                      <option value="IIIT Hyderabad">IIIT Hyderabad</option>
                      <option value="NIT Surathkal">NIT Surathkal</option>
                      <option value="RV College of Engineering, Bengaluru">RVCE Bengaluru</option>
                      <option value="Delhi Technological University (DTU)">DTU Delhi</option>
                      <option value="COEP Technological University">COEP Tech, Pune</option>
                      <option value="JSPM RSCOE, Pune">JSPM RSCOE, Pune</option>
                      <option value="Anna University (CEG), Chennai">Anna University, Chennai</option>
                      <option value="VJTI Mumbai">VJTI Mumbai</option>
                      <option value="Other Engineering Institute">Other Indian Institute</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Branch / Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="AI & Data Science">AI & Data Science</option>
                      <option value="Electronics & Telecommunication">Electronics & Telecom (ENTC)</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Current Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="1st Year">1st Year (FE)</option>
                      <option value="2nd Year">2nd Year (SE)</option>
                      <option value="3rd Year">3rd Year (TE)</option>
                      <option value="Final Year">Final Year (BE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Current CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="4.0"
                      max="10.0"
                      value={cgpa}
                      onChange={(e) => setCgpa(parseFloat(e.target.value) || 8.0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      University PRN / Roll No <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Works without college email
                    </span>
                  </div>
                  <input
                    type="text"
                    value={prn}
                    onChange={(e) => setPrn(e.target.value)}
                    placeholder="e.g. 72153921K (SPPU PRN)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used for instant TPO Gatekeeper clearance when applying to Barclays and Persistent campus drives.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Career Role
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Full-Stack AI Engineer">Full-Stack AI Developer</option>
                    <option value="Junior Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="Cloud & DevOps Associate">Cloud & DevOps Engineer</option>
                    <option value="Frontend Architect Trainee">Frontend Architect</option>
                    <option value="Data Analytics Associate">Data Analyst</option>
                  </select>
                </div>
              </div>
            )}

            {/* Recruiter Specific Fields */}
            {selectedRole === 'recruiter' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Barclays India (Bengaluru & Pune)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Campus Talent Acquisition Lead"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Academician Specific Fields */}
            {selectedRole === 'academician' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. IIT Delhi, BITS Pilani, COEP Tech, or RVCE"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department & Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Head of Department, Computer Engineering"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 mt-4"
            >
              <span>Save & Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : currentUser ? (
          /* VIEW 2: Already Logged In Overview */
          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`}
                  alt={userProfile?.displayName || 'User'}
                  className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {userProfile?.displayName || currentUser.displayName || 'Verified User'}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-300/40">
                      Firebase Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                    {userProfile?.college} • {userProfile?.targetRole}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowProfileSetup(true)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
              >
                Edit College & PRN
              </button>
              <button
                onClick={async () => {
                  await logout();
                  setActiveTab('auth');
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 3: Main Authentication (Tabs: Sign In vs 1-Click Demo) */
          <>
            <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mb-6 max-w-xs mx-auto border border-slate-200/60 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('auth')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'auth' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Firebase Sign In
              </button>
              <button
                onClick={() => setActiveTab('demo')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'demo' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                1-Click Demo Personas
              </button>
            </div>

            {activeTab === 'auth' ? (
              <div className="space-y-4">
                {/* 1-Click Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200/90 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs md:text-sm font-bold transition flex items-center justify-center gap-3 shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google Account</span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-mono text-slate-400">or with email</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                {/* Email / Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dhruv Patil"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Personal or College)</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. dhruv.patil@gmail.com or @rscoe.edu.in"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••• (Min. 6 characters)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs mt-2"
                  >
                    {isSubmitting ? 'Authenticating...' : authMode === 'signin' ? 'Sign In to HireX' : 'Create Free Account'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                    >
                      {authMode === 'signin' 
                        ? "Don't have an account? Sign up here" 
                        : "Already have an account? Sign in here"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* 1-Click Demo Personas for Quick Hackathon Demonstration */
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-500 mb-2">
                  Switch instantly into pre-configured roles to evaluate role-specific dashboards:
                </p>
                {demoUsers.map((u) => (
                  <div
                    key={u.role}
                    onClick={() => {
                      switchDemoRole(u.role);
                      onSelectRole(u.role);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {u.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 px-1.5 py-0.5 rounded-md">
                            {u.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{u.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                        {u.score}
                      </span>
                      <button className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold transition shadow-xs">
                        Switch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
