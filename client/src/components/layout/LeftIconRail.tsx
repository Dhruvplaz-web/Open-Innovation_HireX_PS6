import React from 'react';
import {
  Home,
  Briefcase,
  Code2,
  Zap,
  Award,
  User,
  Sun,
  Moon,
  Info,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  FolderGit2,
  Lock,
  Users,
  TrendingUp,
  ShieldAlert,
  LucideIcon
} from 'lucide-react';
import { Role } from '../../types';

interface LeftIconRailProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  toggleDark: () => void;
  openModal: (modal: string) => void;
  currentRole?: Role;
  onSignOut?: () => void;
}

interface RailItem {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  activeMatch?: string[];
}

export const LeftIconRail: React.FC<LeftIconRailProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleDark,
  openModal,
  currentRole = 'student'
}) => {
  // Navigation items per role matching the exact original structure and color highlights
  const getRoleItems = (): RailItem[] => {
    switch (currentRole) {
      case 'student':
        return [
          {
            id: 'dashboard',
            label: 'Command Center (Readiness & Peer Benchmarks)',
            icon: Home,
            color: 'text-slate-400',
            activeMatch: ['dashboard']
          },
          {
            id: 'passport',
            label: 'Skill Verification & Proctored Assessment',
            icon: ShieldCheck,
            color: 'text-emerald-400',
            activeMatch: ['passport', 'skill-passport', 'skill-verification', 'verification', 'workflow', 'journey']
          },
          {
            id: 'collaboration',
            label: 'Project & Research Collaboration Hub',
            icon: FolderGit2,
            color: 'text-amber-400',
            activeMatch: ['collaboration', 'project-hub', 'projects']
          },
          {
            id: 'incognito',
            label: 'Incognito Talent Matching & Recruiter Invitations',
            icon: Lock,
            color: 'text-purple-400',
            activeMatch: ['incognito', 'talent-visibility']
          },
          {
            id: 'opportunities',
            label: 'Campus Drives & ATS Resume Scanner',
            icon: Briefcase,
            color: 'text-slate-400',
            activeMatch: ['opportunities', 'applications', 'interviews']
          },
          {
            id: 'codelab',
            label: 'Algorithmic Code Lab & AST Auditor',
            icon: Code2,
            color: 'text-slate-400',
            activeMatch: ['codelab', 'code-lab']
          },
          {
            id: 'aptitude',
            label: 'Gamified Aptitude Arena & Cognitive Battery',
            icon: Zap,
            color: 'text-slate-400',
            activeMatch: ['aptitude']
          },
          {
            id: 'transcript',
            label: 'Official AICTE Skill Transcript & AI Mock Interview',
            icon: Award,
            color: 'text-slate-400',
            activeMatch: ['transcript']
          },
          {
            id: 'profile',
            label: 'Complete Student Profile & Portfolio',
            icon: User,
            color: 'text-slate-400',
            activeMatch: ['profile']
          }
        ];

      case 'recruiter':
        return [
          {
            id: 'dashboard',
            label: 'Talent Pipeline & Candidate Search',
            icon: Users,
            color: 'text-slate-400',
            activeMatch: ['dashboard']
          },
          {
            id: 'opportunities',
            label: 'Campus Drives & Job Postings',
            icon: Briefcase,
            color: 'text-slate-400',
            activeMatch: ['opportunities']
          },
          {
            id: 'collaboration',
            label: 'Capstone Projects Showcase',
            icon: FolderGit2,
            color: 'text-amber-400',
            activeMatch: ['collaboration', 'project-hub', 'projects']
          },
          {
            id: 'incognito',
            label: 'Incognito Candidate Pool',
            icon: Lock,
            color: 'text-purple-400',
            activeMatch: ['incognito', 'talent-visibility']
          }
        ];

      case 'academician':
        return [
          {
            id: 'dashboard',
            label: 'Institutional Command & NAAC Index',
            icon: GraduationCap,
            color: 'text-slate-400',
            activeMatch: ['dashboard']
          },
          {
            id: 'opportunities',
            label: 'Placement Drives & Job Ingestion',
            icon: Briefcase,
            color: 'text-slate-400',
            activeMatch: ['opportunities']
          },
          {
            id: 'collaboration',
            label: 'Student Capstones & Research',
            icon: FolderGit2,
            color: 'text-amber-400',
            activeMatch: ['collaboration', 'project-hub', 'projects']
          },
          {
            id: 'transcript',
            label: 'NAAC / NBA Accreditation Reports',
            icon: TrendingUp,
            color: 'text-emerald-400',
            activeMatch: ['transcript']
          }
        ];

      case 'alumni':
        return [
          {
            id: 'dashboard',
            label: 'Alumni Impact & Scorecard',
            icon: Award,
            color: 'text-amber-400',
            activeMatch: ['dashboard']
          },
          {
            id: 'opportunities',
            label: 'Referrals Pipeline & Jobs',
            icon: Briefcase,
            color: 'text-slate-400',
            activeMatch: ['opportunities']
          },
          {
            id: 'collaboration',
            label: 'Mentee Projects & Guidance',
            icon: FolderGit2,
            color: 'text-amber-400',
            activeMatch: ['collaboration', 'project-hub', 'projects']
          }
        ];

      case 'admin':
        return [
          {
            id: 'dashboard',
            label: 'Platform Governance & Defense',
            icon: ShieldAlert,
            color: 'text-rose-400',
            activeMatch: ['dashboard']
          },
          {
            id: 'collaboration',
            label: 'System Projects & Code Audit',
            icon: FolderGit2,
            color: 'text-amber-400',
            activeMatch: ['collaboration', 'project-hub', 'projects']
          }
        ];

      default:
        return [
          {
            id: 'dashboard',
            label: 'Command Center',
            icon: Home,
            color: 'text-slate-400',
            activeMatch: ['dashboard']
          }
        ];
    }
  };

  const roleItems = getRoleItems();

  const isItemActive = (item: RailItem) => {
    if (item.activeMatch && item.activeMatch.includes(activeTab)) {
      return true;
    }
    return activeTab === item.id;
  };

  return (
    <aside
      className="w-16 md:w-20 flex flex-col items-center justify-between py-4 px-2 select-none shrink-0 z-30 h-screen transition-all duration-200"
      aria-label="Main Navigation"
    >
      {/* Top Logo Icon Pill -> Navigates to Landing Page */}
      <div
        onClick={() => setActiveTab('landing')}
        title="HireX Landing Page • JSPM RSCOE"
        className="w-11 h-11 rounded-2xl bg-[#0d0e15] text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 group relative border border-white/[0.08]"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span className="absolute left-16 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md border border-slate-800">
          Return to Landing Page
        </span>
      </div>

      {/* Center Nav Rail Capsule — Exact Match to Reference Design */}
      <nav
        className="flex flex-col items-center bg-[#0d0e15] border border-white/[0.08] py-2.5 px-1.5 rounded-[28px] shadow-2xl gap-1.5 my-auto max-h-[calc(100vh-170px)] overflow-y-auto no-scrollbar"
        aria-label="Role Functions"
      >
        {/* Dynamic Role-Aware Items */}
        {roleItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer group relative ${
                active
                  ? 'bg-[#182035] text-white shadow-sm ring-1 ring-blue-500/30'
                  : `${item.color} hover:text-white hover:bg-white/[0.06]`
              }`}
              aria-label={item.label}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span className="absolute left-14 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md border border-slate-800">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Divider Line */}
        <div className="w-5 h-[1px] bg-slate-800/80 my-1 shrink-0" />

        {/* Universal Utility Icons: Info, Account / Auth, Legal & Compliance */}
        {/* Info / About */}
        <button
          type="button"
          onClick={() => openModal('about')}
          title="About Project & Hackathon"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer group relative"
          aria-label="About Project"
        >
          <Info className="w-4.5 h-4.5 shrink-0" />
          <span className="absolute left-14 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md border border-slate-800">
            About Project & Verification
          </span>
        </button>

        {/* Account & Firebase Authentication */}
        <button
          type="button"
          onClick={() => openModal('auth')}
          title="Firebase Auth & Persona Gateway"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer group relative"
          aria-label="Account & Auth"
        >
          <UserCheck className="w-4.5 h-4.5 shrink-0" />
          <span className="absolute left-14 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md border border-slate-800">
            Firebase Auth & Persona Gateway
          </span>
        </button>

        {/* Legal & Compliance */}
        <button
          type="button"
          onClick={() => openModal('legal')}
          title="Compliance & DPDP Act 2023"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer group relative"
          aria-label="Legal & Compliance"
        >
          <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
          <span className="absolute left-14 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md border border-slate-800">
            Compliance & DPDP Act 2023
          </span>
        </button>
      </nav>

      {/* Bottom Theme Switcher Pill (Sun / Moon) — Exact Match to Reference */}
      <div className="bg-[#0d0e15] border border-white/[0.08] p-1 rounded-2xl shadow-xl flex flex-col gap-1 items-center shrink-0">
        <button
          type="button"
          onClick={toggleDark}
          title={!isDark ? "Radiant Light Mode Active" : "Switch to Light Mode"}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            !isDark
              ? 'bg-[#182035] text-white ring-1 ring-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Light mode"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleDark}
          title={isDark ? "Midnight Dark Mode Active" : "Switch to Dark Mode"}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            isDark
              ? 'bg-[#182035] text-white ring-1 ring-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Dark mode"
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
