import React, { useState } from 'react';
import { Search, Bell, LogOut, ChevronDown } from 'lucide-react';
import { Role } from '../../types';

interface TopNavBarProps {
  currentRole?: Role;
  setRole?: (role: Role) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openModal?: (modal: string) => void;
  userName: string;
  userAvatar: string;
  userTitle?: string;
  onGoToLanding?: () => void;
  onSignOut?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentRole = 'student',
  activeTab,
  setActiveTab,
  userName,
  userAvatar,
  onSignOut
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getBreadcrumbTitle = () => {
    if (currentRole === 'academician') return 'Institutional Academician & TPO Portal';
    if (currentRole === 'recruiter') return 'Corporate Recruiter & Talent Engine';
    if (currentRole === 'admin') return 'Platform Super Admin Governance';
    switch (activeTab) {
      case 'dashboard':
        return 'Placement Command Center';
      case 'opportunities':
        return 'Campus Drives & TPO Gatekeeper';
      case 'codelab':
      case 'code-lab':
        return 'Algorithmic Code Lab & AST Auditor';
      case 'aptitude':
        return 'Algorithmic Code Lab & AST Auditor';
      case 'collaboration':
      case 'project-hub':
        return 'Project & Research Collaboration Hub';
      case 'profile':
        return 'Verified Student Profile & Portfolio';
      case 'passport':
      case 'skill-passport':
      case 'skill-verification':
      case 'verification':
      case 'workflow':
      case 'journey':
        return 'Skill Verification & Proctored Assessment';
      default:
        return 'Placement Command Center';
    }
  };

  const handleSignOutClick = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      setActiveTab('landing');
    }
  };

  return (
    <header className="w-full flex items-center justify-between py-3 px-4 md:px-8 shrink-0 bg-porcelain-100/80 dark:bg-porcelain-950/80 backdrop-blur-sm z-20 border-b border-slate-200/50 dark:border-slate-800/50">
      {/* Brand Title with Live Status */}
      <div 
        onClick={() => setActiveTab('dashboard')}
        className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
      >
        <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          HireX
        </span>
        <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-3">
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-card-dark/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students, skills, jobs, opportunities..."
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden lg:inline-block text-[10px] font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700">
            ctrl K
          </kbd>
        </div>
      </div>

      {/* Right Controls: Role Badge, Notifications, Sign Out & Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Role Indicator Capsule */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs text-xs font-bold text-slate-700 dark:text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-slate-400 font-mono">ROLE:</span>
          <span className="capitalize">{currentRole}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </div>

        {/* Notification Bell with 9+ badge */}
        <button
          onClick={() => setActiveTab('opportunities')}
          title="Notifications"
          className="relative w-9 h-9 rounded-xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-white shadow-xs">
            9+
          </span>
        </button>

        {/* Sign Out Icon */}
        <button
          onClick={handleSignOutClick}
          title="Sign Out"
          className="w-9 h-9 rounded-xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-center text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Profile Icon Capsule -> Navigates to Dedicated Profile View */}
        <div 
          onClick={() => setActiveTab('profile')}
          title="View Student Profile"
          className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border shadow-xs cursor-pointer transition-all duration-150 select-none ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
              : 'bg-white dark:bg-card-dark border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="relative">
            <img 
              src={userAvatar} 
              alt={userName}
              className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 object-cover" 
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight">
              {userName.split(' ')[0]}
            </span>
            <span className={`text-[10px] leading-tight ${activeTab === 'profile' ? 'opacity-80' : 'text-slate-400'}`}>
              JSPM RSCOE, Pune
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
