import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  X,
  UserCheck
} from 'lucide-react';
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
  isDark?: boolean;
  toggleDark?: () => void;
  onGoToLanding?: () => void;
  onSignOut?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentRole = 'student',
  setRole,
  activeTab,
  setActiveTab,
  openModal,
  userName,
  userAvatar,
  userTitle = 'JSPM RSCOE Pune',
  isDark = false,
  toggleDark,
  onGoToLanding,
  onSignOut
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close flyouts on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K hotkey for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-hub-search');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const notifications = [
    {
      id: 'notif_1',
      title: 'Barclays Campus Drive Shortlist',
      desc: 'Your profile has cleared eligibility for Full-Stack AI Developer Intern.',
      time: '12m ago',
      unread: true,
      type: 'drive'
    },
    {
      id: 'notif_2',
      title: 'Alumni Referral Dispatched',
      desc: 'Vikram Aditya (Staff SWE, Google) received your referral request.',
      time: '1h ago',
      unread: true,
      type: 'alumni'
    },
    {
      id: 'notif_3',
      title: 'Evidence Calibration Score Updated',
      desc: 'SHA-256 verified certificate added +45 pts to your verified skill index.',
      time: '3h ago',
      unread: false,
      type: 'skill'
    }
  ];

  const getRoleDisplayName = (r: Role) => {
    switch (r) {
      case 'student': return 'Student (2026 Batch)';
      case 'recruiter': return 'Corporate Recruiter';
      case 'academician': return 'TPO / Academician';
      case 'alumni': return 'Distinguished Alumni';
      case 'admin': return 'Super Administrator';
      default: return 'User';
    }
  };

  const getRoleBadgeStyle = (r: Role) => {
    switch (r) {
      case 'student': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'recruiter': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      case 'academician': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'alumni': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'admin': return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
    }
  };

  const getDynamicPlaceholder = () => {
    switch (currentRole) {
      case 'student': return 'Search campus drives, companies, skills, ATS requirements...';
      case 'recruiter': return 'Search verified candidate profiles, test scores, GitHub repos...';
      case 'academician': return 'Search student cohorts, missing curriculum skills, NAAC reports...';
      case 'alumni': return 'Search juniors, referral openings, capstone projects...';
      case 'admin': return 'Search system audit logs, registered users, verification queues...';
    }
  };



  return (
    <header className="w-full shrink-0 z-30 select-none sticky top-0 transition-all duration-200">
      {/* TIER 1: Upper Glass Utility Bar */}
      <div className="w-full flex items-center justify-between px-4 md:px-8 py-3 bg-white/85 dark:bg-[#0f1422]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        {/* Brand Identity & Role Beacon */}
        <div className="flex items-center gap-3">
          <div
            onClick={onGoToLanding || (() => setActiveTab('landing'))}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="HireX Placement Hub • Return to Landing"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-150">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                HireX
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider -mt-1">
                Placement Hub
              </span>
            </div>
          </div>

          {/* Active Role Selector Capsule */}
          <div className="relative" ref={roleRef}>
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition shadow-2xs ${getRoleBadgeStyle(currentRole)} hover:brightness-95`}
              title="Switch Platform Persona"
            >
              <span>{getRoleDisplayName(currentRole)}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#131929] border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Persona / Role
                </div>
                {(['student', 'recruiter', 'academician', 'alumni', 'admin'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      if (setRole) setRole(r);
                      setIsRoleMenuOpen(false);
                      setActiveTab('dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                      currentRole === r
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{getRoleDisplayName(r)}</span>
                    {currentRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Frosted Glass Search Bar with Ctrl+K */}
        <div className="hidden lg:flex items-center flex-1 max-w-xl mx-8">
          <div className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-100/70 dark:bg-slate-800/70 backdrop-blur-md border transition shadow-inner-sm ${
            isSearchFocused
              ? 'border-blue-500/80 ring-2 ring-blue-500/20 bg-white dark:bg-slate-900 shadow-sm'
              : 'border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
          }`}>
            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <input
              id="global-hub-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={getDynamicPlaceholder()}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden xl:inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </div>
        </div>

        {/* Right Controls: AI Co-Pilot, Notifications, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ask AI Co-Pilot CTA */}
          <button
            type="button"
            onClick={() => openModal && openModal('agent')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-bold transition shadow-sm shadow-blue-500/20 cursor-pointer"
            title="Launch Placement Co-Pilot Agent"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Co-Pilot</span>
          </button>

          {/* Interactive Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative w-9 h-9 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition shadow-2xs cursor-pointer"
              title="Notifications & Announcements"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold font-mono flex items-center justify-center ring-2 ring-white dark:ring-[#0f1422]">
                3
              </span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#131929] border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Announcements & Feed</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      3 New
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-3 flex items-start gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    setActiveTab('opportunities');
                  }}
                  className="w-full mt-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold text-center transition border border-slate-200/60 dark:border-slate-700"
                >
                  View Placement Drives & Deadlines →
                </button>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Switcher */}
          {toggleDark && (
            <button
              type="button"
              onClick={toggleDark}
              className="w-9 h-9 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-amber-500 transition shadow-2xs cursor-pointer"
              title={isDark ? "Switch to Radiant Light Mode" : "Switch to Midnight Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          )}

          {/* User Profile Capsule with Dropdown */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition cursor-pointer shadow-2xs"
              title="User Profile Menu"
            >
              <div className="relative shrink-0">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-lg object-cover bg-slate-200 dark:bg-slate-700 border border-white dark:border-slate-600"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0f1422]" />
              </div>

              <div className="hidden md:flex flex-col text-left min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px] leading-tight">
                  {userName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px] leading-tight">
                  {userTitle.split(',')[0]}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </div>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#131929] border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 mb-2 border border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{userName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{userTitle}</p>
                  <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Verified Institutional Identity
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setActiveTab('profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                >
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span>My Student Profile & Dossier</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (openModal) openModal('assessment');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Take Proctored Skill Assessment</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (openModal) openModal('about');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Help & Institutional Verification</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onSignOut) onSignOut();
                    else setActiveTab('landing');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
