import React, { useState } from 'react';
import { Award, Mic, ShieldCheck } from 'lucide-react';
import { StudentProfile } from '../types';
import { CertificateScannerWorkspace } from '../components/certificates/CertificateScannerWorkspace';
import { InterviewSimulatorView } from './InterviewSimulatorView';

interface PortfolioTranscriptViewProps {
  student: StudentProfile;
  initialTab?: 'scanner' | 'transcript' | 'mock_interview';
  onProfileUpdated?: (updatedStudent: any) => void;
}

export const PortfolioTranscriptView: React.FC<PortfolioTranscriptViewProps> = ({
  student,
  initialTab = 'scanner',
  onProfileUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'mock_interview'>(
    initialTab === 'mock_interview' ? 'mock_interview' : 'scanner'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header with Tab Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700">
              <Award className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Forensic Certificate Scanner & AI Mock Interviewer
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            NEP 2020 NCrF accredited forensic verification with real-time AI technical interview simulator.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'scanner'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Forensic Certificate Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('mock_interview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'mock_interview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>AI Mock Interviewer</span>
          </button>
        </div>
      </div>

      {activeTab === 'scanner' && (
        <CertificateScannerWorkspace
          student={student}
          onProfileUpdated={onProfileUpdated}
        />
      )}

      {activeTab === 'mock_interview' && (
        <InterviewSimulatorView student={student} />
      )}
    </div>
  );
};
