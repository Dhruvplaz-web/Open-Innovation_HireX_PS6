import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Zap,
  Building,
  Clock,
  Award,
  ChevronRight,
  FileText,
  User,
  ShieldCheck,
  Cpu,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { InterviewDifficulty, InterviewConfig } from '../../types/interview';

interface Props {
  config: InterviewConfig | null;
  onStart: (params: {
    role: string;
    round_type: string;
    difficulty: InterviewDifficulty;
    experience_level: string;
    duration_minutes: number;
    target_company: string;
    job_description?: string;
    resume_text?: string;
  }) => void;
  isLoading: boolean;
}

const ROLES = [
  { id: 'Software Developer', label: 'Software Developer', desc: 'Core OOP, Data Structures, Concurrency & Systems', icon: '💻' },
  { id: 'Frontend Developer', label: 'Frontend Developer', desc: 'React, TypeScript, Web Performance & DOM APIs', icon: '🎨' },
  { id: 'Backend Developer', label: 'Backend Developer', desc: 'Node.js, Python, Databases, Caching & Distributed Systems', icon: '⚙️' },
  { id: 'Full Stack Developer', label: 'Full Stack Developer', desc: 'End-to-End System Design, Auth, REST/gRPC & Cloud', icon: '🚀' },
  { id: 'Data Analyst / Scientist', label: 'Data Analyst / Scientist', desc: 'SQL, Pandas, Statistical Modeling & Pipelines', icon: '📊' },
  { id: 'DevOps / Cloud Engineer', label: 'DevOps / Cloud Engineer', desc: 'Docker, Kubernetes, CI/CD, IaC & Site Reliability', icon: '☁️' },
  { id: 'Mobile App Developer', label: 'Mobile App Developer', desc: 'React Native, Flutter, Native APIs & Offline Sync', icon: '📱' }
];

const ROUNDS = [
  { id: 'Technical Fundamentals', label: 'Technical Fundamentals', desc: 'OS, DBMS, Networks, Language Core & Concurrency', badge: 'Core CS' },
  { id: 'DSA & Algorithmic Problem Solving', label: 'DSA & Coding', desc: 'Time/Space Complexity, Trees, Graphs & Dynamic Programming', badge: 'Algorithms' },
  { id: 'System Design & Architecture', label: 'System Design', desc: 'Scalability, Microservices, Caching & Partitioning', badge: 'High Scale' },
  { id: 'Project Discussion & Resume Defense', label: 'Project Defense', desc: 'Deep dive into your actual capstone projects & trade-offs', badge: 'Experience' },
  { id: 'HR & Behavioral Round', label: 'HR & Behavioral', desc: 'STAR Method, Cultural Fit, Teamwork & Leadership', badge: 'Culture' }
];

const COMPANIES = ['Barclays', 'Google', 'Microsoft', 'Amazon', 'Tata Technologies', 'Persistent Systems', 'TCS Digital', 'Morgan Stanley'];

export const InterviewSetupCard: React.FC<Props> = ({ config, onStart, isLoading }) => {
  const [selectedRole, setSelectedRole] = useState<string>('Software Developer');
  const [selectedRound, setSelectedRound] = useState<string>('Technical Fundamentals');
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty>('Intermediate');
  const [selectedExperience, setSelectedExperience] = useState<string>('Fresher / Student (0-1 yrs)');
  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [targetCompany, setTargetCompany] = useState<string>('Barclays');
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');

  const handleLaunch = () => {
    onStart({
      role: selectedRole,
      round_type: selectedRound,
      difficulty: selectedDifficulty,
      experience_level: selectedExperience,
      duration_minutes: selectedDuration,
      target_company: targetCompany.trim() || 'Tier-1 Tech',
      job_description: jobDescription.trim() || undefined,
      resume_text: resumeText.trim() || undefined
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* AI Provider Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-slate-900 border border-indigo-500/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">AI Engine Provider:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {config?.active_provider || 'HireX Sovereign Context Engine'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Live context-aware technical interviewing with multi-dimensional answer scoring and personalized preparation plans.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Real-time Dynamic Follow-ups</span>
        </div>
      </div>

      {/* Main Configuration Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-md space-y-8">
        
        {/* 1. Target Job Role */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>1. Target Job Role</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">Select target specialization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLES.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm shadow-indigo-500/10'
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{r.icon}</span>
                  <div className="min-w-0">
                    <strong className={`text-xs block font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                      {r.label}
                    </strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 block">
                      {r.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Interview Round */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>2. Interview Round</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">Industry screening stage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROUNDS.map((rd) => {
              const isSelected = selectedRound === rd.id;
              return (
                <div
                  key={rd.id}
                  onClick={() => setSelectedRound(rd.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 shadow-sm shadow-purple-500/10'
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <strong className={`text-xs font-bold ${isSelected ? 'text-purple-900 dark:text-purple-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {rd.label}
                      </strong>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                        {rd.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {rd.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Difficulty & Duration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              3. Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {(['Beginner', 'Intermediate', 'Advanced'] as InterviewDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                    selectedDifficulty === diff
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-mono block">
              {selectedDifficulty === 'Beginner' && 'Fundamental concepts & standard scenarios'}
              {selectedDifficulty === 'Intermediate' && 'Architectural trade-offs & edge cases'}
              {selectedDifficulty === 'Advanced' && 'Tier-1 MNC bar: deep internals & failure recovery'}
            </span>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              4. Experience Profile
            </label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Fresher / Student (0-1 yrs)">Fresher / Student (0-1 yrs)</option>
              <option value="Junior Associate (1-2 yrs)">Junior Associate (1-2 yrs)</option>
              <option value="Experienced / Lead (3+ yrs)">Experienced Engineer (3+ yrs)</option>
            </select>
            <span className="text-[10px] text-slate-400 font-mono block">Calibrates expected answer depth</span>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              5. Session Duration
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {[10, 15, 30].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSelectedDuration(dur)}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                    selectedDuration === dur
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {dur}m
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-mono block">
              {selectedDuration === 10 && 'Quick screening: 3-4 questions'}
              {selectedDuration === 15 && 'Standard technical round: 5-6 questions'}
              {selectedDuration === 30 && 'Comprehensive deep dive: 8-10 questions'}
            </span>
          </div>
        </div>

        {/* 6. Target Company */}
        <div className="space-y-2.5 pt-2">
          <label className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>6. Target Company Simulation</span>
            <span className="text-[10px] font-normal text-slate-400">Tailors company question flavor</span>
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {COMPANIES.map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => setTargetCompany(comp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  targetCompany === comp
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {comp}
              </button>
            ))}
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="Or enter custom company..."
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 flex-1 min-w-[180px]"
            />
          </div>
        </div>

        {/* 7. Optional JD and Resume Upload Accordion */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${showOptionalFields ? 'rotate-90' : ''}`} />
            <span>Optional: Paste Job Description (JD) or Project Resume Context</span>
          </button>

          {showOptionalFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                  Paste Target Job Description (JD)
                </label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste requirements, preferred tech stack, or job posting text..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                  Resume Highlights or Capstone Project Summary
                </label>
                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste key projects, repositories, or technologies you want the AI to grill you on..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                />
              </div>
            </div>
          )}
        </div>

        {/* Launch Button Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Real-time voice & text evaluation • Stored in personal history ledger</span>
          </div>

          <button
            type="button"
            onClick={handleLaunch}
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Personalized Question 1...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Start AI Mock Interview ({selectedDuration} mins)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
