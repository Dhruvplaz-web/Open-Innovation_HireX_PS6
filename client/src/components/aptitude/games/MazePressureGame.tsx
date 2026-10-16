import React, { useState, useEffect } from 'react';
import { Compass, Eye, ShieldAlert, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  onComplete?: (metrics: any) => void;
  isBatteryMode?: boolean;
}

export const MazePressureGame: React.FC<Props> = ({ onComplete, isBatteryMode }) => {
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [goalPos] = useState<{ r: number; c: number }>({ r: 3, c: 3 });
  const [isMemorizePhase, setIsMemorizePhase] = useState<boolean>(true);
  const [memorizeTimer, setMemorizeTimer] = useState<number>(3);
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // 4x4 Grid Obstacles (1 = wall, 0 = path)
  const grid = [
    [0, 0, 1, 0],
    [1, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ];

  useEffect(() => {
    if (!isMemorizePhase) return;
    const interval = setInterval(() => {
      setMemorizeTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsMemorizePhase(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isMemorizePhase]);

  const movePlayer = (dr: number, dc: number) => {
    if (isMemorizePhase || isFinished) return;

    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;

    if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
      if (grid[nr][nc] === 1) {
        setErrorsCount((prev) => prev + 1);
      } else {
        setPlayerPos({ r: nr, c: nc });
        if (nr === goalPos.r && nc === goalPos.c) {
          setIsFinished(true);
          const metrics = { errors: errorsCount };
          if (onComplete) onComplete(metrics);
        }
      }
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300">
              Cognitive Game 9 of 9
            </span>
            <span className="text-xs font-semibold text-slate-400">Navigation Errors: {errorsCount}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Spatial Memory & Pressure Maze</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Memorize the map before the fog of war descends, then navigate safely to the green goal!
          </p>
        </div>

        {isMemorizePhase && (
          <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold animate-pulse">
            Memorize Map: {memorizeTimer}s
          </div>
        )}
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-xs mx-auto">
            {grid.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isPlayer = playerPos.r === rIdx && playerPos.c === cIdx;
                const isGoal = goalPos.r === rIdx && goalPos.c === cIdx;
                const isWall = cell === 1;

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`h-16 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                      isPlayer
                        ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400'
                        : isGoal
                        ? 'bg-emerald-500 text-white animate-pulse'
                        : isMemorizePhase && isWall
                        ? 'bg-red-900/60 border border-red-700 text-red-300'
                        : 'bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {isPlayer ? '🏃' : isGoal ? '🏁' : isMemorizePhase && isWall ? '🧱' : ''}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => movePlayer(-1, 0)}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-md cursor-pointer"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => movePlayer(0, -1)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-md cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => movePlayer(1, 0)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-md cursor-pointer"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => movePlayer(0, 1)}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-md cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-center space-y-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Spatial Memory Maze Assessment Complete</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Navigation Accuracy: <strong className="text-orange-600 font-mono text-base">{Math.max(0, 100 - errorsCount * 15)}%</strong> ({errorsCount} Wall Hits)
          </p>
          {!isBatteryMode && (
            <button
              onClick={() => {
                setPlayerPos({ r: 0, c: 0 });
                setErrorsCount(0);
                setIsMemorizePhase(true);
                setMemorizeTimer(3);
                setIsFinished(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-500 transition shadow-md"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
