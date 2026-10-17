import React, { useState } from 'react';
import { 
  Terminal, 
  Code2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  Shield, 
  BarChart3, 
  Sun, 
  Moon, 
  LogIn, 
  ChevronRight, 
  Check, 
  Play, 
  Search, 
  Scale, 
  MapPin, 
  Network, 
  Activity, 
  TrendingUp, 
  GitBranch, 
  XCircle,
  FileCheck2,
  Lock,
  Layers,
  ArrowUpRight,
  Award
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';
import { Role } from '../types';

interface LandingPageViewProps {
  onEnterRole: (role: Role) => void;
  onOpenAuthModal: () => void;
  onNavigateTab: (tab: string) => void;
  isDark: boolean;
  toggleDark: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterRole,
  onOpenAuthModal,
  onNavigateTab,
  isDark,
  toggleDark
}) => {
  // Interactive AST Engine State
  const [selectedSnippet, setSelectedSnippet] = useState<'linear' | 'quadratic'>('linear');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [astMetrics, setAstMetrics] = useState({
    runtime: 'O(N)',
    category: 'Linear Optimal',
    nodes: 28,
    depth: 1,
    grade: 'Production Grade',
    explanation: 'Single-pass iterative traversal verified. Constant memory overhead and zero nested iteration hazards.'
  });

  const linearSnippet = `def linear_talent_search(candidates: list, skill_hash: str) -> list:
    # Single iterative pass: Verified O(N) linear scan
    matches = []
    for cand in candidates:
        if skill_hash in cand['verified_proofs']:
            matches.append(cand['student_id'])
    return matches`;

  const quadraticSnippet = `def unoptimized_cross_match(candidates: list, rubric: list) -> list:
    # Nested iteration: AST flags quadratic O(N²) explosion
    matches = []
    for cand in candidates:
        for criteria in rubric:
            if cand['score'] >= criteria['threshold']:
                matches.append((cand['id'], criteria['skill']))
    return matches`;

  const triggerAstAudit = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      if (selectedSnippet === 'linear') {
        setAstMetrics({
          runtime: 'O(N)',
          category: 'Linear Optimal',
          nodes: 28,
          depth: 1,
          grade: 'Production Grade',
          explanation: 'Single-pass iterative traversal verified. Constant memory overhead and zero nested iteration hazards.'
        });
      } else {
        setAstMetrics({
          runtime: 'O(N²)',
          category: 'Quadratic Warning',
          nodes: 44,
          depth: 2,
          grade: 'Refactor Required',
          explanation: 'Nested iteration detected in AST tree. Latency blowout risks identified under N > 10,000 candidate records.'
        });
      }
      setIsAnalyzing(false);
    }, 280);
  };

  // Interactive Recruiter Semantic Query Console (Pan-India Cohort)
  const [activeQueryIndex, setActiveQueryIndex] = useState<number>(0);
  const recruiterQueries = [
    {
      query: "Find candidates with verified O(N) AST proof in Python & FastAPI",
      candidate: "Rahul Sharma",
      institution: "NIT Surathkal / COEP Tech • CS 2026",
      role: "Backend Engineer",
      matchScore: "94%",
      codeProof: "92/100 AST Verified",
      cgpa: "8.92",
      status: "Day-1 Deployable"
    },
    {
      query: "Show engineers with >85% React TypeScript & 0 active backlogs",
      candidate: "Priya Patil",
      institution: "BITS Pilani / PES Univ Bengaluru • IT 2026",
      role: "Frontend Systems",
      matchScore: "91%",
      codeProof: "89/100 AST Verified",
      cgpa: "8.75",
      status: "TPO Pre-Approved"
    },
    {
      query: "Candidates ready for AI & Data Science with vector DB experience",
      candidate: "Aditya Deshmukh",
      institution: "IIIT Hyderabad / DTU Delhi • AI & DS 2026",
      role: "Applied AI Intern",
      matchScore: "89%",
      codeProof: "95/100 AST Verified",
      cgpa: "9.10",
      status: "High Aptitude Index"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4fd] via-[#f4f2ff] to-[#edf3fe] dark:from-[#0b0f19] dark:via-[#0d1326] dark:to-[#0a0d18] text-[#0f172a] dark:text-[#f8fafc] selection:bg-blue-600/15 font-sans transition-colors duration-200">
      <SEOHead
        title="HireX | Pan-India Talent Intelligence Platform for Universities & Enterprise Tech"
        description="HireX is the AI-native talent intelligence infrastructure connecting Indian engineering universities nationwide and enterprise tech employers through in-browser AST code verification and real-time curriculum telemetry."
        path="/"
      />

      {/* 1. ENTERPRISE HEADER */}
      <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-[#0f1422]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Brand Identity */}
          <div 
            onClick={() => onEnterRole('student')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-md shadow-blue-500/20 transition-transform group-hover:scale-95">
              HX
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                HireX
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                Placement Hub 2026
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#the-platform" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Platform</a>
            <a href="#the-solutions" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Solutions</a>
            <a href="#the-problem" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Curriculum Gap</a>
            <a href="#the-matrix" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Why HireX</a>
            <a href="#tech-drives" className="hover:text-blue-600 dark:hover:text-blue-400 transition">National Drives</a>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-white/80 dark:hover:bg-slate-800/80 transition cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 hover:bg-white/80 dark:hover:bg-slate-800/80 transition cursor-pointer"
            >
              Sign In
            </button>

            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/25 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. PRODUCT ANNOUNCEMENT BANNER */}
      <aside aria-label="Product Release" className="border-b border-blue-200/50 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 py-2.5 px-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-semibold text-slate-900 dark:text-white">Announcing HireX 3.0:</span>
            <span>Real-time AST code verification and alumni referrals telemetry across Indian engineering universities.</span>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explore Campus Drives & Placement Matrix</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* 3. HERO SECTION: CINEMATIC EDITORIAL STATEMENT */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 space-y-16">
        <div className="max-w-5xl space-y-8">
          {/* Editorial Eyebrow */}
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Pan-India Campus Talent Intelligence Infrastructure</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span>AICTE &amp; NEP 2020 Aligned</span>
          </div>

          {/* Primary Display Headline (Oversized, Tight Tracking) */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[-0.04em] text-slate-900 dark:text-white leading-[0.98]">
            Proof over claims.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Talent over pedigree.
            </span>
          </h1>

          {/* Subtitle Paragraph */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-normal">
            HireX provides the soft-glassmorphic talent intelligence infrastructure for higher education and enterprise tech employers across India. We replace unverified resumes with in-browser AST code verification, diagnose real-time curriculum desynchronization, and connect early-career engineers to top tech careers with mathematical certainty.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onOpenAuthModal}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold transition shadow-lg shadow-blue-500/25 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Placement Command</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEnterRole('student')}
              className="px-7 py-4 rounded-2xl glass-panel text-slate-800 dark:text-slate-100 hover:bg-white text-sm font-bold transition shadow-xs cursor-pointer"
            >
              Student Portal
            </button>

            <button
              onClick={() => onEnterRole('recruiter')}
              className="px-7 py-4 rounded-2xl glass-panel text-slate-800 dark:text-slate-100 hover:bg-white text-sm font-bold transition shadow-xs cursor-pointer"
            >
              Corporate Recruiter
            </button>

            <button
              onClick={() => onEnterRole('alumni')}
              className="px-7 py-4 rounded-2xl glass-panel text-amber-700 dark:text-amber-300 hover:bg-white text-sm font-bold transition shadow-xs cursor-pointer"
            >
              Alumni Portal
            </button>
          </div>
        </div>

        {/* Hero Visual Anchor: High-Resolution Platform Presentation */}
        <div className="relative pt-6">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] shadow-2xl relative">
            <img
              src="/images/platform-preview.jpg"
              alt="HireX Talent Intelligence Platform Interface"
              className="w-full h-auto object-cover max-h-[560px]"
            />
            {/* Architectural Telemetry Inset Badges */}
            <div className="absolute top-6 left-6 hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-black/80 dark:bg-black/90 backdrop-blur-md border border-white/10 text-white text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Client AST: O(N) Linear Proof Verified</span>
            </div>
            <div className="absolute bottom-6 right-6 hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-black/80 dark:bg-black/90 backdrop-blur-md border border-white/10 text-white text-xs font-mono">
              <span className="text-emerald-400 font-bold">94% Role Fit</span>
              <span className="text-slate-300">•</span>
              <span>National Tech Corridors Shortlist Ready</span>
            </div>
          </div>
        </div>

        {/* Enterprise Impact Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-black dark:text-white tracking-tight">70%</span>
            <p className="text-xs text-slate-500 font-medium">Reduction in Technical Screening Hours</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">&lt;2ms</span>
            <p className="text-xs text-slate-500 font-medium">In-Browser AST Parser Latency</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 tracking-tight">4.2x</span>
            <p className="text-xs text-slate-500 font-medium">Interview-to-Offer Velocity</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">0%</span>
            <p className="text-xs text-slate-500 font-medium">Protected Demographic Trait Bias</p>
          </div>
        </div>

        {/* Proof / Institutional Trust Strip Across Indian Tech Corridors */}
        <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs text-slate-500 font-mono">
          <span className="uppercase tracking-widest text-[11px] font-semibold text-slate-400">
            Validated Across India's Premier Tech Corridors
          </span>
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 font-bold text-slate-700 dark:text-slate-300">
            <span>Bengaluru</span>
            <span>•</span>
            <span>Hyderabad</span>
            <span>•</span>
            <span>Pune</span>
            <span>•</span>
            <span>Delhi-NCR</span>
            <span>•</span>
            <span>Mumbai &amp; Chennai</span>
            <span>•</span>
            <span>AICTE Aligned</span>
          </div>
        </div>
      </section>

      {/* 4. THE PROBLEM & THE PARADOX (Asymmetric Editorial Layout with Authentic Photography) */}
      <section id="the-problem" className="border-t border-black/[0.06] dark:border-white/[0.08] py-28 max-w-7xl mx-auto px-6 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Authentic Student Engineering Lab Visual */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.1] relative group">
              <img
                src="/images/about-students.jpg"
                alt="Indian engineering students collaborating on microservices architecture"
                className="w-full h-auto object-cover max-h-[500px] grayscale hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-white text-xs flex items-center justify-between font-mono">
                <div>
                  <span className="font-bold text-emerald-400 block">National Engineering Cohort</span>
                  <span className="text-[11px] text-slate-300">Microservices Architecture Lab &bull; Batch 2026</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Verified AST
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Thesis */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                01 &mdash; India's $12B Early-Career Gap
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-black dark:text-white leading-[1.08]">
                1.5 million graduates.<br />
                75% unemployable in production code.
              </h2>
            </div>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              University course catalogs take 3 to 5 years to update across India. While academic syllabi still test paper-based monolithic memory layouts, enterprises across Bengaluru, Hyderabad, Pune, and Gurgaon hire for containerized FastAPI microservices, asynchronous workers, and vector databases.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] space-y-1">
                <span className="font-bold text-sm text-black dark:text-white block">The Enterprise Hiring Breakdown</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Recruiters receive 2,000+ unverified resumes per role. Keyword-based ATS filters reward buzzword padding rather than demonstrable algorithmic competence.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] space-y-1">
                <span className="font-bold text-sm text-black dark:text-white block">The Academic Blind Spot</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Deans and faculty have zero real-time telemetry into how their practical laboratory coursework diverges from 250,000+ live vacancies in major Indian IT corridors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE SIGNATURE PLATFORM: LIVE AST CODE VERIFICATION ENGINE */}
      <section id="the-platform" className="border-t border-black/[0.06] dark:border-white/[0.08] py-28 max-w-7xl mx-auto px-6 space-y-12">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            02 &mdash; Core Proprietary Technology
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-black dark:text-white leading-[1.08]">
            Client-Side Abstract Syntax Tree (AST) Static Compiler
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Rather than relying on self-reported resume claims, HireX parses candidate code trees directly in the browser. We audit loop depths, recursion trees, and algorithmic cyclomatic complexity in under 2 milliseconds.
          </p>
        </div>

        {/* Interactive Sandbox Console */}
        <div className="p-6 md:p-8 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Select Subroutine:
              </span>
              <button
                onClick={() => setSelectedSnippet('linear')}
                className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                  selectedSnippet === 'linear'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Snippet A: Linear O(N)
              </button>
              <button
                onClick={() => setSelectedSnippet('quadratic')}
                className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                  selectedSnippet === 'quadratic'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Snippet B: Quadratic O(N²)
              </button>
            </div>

            <button
              onClick={triggerAstAudit}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-lg bg-black hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-black text-xs font-mono font-bold transition flex items-center gap-2 active:scale-95 self-start sm:self-auto"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAnalyzing ? 'Executing AST Parser...' : 'Run AST Static Verification'}</span>
            </button>
          </div>

          {/* Code Viewer & Real-Time Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Code Block */}
            <div className="lg:col-span-7 rounded-xl overflow-hidden bg-black p-5 border border-white/10 font-mono text-xs text-slate-200">
              <pre className="overflow-x-auto leading-relaxed text-[12px]">
                {selectedSnippet === 'linear' ? linearSnippet : quadraticSnippet}
              </pre>
            </div>

            {/* AST Static Audit Results Panel */}
            <div className="lg:col-span-5 p-6 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#12141D] flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    AST Parser Output
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    astMetrics.runtime === 'O(N)'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                  }`}>
                    {astMetrics.grade}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-mono block">Calculated Big-O</span>
                    <span className="text-3xl font-mono font-extrabold text-black dark:text-white">
                      {astMetrics.runtime}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">
                    {astMetrics.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
                    <span className="text-[10px] text-slate-500 block">AST Syntax Nodes</span>
                    <span className="text-base font-bold text-black dark:text-white">{astMetrics.nodes}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
                    <span className="text-[10px] text-slate-500 block">Nesting Depth</span>
                    <span className="text-base font-bold text-black dark:text-white">{astMetrics.depth}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans pt-1">
                  {astMetrics.explanation}
                </p>
              </div>

              <button
                onClick={() => onEnterRole('student')}
                className="w-full py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <span>Launch In-Browser CodeLab (10+ Problems)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOUR ENTERPRISE SOLUTIONS (With High-End Contextual Photography) */}
      <section id="the-solutions" className="border-t border-black/[0.06] dark:border-white/[0.08] py-28 max-w-7xl mx-auto px-6 space-y-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            03 &mdash; Enterprise Solutions
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-black dark:text-white leading-[1.08]">
            Built for Higher Education and Technical Employers Across India
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            One single source of truth connecting engineering students, enterprise talent acquisition leaders, college deans, and placement officers across all Indian states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Solution 1: Student Workspace */}
          <div className="p-8 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#12141D] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] h-48 bg-black">
                <img
                  src="/images/auth-codelab.jpg"
                  alt="Student coding AST in browser CodeLab"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                  For Students &amp; Graduates
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white mt-1">
                  Verified Skill Identity &amp; CodeLab
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Build an unforgeable, code-backed engineering identity. Solve algorithmic problems evaluated by client-side AST, conquer 45-second timed aptitude sprints, and earn AICTE-aligned digital transcripts recognized across India.
              </p>

              <ul className="space-y-2 pt-2 text-xs font-mono text-slate-600 dark:text-slate-400 border-t border-black/[0.06] dark:border-white/[0.08]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> In-Browser CodeLab with AST cyclomatic analysis</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> 45-second Aptitude Arena (Speed &amp; Accuracy)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> AI Resume ATS Match &amp; Semantic Keyword Gap Scanner</li>
              </ul>
            </div>

            <button
              onClick={() => onEnterRole('student')}
              className="w-full py-3 rounded-lg bg-black hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-black text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Explore Student Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Solution 2: Recruiter Workspace */}
          <div className="p-8 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#12141D] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] h-48 bg-black">
                <img
                  src="/images/recruiter-pipeline.jpg"
                  alt="Enterprise technical recruiter reviewing candidate profiles"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
                  For Technical Recruiters
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white mt-1">
                  Enterprise Talent Acquisition Pipeline
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Eliminate resume embellishment and cut hiring cycles by 70%. Query student talent across all Indian engineering institutes in plain English, inspect actual code runtime proofs, and shortlist candidates using bias-free vector similarity.
              </p>

              <ul className="space-y-2 pt-2 text-xs font-mono text-slate-600 dark:text-slate-400 border-t border-black/[0.06] dark:border-white/[0.08]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-500" /> Natural language talent query across Pan-India cohorts</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-500" /> Verified code scores with Big-O execution telemetry</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-500" /> Zero protected demographic characteristic bias</li>
              </ul>
            </div>

            <button
              onClick={() => onEnterRole('recruiter')}
              className="w-full py-3 rounded-lg bg-black hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-black text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Explore Recruiter Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Solution 3: Academician / Dean Workspace */}
          <div className="p-8 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#12141D] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] h-48 bg-black">
                <img
                  src="/images/academic-deans.jpg"
                  alt="University Deans reviewing curriculum desync analytics"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-sky-600 dark:text-sky-400 font-bold block">
                  For University Deans &amp; Faculty
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white mt-1">
                  Curriculum Workforce Planning
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Identify curriculum desynchronization against national hiring trends across Bengaluru, Hyderabad, Pune, and Delhi-NCR in real time. Benchmark branch-level placement readiness and receive AICTE-aligned lab modernization roadmaps.
              </p>

              <ul className="space-y-2 pt-2 text-xs font-mono text-slate-600 dark:text-slate-400 border-t border-black/[0.06] dark:border-white/[0.08]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500" /> Syllabus Desync Diagnostics vs 250,000+ national vacancies</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500" /> Branch Readiness Benchmarks (Comp, AI&amp;DS, IT, ENTC)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500" /> AICTE Credit Mapping &amp; Automated CO-PO Attainment</li>
              </ul>
            </div>

            <button
              onClick={() => onEnterRole('academician')}
              className="w-full py-3 rounded-lg bg-black hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-black text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Explore Dean Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Solution 4: TPO Administrator Workspace */}
          <div className="p-8 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#12141D] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] h-48 bg-black">
                <img
                  src="/images/auth-campus.jpg"
                  alt="University campus placement governance hub"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold block">
                  For Campus Placement Offices
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white mt-1">
                  Placement Drive Automation &amp; Governance
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Automate placement drive operations from manual paperwork to verified governance. Enforce CGPA and backlog criteria, generate student rosters, and issue verifiable digital NOCs for drives nationwide.
              </p>

              <ul className="space-y-2 pt-2 text-xs font-mono text-slate-600 dark:text-slate-400 border-t border-black/[0.06] dark:border-white/[0.08]">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Automated campus drive gatekeeper &amp; backlog filters</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Digital TPO No Objection Certificate (NOC) generation</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Cryptographic student credentials with SHA-256 ledger</li>
              </ul>
            </div>

            <button
              onClick={() => onEnterRole('admin')}
              className="w-full py-3 rounded-lg bg-black hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-black text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Explore TPO Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. NATURAL LANGUAGE TALENT RETRIEVAL (The Recruiter Search Experience) */}
      <section className="border-t border-black/[0.06] dark:border-white/[0.08] py-28 max-w-7xl mx-auto px-6 space-y-12">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            04 &mdash; Semantic Talent Discovery
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-black dark:text-white leading-[1.08]">
            Query the Pan-India Campus Talent Graph in Plain English
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Traverse student AST code execution records, aptitude speed percentiles, and university PRN records in milliseconds across all Indian engineering institutes.
          </p>
        </div>

        <div className="p-6 md:p-8 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.02] space-y-6">
          {/* Query Bar */}
          <div className="p-3 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#12141D] flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 w-full px-3 py-1.5 text-xs">
              <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <input
                type="text"
                readOnly
                value={recruiterQueries[activeQueryIndex].query}
                className="w-full bg-transparent text-black dark:text-white font-medium outline-none cursor-default font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto justify-end px-2">
              <span className="text-[10px] font-mono text-slate-400 hidden md:inline">Presets:</span>
              {recruiterQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQueryIndex(idx)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-mono transition ${
                    activeQueryIndex === idx
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Query {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card Preview */}
          <div className="p-6 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#12141D] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-lg text-black dark:text-white">
                  {recruiterQueries[activeQueryIndex].candidate}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  {recruiterQueries[activeQueryIndex].status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {recruiterQueries[activeQueryIndex].institution} &bull; Matched: <span className="text-black dark:text-white font-semibold">{recruiterQueries[activeQueryIndex].role}</span>
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                CGPA: {recruiterQueries[activeQueryIndex].cgpa} &bull; Code Quality: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{recruiterQueries[activeQueryIndex].codeProof}</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right font-mono">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {recruiterQueries[activeQueryIndex].matchScore}
                </span>
                <span className="text-[10px] text-slate-400 block">Vector Fit</span>
              </div>
              <button
                onClick={() => onEnterRole('recruiter')}
                className="px-4 py-2.5 rounded-lg bg-black hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-black text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              >
                <span>Inspect Runtime Trace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. THE COMPARISON MATRIX: TRADITIONAL VS SKILLBRIDGE */}
      <section id="the-matrix" className="border-t border-black/[0.06] dark:border-white/[0.08] py-28 max-w-7xl mx-auto px-6 space-y-12">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            05 &mdash; Architectural Comparison
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-black dark:text-white leading-[1.08]">
            The Fundamental Paradigm Shift
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Why traditional campus hiring breaks down across Indian colleges, and how skill-based intelligence creates verifiable certainty.
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#12141D] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-black/[0.06] dark:border-white/[0.08] text-xs font-mono font-bold">
            <div className="md:col-span-4 p-4 text-slate-500 uppercase tracking-wider">
              Talent Metric
            </div>
            <div className="md:col-span-4 p-4 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 uppercase tracking-wider border-t md:border-t-0 md:border-l border-black/[0.06] dark:border-white/[0.08]">
              Traditional Campus Recruiting
            </div>
            <div className="md:col-span-4 p-4 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 uppercase tracking-wider border-t md:border-t-0 md:border-l border-black/[0.06] dark:border-white/[0.08]">
              HireX Enterprise
            </div>
          </div>

          {[
            {
              metric: 'Skill Verification',
              traditional: 'Unverified self-reported resume bullet points and buzzwords',
              hirex: 'Client-side AST parser proving Big-O complexity & cyclomatic nodes'
            },
            {
              metric: 'Curriculum Synchronization',
              traditional: 'Static 4-year syllabi disconnected from live tech vacancies',
              hirex: 'Real-time syllabus desynchronization index vs 250,000+ national tech vacancies'
            },
            {
              metric: 'Recruiter Screening',
              traditional: 'Keyword ATS filters rewarding formatting tricks over true aptitude',
              hirex: 'Bias-free vector matching computing purely verified technical traces'
            },
            {
              metric: 'Placement Office (TPO)',
              traditional: 'Manual paper NOC signatures, physical tokens, and Excel rosters',
              hirex: 'Digital eligibility gatekeeping, auto-rosters, and cryptographic transcripts'
            }
          ].map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 border-b last:border-b-0 border-black/[0.06] dark:border-white/[0.08] text-xs">
              <div className="md:col-span-4 p-4 font-bold text-black dark:text-white bg-black/[0.01] dark:bg-white/[0.01] flex items-center">
                {row.metric}
              </div>
              <div className="md:col-span-4 p-4 text-slate-600 dark:text-slate-400 border-t md:border-t-0 md:border-l border-black/[0.06] dark:border-white/[0.08] flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{row.traditional}</span>
              </div>
              <div className="md:col-span-4 p-4 text-black dark:text-white bg-emerald-50/20 dark:bg-emerald-950/10 border-t md:border-t-0 md:border-l border-black/[0.06] dark:border-white/[0.08] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-medium">{row.hirex}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8.5 WHY SKILLBRIDGE? ARCHITECTURAL DIFFERENTIATION & DATA NETWORK EFFECT (REQUIREMENTS 33 & 34) */}
      <section id="why-hirex" className="border-t border-black/[0.06] dark:border-white/[0.08] py-28 max-w-7xl mx-auto px-6 space-y-16">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            05 &mdash; Product Architecture &amp; Defensibility
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-black dark:text-white leading-[1.08]">
            Why HireX? The Connected Intelligence Layer
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            The higher education and recruiting tech landscape is full of siloed tools. Here is how HireX bridges the entire loop into a unified intelligence ecosystem.
          </p>
        </div>

        {/* Existing Siloed Ecosystem vs Connected HireX Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left: Fragmented Landscape */}
          <div className="p-8 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#12141D] space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                The Disconnected Status Quo
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white">
                Siloed Tools, Disconnected Workflows
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Colleges and companies operate across multiple fragmented solutions that don't talk to each other:
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-mono">
                {[
                  "Professional Profiles",
                  "Assessment Platforms",
                  "Learning Platforms (LMS)",
                  "Job Portals & Job Boards",
                  "College ERP Systems",
                  "Placement Cell Spreadsheets"
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">The Problem:</span> Student assessment scores never reach faculty curriculum planning, college training rarely connects to corporate job requirements, and hiring outcomes are lost in spreadsheets.
            </div>
          </div>

          {/* Right: HireX Unified Intelligence */}
          <div className="p-8 rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-slate-950 text-white space-y-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 block">
                The HireX Layer
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                One Shared Skill Intelligence Layer
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                HireX connects these disparate workflows into one continuous closed loop:
              </p>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono space-y-2 text-indigo-200">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">1. Measure:</span> Proctored objective assessments &amp; code analysis
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">2. Demand:</span> Real-time corporate job requirements
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">3. Intervene:</span> Targeted cohort bootcamps with before/after delta
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">4. Place:</span> Bias-free AI matching &amp; verified Skill Passports
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">5. Feedback:</span> Recruitment outcomes feed institutional analytics
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-xs text-indigo-200">
              <span className="font-bold text-white">Our Core Philosophy:</span> &ldquo;Features can be replicated. The true defensibility comes from the connected skill, demand, training and outcome data generated across the ecosystem.&rdquo;
            </div>
          </div>
        </div>

        {/* The Skill Intelligence Network Effect (Requirement 34) */}
        <div className="p-8 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#12141D] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Requirement 34: Cumulative Network Defensibility
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-black dark:text-white mt-1">
                The Skill Intelligence Data Flywheel
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Self-Reinforcing Accuracy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-mono text-indigo-600 font-bold block">More Students</span>
              <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">&darr; More Verified Skill Evidence</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-mono text-indigo-600 font-bold block">More Recruiters</span>
              <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">&darr; More Industry Demand Data</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-mono text-indigo-600 font-bold block">More Colleges</span>
              <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">&darr; More Cohort Skill Records</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-mono text-indigo-600 font-bold block">More Training</span>
              <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">&darr; More Measured Improvement</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-mono text-indigo-600 font-bold block">More Hiring</span>
              <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">&darr; More Closed-Loop Outcome Data</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PAN-INDIA TECH CORRIDOR PLACEMENT PIPELINES */}
      <section id="tech-drives" className="border-t border-black/[0.06] dark:border-white/[0.08] py-28 max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              06 &mdash; Active Enterprise Tech Drives
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-black dark:text-white leading-[1.08]">
              Live Pan-India Enterprise Hiring Pipelines
            </h2>
          </div>

          <button
            onClick={() => onEnterRole('student')}
            className="px-5 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.1] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All National Drives in Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              company: 'Barclays Global Service Centre',
              role: 'Graduate Software Engineer',
              stipend: '₹12.5 LPA',
              location: 'Bengaluru & Pune',
              match: '91%',
              skills: ['Python', 'FastAPI', 'Algorithms']
            },
            {
              company: 'Persistent Systems',
              role: 'Cloud Microservices Associate',
              stipend: '₹8.5 LPA',
              location: 'Pune & Hyderabad',
              match: '87%',
              skills: ['React', 'TypeScript', 'Docker']
            },
            {
              company: 'Cognizant GenC Next',
              role: 'Full-Stack Developer',
              stipend: '₹7.2 LPA',
              location: 'Bengaluru, Chennai & Delhi-NCR',
              match: '82%',
              skills: ['SQL', 'FastAPI', 'Node.js']
            },
            {
              company: 'Veritas Technologies',
              role: 'Core Systems & Storage Intern',
              stipend: '₹45,000 / mo',
              location: 'Mumbai & Bengaluru (Hybrid)',
              match: '85%',
              skills: ['Data Structures', 'Python', 'Linux']
            }
          ].map((drive) => (
            <div
              key={drive.company}
              onClick={() => onEnterRole('student')}
              className="p-5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-[#12141D] hover:border-black/30 dark:hover:border-white/30 cursor-pointer transition space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-black dark:text-white">{drive.company}</span>
                <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  {drive.match} Match
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {drive.role}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {drive.location}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {drive.skills.map((s) => (
                  <span key={s} className="text-[10px] font-mono bg-black/[0.04] dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    {s}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-xs">
                <span className="font-extrabold text-black dark:text-white font-mono">{drive.stipend}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Apply <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FINAL TRANSFORMATION STATEMENT & ENTERPRISE CTA */}
      <section className="border-t border-black/[0.06] dark:border-white/[0.08] py-28 max-w-7xl mx-auto px-6">
        <div className="p-10 md:p-16 rounded-3xl bg-black text-white dark:bg-white dark:text-black space-y-8 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400 dark:text-slate-600">
              National Talent Infrastructure
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.04em] leading-[1.05]">
              Modernize your campus talent pipeline today.
            </h2>
            <p className="text-base sm:text-lg text-slate-400 dark:text-slate-600 max-w-2xl mx-auto font-normal">
              Join forward-thinking academic institutions and enterprise employers across India using HireX to discover, verify, and deploy early-career technical talent.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenAuthModal}
              className="px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-black dark:bg-black dark:hover:bg-slate-900 dark:text-white text-sm font-bold transition shadow-sm active:scale-95 flex items-center gap-2"
            >
              <span>Schedule Enterprise Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEnterRole('student')}
              className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-black/10 dark:hover:bg-black/20 text-white dark:text-black border border-white/20 dark:border-black/20 text-sm font-semibold transition"
            >
              Start Free for Students
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
