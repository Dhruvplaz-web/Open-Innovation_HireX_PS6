import React, { useState, useEffect, useRef } from 'react';
import { Brain, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface Props {
  onComplete?: (metrics: any) => void;
  isBatteryMode?: boolean;
}

const SYMBOLS = ['○', '△', '□', '☆', '✦', '◈', '⬡'];

export const WorkingMemoryGame: React.FC<Props> = ({ onComplete, isBatteryMode }) => {
  const [nBack, setNBack] = useState<number>(2);
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Score metrics
  const [hits, setHits] = useState<number>(0);
  const [falsePositives, setFalsePositives] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [totalMatchesPossible, setTotalMatchesPossible] = useState<number>(0);
  const [feedback, setFeedback] = useState<'NONE' | 'CORRECT' | 'WRONG'>('NONE');

  const timerRef = useRef<any>(null);

  const startNBack = () => {
    // Generate sequence of 20 symbols with ~30% intentional N-back matches
    const seq: string[] = [];
    let matchCount = 0;
    for (let i = 0; i < 20; i++) {
      if (i >= nBack && Math.random() < 0.35) {
        seq.push(seq[i - nBack]);
        matchCount++;
      } else {
        const randSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        seq.push(randSym);
      }
    }

    setSequence(seq);
    setTotalMatchesPossible(matchCount);
    setCurrentIndex(0);
    setHits(0);
    setFalsePositives(0);
    setMisses(0);
    setIsPlaying(true);
    setIsFinished(false);
  };

  useEffect(() => {
    if (!isPlaying || currentIndex >= sequence.length) {
      if (isPlaying && currentIndex >= sequence.length) {
        finishGame();
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      // Check if current was a match that user missed
      if (currentIndex >= nBack) {
        const isMatch = sequence[currentIndex] === sequence[currentIndex - nBack];
        if (isMatch && feedback === 'NONE') {
          setMisses((prev) => prev + 1);
        }
      }

      setFeedback('NONE');
      setCurrentIndex((prev) => prev + 1);
    }, 1800);

    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentIndex, sequence, nBack, feedback]);

  const handleMatchClick = () => {
    if (!isPlaying || currentIndex < nBack) return;

    const isTrueMatch = sequence[currentIndex] === sequence[currentIndex - nBack];
    if (isTrueMatch) {
      setHits((prev) => prev + 1);
      setFeedback('CORRECT');
    } else {
      setFalsePositives((prev) => prev + 1);
      setFeedback('WRONG');
    }
  };

  const finishGame = () => {
    setIsPlaying(false);
    setIsFinished(true);
    const accuracy = totalMatchesPossible > 0 ? Math.round((hits / totalMatchesPossible) * 100) : 80;
    const metrics = {
      n_back: nBack,
      accuracy,
      hits,
      false_positives: falsePositives,
      misses
    };
    if (onComplete) onComplete(metrics);
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
              Cognitive Game 2 of 9
            </span>
            <span className="text-xs font-semibold text-slate-400">N-Back Working Memory</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Working Memory N-Back Challenge</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Press MATCH when the current symbol matches the symbol shown exactly {nBack} positions earlier.
          </p>
        </div>

        {/* N-back Selector */}
        {!isPlaying && !isFinished && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            {[1, 2, 3].map((val) => (
              <button
                key={val}
                onClick={() => setNBack(val)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  nBack === val ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {val}-Back
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Arena */}
      {!isPlaying && !isFinished && (
        <div className="text-center p-8 space-y-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <Brain className="w-12 h-12 mx-auto text-indigo-600" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Ready for {nBack}-Back Memory Assessment?</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Symbols will appear one by one. Tap "MATCH" whenever the symbol matches what you saw {nBack} step{nBack > 1 ? 's' : ''} ago.
          </p>
          <button
            onClick={startNBack}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition"
          >
            Start N-Back Session
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Progress: {currentIndex + 1} / {sequence.length}</span>
            <span>Target Mode: {nBack}-Back</span>
          </div>

          {/* Active Symbol Display */}
          <div className="h-48 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
            <div className="text-7xl font-bold text-indigo-400 animate-fade-in key={currentIndex}">
              {sequence[currentIndex] || '•'}
            </div>

            {feedback === 'CORRECT' && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Correct Match!
              </div>
            )}

            {feedback === 'WRONG' && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold flex items-center gap-1">
                <XCircle className="w-4 h-4" /> False Alarm!
              </div>
            )}
          </div>

          <button
            onClick={handleMatchClick}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base shadow-lg transition transform active:scale-95 cursor-pointer"
          >
            🎯 MATCH (Same as {nBack} Steps Ago)
          </button>
        </div>
      )}

      {isFinished && (
        <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center space-y-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Working Memory Assessment Complete</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Hits</span>
              <div className="text-xl font-bold text-emerald-600">{hits}</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">False Alarms</span>
              <div className="text-xl font-bold text-red-500">{falsePositives}</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Misses</span>
              <div className="text-xl font-bold text-amber-500">{misses}</div>
            </div>
          </div>
          {!isBatteryMode && (
            <button
              onClick={startNBack}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition shadow-md"
            >
              Replay N-Back
            </button>
          )}
        </div>
      )}
    </div>
  );
};
