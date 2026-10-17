import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Bot, 
  History, 
  SlidersHorizontal, 
  Award, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';
import type { 
  InterviewSession, 
  InterviewConfig, 
  InterviewDifficulty,
  AnswerEvaluation, 
  FinalInterviewReport,
  InterviewQuestion 
} from '../types/interview';
import { apiService } from '../services/api';
import { InterviewSetupCard } from '../components/interview/InterviewSetupCard';
import { InterviewRoomView } from '../components/interview/InterviewRoomView';
import { InterviewResultDashboard } from '../components/interview/InterviewResultDashboard';
import { InterviewHistoryList } from '../components/interview/InterviewHistoryList';

interface InterviewSimulatorViewProps {
  student: {
    id: string;
    name?: string;
    email?: string;
    department?: string;
    year?: string;
  };
  onNavigateTab?: (tab: string) => void;
  defaultMode?: 'SETUP' | 'ROOM' | 'REPORT' | 'HISTORY';
}

type ViewMode = 'SETUP' | 'ROOM' | 'REPORT' | 'HISTORY';

export const InterviewSimulatorView: React.FC<InterviewSimulatorViewProps> = ({
  student,
  onNavigateTab,
  defaultMode = 'SETUP'
}) => {
  const [mode, setMode] = useState<ViewMode>(defaultMode);
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);
  
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);
  
  const [latestEvaluation, setLatestEvaluation] = useState<AnswerEvaluation | null>(null);
  const [historySessions, setHistorySessions] = useState<InterviewSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load backend configuration on mount
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        setIsLoadingConfig(true);
        const data = await apiService.getInterviewConfig();
        if (isMounted && data) {
          setConfig(data);
        }
      } catch (err: any) {
        console.error('Failed to load interview config:', err);
      } finally {
        if (isMounted) setIsLoadingConfig(false);
      }
    };
    fetchConfig();
    return () => { isMounted = false; };
  }, []);

  // Fetch student interview history
  const loadHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await apiService.getInterviewHistory(student.id);
      if (res && res.sessions) {
        setHistorySessions(res.sessions);
      } else if (Array.isArray(res)) {
        setHistorySessions(res);
      }
    } catch (err: any) {
      console.warn('Could not load interview history from server:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [student.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handler: Start a new session
  const handleStartInterview = async (params: {
    role: string;
    round_type: string;
    difficulty: InterviewDifficulty;
    experience_level: string;
    duration_minutes: number;
    target_company: string;
    job_description?: string;
    resume_text?: string;
  }) => {
    setErrorMessage(null);
    setIsStartingSession(true);
    try {
      const res = await apiService.startInterviewSession({
        student_id: student.id,
        role: params.role,
        round_type: params.round_type,
        difficulty: params.difficulty,
        experience_level: params.experience_level,
        duration_minutes: params.duration_minutes,
        target_company: params.target_company,
        job_description: params.job_description,
        resume_text: params.resume_text,
      });

      if (res && res.session) {
        setActiveSession(res.session);
        setLatestEvaluation(null);
        setMode('ROOM');
      } else {
        throw new Error(res?.message || 'Unable to start interview session');
      }
    } catch (err: any) {
      console.error('Failed to start interview:', err);
      setErrorMessage(err.message || 'Failed to initialize AI interview. Please try again.');
    } finally {
      setIsStartingSession(false);
    }
  };

  // Handler: Submit an answer to current question
  const handleSubmitAnswer = async (
    answerText: string,
    audioDurationSeconds: number
  ): Promise<void> => {
    if (!activeSession) return;
    
    setIsSubmittingAnswer(true);
    setErrorMessage(null);

    try {
      const res = await apiService.submitInterviewAnswer({
        session_id: activeSession.id,
        student_id: student.id,
        answer_text: answerText,
        audio_duration_seconds: audioDurationSeconds
      });

      if (res && res.data) {
        const payload = res.data;
        const evaluation: AnswerEvaluation = payload.previous_evaluation;
        setLatestEvaluation(evaluation);

        // Update activeSession with answer and evaluation
        setActiveSession(prev => {
          if (!prev) return prev;
          const currentIdx = prev.current_question_index;
          const updatedQuestions = [...prev.questions];
          
          if (updatedQuestions[currentIdx - 1]) {
            updatedQuestions[currentIdx - 1] = {
              ...updatedQuestions[currentIdx - 1],
              student_answer: answerText,
              audio_duration_seconds: audioDurationSeconds,
              evaluation: evaluation
            };
          }

          if (payload.next_question) {
            const nextQ: InterviewQuestion = payload.next_question;
            if (!updatedQuestions.some(q => q.index === nextQ.index)) {
              updatedQuestions.push(nextQ);
            }
          }

          const isCompleted = payload.status === 'COMPLETED';

          return {
            ...prev,
            questions: updatedQuestions,
            current_question_index: payload.current_question_index || currentIdx + 1,
            status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS'
          };
        });

        if (payload.status === 'COMPLETED' || payload.is_completed) {
          await handleCompleteInterview();
        }
      }
    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      setErrorMessage(err.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Handler: Complete interview and generate final report
  const handleCompleteInterview = async () => {
    if (!activeSession) return;
    setErrorMessage(null);

    try {
      const res = await apiService.completeInterviewSession({
        session_id: activeSession.id,
        student_id: student.id
      });

      if (res && res.data && res.data.report) {
        const finalReport: FinalInterviewReport = res.data.report;
        setActiveSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'COMPLETED',
            overall_evaluation: finalReport
          };
        });
        setMode('REPORT');
        loadHistory();
      }
    } catch (err: any) {
      console.error('Failed to complete interview:', err);
      setErrorMessage(err.message || 'Failed to generate final report.');
    }
  };

  // Handler: Select a past session from history
  const handleSelectHistorySession = (session: InterviewSession) => {
    setActiveSession(session);
    if (session.overall_evaluation) {
      setMode('REPORT');
    } else {
      setMode('ROOM');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0f1019] text-white border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm flex items-center justify-center">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                AI Mock Interview Simulator
              </h1>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v3.2 Autonomous
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Candidate: <strong className="text-white">{student.name || 'Scholar Candidate'}</strong></span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Cpu className="h-3 w-3" />
                {config?.active_provider ? `${config.active_provider} (${config.model})` : 'Gemini 2.5 Flash / Neural Engine'}
              </span>
            </p>
          </div>
        </div>

        {/* Mode Selector Pill Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-stretch md:self-auto overflow-x-auto">
          <button
            onClick={() => setMode('SETUP')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              mode === 'SETUP'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Setup
          </button>

          {activeSession && (
            <button
              onClick={() => setMode(activeSession.overall_evaluation ? 'REPORT' : 'ROOM')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                mode === 'ROOM' || mode === 'REPORT'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {activeSession.overall_evaluation ? (
                <>
                  <Award className="h-3.5 w-3.5" />
                  Scorecard
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Session
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setMode('HISTORY')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              mode === 'HISTORY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            History ({historySessions.length})
          </button>
        </div>
      </div>

      {/* Global Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-200 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-white text-xs underline font-mono shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Viewport Modes */}
      {mode === 'SETUP' && (
        <div className="animate-in fade-in duration-300">
          <InterviewSetupCard
            config={config}
            isLoading={isStartingSession}
            onStart={handleStartInterview}
          />
        </div>
      )}

      {mode === 'ROOM' && activeSession && (
        <div className="animate-in fade-in duration-300">
          <InterviewRoomView
            session={activeSession}
            isSubmitting={isSubmittingAnswer}
            onSubmitAnswer={handleSubmitAnswer}
            onEndEarly={handleCompleteInterview}
            previousEvaluation={latestEvaluation}
          />
        </div>
      )}

      {mode === 'REPORT' && activeSession?.overall_evaluation && (
        <div className="animate-in fade-in duration-300">
          <InterviewResultDashboard
            report={activeSession.overall_evaluation}
            session={activeSession}
            onRetake={() => {
              setActiveSession(null);
              setLatestEvaluation(null);
              setMode('SETUP');
            }}
            onViewHistory={() => setMode('HISTORY')}
          />
        </div>
      )}

      {mode === 'HISTORY' && (
        <div className="animate-in fade-in duration-300">
          <InterviewHistoryList
            sessions={historySessions}
            onSelectSession={handleSelectHistorySession}
            onNewInterview={() => {
              setActiveSession(null);
              setLatestEvaluation(null);
              setMode('SETUP');
            }}
          />
        </div>
      )}
    </div>
  );
};
