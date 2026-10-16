import React from 'react';
import { Home, Briefcase, Code2, Zap, Award, User, Sun, Moon, Info, ShieldCheck, UserCheck, GraduationCap, Building, FolderGit2, Lock } from 'lucide-react';
import { Role } from '../../types';

interface LeftIconRailProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  toggleDark: () => void;
  openModal: (modal: string) => void;
  currentRole?: Role;
}

export const LeftIconRail: React.FC<LeftIconRailProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleDark,
  openModal,
  currentRole = 'student'
}) => {
  return (
    <aside className="w-16 md:w-20 flex flex-col items-center justify-between py-6 px-2 select-none shrink-0" aria-label="Main Navigation">
      {/* Top Logo Icon -> Navigates to Landing Page */}
      <div 
        onClick={() => setActiveTab('landing')}
        title="HireX Landing Page • JSPM RSCOE"
        className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-sm cursor-pointer hover:scale-102 active:scale-98 transition-all duration-150 group relative border border-slate-800 dark:border-slate-200"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span className="absolute left-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md border border-slate-800 dark:border-slate-200">
          Return to Landing Page
        </span>
      </div>

      {/* Center Nav Rail Container — Student Functions */}
      <nav className="flex flex-col items-center bg-white dark:bg-slate-900/90 backdrop-blur-md py-3 px-1.5 rounded-2xl shadow-sm border border-slate-200/90 dark:border-slate-800 gap-1.5 my-auto">
        {currentRole === 'student' ? (
          <>
            {/* 1. Command Center / Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              title="Command Center (Readiness & Peer Benchmarks)"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              aria-label="Dashboard"
            >
              <Home className="w-4.5 h-4.5" />
            </button>

            {/* 1.5 Skill Verification & Proctored Assessment */}
            <button
              onClick={() => setActiveTab('passport')}
              title="Skill Verification & Proctored Assessment (3 Tiers, Biometric & Fullscreen Integrity)"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'passport' || activeTab === 'skill-passport' || activeTab === 'skill-verification' || activeTab === 'verification'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
              }`}
              aria-label="Skill Verification"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
            </button>

            {/* 2. Project & Research Collaboration Hub */}
            <button
              onClick={() => setActiveTab('collaboration')}
              title="Project & Research Collaboration Hub (Capstone & R&D)"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'collaboration' || activeTab === 'project-hub'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-amber-500 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60'
              }`}
              aria-label="Collaboration Hub"
            >
              <FolderGit2 className="w-4.5 h-4.5" />
            </button>

            {/* 2.7 Anonymous / Incognito Talent Matching */}
            <button
              onClick={() => setActiveTab('incognito')}
              title="Incognito Talent Matching & Recruiter Invitations"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'incognito' || activeTab === 'talent-visibility'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-purple-600 hover:text-purple-800 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60'
              }`}
              aria-label="Incognito Talent"
            >
              <Lock className="w-4.5 h-4.5" />
            </button>

            {/* 3. Campus Placement Drives & ATS Scanner */}
            <button
              onClick={() => setActiveTab('opportunities')}
              title="Campus Drives & ATS Resume Scanner"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'opportunities'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              aria-label="Campus Drives"
            >
              <Briefcase className="w-4.5 h-4.5" />
            </button>

            {/* 4. In-Browser Code Lab & AST Complexity Auditor */}
            <button
              onClick={() => setActiveTab('codelab')}
              title="Algorithmic Code Lab & AST Auditor"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'codelab'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              aria-label="Code Lab"
            >
              <Code2 className="w-4.5 h-4.5" />
            </button>

            {/* 5. Algorithmic Code Lab & AST Arena (Upgraded Aptitude) */}
            <button
              onClick={() => setActiveTab('aptitude')}
              title="Algorithmic Code Lab & AST Arena"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'aptitude'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              aria-label="Algorithmic Code Lab & AST Arena"
            >
              <Zap className="w-4.5 h-4.5" />
            </button>

            {/* 6. AICTE Skill Transcript & Mock Interview */}
            <button
              onClick={() => setActiveTab('transcript')}
              title="Official AICTE Skill Transcript & AI Mock Interview"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'transcript'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              aria-label="Skill Transcript"
            >
              <Award className="w-4.5 h-4.5" />
            </button>

            {/* 7. Verified Student Profile & Portfolio */}
            <button
              onClick={() => setActiveTab('profile')}
              title="Complete Student Profile & Portfolio"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              aria-label="Student Profile"
            >
              <User className="w-4.5 h-4.5" />
            </button>
          </>
        ) : (
          <>
            {/* Non-Student Role Primary Workspace */}
            <button
              onClick={() => setActiveTab('dashboard')}
              title={`${currentRole.toUpperCase()} Portal Workspace`}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              aria-label="Portal Workspace"
            >
              {currentRole === 'academician' ? (
                <GraduationCap className="w-4.5 h-4.5" />
              ) : currentRole === 'recruiter' ? (
                <Briefcase className="w-4.5 h-4.5" />
              ) : (
                <ShieldCheck className="w-4.5 h-4.5" />
              )}
            </button>

            {/* Non-Student Collaboration Hub Shortcut */}
            <button
              onClick={() => setActiveTab('collaboration')}
              title="Project & Research Collaboration Hub"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'collaboration'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-amber-500 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60'
              }`}
              aria-label="Collaboration Hub"
            >
              <FolderGit2 className="w-4.5 h-4.5" />
            </button>
          </>
        )}

        <div className="w-5 h-[1px] bg-slate-200 dark:bg-slate-800 my-1" />

        {/* Info */}
        <button
          onClick={() => openModal('about')}
          title="About Project & Hackathon"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
          aria-label="About Project"
        >
          <Info className="w-4.5 h-4.5" />
        </button>

        {/* Account & Firebase Authentication */}
        <button
          onClick={() => setActiveTab('login')}
          title="Firebase Auth & Persona Gateway"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
          aria-label="Account & Auth"
        >
          <UserCheck className="w-4.5 h-4.5" />
        </button>

        {/* Legal & Compliance */}
        <button
          onClick={() => openModal('legal')}
          title="Compliance & DPDP Act 2023"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
          aria-label="Legal & Compliance"
        >
          <ShieldCheck className="w-4.5 h-4.5" />
        </button>
      </nav>

      {/* Bottom Theme Switcher Pill (Sun/Moon) */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-xl shadow-sm border border-slate-200/90 dark:border-slate-800 flex flex-col gap-1">
        <button
          onClick={toggleDark}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            !isDark ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Light mode"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleDark}
          title={isDark ? "Dark mode active" : "Switch to Dark Mode"}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isDark ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
          aria-label="Dark mode"
        >
          <Moon className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
