import React from 'react';
import { X, ShieldCheck, Award, GraduationCap, CheckCircle2, Code2, BookOpen, User } from 'lucide-react';
import { StudentProfile } from '../../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onOpenAssessment?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, student, onOpenAssessment }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <img
            src={student.avatar}
            alt={student.name}
            className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{student.name}</h2>
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{student.target_role}</p>
            <p className="text-xs text-slate-400 mt-0.5">{student.college} • {student.year}</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-xl font-black text-slate-900 dark:text-white block">{student.verified_score}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Skill Score</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-xl font-black text-slate-900 dark:text-white block">{student.cgpa}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">CGPA</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-xl font-black text-slate-900 dark:text-white block">#{student.rank_in_college}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">College Rank</span>
          </div>
        </div>

        {/* Verified Skills Section */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Objective Verified Competencies
          </h3>
          <div className="space-y-2.5">
            {Object.entries(student.skills).map(([skill, val]) => (
              <div
                key={skill}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${val.verified ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{skill}</span>
                  <span className="text-[10px] text-slate-400">({val.level})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 dark:bg-slate-100 rounded-full" style={{ width: `${val.score}%` }} />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{val.score}%</span>
                </div>
              </div>
            ))}
          </div>

          {onOpenAssessment && (
            <button
              onClick={() => {
                onClose();
                onOpenAssessment();
              }}
              className="w-full mt-3 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify New Skill or QR Certificate</span>
            </button>
          )}
        </div>

        {/* Academic & NEP 2020 Accreditation */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>NEP 2020 Credit Harmonization</span>
          </div>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400 text-[11px]">
            This profile has 18 verified academic credits linked to practical GitHub project submissions and proctored coding assessments, approved by JSPM RSCOE.
          </p>
        </div>
      </div>
    </div>
  );
};
