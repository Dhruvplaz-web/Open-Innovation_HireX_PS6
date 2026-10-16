import React from 'react';
import { X, Award, Users, Target, Cpu, CheckCircle } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const team = [
    { name: "Yuvraj Kadam", role: "ML Engineer & Pipeline Specialist", contact: "+91 89751 63432" },
    { name: "Nimisha Joshi", role: "Frontend Architect & UX Lead", contact: "+91 95297 71693" },
    { name: "Khushi Patil", role: "AI Research & Evaluation", contact: "+91 90217 16843" },
    { name: "Dhruv Patil", role: "Full-Stack & Agent Systems Lead", contact: "+91 96651 84535" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card-dark w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium mb-2 border border-slate-200 dark:border-slate-700">
            <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Enterprise Talent Intelligence Platform</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            About HireX Enterprise
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            National AICTE-aligned skill verification and placement intelligence platform connecting Indian universities to Tier-1 tech employers.
          </p>
        </div>

        {/* Problem Statement Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 mb-6 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Problem Statement</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            "Portal for Academia Industry collaboration for Skill Mapping, Internships and Placement."
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            Unverified student skills, mismatched opportunities, reactive curricula, and costly manual recruiter screening — all stemming from the absence of a standardized, trustworthy skill signal connecting academia and industry.
          </p>
        </div>

        {/* Solution Pillars */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Core Technological Innovation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Sovereign Local ML</span>
              <p className="text-slate-500 text-[11px] leading-snug">
                Sub-10ms objective skill calibration and vector job matching with zero external API lock-in.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Agentic AI Co-Pilot</span>
              <p className="text-slate-500 text-[11px] leading-snug">
                Autonomous guidance for student roadmap generation, recruiter candidate screening, and syllabus audit.
              </p>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Team Dominator (Size: 4)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {team.map((m) => (
              <div
                key={m.name}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 shadow-xs"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">{m.name}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium block mt-0.5">{m.role}</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">{m.contact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
