import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap } from 'lucide-react';

interface Props {
  onComplete?: (metrics: any) => void;
  isBatteryMode?: boolean;
}

export const InformationProcessingGame: React.FC<Props> = ({ onComplete, isBatteryMode }) => {
  const [targetSymbol, setTargetSymbol] = useState<string>('★');
  const [gridItems, setGridItems] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [clicksCount, setClicksCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());

  const symbolsList = ['★', '☆', '✦', '✧', '✪', '✵', '✶'];
  const TOTAL_TARGETS = 10;

  useEffect(() => {
    generateGrid();
  }, []);

  const generateGrid = () => {
    const target = '★';
    const items: string[] = [];
    const targetIdx = Math.floor(Math.random() * 16);

    for (let i = 0; i < 16; i++) {
      if (i === targetIdx) {
        items.push(target);
      } else {
        const distractor = symbolsList[1 + Math.floor(Math.random() * (symbolsList.length - 1))];
        items.push(distractor);
      }
    }
    setGridItems(items);
  };

  const handleSymbolClick = (sym: string) => {
    if (isFinished) return;

    setClicksCount((prev) => prev + 1);

    if (sym === targetSymbol) {
      const nextScore = score + 1;
      setScore(nextScore);

      if (nextScore >= TOTAL_TARGETS) {
        setIsFinished(true);
        const elapsedSec = (Date.now() - startTimeRef.current) / 1000.0;
        const cps = roundTwo(TOTAL_TARGETS / Math.max(1, elapsedSec));
        const metrics = {
          clicks_per_sec: cps,
          total_targets: TOTAL_TARGETS,
          elapsed_sec: elapsedSec
        };
        if (onComplete) onComplete(metrics);
      } else {
        generateGrid();
      }
    }
  };

  const roundTwo = (num: number) => Math.round(num * 100) / 100;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300">
              Cognitive Game 6 of 9
            </span>
            <span className="text-xs font-semibold text-slate-400">Targets Found: {score} / {TOTAL_TARGETS}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Information Processing & Visual Search</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rapidly locate and click the Target Symbol <strong>★</strong> among distractor symbols!
          </p>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-3 p-6 rounded-2xl bg-slate-950 border border-slate-800">
            {gridItems.map((sym, idx) => (
              <button
                key={idx}
                onClick={() => handleSymbolClick(sym)}
                className="h-16 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-2xl font-bold text-slate-300 hover:text-pink-400 transition flex items-center justify-center cursor-pointer active:scale-90"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-center space-y-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Processing Speed Assessment Complete</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Processing Speed: <strong className="text-pink-600 font-mono text-base">{roundTwo(TOTAL_TARGETS / Math.max(1, (Date.now() - startTimeRef.current) / 1000.0))} Targets/Sec</strong>
          </p>
          {!isBatteryMode && (
            <button
              onClick={() => {
                setScore(0);
                setClicksCount(0);
                setIsFinished(false);
                startTimeRef.current = Date.now();
                generateGrid();
              }}
              className="px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-xs hover:bg-pink-500 transition shadow-md"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
