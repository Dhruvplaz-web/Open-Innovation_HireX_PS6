import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Building2, 
  Sun, 
  Moon, 
  Zap, 
  Check, 
  ChevronRight, 
  X,
  ExternalLink,
  Award
} from 'lucide-react';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/common/SEOHead';
import { ResumeOnboardingSection, extractSkillsFromText } from '../components/auth/ResumeOnboardingSection';

interface AuthViewProps {
  onEnterRole: (role: Role) => void;
  onNavigateTab: (tab: string) => void;
  initialMode?: 'signin' | 'signup';
  isDark?: boolean;
  toggleDark?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onEnterRole,
  onNavigateTab,
  initialMode = 'signin',
  isDark = true,
  toggleDark
}) => {
  const { 
    userProfile, 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    saveOnboardingProfile, 
    switchDemoRole,
    sendPasswordReset
  } = useAuth();

  // Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'signup' || modeParam === 'signin') return modeParam;
    return initialMode;
  });

  // Carousel Active Slide (0, 1, 2)
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [resetSentNotice, setResetSentNotice] = useState('');

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter your email address in the field above to receive a password reset link.');
      return;
    }
    setErrorMsg('');
    try {
      await sendPasswordReset(email);
      setResetSentNotice(`Password reset instructions sent to ${email}. Check your inbox!`);
      setTimeout(() => setResetSentNotice(''), 6000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch password reset email.');
    }
  };

  // Role Selection (Default: Student)
  const [selectedRole, setSelectedRole] = useState<Role>(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role') as Role;
    if (['student', 'recruiter', 'academician', 'admin', 'alumni'].includes(roleParam)) {
      return roleParam;
    }
    return userProfile?.role || 'student';
  });

  // Judge Fast Pass Drawer Toggle
  const [showFastPassDrawer, setShowFastPassDrawer] = useState(false);

  // Status & Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2 Onboarding Wizard State
  const [showOnboarding, setShowOnboarding] = useState(false);
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

  // Synchronize URL query params (?mode=...&role=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('mode', authMode);
    params.set('role', selectedRole);
    const newRelativePathQuery = window.location.pathname + '?' + params.toString();
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [authMode, selectedRole]);

  // Automatic Carousel Rotation every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Carousel Slides Content
  const slides = [
    {
      image: '/images/auth-campus.jpg',
      headlineTop: 'Connecting Campus Talent,',
      headlineBottom: 'Accelerating Careers',
      badge: 'SPPU Tech Ecosystem'
    },
    {
      image: '/images/auth-codelab.jpg',
      headlineTop: 'Verifying In-Browser AST Code,',
      headlineBottom: 'Eliminating Resume Fluff',
      badge: 'Algorithmic Proof Engine'
    },
    {
      image: '/images/auth-campus.jpg',
      headlineTop: 'Curriculum Diagnostics &',
      headlineBottom: 'Zero-Bias AI Matching',
      badge: 'Institutional Workforce Planning'
    }
  ];

  // 1-Click Google OAuth Provider
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const profile = await loginWithGoogle();
      if (!profile?.isOnboarded) {
        setShowOnboarding(true);
      } else {
        onEnterRole(profile?.role || 'student');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in encountered an issue. Please verify browser popup settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms && authMode === 'signup') {
      setErrorMsg('Please agree to the Terms & Conditions to proceed.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        const profile = await loginWithEmail(email, password);
        // If a new user signs in without having completed their resume onboarding, direct them to Onboarding
        if (!profile?.isOnboarded) {
          setShowOnboarding(true);
        } else {
          onEnterRole(profile?.role || 'student');
        }
      } else {
        const fullName = `${firstName} ${lastName}`.trim() || 'New Member';
        await registerWithEmail(email, password, fullName);
        setShowOnboarding(true);
      }
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found') {
        if (authMode === 'signin') {
          setErrorMsg('Account not found with these credentials. If you are new, switch to "Sign up" to create your account in 1 click.');
        } else {
          setErrorMsg('Invalid registration credentials. Please verify your email and password.');
        }
      } else if (err?.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Switch to "Log in" to sign in.');
      } else if (err?.code === 'auth/weak-password') {
        setErrorMsg('Password is too short. Please use at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication error. Please verify credentials.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Onboarding Step 2 Save Handler (Includes Resume & Detected Skills)
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
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
        cgpa: Number(cgpa),
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
      onEnterRole(selectedRole);
    } catch (err: any) {
      setErrorMsg('Failed to save profile details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fast-Pass Demo Persona Selector for Judges
  const handleSelectDemoPersona = (role: Role) => {
    switchDemoRole(role);
    onEnterRole(role);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-10 select-none font-sans transition-colors duration-200 bg-gradient-to-br from-[#f0f4fd] via-[#f4f2ff] to-[#edf3fe] dark:from-[#0b0f19] dark:via-[#0d1326] dark:to-[#0a0d18] text-slate-900 dark:text-slate-100">
      <SEOHead
        title={authMode === 'signup' ? 'Create an Account | HireX' : 'Sign In | HireX'}
        description="Join the AI-native campus talent intelligence platform to verify skills and access campus drives."
        path="/login"
      />

      {/* Main Container Card (Soft Glassmorphic Elevated Panel) */}
      <div className={`w-full max-w-5xl rounded-[32px] overflow-hidden border shadow-2xl transition-colors duration-200 relative backdrop-blur-xl ${
        isDark 
          ? 'bg-[#121829]/95 border-slate-800/80 shadow-black/60' 
          : 'bg-white/95 border-blue-200/70 shadow-xl shadow-blue-500/10'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 p-3 sm:p-4 lg:p-6 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT INSET IMAGE CARD (Exact replicate of reference) */}
          <div className="lg:col-span-5 min-h-[460px] sm:min-h-[520px] lg:min-h-[620px] rounded-[24px] relative overflow-hidden flex flex-col justify-between p-6 sm:p-7 shadow-xl select-none group">
            
            {/* Background Image with Smooth Crossfade */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out transform scale-105 group-hover:scale-110"
              style={{ backgroundImage: `url('${slides[activeSlide].image}')` }}
            />

            {/* Cinematic Gradient Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/30" />
            <div className="absolute inset-0 bg-indigo-950/20 mix-blend-overlay" />

            {/* Top Bar inside Image: Brand Logo (Left) & Back to Website (Right) */}
            <div className="relative z-10 flex items-center justify-between w-full">
              {/* Brand Logo (Matching NMU style in reference image) */}
              <div 
                onClick={() => onNavigateTab('landing')}
                className="flex items-center gap-2.5 cursor-pointer group/logo"
              >
                <div className="w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center font-bold shadow-md shadow-black/20 group-hover/logo:scale-105 transition">
                  <svg className="w-4 h-4" viewBox="0 0 64 64" fill="none">
                    <circle cx="20" cy="42" r="5" fill="#4f46e5"/>
                    <circle cx="44" cy="42" r="5" fill="#10b981"/>
                    <circle cx="32" cy="22" r="6" fill="#0f172a"/>
                    <path d="M20 42 C 24 28, 40 28, 44 42" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base text-white tracking-wider leading-none">
                    HireX
                  </span>
                  <span className="text-[9px] font-mono text-indigo-300 font-semibold tracking-widest uppercase mt-0.5">
                    Talent Intel
                  </span>
                </div>
              </div>

              {/* Back to Website Pill Button (Matching reference top right) */}
              <button
                type="button"
                onClick={() => onNavigateTab('landing')}
                className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>Back to website</span>
                <span className="text-sm">→</span>
              </button>
            </div>

            {/* Bottom Section inside Image: Headline & Carousel Dots */}
            <div className="relative z-10 space-y-5 text-center sm:text-left">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded-full border border-indigo-500/30 inline-block mb-1">
                  {slides[activeSlide].badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
                  {slides[activeSlide].headlineTop} <br className="hidden sm:inline" />
                  {slides[activeSlide].headlineBottom}
                </h3>
              </div>

              {/* Carousel Indicators (Exact match of reference image: - - —) */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSlide === idx 
                        ? 'w-8 bg-white shadow-sm' 
                        : 'w-4 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Authentication Form (Exact match of reference layout) */}
          <div className="lg:col-span-7 flex flex-col justify-center px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
            
            {/* Top Toolbar: Theme Switcher Pill (Sun/Moon) */}
            <div className="flex items-center justify-end mb-4">
              {toggleDark && (
                <button
                  type="button"
                  onClick={toggleDark}
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 shadow-xs ${
                    isDark 
                      ? 'bg-[#202236] border-slate-700/80 text-slate-300 hover:text-white' 
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {isDark ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-mono">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[11px] font-mono">Dark Mode</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error Notification Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 2 ONBOARDING WIZARD */}
            {showOnboarding ? (
              <form onSubmit={handleCompleteOnboarding} className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-1">
                    Step 2 of 2: Telemetry Setup
                  </span>
                  <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Complete Your Placement Identity
                  </h2>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Set your institutional college, academic year, and career targets.
                  </p>
                </div>

                {/* Role Persona Radio Tabs */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Select Your Persona
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { role: 'student' as Role, label: 'Student', icon: GraduationCap },
                      { role: 'recruiter' as Role, label: 'Recruiter', icon: Briefcase },
                      { role: 'academician' as Role, label: 'College', icon: Building2 },
                      { role: 'admin' as Role, label: 'TPO Admin', icon: Shield },
                      { role: 'alumni' as Role, label: 'Alumni', icon: Award }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedRole === item.role;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setSelectedRole(item.role)}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold shadow-xs'
                              : isDark
                              ? 'bg-[#202236] border-slate-700/60 text-slate-400 hover:text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Role-Specific Form Fields */}
                {selectedRole === 'student' ? (
                  <div className="space-y-4">
                    {/* Resume Upload & Telemetry Ingestion */}
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
                      isDark={isDark}
                    />

                    {/* Academic & Institutional Records */}
                    <div className="pt-3 border-t border-slate-700/40">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          Academic & Institutional Records
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-mono">TPO Gatekeeper Verification</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="sm:col-span-2 space-y-1">
                          <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>College / University</label>
                          <input
                            type="text"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            placeholder="e.g. JSPM RSCOE Pune, IIT Bombay, COEP Tech"
                            className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs ${
                              isDark 
                                ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500' 
                                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Department / Branch</label>
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Computer Engineering"
                            className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs ${
                              isDark 
                                ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500' 
                                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Academic Year</label>
                          <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs ${
                              isDark 
                                ? 'bg-[#202236] border-slate-700/70 text-white focus:border-indigo-500' 
                                : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                            }`}
                          >
                            <option value="1st Year">1st Year (FE)</option>
                            <option value="2nd Year">2nd Year (SE)</option>
                            <option value="3rd Year">3rd Year (TE)</option>
                            <option value="4th Year">Final Year (BE)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Current CGPA (out of 10.0)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={cgpa}
                            onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                            className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs ${
                              isDark 
                                ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500' 
                                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Target Career Role</label>
                          <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="Full-Stack AI Engineer"
                            className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs ${
                              isDark 
                                ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500' 
                                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                            }`}
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                          <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>University PRN / Roll No (Optional)</label>
                          <input
                            type="text"
                            value={prn}
                            onChange={(e) => setPrn(e.target.value)}
                            placeholder="e.g. 72153921K (SPPU PRN)"
                            className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs ${
                              isDark 
                                ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500' 
                                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Organization</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Barclays, Persistent"
                        className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs ${
                          isDark 
                            ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500' 
                            : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Designation</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="Campus Talent Lead"
                        className={`w-full px-3 py-2.5 rounded-xl border outline-none text-xs ${
                          isDark 
                            ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500' 
                            : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>{isSubmitting ? 'Saving Telemetry Profile...' : 'Complete Setup & Launch Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* PRIMARY SIGN UP / LOG IN SCREEN (Exact reference screenshot) */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header & Subtitle */}
                <div className="space-y-2">
                  <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {authMode === 'signup' ? 'Create an account' : 'Welcome back'}
                  </h1>

                  <div className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {authMode === 'signup' ? (
                      <p>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('signin')}
                          className="text-indigo-500 hover:text-indigo-400 font-semibold underline underline-offset-2 transition"
                        >
                          Log in
                        </button>
                      </p>
                    ) : (
                      <p>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('signup')}
                          className="text-indigo-500 hover:text-indigo-400 font-semibold underline underline-offset-2 transition"
                        >
                          Sign up
                        </button>
                      </p>
                    )}
                  </div>
                </div>

                {/* Feedback Banners */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {resetSentNotice && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-start gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{resetSentNotice}</span>
                  </div>
                )}

                {/* Form Elements */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* First Name & Last Name (Side by side like Fletcher / Last name in image) */}
                  {authMode === 'signup' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                          className={`w-full p-3.5 rounded-xl border text-sm outline-none transition ${
                            isDark 
                              ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white'
                          }`}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last name"
                          className={`w-full p-3.5 rounded-xl border text-sm outline-none transition ${
                            isDark 
                              ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className={`w-full p-3.5 rounded-xl border text-sm outline-none transition ${
                        isDark 
                          ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white'
                      }`}
                    />
                  </div>

                  {/* Password Field with Eye Icon */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full p-3.5 pr-11 rounded-xl border text-sm outline-none transition ${
                        isDark 
                          ? 'bg-[#202236] border-slate-700/70 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition ${
                        isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Checkbox: I agree to Terms & Conditions (like in reference image) */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="w-4 h-4 rounded-md accent-indigo-600 cursor-pointer"
                      />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                        {authMode === 'signup' ? (
                          <>
                            I agree to the{' '}
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateTab('terms-of-service');
                              }}
                              className="underline hover:text-indigo-400"
                            >
                              Terms &amp; Conditions
                            </span>
                          </>
                        ) : (
                          'Remember credentials'
                        )}
                      </span>
                    </label>

                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold transition hover:underline"
                        title="Send password reset link to your email"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  {/* Primary Action Button (Matching reference button) */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 mt-1"
                  >
                    <span>
                      {isSubmitting 
                        ? 'Verifying...' 
                        : authMode === 'signup' 
                          ? 'Create account' 
                          : 'Log in'}
                    </span>
                  </button>
                </form>

                {/* Social Login Divider (Matching reference: "Or register with" / "Or log in with") */}
                <div className="relative flex items-center justify-center my-4">
                  <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
                  <span className={`absolute px-3 text-[11px] font-mono uppercase tracking-wider ${
                    isDark ? 'bg-[#181926] text-slate-500' : 'bg-white text-slate-400'
                  }`}>
                    {authMode === 'signup' ? 'Or register with' : 'Or log in with'}
                  </span>
                </div>

                {/* Social Buttons Row: Google & Judge Fast-Pass */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-xs active:scale-98 ${
                      isDark 
                        ? 'bg-[#202236] border-slate-700/80 text-white hover:bg-[#282b45]' 
                        : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Judge Fast-Pass Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setShowFastPassDrawer(!showFastPassDrawer)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs active:scale-98 ${
                      showFastPassDrawer
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : isDark
                        ? 'bg-[#202236] border-slate-700/80 text-indigo-400 hover:bg-[#282b45]'
                        : 'bg-white border-slate-300 text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current text-indigo-400" />
                    <span>Demo Sandbox</span>
                  </button>
                </div>

                {/* ENTERPRISE ROLE SANDBOX DRAWER */}
                {showFastPassDrawer && (
                  <div className={`p-4 rounded-2xl border transition-all animate-in slide-in-from-top-2 duration-200 ${
                    isDark 
                      ? 'bg-[#151624] border-indigo-500/40 text-white' 
                      : 'bg-indigo-50/70 border-indigo-200 text-slate-900'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-400 fill-current" />
                        1-Click Role Sandbox
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowFastPassDrawer(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className={`text-[11px] mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Select an avatar to immediately bypass login and test full portal datasets:
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleSelectDemoPersona('student')}
                        className={`p-2 rounded-xl border text-left transition flex items-center justify-between group ${
                          isDark 
                            ? 'bg-[#202236] border-slate-700 hover:border-emerald-500' 
                            : 'bg-white border-slate-200 hover:border-emerald-500'
                        }`}
                      >
                        <div>
                          <span className="font-bold block group-hover:text-emerald-400">Student</span>
                          <span className="text-[10px] text-slate-400 font-mono">Dhruv (JSPM)</span>
                        </div>
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoPersona('recruiter')}
                        className={`p-2 rounded-xl border text-left transition flex items-center justify-between group ${
                          isDark 
                            ? 'bg-[#202236] border-slate-700 hover:border-indigo-500' 
                            : 'bg-white border-slate-200 hover:border-indigo-500'
                        }`}
                      >
                        <div>
                          <span className="font-bold block group-hover:text-indigo-400">Recruiter</span>
                          <span className="text-[10px] text-slate-400 font-mono">Barclays Lead</span>
                        </div>
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoPersona('academician')}
                        className={`p-2 rounded-xl border text-left transition flex items-center justify-between group ${
                          isDark 
                            ? 'bg-[#202236] border-slate-700 hover:border-sky-500' 
                            : 'bg-white border-slate-200 hover:border-sky-500'
                        }`}
                      >
                        <div>
                          <span className="font-bold block group-hover:text-sky-400">Dean / College</span>
                          <span className="text-[10px] text-slate-400 font-mono">HOD Computer</span>
                        </div>
                        <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoPersona('admin')}
                        className={`p-2 rounded-xl border text-left transition flex items-center justify-between group ${
                          isDark 
                            ? 'bg-[#202236] border-slate-700 hover:border-purple-500' 
                            : 'bg-white border-slate-200 hover:border-purple-500'
                        }`}
                      >
                        <div>
                          <span className="font-bold block group-hover:text-purple-400">TPO Admin</span>
                          <span className="text-[10px] text-slate-400 font-mono">Placement Dir</span>
                        </div>
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoPersona('alumni')}
                        className={`p-2 rounded-xl border text-left transition flex items-center justify-between group col-span-2 sm:col-span-1 ${
                          isDark 
                            ? 'bg-[#202236] border-slate-700 hover:border-amber-500' 
                            : 'bg-white border-slate-200 hover:border-amber-500'
                        }`}
                      >
                        <div>
                          <span className="font-bold block group-hover:text-amber-400">Alumni Lead</span>
                          <span className="text-[10px] text-slate-400 font-mono">Vikram (Google)</span>
                        </div>
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
