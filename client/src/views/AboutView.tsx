import React from 'react';
import { 
  Compass, 
  ChevronRight, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  BarChart3, 
  Target,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { SITE_CONFIG } from '../config/site';

interface AboutViewProps {
  onNavigateTab: (tab: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 animate-in fade-in duration-200">
      <SEOHead
        title="About HireX | Academia–Industry Collaboration"
        description="Learn how HireX bridges the gap between academic curriculum and industry expectations through verified skill assessments and explainable AI matching."
        path="/about"
      />

      {/* Accessible Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
        <button 
          onClick={() => onNavigateTab('dashboard')}
          className="hover:text-slate-700 dark:hover:text-slate-200 transition focus-visible:outline-slate-900 dark:focus-visible:outline-white"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          About Us
        </span>
      </nav>

      {/* Header Banner */}
      <header className="space-y-3 border-b border-slate-200/90 dark:border-slate-800 pb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <Compass className="w-5 h-5 text-indigo-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          About HireX
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-3xl">
          HireX bridges the gap between academic skills and industry opportunities through verified skill assessments, skill-gap analysis, explainable AI matching and placement analytics.
        </p>
      </header>

      {/* Mission / Core Philosophy */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          The Purpose Behind HireX
        </h2>
        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-3">
          <p>
            Traditional academic transcripts validate that a student passed theoretical coursework, but industry hiring teams look for concrete, demonstrated competency in modern toolchains, algorithmic thinking, and domain problem solving. This divide leaves qualified students overlooked and recruiters sifting through unverifiable resume buzzwords.
          </p>
          <p>
            HireX establishes a transparent, objective standard. By combining AST-based code verification, aptitude arenas, and ATS resume scanning with explainable matching models, both students and institutional advisors can clearly see where curriculum strengths meet industry demand.
          </p>
        </div>
      </section>

      {/* 4 Ecosystem Personas */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          The Four Pillars of the HireX Ecosystem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Students */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Students & Candidates</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Verify competencies through interactive coding sandboxes and validated assessments. Discover transparent skill gap roadmaps and receive explainable job and internship recommendations without algorithmic opacity.
            </p>
          </div>

          {/* Academicians */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Academia & Institutions</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Track real-time cohort readiness, analyze curriculum-to-industry gaps across departments, and coordinate placement drives with objective assessment analytics and institutional oversight.
            </p>
          </div>

          {/* Recruiters */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recruiters & Industry</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Publish verified opportunities, inspect verified skill profiles backed by actual code executions and score breakdowns, and streamline candidate discovery with transparent match reasoning.
            </p>
          </div>

          {/* Administrators */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Administrators & TPOs</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Maintain institutional governance, moderate job postings, verify academic rosters, ensure platform integrity, and configure role-based access control across campus nodes.
            </p>
          </div>
        </div>
      </section>

      {/* End-to-End Workflow */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          End-to-End Verification & Placement Workflow
        </h2>
        <div className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center text-center">
            
            <div className="p-3 bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 block">STEP 1</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Skill Assessment</p>
              <p className="text-[10px] text-slate-500">AST code & tests</p>
            </div>

            <div className="hidden md:flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="p-3 bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block">STEP 2</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Verified Skills</p>
              <p className="text-[10px] text-slate-500">Tamper-proof profile</p>
            </div>

            <div className="hidden md:flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="p-3 bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 block">STEP 3</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Skill Gap</p>
              <p className="text-[10px] text-slate-500">Target roadmap</p>
            </div>

            <div className="hidden md:flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="p-3 bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 block">STEP 4</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">AI Matching</p>
              <p className="text-[10px] text-slate-500">Explainable score</p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-center mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
            <div className="p-3 bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 block">STEP 5</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Opportunity</p>
              <p className="text-[10px] text-slate-500">Internship or job</p>
            </div>

            <div className="hidden md:flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="p-3 bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 block">STEP 6</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Application</p>
              <p className="text-[10px] text-slate-500">Verified submission</p>
            </div>

            <div className="hidden md:flex justify-center text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="p-3 bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 block">STEP 7</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Placement Analytics</p>
              <p className="text-[10px] text-slate-500">Institutional outcome</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Decision Support Disclaimer Notice */}
      <section className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card-dark flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <p className="font-semibold text-slate-900 dark:text-white">
            Decision-Support Transparency Notice
          </p>
          <p className="text-[11px] leading-relaxed">
            All AI-assisted matching scores, compatibility indicators, and skill recommendations provided on HireX are decision-support insights. HireX does not guarantee employment, selection, or interview invitations. Final hiring determinations are solely made by independent recruiter organizations.
          </p>
        </div>
      </section>

      {/* Action Navigation */}
      <section className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/90 dark:border-slate-800">
        <button
          onClick={() => onNavigateTab('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95"
        >
          <span>Explore Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigateTab('contact')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium underline"
          >
            Contact the Team
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            onClick={() => onNavigateTab('terms-of-service')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium underline"
          >
            Terms of Service
          </button>
        </div>
      </section>
    </div>
  );
};
