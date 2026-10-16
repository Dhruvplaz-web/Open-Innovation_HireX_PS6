import React, { useState } from 'react';
import { Layers, RotateCcw, CheckCircle } from 'lucide-react';

interface Props {
  onComplete?: (metrics: any) => void;
  isBatteryMode?: boolean;
}

export const PlanningStrategyGame: React.FC<Props> = ({ onComplete, isBatteryMode }) => {
  const [pegs, setPegs] = useState<{ [peg: string]: number[] }>({
    A: [3, 2, 1], // Bottom to top
    B: [],
    C: []
  });

  const [selectedPeg, setSelectedPeg] = useState<string | null>(null);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const OPTIMAL_MOVES = 7; // 2^3 - 1 = 7

  const handlePegClick = (pegKey: string) => {
    if (isFinished) return;

    if (selectedPeg === null) {
      if (pegs[pegKey].length > 0) {
        setSelectedPeg(pegKey);
      }
    } else {
      if (selectedPeg === pegKey) {
        setSelectedPeg(null);
        return;
      }

      const sourceDisks = [...pegs[selectedPeg]];
      const targetDisks = [...pegs[pegKey]];
      const movingDisk = sourceDisks[sourceDisks.length - 1];
      const topTargetDisk = targetDisks.length > 0 ? targetDisks[targetDisks.length - 1] : Infinity;

      // Rule Check: Larger disk cannot sit on smaller disk
      if (movingDisk < topTargetDisk) {
        sourceDisks.pop();
        targetDisks.push(movingDisk);

        const newPegs = { ...pegs, [selectedPeg]: sourceDisks, [pegKey]: targetDisks };
        setPegs(newPegs);
        const newMoves = movesCount + 1;
        setMovesCount(newMoves);
        setSelectedPeg(null);

        // Win Condition: All 3 disks on Peg C
        if (newPegs.C.length === 3) {
          setIsFinished(true);
          const extraMoves = Math.max(0, newMoves - OPTIMAL_MOVES);
          const metrics = {
            extra_moves: extraMoves,
            total_moves: newMoves,
            optimal_moves: OPTIMAL_MOVES
          };
          if (onComplete) onComplete(metrics);
        }
      } else {
        setSelectedPeg(null); // Invalid move
      }
    }
  };

  const restartHanoi = () => {
    setPegs({ A: [3, 2, 1], B: [], C: [] });
    setSelectedPeg(null);
    setMovesCount(0);
    setIsFinished(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
              Cognitive Game 5 of 9
            </span>
            <span className="text-xs font-semibold text-slate-400">Moves: {movesCount} (Optimal: 7)</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Strategic Planning & Tower Optimization</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Move all disks from Peg A to Peg C. A larger disk cannot sit on top of a smaller disk.
          </p>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          <div className="h-60 rounded-2xl bg-slate-950 border border-slate-800 flex items-end justify-around p-6 relative">
            {['A', 'B', 'C'].map((pegKey) => (
              <div
                key={pegKey}
                onClick={() => handlePegClick(pegKey)}
                className={`w-28 flex flex-col items-center justify-end relative cursor-pointer group ${
                  selectedPeg === pegKey ? 'ring-2 ring-emerald-500 rounded-xl bg-slate-900/60' : ''
                }`}
              >
                {/* Vertical Pole */}
                <div className="w-2.5 h-36 bg-slate-700 rounded-t-full absolute bottom-0 z-0 group-hover:bg-emerald-600 transition-colors"></div>

                {/* Disks */}
                <div className="z-10 flex flex-col-reverse gap-1.5 items-center pb-2 w-full">
                  {pegs[pegKey].map((diskSize) => (
                    <div
                      key={diskSize}
                      className={`h-7 rounded-lg shadow-md font-bold text-xs text-white flex items-center justify-center transition-all ${
                        diskSize === 3 ? 'w-24 bg-indigo-600' : diskSize === 2 ? 'w-18 bg-purple-500' : 'w-12 bg-pink-500'
                      }`}
                    >
                      {diskSize}
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-xs font-mono font-bold text-slate-400">Peg {pegKey}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Tower Planning Challenge Complete</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Moves Used: <strong className="text-emerald-600 font-mono text-base">{movesCount}</strong> (Optimal: {OPTIMAL_MOVES})
          </p>
          {!isBatteryMode && (
            <button
              onClick={restartHanoi}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow-md"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
