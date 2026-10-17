import React, { useState, useEffect, useRef } from 'react';
import { GameShell, GamePhase } from '../GameShell';
import { GameMetadata, GameResult } from '../../../types/aptitude';
import { Hash, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';

const METADATA: GameMetadata = {
  id: 'number_logic',
  name: 'Numerical Agility Under Time Pressure',
  skill: 'Numerical Velocity & Pattern Deductions',
  skillCategory: 'Speed',
  duration: '2 mins',
  difficulty: 'Fast-Paced',
  description: 'Rapidly identify the missing number in rapid numeric sequences before the countdown expires.',
  mncReference: 'Cut-e / Revelian / Cubiks style',
  skillsEvaluated: ['Mental Arithmetic Velocity', 'Sequence Pattern Recognition', 'Time Pressure Resilience'],
  iconName: 'NumberLogic'
};

interface NumberPuzzle {
  sequence: string[];
  options: string[];
  correctAnswer: string;
  rule: string;
}

const NUMBER_PUZZLES: NumberPuzzle[] = [
  {
    sequence: ['2', '4', '8', '16', '?'],
    options: ['24', '30', '32', '36'],
    correctAnswer: '32',
    rule: 'Multiplication by 2'
  },
  {
    sequence: ['3', '7', '15', '31', '?'],
    options: ['45', '55', '63', '65'],
    correctAnswer: '63',
    rule: 'Double plus 1 (2n + 1)'
  },
  {
    sequence: ['1', '4', '9', '16', '25', '?'],
    options: ['34', '36', '40', '49'],
    correctAnswer: '36',
    rule: 'Consecutive squares (n²)'
  },
  {
    sequence: ['80', '40', '20', '10', '?'],
    options: ['2', '4', '5', '8'],
    correctAnswer: '5',
    rule: 'Halving sequence (/ 2)'
  },
  {
    sequence: ['2', '3', '5', '8', '13', '?'],
    options: ['18', '20', '21', '24'],
    correctAnswer: '21',
    rule: 'Fibonacci summation (sum of previous two)'
  },
  {
    sequence: ['11', '13', '17', '19', '23', '?'],
    options: ['27', '29', '31', '33'],
    correctAnswer: '29',
    rule: 'Consecutive prime numbers'
  }
];

interface Props {
  onComplete?: (result: GameResult) => void;
  onExit?: () => void;
}

export const NumberLogicGame: React.FC<Props> = ({ onComplete, onExit }) => {
  const [phase, setPhase] = useState<GamePhase>('INSTRUCTIONS');
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(6.0); // 6s per puzzle
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const puzzleStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);

  const TOTAL_ROUNDS = phase === 'PRACTICE' ? 2 : NUMBER_PUZZLES.length;
  const currentPuzzle = NUMBER_PUZZLES[puzzleIndex % NUMBER_PUZZLES.length];

  useEffect(() => {
    if (phase !== 'PRACTICE' && phase !== 'PLAYING') return;

    setTimeLeft(6.0);
    puzzleStartTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          handleSelectOption(''); // Timed out
          return 6.0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(timerIntervalRef.current);
  }, [phase, puzzleIndex]);

  const handleSelectOption = (opt: string) => {
    clearInterval(timerIntervalRef.current);
    setSelectedAnswer(opt);

    const latency = Date.now() - puzzleStartTimeRef.current;
    setReactionTimes((prev) => [...prev, latency]);

    const isCorrect = opt === currentPuzzle.correctAnswer;
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    setTimeout(() => {
      if (puzzleIndex >= TOTAL_ROUNDS - 1) {
        if (phase === 'PRACTICE') {
          setPhase('PLAYING');
          resetGame();
        } else {
          finishGame(isCorrect ? correctCount + 1 : correctCount);
        }
      } else {
        setPuzzleIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      }
    }, 700);
  };

  const finishGame = (totalCorrect: number) => {
    clearInterval(timerIntervalRef.current);

    const avgRT = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 3000;

    const accuracy = Math.round((totalCorrect / TOTAL_ROUNDS) * 100);
    const score = totalCorrect * 300;

    const res: GameResult = {
      gameId: METADATA.id,
      gameName: METADATA.name,
      score,
      accuracyPct: accuracy,
      reactionTimeMs: avgRT,
      roundsCompleted: TOTAL_ROUNDS,
      percentile: Math.min(99, 68 + totalCorrect * 5),
      skills: {
        memory: 70,
        speed: Math.min(97, Math.max(45, Math.round((6000 - avgRT) / 60))),
        logic: Math.min(98, 60 + totalCorrect * 6),
        focus: 85,
        risk: 55,
        spatial: 60
      },
      tips: [
        `Solved ${totalCorrect} of ${TOTAL_ROUNDS} under 6s sprint timer with average response latency of ${(avgRT / 1000).toFixed(1)}s.`,
        'Check first-order differences immediately; if differences are constant or doubling, that identifies 80% of series.'
      ],
      roleMatches: ['Quantitative Developer', 'Backend Systems', 'Algorithmic Trader']
    };

    setGameResult(res);
    setPhase('RESULT');
    if (onComplete) onComplete(res);
  };

  const resetGame = () => {
    clearInterval(timerIntervalRef.current);
    setPuzzleIndex(0);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setReactionTimes([]);
    setTimeLeft(6.0);
  };

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
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-sm font-bold text-indigo-400">
            2, 4, 8, 16, ?
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>1. Observe the mathematical series (doubling each step).</p>
            <p>2. Choose <strong>32</strong> before the shrinking timer runs out!</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-center max-w-lg mx-auto py-2">
        {/* HUD */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Round</span>
            <strong className="text-slate-900 dark:text-white font-bold">{puzzleIndex + 1} of {TOTAL_ROUNDS}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Timer</span>
            <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{timeLeft.toFixed(1)}s</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Score</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{correctCount * 300}</strong>
          </div>
        </div>

        {/* Shrinking Timer */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-100"
            style={{ width: `${(timeLeft / 6.0) * 100}%` }}
          />
        </div>

        {/* Sequence Display */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 font-mono shadow-inner">
          {currentPuzzle.sequence.map((term, i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${
                term === '?'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 animate-pulse'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm'
              }`}
            >
              {term}
            </div>
          ))}
        </div>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentPuzzle.options.map((opt) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === currentPuzzle.correctAnswer;

            let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400';
            if (selectedAnswer !== null) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400';
              } else if (isSelected) {
                btnStyle = 'bg-rose-600 text-white border-rose-600';
              }
            }

            return (
              <button
                key={opt}
                onClick={() => selectedAnswer === null && handleSelectOption(opt)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded-2xl border text-center font-mono font-bold text-base transition-all cursor-pointer active:scale-95 shadow-sm ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
};
