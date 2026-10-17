import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  Brain,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { InterviewSession, InterviewQuestion, AnswerEvaluation } from '../../types/interview';

interface Props {
  session: InterviewSession;
  onSubmitAnswer: (answerText: string, audioDurationSeconds: number) => Promise<void>;
  onEndEarly: () => void;
  isSubmitting: boolean;
  previousEvaluation?: AnswerEvaluation | null;
}

export const InterviewRoomView: React.FC<Props> = ({
  session,
  onSubmitAnswer,
  onEndEarly,
  isSubmitting,
  previousEvaluation
}) => {
  const [answerText, setAnswerText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showPreviousEval, setShowPreviousEval] = useState<boolean>(true);
  const [confirmEndModal, setConfirmEndModal] = useState<boolean>(false);

  // Timer State (countdown from duration_minutes * 60)
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    return (session.duration_minutes || 15) * 60;
  });

  const recognitionRef = useRef<any>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const accumulatedAudioSecondsRef = useRef<number>(0);

  const currentQuestions = session.questions || [];
  const currentQIndex = session.current_question_index || currentQuestions.length;
  const currentQuestion: InterviewQuestion | undefined = currentQuestions[currentQIndex - 1];

  // 1. Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setAnswerText((prev) => (prev ? `${prev.trim()} ${finalTranscript}` : finalTranscript));
        }
      };

      recog.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recog;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { /* ignore */ }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 2. Timer Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-read question using SpeechSynthesis when new question appears
  const handleSpeakQuestion = () => {
    if (!currentQuestion || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice Input
  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. Please type your response or use Chrome/Edge.');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
        accumulatedAudioSecondsRef.current += duration;
      } catch { /* ignore */ }
      setIsRecording(false);
    } else {
      try {
        recordingStartTimeRef.current = Date.now();
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.warn('Failed to start speech recognition:', e);
      }
    }
  };

  const handleSubmit = async () => {
    if (!answerText.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { /* ignore */ }
      setIsRecording(false);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }

    const audioSeconds = accumulatedAudioSecondsRef.current;
    accumulatedAudioSecondsRef.current = 0;
    const textToSubmit = answerText.trim();
    setAnswerText('');

    await onSubmitAnswer(textToSubmit, audioSeconds);
  };

  // Format time remaining MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const progressPct = Math.round((currentQIndex / (session.target_question_count || 5)) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Top HUD Ribbon */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                {session.target_company}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {session.role}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400">
                {session.round}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Difficulty: {session.difficulty} • Exp: {session.experience_level}
            </span>
          </div>
        </div>

        {/* Right side controls: Timer, Progress & End Session */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Live Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
            timeLeft < 120
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Question Counter & Progress */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <span>Q{currentQIndex} of {session.target_question_count}</span>
            <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* End Interview Early Button */}
          <button
            type="button"
            onClick={() => setConfirmEndModal(true)}
            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition cursor-pointer"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* 2. Previous Question Instant Evaluation Banner (if applicable) */}
      {previousEvaluation && showPreviousEval && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Previous Answer Evaluated: {previousEvaluation.overall_score}/10
              </span>
            </div>
            <button
              onClick={() => setShowPreviousEval(false)}
              className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Dismiss Feedback
            </button>
          </div>

          <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
            {previousEvaluation.feedback}
          </p>

          {previousEvaluation.keywords_detected?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                Grounded:
              </span>
              {previousEvaluation.keywords_detected.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                >
                  ✓ {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. AI Interviewer Card & Active Question */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl shadow-md shadow-indigo-600/20">
                🎙️
              </div>
              {isPlayingAudio && (
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-card-dark animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-bold text-slate-900 dark:text-white">
                  AI Technical Interviewer
                </strong>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {isPlayingAudio ? 'Speaking...' : isSubmitting ? 'Analyzing Response...' : 'Listening'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentQuestion?.category || session.round}
              </span>
            </div>
          </div>

          {/* Text to Speech Button */}
          {'speechSynthesis' in window && (
            <button
              type="button"
              onClick={handleSpeakQuestion}
              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isPlayingAudio
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600'
              }`}
              title={isPlayingAudio ? 'Stop Reading' : 'Listen to Question'}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPlayingAudio ? 'Stop Audio' : 'Listen Question'}</span>
            </button>
          )}
        </div>

        {/* Question Statement */}
        <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
            Question #{currentQIndex} of {session.target_question_count}
          </span>
          <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
            {currentQuestion?.question || 'Loading next technical question...'}
          </p>
        </div>

        {/* Optional Hints Accordion */}
        {currentQuestion?.hints && currentQuestion.hints.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHints ? 'Hide Architectural Hints' : 'Need a hint? Click to view expected trade-offs'}</span>
              {showHints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showHints && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                {currentQuestion.hints.map((h, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{h}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Candidate Response Workspace */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>Your Technical Explanation</span>
              {isRecording && (
                <span className="flex items-center gap-1 text-[11px] text-rose-500 animate-pulse font-bold lowercase">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  listening to your mic...
                </span>
              )}
            </label>

            <span className="text-[11px] font-mono text-slate-400">
              {wordCount} words {wordCount < 20 ? '(aim for 30+ words for full depth scoring)' : '✓ good length'}
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={7}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your technical defense or click the microphone to speak your answer clearly. Explain mechanisms, trade-offs, and edge cases..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs md:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* Action Ribbon: Mic, Clear, Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Mic Speech-to-Text Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                    isRecording
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Start Microphone Speech-to-Text'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-500" />}
                  <span>{isRecording ? 'Stop Mic Recording' : 'Voice Input (Mic)'}</span>
                </button>
              )}

              {answerText && (
                <button
                  type="button"
                  onClick={() => setAnswerText('')}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Primary Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !answerText.trim()}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Technical Depth...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {currentQIndex >= (session.target_question_count || 5)
                      ? 'Submit Final Answer & Finish'
                      : 'Submit Answer & Next Question'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to End Interview Early */}
      {confirmEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                End Interview Early?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to conclude the interview session now? The AI will compile your evaluation report based on the questions answered so far.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmEndModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Continue Interview
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmEndModal(false);
                  onEndEarly();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Conclude & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
