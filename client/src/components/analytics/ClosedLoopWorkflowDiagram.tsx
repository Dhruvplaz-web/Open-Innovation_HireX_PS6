import React from 'react';
import {
  GraduationCap,
  Briefcase,
  User,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const ClosedLoopWorkflowDiagram: React.FC = () => {
  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-indigo-500/30 shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="relative z-10 max-w-2xl mb-8 space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
            CLOSED-LOOP SKILL INTELLIGENCE ARCHITECTURE
          </span>
          <span className="text-xs text-indigo-200/70 font-semibold">• Core Defensibility Engine</span>
        </div>
        <h3 className="text-xl md:text-2xl font-black text-white">
          Three-Sided Continuous Skill & Employability Loop
        </h3>
        <p className="text-xs md:text-sm text-indigo-200/80">
          Features can be replicated. The true moat of HireX is the closed feedback loop connecting verified student capability, institutional syllabus intervention, recruiter hiring demand, and live placement outcomes.
        </p>
      </div>

      {/* 3 Pillars in parallel */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pillar 1: STUDENT */}
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <User className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                Student Trajectory
              </h4>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-[10px]">1</span>
                <span>Proctored Skill Measurement</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-[10px]">2</span>
                <span>Verified Skill Passport</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-[10px]">3</span>
                <span>Personal Skill Gap Discovery</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-[10px]">4</span>
                <span>Targeted Course Remediation</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-[10px]">5</span>
                <span>Strong-Skill Job Match & Apply</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-indigo-300 font-medium">
            → Student answers: "What proves my capability?"
          </div>
        </div>

        {/* Pillar 2: ACADEMIA */}
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <GraduationCap className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                Institutional Intelligence
              </h4>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[10px]">1</span>
                <span>Authorized Cohort Aggregation</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[10px]">2</span>
                <span>Industry Demand vs Student Gap</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[10px]">3</span>
                <span>Institutional Skill Readiness Index</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[10px]">4</span>
                <span>Targeted Cohort Intervention</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-[10px]">5</span>
                <span>Before/After Reassessment Gain</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-300 font-medium">
            → College answers: "Where are our curriculum gaps?"
          </div>
        </div>

        {/* Pillar 3: RECRUITER */}
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Briefcase className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                Recruiter Demand & Hiring
              </h4>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-[10px]">1</span>
                <span>Structured Job & Proficiency Post</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-[10px]">2</span>
                <span>Real-Time Industry Demand Feed</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-[10px]">3</span>
                <span>Verified Candidate Skill Passports</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-[10px]">4</span>
                <span>Shortlist, Interview & Selection</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center text-[10px]">5</span>
                <span>Recruitment Outcome Feedback</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-amber-300 font-medium">
            → Recruiter answers: "Which talent truly has the skills?"
          </div>
        </div>
      </div>

      {/* The Central Unifying Loop Banner */}
      <div className="relative z-10 p-5 rounded-2xl bg-indigo-950/60 border border-indigo-400/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Unified Skill Intelligence Layer
            </h4>
            <p className="text-xs text-indigo-200/80">
              When a recruiter hires, outcome feedback updates university intervention priorities and improves student recommendations for the next cycle.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-mono font-bold text-indigo-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <span>MEASURE</span> → <span>VERIFY</span> → <span>TRAIN</span> → <span>HIRE</span> → <span>FEEDBACK</span>
        </div>
      </div>

      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
    </div>
  );
};
