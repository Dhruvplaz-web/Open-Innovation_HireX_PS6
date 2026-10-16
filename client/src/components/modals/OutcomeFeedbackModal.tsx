import React, { useState } from 'react';
import { X, Send, Award, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { apiService } from '../../services/api';

interface OutcomeFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onSuccess?: () => void;
}

export const OutcomeFeedbackModal: React.FC<OutcomeFeedbackModalProps> = ({
  isOpen,
  onClose,
  application,
  onSuccess
}) => {
  const [outcome, setOutcome] = useState<'SELECTED' | 'REJECTED' | 'SHORTLISTED' | 'OFFERED'>('SELECTED');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    application?.matched_skills || ['Python', 'FastAPI', 'React']
  );
  const [skillReadiness, setSkillReadiness] = useState<string>(
    'Exceeded benchmark cutoff on proctored live coding.'
  );
  const [interviewReadiness, setInterviewReadiness] = useState<string>(
    'Demonstrated clear architectural clarity and engineering fundamentals.'
  );
  const [technicalGap, setTechnicalGap] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      setErrorMsg('Please select at least one skill associated with this hiring decision.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiService.submitRecruitmentOutcome({
        application_id: application.id,
        outcome,
        important_skills: selectedSkills,
        skill_readiness: skillReadiness,
        interview_readiness: interviewReadiness,
        technical_gap: technicalGap,
        notes: notes || `${selectedSkills.join(', ')} were among the skills associated with this recruitment outcome.`
      });

      if (res.status === 'success') {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg('Failed to record outcome.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording outcome.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-start justify-between">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1 w-fit">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              RECRUITMENT OUTCOME FEEDBACK LOOP
            </span>
            <h3 className="text-xl font-black text-white">
              Record Decision & Feedback
            </h3>
            <p className="text-xs text-indigo-200/80">
              Candidate: <span className="font-bold text-white">{application.student_name}</span> • {application.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Outcome Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Recruitment Decision Outcome
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['SELECTED', 'SHORTLISTED', 'REJECTED'] as const).map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setOutcome(opt)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    outcome === opt
                      ? opt === 'SELECTED'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : opt === 'SHORTLISTED'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-rose-600 text-white border-rose-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Skills Associated with Outcome */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Skills Associated with this Outcome
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Select key technical competencies that factored into this hiring evaluation.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Python', 'React', 'FastAPI', 'SQL', 'Machine Learning', 'Docker', 'Data Structures', 'TypeScript'].map(sk => {
                const isSelected = selectedSkills.includes(sk);
                return (
                  <button
                    type="button"
                    key={sk}
                    onClick={() => toggleSkill(sk)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{sk}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Qualitative Signals */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Technical Skill Readiness Feedback
              </label>
              <input
                type="text"
                value={skillReadiness}
                onChange={e => setSkillReadiness(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="e.g. Exceeded benchmark cutoff on proctored live coding"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Interview & Architectural Readiness
              </label>
              <input
                type="text"
                value={interviewReadiness}
                onChange={e => setInterviewReadiness(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="e.g. Strong system design and algorithmic clarity"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Identified Technical Gaps (Optional)
              </label>
              <input
                type="text"
                value={technicalGap}
                onChange={e => setTechnicalGap(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="e.g. Could benefit from production container orchestration labs"
              />
            </div>
          </div>

          {/* Feedback loop notice */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-200">Continuous Feedback Loop:</span> This evaluation feeds directly into institutional skill intelligence and university syllabus recommendations, closing the loop between Students, Academia and Recruiters.
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recording...' : 'Submit Outcome Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
