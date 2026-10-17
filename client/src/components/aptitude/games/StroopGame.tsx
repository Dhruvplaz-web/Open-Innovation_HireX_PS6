import React, { useState, useEffect, useRef } from 'react';
import { GameShell, GamePhase } from '../GameShell';
import { GameMetadata, GameResult } from '../../../types/aptitude';
import { RefreshCw, CheckCircle2, Clock } from 'lucide-react';

const METADATA: GameMetadata = {
  id: 'stroop_test',
  name: 'Stroop Cognitive Flexibility Test',
  skill: 'Inhibition & Cognitive Flexibility',
  skillCategory: 'Focus',
  duration: '2 mins',
  difficulty: 'Fast-Paced',
  description: 'Select the actual INK COLOR of the word displayed, completely ignoring the literal word meaning.',
  mncReference: 'Cut-e / pymetrics / SHL style',
  skillsEvaluated: ['Cognitive Inhibition', 'Perceptual Interference', 'Semantic Suppression', 'Selective Focus'],
  iconName: 'Stroop'
};

const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];
const COLOR_HEX: Record<string, string> = {
  RED: '#ef4444',
  BLUE: '#3b82f6',
  GREEN: '#10b981',
  YELLOW: '#f59e0b',
  PURPLE: '#8b5cf6'
};

interface Props {
  onComplete?: (result: GameResult) => void;
  onExit?: () => void;
}

export const StroopGame: React.FC<Props> = ({ onComplete, onExit }) => {
  const [phase, setPhase] = useState<GamePhase>('INSTRUCTIONS');
  const [trial, setTrial] = useState<number>(0);
  const [wordText, setWordText] = useState<string>('RED');
  const [inkColor, setInkColor] = useState<string>('BLUE');
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [trialTimeLeft, setTrialTimeLeft] = useState<number>(2.5); // 2.5s per trial
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const trialStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);

  const TOTAL_TRIALS = phase === 'PRACTICE' ? 2 : 10;

  const generateTrial = () => {
    // Pick word text
    const textIdx = Math.floor(Math.random() * COLOR_NAMES.length);
    const text = COLOR_NAMES[textIdx];

    // Pick ink color (80% incongruent, 20% congruent)
    let color = text;
    if (Math.random() < 0.8) {
      const remaining = COLOR_NAMES.filter((c) => c !== text);
      color = remaining[Math.floor(Math.random() * remaining.length)];
    }

    setWordText(text);
    setInkColor(color);
    setTrialTimeLeft(2.5);
    trialStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (phase !== 'PRACTICE' && phase !== 'PLAYING') return;

    timerIntervalRef.current = setInterval(() => {
      setTrialTimeLeft((prev) => {
        if (prev <= 0.1) {
          handleAnswer(''); // Timed out
          return 2.5;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(timerIntervalRef.current);
  }, [phase, trial]);

  const handleAnswer = (selectedColor: string) => {
    const latency = Date.now() - trialStartTimeRef.current;
    setReactionTimes((prev) => [...prev, latency]);

    const isCorrect = selectedColor === inkColor;
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    if (trial >= TOTAL_TRIALS - 1) {
      clearInterval(timerIntervalRef.current);
      if (phase === 'PRACTICE') {
        setPhase('PLAYING');
        resetGame();
      } else {
        finishGame(isCorrect ? correctCount + 1 : correctCount);
      }
    } else {
      setTrial((prev) => prev + 1);
      generateTrial();
    }
  };

  const finishGame = (totalCorrect: number) => {
    clearInterval(timerIntervalRef.current);

    const avgRT = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 800;

    const accuracy = Math.round((totalCorrect / TOTAL_TRIALS) * 100);
    const score = totalCorrect * 250;

    const res: GameResult = {
      gameId: METADATA.id,
      gameName: METADATA.name,
      score,
      accuracyPct: accuracy,
      reactionTimeMs: avgRT,
      roundsCompleted: TOTAL_TRIALS,
      percentile: Math.min(99, 65 + totalCorrect * 3.5),
      skills: {
        memory: 65,
        speed: Math.min(96, Math.max(40, Math.round((1200 - avgRT) / 8))),
        logic: 75,
        focus: Math.min(98, totalCorrect * 10),
        risk: 50,
        spatial: 60
      },
      tips: [
        `You scored ${accuracy}% accuracy with ${avgRT}ms latency under semantic interference.`,
        'Inhibition technique: Focus on the outer edges or font contours of the letter glyphs rather than reading the word aloud.'
      ],
      roleMatches: ['Core Backend Engineer', 'Quality Assurance Architect', 'Data Engineer']
    };

    setGameResult(res);
    setPhase('RESULT');
    if (onComplete) onComplete(res);
  };

  const resetGame = () => {
    clearInterval(timerIntervalRef.current);
    setTrial(0);
    setCorrectCount(0);
    setReactionTimes([]);
    generateTrial();
  };

  useEffect(() => {
    if (phase === 'PRACTICE' || phase === 'PLAYING') {
      resetGame();
    }
  }, [phase]);

  return (
    <GameShell
      game={METADATA}
      phase={phase}
      onSetPhase={(p) => {
        setPhase(p);
        resetGame();
      }}
      onExit={() => {
        clearInterval(timerIntervalRef.current);
        if (onExit) {
          onExit();
        } else {
          setPhase('INSTRUCTIONS');
        }
      }}
      result={gameResult}
      onPlayAgain={() => {
        resetGame();
        setPhase('PLAYING');
      }}
      instructionDemo={
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 text-center">
            <span className="text-xl font-black font-mono" style={{ color: '#3b82f6' }}>
              RED
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Font color is Blue!</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>1. The word reads "RED", but its font color is <strong>BLUE</strong>.</p>
            <p>2. You must select <strong>BLUE</strong> (the ink color).</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-center max-w-lg mx-auto py-2">
        {/* HUD */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Trial</span>
            <strong className="text-slate-900 dark:text-white font-bold">{trial + 1} of {TOTAL_TRIALS}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Timer</span>
            <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{trialTimeLeft.toFixed(1)}s</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Score</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{correctCount * 250}</strong>
          </div>
        </div>

        {/* Shrinking Timer Bar */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-100"
            style={{ width: `${(trialTimeLeft / 2.5) * 100}%` }}
          />
        </div>

        {/* Word Display */}
        <div className="h-44 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center select-none shadow-inner">
          <span
            className="text-5xl font-black font-mono tracking-wider transition-all duration-150 transform scale-100 drop-shadow-md"
            style={{ color: COLOR_HEX[inkColor] || '#fff' }}
          >
            {wordText}
          </span>
        </div>

        {/* Color Choice Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">
            Choose the INK COLOR:
          </span>
          <div className="grid grid-cols-5 gap-2">
            {COLOR_NAMES.map((c) => (
              <button
                key={c}
                onClick={() => handleAnswer(c)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-400 font-bold text-xs transition cursor-pointer shadow-sm active:scale-95 text-slate-800 dark:text-slate-200 flex flex-col items-center gap-1.5"
              >
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: COLOR_HEX[c] }} />
                <span>{c}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  );
};
