import React, { useMemo } from 'react';
import { Target, ArrowRight } from 'lucide-react';
import { StudentProfile, PlacementReadinessData } from '../../types';

interface YourNextBestActionCardProps {
  student?: StudentProfile;
  selectedRole?: string;
  placementReadiness?: PlacementReadinessData;
  onNavigateTab: (tab: string) => void;
  onOpenAssessment?: () => void;
  className?: string;
}

export const YourNextBestActionCard: React.FC<YourNextBestActionCardProps> = ({
  student,
  selectedRole = 'Full-Stack AI Developer',
  placementReadiness: _placementReadiness,
  onNavigateTab,
  onOpenAssessment,
  className = ''
}) => {
  const isNewUser = (student?.verified_score || 0) === 0 && Object.keys(student?.skills || {}).length === 0;

  const actionData = useMemo(() => {
    if (isNewUser) {
      return {
        targetScore: 75,
        title: 'Complete Baseline Code Lab Diagnostic',
        description: 'Your profile has 0 verified skills. Take your first 15-minute proctored assessment to establish your placement index and unlock campus drive eligibility.',
        targetTab: 'codelab'
      };
    }

    if (selectedRole === 'Cloud & DevOps Engineer') {
      return {
        targetScore: 85,
        title: 'Verify Containerization & Cloud Infrastructure',
        description: 'Docker is currently unverified (68/100) and Kubernetes is missing. Completing containerization challenges will lift your readiness by +14 points.',
        targetTab: 'codelab'
      };
    }

    if (selectedRole === 'Autonomous AI Agent Engineer') {
      return {
        targetScore: 90,
        title: 'Calibrate Multi-Agent Orchestration & Tool Calling',
        description: 'Demonstrate LangGraph or native tool calling in Code Lab to boost your technical pillar score for Tier-1 AI Engineer corporate drives.',
        targetTab: 'codelab'
      };
    }

    if (selectedRole === 'Distributed Systems Architect') {
      return {
        targetScore: 90,
        title: 'Complete Sharding & Consensus Diagnostic',
        description: 'Solve the Raft consensus and high-throughput cache invalidation labs to clear Tier-1 Core Systems benchmarks.',
        targetTab: 'codelab'
      };
    }

    // Default: Full-Stack AI Developer
    return {
      targetScore: 85,
      title: 'Strengthen Technical Interview Articulation',
      description: 'Communication is your biggest current readiness gap (74/100). Articulating architectural choices will increase your clearance odds for Tier-1 corporate drives.',
      targetTab: 'codelab'
    };
  }, [student, selectedRole, isNewUser]);

  return (
    <div className={`hub-card p-5 md:p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-soft transition-all select-none ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Icon & Action Copy */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-2xs">
            <Target className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
                YOUR NEXT BEST ACTION
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                Target: {actionData.targetScore}%
              </span>
            </div>

            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {actionData.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed max-w-3xl">
              {actionData.description}
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center flex-wrap">
          <button
            type="button"
            onClick={() => onNavigateTab(actionData.targetTab || 'codelab')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-102 active:scale-98"
          >
            <span>Practice in Code Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) onNavigateTab('passport');
              else if (onOpenAssessment) onOpenAssessment();
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Review Skill Proofs</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
