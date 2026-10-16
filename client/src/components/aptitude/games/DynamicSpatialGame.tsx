import React, { useState } from 'react';
import { Compass, RotateCw, CheckCircle2 } from 'lucide-react';

interface Props {
  onComplete?: (metrics: any) => void;
  isBatteryMode?: boolean;
}

export const DynamicSpatialGame: React.FC<Props> = ({ onComplete, isBatteryMode }) => {
  const [trial, setTrial] = useState<number>(1);
  const [targetAngle, setTargetAngle] = useState<number>(90);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const TOTAL_TRIALS = 5;

  const angles = [0, 90, 180, 270];

  const handleSelectAngle = (selected: number) => {
    const isCorrect = selected === targetAngle;
    if (isCorrect) setScore((prev) => prev + 1);

    if (trial >= TOTAL_TRIALS) {
      setIsFinished(true);
      const metrics = {
        accuracy: Math.round(((isCorrect ? score + 1 : score) / TOTAL_TRIALS) * 100),
        total_trials: TOTAL_TRIALS
      };
      if (onComplete) onComplete(metrics);
    } else {
      setTrial((prev) => prev + 1);
      const nextAngle = angles[Math.floor(Math.random() * angles.length)];
      setTargetAngle(nextAngle);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300">
              Cognitive Game 4 of 9
            </span>
            <span className="text-xs font-semibold text-slate-400">Trial {trial} of {TOTAL_TRIALS}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Dynamic Spatial Mental Rotation</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mentally rotate the 3D projection polygon to identify its exact angular orientation.
          </p>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          <div className="h-56 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
            <div
              className="w-24 h-24 border-4 border-cyan-500 bg-cyan-500/20 rounded-xl flex items-center justify-center transition-transform duration-500 shadow-2xl"
              style={{ transform: `rotate(${targetAngle}deg)` }}
            >
              <div className="w-6 h-6 bg-cyan-400 rounded-sm transform translate-x-4 -translate-y-4"></div>
            </div>
            <div className="absolute bottom-3 text-xs text-slate-400 font-mono">
              Target Orientation: ?° Clockwise Shift
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {angles.map((ang) => (
              <button
                key={ang}
                onClick={() => handleSelectAngle(ang)}
                className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-4 h-4 text-cyan-500" />
                <span>{ang}°</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-center space-y-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Spatial Mental Rotation Assessment Complete</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Rotational Accuracy: <strong className="text-cyan-600 font-mono text-base">{Math.round((score / TOTAL_TRIALS) * 100)}%</strong>
          </p>
          {!isBatteryMode && (
            <button
              onClick={() => {
                setTrial(1);
                setScore(0);
                setIsFinished(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition shadow-md"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
