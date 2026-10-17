import React, { useState, useEffect } from 'react';
import { Question, Difficulty } from '../../types/aptitude';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Clock,
  Sparkles,
  RotateCcw,
  Cpu,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface Props {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  isEvaluated: boolean;
  onCheckAnswer: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onBookmark: (questionId: string) => void;
  isBookmarked: boolean;
  runningScore: { correct: number; total: number };
  showTimer?: boolean;
  isTestMode?: boolean;
  testTimeLeft?: number;
  onMarkForReview?: () => void;
  isMarkedForReview?: boolean;
  onClearResponse?: () => void;
  onGenerateAI?: () => void;
  isGeneratingAI?: boolean;
}

export const QuestionView: React.FC<Props> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  isEvaluated,
  onCheckAnswer,
  onNext,
  onPrevious,
  onSkip,
  onBookmark,
  isBookmarked,
  runningScore,
  showTimer = true,
  isTestMode = false,
  testTimeLeft = 0,
  onMarkForReview,
  isMarkedForReview = false,
  onClearResponse,
  onGenerateAI,
  isGeneratingAI = false
}) => {
  // Local Stopwatch for practice mode (seconds elapsed)
  const [practiceSeconds, setPracticeSeconds] = useState<number>(0);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  useEffect(() => {
    setPracticeSeconds(0);
  }, [question.id]);

  useEffect(() => {
    if (isTestMode || isTimerPaused) return;
    const interval = setInterval(() => {
      setPracticeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTestMode, isTimerPaused, question.id]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Easy
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Medium
          </span>
        );
      case 'hard':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            Hard
          </span>
        );
      default:
        return null;
    }
  };

  // Render Visual Diagrams (Family Tree, Compass, Charts, Table)
  const renderDiagram = () => {
    if (!question.diagramType || !question.diagramData) return null;

    const { diagramType, diagramData } = question;

    if (diagramType === 'table') {
      return (
        <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 shadow-inner">
          <table className="w-full text-xs text-left text-slate-700 dark:text-slate-200">
            <thead className="text-[11px] uppercase font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {diagramData.headers?.map((h: string, idx: number) => (
                  <th key={idx} className="px-3 py-2 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono">
              {diagramData.rows?.map((row: string[], rIdx: number) => (
                <tr key={rIdx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                  {row.map((cell: string, cIdx: number) => (
                    <td key={cIdx} className={`px-3 py-2 ${cIdx === 0 ? 'font-bold text-slate-900 dark:text-white' : ''}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (diagramType === 'family_tree') {
      return (
        <div className="my-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/40 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900">
          <div className="flex items-center justify-between mb-3 border-b border-indigo-100 dark:border-indigo-900/40 pb-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              {diagramData.title || 'Family Tree Structural Diagram'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Generational Mapping</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            {diagramData.nodes?.map((node: any, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  node.isTarget
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-md ring-2 ring-emerald-500/30 animate-pulse'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                }`}
              >
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Level {node.level}</span>
                <span className="text-xs font-bold mt-0.5">{node.label}</span>
                <span className={`mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  node.gender === 'male'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : node.gender === 'female'
                    ? 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {node.gender}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (diagramType === 'direction_compass') {
      return (
        <div className="my-4 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/40 to-slate-50 dark:from-emerald-950/20 dark:to-slate-900">
          <div className="flex items-center justify-between mb-3 border-b border-emerald-100 dark:border-emerald-900/40 pb-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              {diagramData.title || 'Directional Vector Coordinates'}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {diagramData.resultant?.distance} • {diagramData.resultant?.direction}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            {diagramData.steps?.map((step: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] text-slate-400 block">Step {idx + 1}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (diagramType === 'chart') {
      return (
        <div className="my-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 shadow-sm">
          <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mb-3 flex items-center justify-between">
            <span>{diagramData.title}</span>
            <span className="text-[10px] text-slate-400 uppercase">{diagramData.type} Chart</span>
          </div>

          {/* Bar Chart Visualization */}
          {diagramData.type === 'bar' && (
            <div className="space-y-3">
              {diagramData.labels?.map((label: string, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-300">
                    <span>{label}</span>
                    <div className="flex items-center gap-3">
                      {diagramData.series?.map((s: any, sIdx: number) => (
                        <span key={sIdx} className="font-bold" style={{ color: s.color }}>
                          {s.name}: {s.data[idx]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                    {diagramData.series?.map((s: any, sIdx: number) => {
                      const maxVal = Math.max(...s.data) * 1.2 || 100;
                      const widthPct = Math.min(100, Math.round((s.data[idx] / maxVal) * 100));
                      return (
                        <div
                          key={sIdx}
                          style={{ width: `${widthPct}%`, backgroundColor: s.color }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pie Chart Representation */}
          {diagramData.type === 'pie' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {diagramData.slices?.map((slice: any, sIdx: number) => (
                  <div
                    key={sIdx}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center gap-2 text-xs font-mono"
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{slice.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">({slice.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line Chart Representation */}
          {diagramData.type === 'line' && (
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono pt-2">
              {diagramData.labels?.map((label: string, lIdx: number) => (
                <div key={lIdx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">{label}</span>
                  {diagramData.series?.map((s: any, sIdx: number) => (
                    <span key={sIdx} className="font-bold block text-sm mt-1" style={{ color: s.color }}>
                      {s.data[lIdx]}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Question Header & Meta Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {question.topicName} &gt; {question.subTopic}
            </span>
            {getDifficultyBadge(question.difficulty)}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Source: {question.source}</p>
        </div>

        {/* Right side status items (Score, Timer, Bookmark) */}
        <div className="flex items-center gap-3">
          {/* Running Score Pill (Practice) */}
          {!isTestMode && runningScore.total > 0 && (
            <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span>Score: {runningScore.correct}/{runningScore.total}</span>
              <span className="text-[10px] text-emerald-500">
                ({Math.round((runningScore.correct / runningScore.total) * 100)}%)
              </span>
            </div>
          )}

          {/* Timer Display */}
          {showTimer && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
                isTestMode
                  ? testTimeLeft < 120
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 animate-pulse'
                    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isTestMode ? formatTime(testTimeLeft) : formatTime(practiceSeconds)}</span>
            </div>
          )}

          {/* Bookmark Button */}
          <button
            onClick={() => onBookmark(question.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-500'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
          {question.question}
        </h2>

        {/* Diagram in Question (if applicable, e.g. for Data Interpretation tables/charts) */}
        {question.diagramType === 'table' && renderDiagram()}
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = question.correctIndex === idx;

          // Colors when evaluated
          let optionStyles = 'bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-400';
          let indicatorIcon = null;

          if (isEvaluated) {
            if (isCorrect) {
              optionStyles = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30';
              indicatorIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
            } else if (isSelected && !isCorrect) {
              optionStyles = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30';
              indicatorIcon = <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
            } else {
              optionStyles = 'opacity-60 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500';
            }
          } else if (isSelected) {
            optionStyles = 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30';
          }

          return (
            <button
              key={idx}
              onClick={() => !isEvaluated && onSelectOption(idx)}
              disabled={isEvaluated}
              className={`p-4 rounded-xl border text-left font-semibold text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyles} ${
                isEvaluated ? 'cursor-default' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                  isSelected && !isEvaluated
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>
              {indicatorIcon}
            </button>
          );
        })}
      </div>

      {/* Action Buttons Row */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            disabled={questionIndex === 0}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {!isTestMode && !isEvaluated && (
            <button
              onClick={onSkip}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Skip
            </button>
          )}

          {isTestMode && onMarkForReview && (
            <button
              onClick={onMarkForReview}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isMarkedForReview
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
              }`}
            >
              <span>{isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>
          )}

          {isTestMode && onClearResponse && selectedOption !== null && (
            <button
              onClick={onClearResponse}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Clear Response
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Practice Evaluation Trigger */}
          {!isTestMode && !isEvaluated && (
            <button
              onClick={onCheckAnswer}
              disabled={selectedOption === null}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md disabled:opacity-40 cursor-pointer active:scale-95"
            >
              Check Answer &amp; Explanation
            </button>
          )}

          {/* Next Button */}
          {(!isTestMode && isEvaluated) && (
            <button
              onClick={onNext}
              disabled={questionIndex >= totalQuestions - 1}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {isTestMode && (
            <button
              onClick={onNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>{questionIndex === totalQuestions - 1 ? 'Review & Submit' : 'Next Question'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Step-by-Step Explanation & Shortcut Section (Revealed on Check Answer) */}
      {!isTestMode && isEvaluated && (
        <div className={`p-6 rounded-2xl border space-y-4 animate-fade-in ${
          selectedOption === question.correctIndex
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-800 dark:text-slate-200'
            : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-slate-800 dark:text-slate-200'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-3">
            <div className="flex items-center gap-2">
              {selectedOption === question.correctIndex ? (
                <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-1 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-600">
                  <XCircle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold">
                  {selectedOption === question.correctIndex
                    ? 'Spot on! Correct Answer'
                    : `Incorrect (Correct Option: ${String.fromCharCode(65 + question.correctIndex)})`}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Study the formal solution breakdown below.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
              +20 XP Earned
            </span>
          </div>

          {/* Diagram in Explanation (For Blood Relations, Direction Sense, Charts) */}
          {question.diagramType && question.diagramType !== 'table' && renderDiagram()}

          {/* Step-by-Step Mathematical/Logical Explanation */}
          <div className="space-y-2 text-xs leading-relaxed">
            <span className="font-mono uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">
              Step-by-Step Solution:
            </span>
            <div className="whitespace-pre-line font-medium text-slate-800 dark:text-slate-200 bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              {question.explanation}
            </div>
          </div>

          {/* Shortcut Trick Banner */}
          {question.shortcut && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono uppercase text-[10px] text-amber-600 dark:text-amber-400 block mb-0.5">
                  MNC Speed Optimization Tip
                </span>
                <span>{question.shortcut}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
