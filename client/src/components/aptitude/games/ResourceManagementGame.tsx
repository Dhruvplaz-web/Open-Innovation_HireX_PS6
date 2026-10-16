import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  onComplete?: (metrics: any) => void;
  isBatteryMode?: boolean;
}

interface Scenario {
  title: string;
  description: string;
  options: { label: string; budgetImpact: number; staffImpact: number; healthImpact: number }[];
}

const SCENARIOS: Scenario[] = [
  {
    title: 'Unexpected Database Server Outage',
    description: 'Production DB experiences high connection timeout spike. How do you allocate resources?',
    options: [
      { label: 'Hire Cloud Support Specialist (-$20k, +10% Health)', budgetImpact: -20, staffImpact: 0, healthImpact: 10 },
      { label: 'Assign In-House Engineers Overtime (-10 Staff Energy, +15% Health)', budgetImpact: 0, staffImpact: -10, healthImpact: 15 },
      { label: 'Apply Temporary Cache Patch (-$5k, +5% Health)', budgetImpact: -5, staffImpact: 0, healthImpact: 5 }
    ]
  },
  {
    title: 'Client Demands Early Feature Delivery',
    description: 'Key corporate recruiter requests 2-week early delivery of analytics module.',
    options: [
      { label: 'Contract Freelance Dev Team (-$30k, +15% Health)', budgetImpact: -30, staffImpact: 0, healthImpact: 15 },
      { label: 'Reassign Team from Internal Refactoring (0 Cost, +10% Health)', budgetImpact: 0, staffImpact: -5, healthImpact: 10 },
      { label: 'Decline Early Delivery (0 Cost, -5% Health)', budgetImpact: 0, staffImpact: 0, healthImpact: -5 }
    ]
  },
  {
    title: 'Security Compliance Audit Failure',
    description: 'External auditor flags missing encryption certificates on staging environments.',
    options: [
      { label: 'Purchase Enterprise SSL Suite (-$15k, +20% Health)', budgetImpact: -15, staffImpact: 0, healthImpact: 20 },
      { label: 'Task DevOps Lead with Manual Config (-5 Staff Energy, +10% Health)', budgetImpact: 0, staffImpact: -5, healthImpact: 10 },
      { label: 'Request 30-Day Audit Extension (0 Cost, +0% Health)', budgetImpact: 0, staffImpact: 0, healthImpact: 0 }
    ]
  }
];

export const ResourceManagementGame: React.FC<Props> = ({ onComplete, isBatteryMode }) => {
  const [turn, setTurn] = useState<number>(0);
  const [budget, setBudget] = useState<number>(100);
  const [staffEnergy, setStaffEnergy] = useState<number>(100);
  const [systemHealth, setSystemHealth] = useState<number>(75);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const handleChoice = (opt: Scenario['options'][0]) => {
    const nextBudget = Math.max(0, budget + opt.budgetImpact);
    const nextStaff = Math.max(0, staffEnergy + opt.staffImpact);
    const nextHealth = Math.min(100, Math.max(0, systemHealth + opt.healthImpact));

    setBudget(nextBudget);
    setStaffEnergy(nextStaff);
    setSystemHealth(nextHealth);

    const nextTurn = turn + 1;
    if (nextTurn >= SCENARIOS.length) {
      setIsFinished(true);
      const metrics = {
        final_health: nextHealth,
        final_budget: nextBudget,
        final_staff: nextStaff
      };
      if (onComplete) onComplete(metrics);
    } else {
      setTurn(nextTurn);
    }
  };

  const currentScenario = SCENARIOS[turn];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300">
              Cognitive Game 7 of 9
            </span>
            <span className="text-xs font-semibold text-slate-400">Scenario {turn + 1} of {SCENARIOS.length}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Resource Allocation & Emergency Simulator</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Prioritize budget, staff energy, and system health when unexpected tech incidents strike.
          </p>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Budget</span>
              <div className="text-lg font-bold text-emerald-600">${budget}k</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Staff Energy</span>
              <div className="text-lg font-bold text-indigo-500">{staffEnergy}%</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">System Health</span>
              <div className="text-lg font-bold text-teal-600">{systemHealth}%</div>
            </div>
          </div>

          {/* Scenario Box */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" /> {currentScenario.title}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentScenario.description}
            </p>
          </div>

          {/* Option Choices */}
          <div className="space-y-3">
            {currentScenario.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(opt)}
                className="w-full p-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs text-left transition shadow-sm cursor-pointer"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center space-y-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Resource Simulator Complete</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Final System Health: <strong className="text-teal-600 font-mono text-base">{systemHealth}%</strong> • Remaining Budget: ${budget}k
          </p>
          {!isBatteryMode && (
            <button
              onClick={() => {
                setTurn(0);
                setBudget(100);
                setStaffEnergy(100);
                setSystemHealth(75);
                setIsFinished(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition shadow-md"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
