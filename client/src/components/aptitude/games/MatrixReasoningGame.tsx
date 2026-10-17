import React, { useState } from 'react';
import { GameShell, GamePhase } from '../GameShell';
import { GameMetadata, GameResult } from '../../../types/aptitude';
import { Layers, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

const METADATA: GameMetadata = {
  id: 'matrix_reasoning',
  name: 'Pattern Recognition & Matrix Reasoning',
  skill: 'Abstract Reasoning & Inductive Logic',
  skillCategory: 'Logic',
  duration: '4 mins',
  difficulty: 'Challenging',
  description: 'Identify the underlying visual progression rules across rows and columns to select the missing shape in the 3x3 matrix.',
  mncReference: 'SHL / Cubiks / Raven style',
  skillsEvaluated: ['Inductive Logic', 'Visual Transformation', 'Pattern Inference', 'Rule Extrapolation'],
  iconName: 'Matrix'
};

interface MatrixItem {
  id: number;
  ruleExplanation: string;
  gridSvg: string[]; // 8 SVGs for cells 1..8
  optionsSvg: string[]; // 4 candidate options
  correctOption: number;
}

const PUZZLES: MatrixItem[] = [
  // Puzzle 1: Dot Count Progression (1 dot, 2 dots, 3 dots; 4, 5, 6; 7, 8, ?)
  {
    id: 1,
    ruleExplanation: 'Each row increments circle count: Row 1 (1, 2, 3), Row 2 (4, 5, 6), Row 3 (7, 8, 9 circles).',
    gridSvg: [
      '<circle cx="20" cy="20" r="6" fill="#6366f1"/>',
      '<circle cx="12" cy="20" r="5" fill="#6366f1"/><circle cx="28" cy="20" r="5" fill="#6366f1"/>',
      '<circle cx="8" cy="20" r="4" fill="#6366f1"/><circle cx="20" cy="20" r="4" fill="#6366f1"/><circle cx="32" cy="20" r="4" fill="#6366f1"/>',
      '<circle cx="10" cy="12" r="4" fill="#8b5cf6"/><circle cx="30" cy="12" r="4" fill="#8b5cf6"/><circle cx="10" cy="28" r="4" fill="#8b5cf6"/><circle cx="30" cy="28" r="4" fill="#8b5cf6"/>',
      '<circle cx="10" cy="10" r="3" fill="#8b5cf6"/><circle cx="30" cy="10" r="3" fill="#8b5cf6"/><circle cx="20" cy="20" r="4" fill="#8b5cf6"/><circle cx="10" cy="30" r="3" fill="#8b5cf6"/><circle cx="30" cy="30" r="3" fill="#8b5cf6"/>',
      '<circle cx="10" cy="10" r="3" fill="#8b5cf6"/><circle cx="20" cy="10" r="3" fill="#8b5cf6"/><circle cx="30" cy="10" r="3" fill="#8b5cf6"/><circle cx="10" cy="30" r="3" fill="#8b5cf6"/><circle cx="20" cy="30" r="3" fill="#8b5cf6"/><circle cx="30" cy="30" r="3" fill="#8b5cf6"/>',
      '<rect x="10" y="10" width="20" height="20" fill="none" stroke="#ec4899" stroke-width="2"/>',
      '<rect x="8" y="8" width="24" height="24" fill="none" stroke="#ec4899" stroke-width="3"/>'
    ],
    optionsSvg: [
      '<rect x="6" y="6" width="28" height="28" fill="none" stroke="#ec4899" stroke-width="4"/>', // Option A (Correct - 3rd progression)
      '<circle cx="20" cy="20" r="14" fill="#ec4899"/>',
      '<polygon points="20,6 34,34 6,34" fill="#ec4899"/>',
      '<line x1="6" y1="20" x2="34" y2="20" stroke="#ec4899" stroke-width="4"/>'
    ],
    correctOption: 0
  },
  // Puzzle 2: Rotation of Pointer (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°, 360°/0°)
  {
    id: 2,
    ruleExplanation: 'The pointer line rotates 45° clockwise across each consecutive cell.',
    gridSvg: [
      '<line x1="20" y1="20" x2="20" y2="6" stroke="#10b981" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#10b981"/>',
      '<line x1="20" y1="20" x2="30" y2="10" stroke="#10b981" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#10b981"/>',
      '<line x1="20" y1="20" x2="34" y2="20" stroke="#10b981" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#10b981"/>',
      '<line x1="20" y1="20" x2="30" y2="30" stroke="#06b6d4" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#06b6d4"/>',
      '<line x1="20" y1="20" x2="20" y2="34" stroke="#06b6d4" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#06b6d4"/>',
      '<line x1="20" y1="20" x2="10" y2="30" stroke="#06b6d4" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#06b6d4"/>',
      '<line x1="20" y1="20" x2="6" y2="20" stroke="#3b82f6" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#3b82f6"/>',
      '<line x1="20" y1="20" x2="10" y2="10" stroke="#3b82f6" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#3b82f6"/>'
    ],
    optionsSvg: [
      '<line x1="20" y1="20" x2="20" y2="34" stroke="#3b82f6" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#3b82f6"/>',
      '<line x1="20" y1="20" x2="20" y2="6" stroke="#3b82f6" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#3b82f6"/>', // Option B (Correct - points up at 0°)
      '<line x1="20" y1="20" x2="6" y2="20" stroke="#3b82f6" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="#3b82f6"/>',
      '<circle cx="20" cy="20" r="10" fill="none" stroke="#3b82f6" stroke-width="3"/>'
    ],
    correctOption: 1
  },
  // Puzzle 3: Polygon Sides (Triangle 3, Square 4, Pentagon 5; Hexagon 6, Heptagon 7, Octagon 8)
  {
    id: 3,
    ruleExplanation: 'Number of vertices in the polygon increases by +1 along each cell.',
    gridSvg: [
      '<polygon points="20,8 32,32 8,32" fill="none" stroke="#f59e0b" stroke-width="2"/>', // 3
      '<rect x="8" y="8" width="24" height="24" fill="none" stroke="#f59e0b" stroke-width="2"/>', // 4
      '<polygon points="20,6 33,16 28,32 12,32 7,16" fill="none" stroke="#f59e0b" stroke-width="2"/>', // 5
      '<polygon points="20,6 31,12 31,26 20,32 9,26 9,12" fill="none" stroke="#10b981" stroke-width="2"/>', // 6
      '<polygon points="20,5 31,10 33,23 25,33 15,33 7,23 9,10" fill="none" stroke="#10b981" stroke-width="2"/>', // 7
      '<polygon points="14,6 26,6 34,14 34,26 26,34 14,34 6,26 6,14" fill="none" stroke="#10b981" stroke-width="2"/>', // 8
      '<circle cx="20" cy="20" r="14" fill="none" stroke="#6366f1" stroke-width="2"/>', // Circle
      '<circle cx="20" cy="20" r="14" fill="#6366f1" opacity="0.4"/>' // Shaded Circle
    ],
    optionsSvg: [
      '<circle cx="20" cy="20" r="14" fill="#6366f1"/>', // Option A (Correct - Solid Circle)
      '<rect x="10" y="10" width="20" height="20" fill="#6366f1"/>',
      '<polygon points="20,8 32,32 8,32" fill="#6366f1"/>',
      '<line x1="8" y1="8" x2="32" y2="32" stroke="#6366f1" stroke-width="3"/>'
    ],
    correctOption: 0
  }
];

interface Props {
  onComplete?: (result: GameResult) => void;
  onExit?: () => void;
}

export const MatrixReasoningGame: React.FC<Props> = ({ onComplete, onExit }) => {
  const [phase, setPhase] = useState<GamePhase>('INSTRUCTIONS');
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const currentPuzzle = PUZZLES[puzzleIndex % PUZZLES.length];
  const TOTAL_ROUNDS = phase === 'PRACTICE' ? 1 : 3;

  const handleSelectOption = (optIdx: number) => {
    setSelectedOption(optIdx);

    const isCorrect = optIdx === currentPuzzle.correctOption;
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
        setSelectedOption(null);
      }
    }, 800);
  };

  const finishGame = (totalCorrect: number) => {
    const accuracy = Math.round((totalCorrect / TOTAL_ROUNDS) * 100);
    const score = totalCorrect * 350;
    const res: GameResult = {
      gameId: METADATA.id,
      gameName: METADATA.name,
      score,
      accuracyPct: accuracy,
      reactionTimeMs: 1400,
      roundsCompleted: TOTAL_ROUNDS,
      percentile: Math.min(99, 70 + totalCorrect * 9),
      skills: {
        memory: 70,
        speed: 75,
        logic: Math.min(98, 65 + totalCorrect * 11),
        focus: 85,
        risk: 60,
        spatial: Math.min(96, 60 + totalCorrect * 12)
      },
      tips: [
        'Examine rows first (horizontal transformation), then cross-verify columns (vertical addition/subtraction of elements).',
        'Identify invariant attributes (shape, color, line thickness) before analyzing positional shifts.'
      ],
      roleMatches: ['Systems Architect', 'Algorithm Engineer', 'Strategy Consultant']
    };
    setGameResult(res);
    setPhase('RESULT');
    if (onComplete) onComplete(res);
  };

  const resetGame = () => {
    setPuzzleIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
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
        <div className="flex items-center justify-center gap-4 py-3">
          <div className="grid grid-cols-3 gap-1.5 w-24 h-24 p-1.5 bg-slate-900 rounded-xl border border-slate-700">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="bg-slate-800 rounded flex items-center justify-center text-[10px] text-purple-400">
                ●
              </div>
            ))}
            <div className="bg-purple-600 rounded flex items-center justify-center text-xs font-bold text-white">
              ?
            </div>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>1. Observe the 3x3 pattern rule across rows & columns.</p>
            <p>2. Find which candidate shape belongs in the bottom-right <strong>'?'</strong> cell.</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-center max-w-lg mx-auto py-2">
        {/* HUD */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Matrix Puzzle</span>
            <strong className="text-slate-900 dark:text-white font-bold">{puzzleIndex + 1} of {TOTAL_ROUNDS}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Correct</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{correctCount}</strong>
          </div>
        </div>

        {/* 3x3 Matrix Display */}
        <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner max-w-xs mx-auto">
          <div className="grid grid-cols-3 gap-2.5">
            {currentPuzzle.gridSvg.map((svg, idx) => (
              <div
                key={idx}
                className="w-20 h-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 shadow-sm"
              >
                <svg viewBox="0 0 40 40" className="w-full h-full" dangerouslySetInnerHTML={{ __html: svg }} />
              </div>
            ))}
            {/* 9th Cell: Missing Pattern '?' */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl border-2 border-dashed border-white/60 flex items-center justify-center text-white text-2xl font-black font-mono shadow-md animate-pulse">
              ?
            </div>
          </div>
        </div>

        {/* 4 Candidate Options */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Select the shape that logically completes the matrix:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentPuzzle.optionsSvg.map((optSvg, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => selectedOption === null && handleSelectOption(idx)}
                  disabled={selectedOption !== null}
                  className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 ring-4 ring-purple-400/40 shadow-lg scale-95'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 mb-1">{String.fromCharCode(65 + idx)}</span>
                  <div className="w-14 h-14 flex items-center justify-center">
                    <svg viewBox="0 0 40 40" className="w-full h-full" dangerouslySetInnerHTML={{ __html: optSvg }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GameShell>
  );
};
