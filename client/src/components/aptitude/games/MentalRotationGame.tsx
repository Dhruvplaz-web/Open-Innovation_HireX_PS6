import React, { useState } from 'react';
import { GameShell, GamePhase } from '../GameShell';
import { GameMetadata, GameResult } from '../../../types/aptitude';
import { Compass, RotateCcw, CheckCircle2 } from 'lucide-react';

const METADATA: GameMetadata = {
  id: 'mental_rotation',
  name: '3D Mental Rotation & Spatial Reasoning',
  skill: 'Spatial Orientation & 3D Visualization',
  skillCategory: 'Spatial',
  duration: '3 mins',
  difficulty: 'Challenging',
  description: 'Mentally rotate complex 3D isometric structures along spatial axes to identify the exact rotated twin.',
  mncReference: 'Shepard-Metzler / Cubiks / Cut-e style',
  skillsEvaluated: ['3D Spatial Projection', 'Mental Axial Rotation', 'Isometric Object Matching', 'Spatial Acuity'],
  iconName: 'Spatial'
};

interface RotationPuzzle {
  id: number;
  targetSvg: string;
  optionsSvg: string[];
  correctOption: number;
  axisDescription: string;
}

const ROTATION_PUZZLES: RotationPuzzle[] = [
  // Puzzle 1: L-Shaped Polycube rotated 90°
  {
    id: 1,
    axisDescription: 'Rotated 90° clockwise along the Z plane',
    targetSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,15 75,30 50,45 25,30" fill="#818cf8" stroke="#4338ca"/>
      <polygon points="25,30 50,45 50,75 25,60" fill="#4f46e5" stroke="#312e81"/>
      <polygon points="50,45 75,30 75,60 50,75" fill="#6366f1" stroke="#3730a3"/>
      <polygon points="75,30 100,45 75,60 50,45" fill="#a5b4fc" stroke="#4338ca"/>
    </svg>`,
    optionsSvg: [
      // Option A (Mirrored reflection - incorrect)
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,15 75,30 50,45 25,30" fill="#a5b4fc" stroke="#4338ca"/>
        <polygon points="50,45 75,30 75,60 50,75" fill="#4f46e5" stroke="#312e81"/>
        <polygon points="25,30 50,45 50,75 25,60" fill="#6366f1" stroke="#3730a3"/>
      </svg>`,
      // Option B (True Rotated 90° - correct)
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" transform="rotate(90 50 50)">
        <polygon points="50,15 75,30 50,45 25,30" fill="#818cf8" stroke="#4338ca"/>
        <polygon points="25,30 50,45 50,75 25,60" fill="#4f46e5" stroke="#312e81"/>
        <polygon points="50,45 75,30 75,60 50,75" fill="#6366f1" stroke="#3730a3"/>
        <polygon points="75,30 100,45 75,60 50,45" fill="#a5b4fc" stroke="#4338ca"/>
      </svg>`,
      // Option C (Altered cube count - incorrect)
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,25 75,40 50,55 25,40" fill="#818cf8" stroke="#4338ca"/>
        <polygon points="25,40 50,55 50,85 25,70" fill="#4f46e5" stroke="#312e81"/>
      </svg>`
    ],
    correctOption: 1
  },
  // Puzzle 2: T-Shaped Polycube rotated 180°
  {
    id: 2,
    axisDescription: 'Rotated 180° in planar projection',
    targetSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,10 70,22 50,34 30,22" fill="#34d399" stroke="#059669"/>
      <polygon points="30,22 50,34 50,64 30,52" fill="#059669" stroke="#047857"/>
      <polygon points="50,34 70,22 70,52 50,64" fill="#10b981" stroke="#047857"/>
      <polygon points="10,22 30,10 50,22 30,34" fill="#6ee7b7" stroke="#059669"/>
    </svg>`,
    optionsSvg: [
      // Option A (True 180° rotated - correct)
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" transform="rotate(180 50 50)">
        <polygon points="50,10 70,22 50,34 30,22" fill="#34d399" stroke="#059669"/>
        <polygon points="30,22 50,34 50,64 30,52" fill="#059669" stroke="#047857"/>
        <polygon points="50,34 70,22 70,52 50,64" fill="#10b981" stroke="#047857"/>
        <polygon points="10,22 30,10 50,22 30,34" fill="#6ee7b7" stroke="#059669"/>
      </svg>`,
      // Option B (Missing side branch - incorrect)
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" transform="rotate(90 50 50)">
        <polygon points="50,10 70,22 50,34 30,22" fill="#34d399" stroke="#059669"/>
        <polygon points="30,22 50,34 50,64 30,52" fill="#059669" stroke="#047857"/>
      </svg>`,
      // Option C (Inverted color blocks - incorrect)
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 70,22 50,34 30,22" fill="#f87171" stroke="#b91c1c"/>
      </svg>`
    ],
    correctOption: 0
  },
  // Puzzle 3: Stepped Isometric Block
  {
    id: 3,
    axisDescription: 'Rotated 270° counter-clockwise',
    targetSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,20 70,32 50,44 30,32" fill="#f59e0b" stroke="#d97706"/>
      <polygon points="30,32 50,44 50,74 30,62" fill="#d97706" stroke="#b45309"/>
      <polygon points="50,44 70,32 70,62 50,74" fill="#fbbf24" stroke="#d97706"/>
      <polygon points="70,32 90,44 70,56 50,44" fill="#fde68a" stroke="#d97706"/>
    </svg>`,
    optionsSvg: [
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,20 70,32 50,44 30,32" fill="#ef4444" stroke="#b91c1c"/>
      </svg>`,
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" transform="rotate(270 50 50)">
        <polygon points="50,20 70,32 50,44 30,32" fill="#f59e0b" stroke="#d97706"/>
        <polygon points="30,32 50,44 50,74 30,62" fill="#d97706" stroke="#b45309"/>
        <polygon points="50,44 70,32 70,62 50,74" fill="#fbbf24" stroke="#d97706"/>
        <polygon points="70,32 90,44 70,56 50,44" fill="#fde68a" stroke="#d97706"/>
      </svg>`,
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" transform="rotate(90 50 50)">
        <polygon points="50,20 70,32 50,44 30,32" fill="#f59e0b" stroke="#d97706"/>
        <polygon points="30,32 50,44 50,74 30,62" fill="#d97706" stroke="#b45309"/>
      </svg>`
    ],
    correctOption: 1
  }
];

interface Props {
  onComplete?: (result: GameResult) => void;
  onExit?: () => void;
}

export const MentalRotationGame: React.FC<Props> = ({ onComplete, onExit }) => {
  const [phase, setPhase] = useState<GamePhase>('INSTRUCTIONS');
  const [puzzleIndex, setPuzzleIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const currentPuzzle = ROTATION_PUZZLES[puzzleIndex % ROTATION_PUZZLES.length];
  const TOTAL_ROUNDS = phase === 'PRACTICE' ? 1 : ROTATION_PUZZLES.length;

  const handleSelect = (idx: number) => {
    setSelectedOption(idx);
    const isCorrect = idx === currentPuzzle.correctOption;
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
    }, 700);
  };

  const finishGame = (totalCorrect: number) => {
    const accuracy = Math.round((totalCorrect / TOTAL_ROUNDS) * 100);
    const score = totalCorrect * 350;

    const res: GameResult = {
      gameId: METADATA.id,
      gameName: METADATA.name,
      score,
      accuracyPct: accuracy,
      reactionTimeMs: 1600,
      roundsCompleted: TOTAL_ROUNDS,
      percentile: Math.min(99, 72 + totalCorrect * 8),
      skills: {
        memory: 68,
        speed: 74,
        logic: 80,
        focus: 86,
        risk: 50,
        spatial: Math.min(99, 65 + totalCorrect * 11)
      },
      tips: [
        `Achieved ${accuracy}% spatial accuracy on complex 3D isometric polycube rotations.`,
        'Mental rotation trick: Fixate on a distinctive asymmetrical "corner" block and mentally track its path along the rotation axis.'
      ],
      roleMatches: ['Computer Graphics / Vision', 'Robotics Software', 'Simulation Engineer']
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
          <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-xl p-2 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,15 75,30 50,45 25,30" fill="#818cf8"/>
              <polygon points="25,30 50,45 50,75 25,60" fill="#4f46e5"/>
              <polygon points="50,45 75,30 75,60 50,75" fill="#6366f1"/>
            </svg>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>1. Analyze the reference 3D block figure.</p>
            <p>2. Select which option is the <strong>exact same figure rotated</strong> in 3D space.</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-center max-w-lg mx-auto py-2">
        {/* HUD */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Puzzle</span>
            <strong className="text-slate-900 dark:text-white font-bold">{puzzleIndex + 1} of {TOTAL_ROUNDS}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Correct</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{correctCount}</strong>
          </div>
        </div>

        {/* Target 3D Shape Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xs mx-auto shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold block mb-2">
            REFERENCE 3D FIGURE
          </span>
          <div className="w-32 h-32 mx-auto flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-md"
              dangerouslySetInnerHTML={{ __html: currentPuzzle.targetSvg }}
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">
            Which figure is an exact spatial rotation of the reference?
          </span>
          <div className="grid grid-cols-3 gap-3">
            {currentPuzzle.optionsSvg.map((optSvg, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => selectedOption === null && handleSelect(idx)}
                  disabled={selectedOption !== null}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 ring-4 ring-purple-400/40 shadow-lg scale-95'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                  }`}
                >
                  <span className="text-[10px] font-mono text-slate-400 mb-2">{String.fromCharCode(65 + idx)}</span>
                  <div className="w-20 h-20 flex items-center justify-center">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: optSvg }}
                    />
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
