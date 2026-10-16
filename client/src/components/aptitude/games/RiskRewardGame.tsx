import React, { useState } from 'react';
import { Zap, ShieldCheck, Flame, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  onComplete?: (metrics: any) => void;
  isBatteryMode?: boolean;
}

export const RiskRewardGame: React.FC<Props> = ({ onComplete, isBatteryMode }) => {
  const [round, setRound] = useState<number>(1);
  const [potentialPoints, setPotentialPoints] = useState<number>(10);
  const [bankedPoints, setBankedPoints] = useState<number>(0);
  const [pumpsCount, setPumpsCount] = useState<number>(0);
  const [poppedCount, setPoppedCount] = useState<number>(0);
  const [balloonScale, setBalloonScale] = useState<number>(1.0);
  const [isPopped, setIsPopped] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const TOTAL_ROUNDS = 5;

  const handlePump = () => {
    if (isPopped || isFinished) return;

    // Burst probability rises with pumps (max threshold ~ 8 pumps)
    const newPumps = pumpsCount + 1;
    const burstProbability = 0.08 + (newPumps * 0.12);
    const popped = Math.random() < burstProbability;

    if (popped) {
      setIsPopped(true);
      setPoppedCount((prev) => prev + 1);
      setBalloonScale(0.2);
      const historyItem = { round, banked: 0, pumps: newPumps, status: 'POPPED' };
      setGameHistory((prev) => [...prev, historyItem]);
      setTimeout(() => advanceRound(historyItem), 1200);
    } else {
      setPumpsCount(newPumps);
      setPotentialPoints((prev) => prev + 15 + newPumps * 5);
      setBalloonScale((prev) => Math.min(2.5, prev + 0.18));
    }
  };

  const handleBank = () => {
    if (isPopped || isFinished) return;

    const newBanked = bankedPoints + potentialPoints;
    setBankedPoints(newBanked);
    const historyItem = { round, banked: potentialPoints, pumps: pumpsCount, status: 'BANKED' };
    setGameHistory((prev) => [...prev, historyItem]);
    advanceRound(historyItem);
  };

  const advanceRound = (lastItem: any) => {
    if (round >= TOTAL_ROUNDS) {
      setIsFinished(true);
      const metrics = {
        banked_points: lastItem.status === 'BANKED' ? bankedPoints + lastItem.banked : bankedPoints,
        popped_count: lastItem.status === 'POPPED' ? poppedCount + 1 : poppedCount,
        total_rounds: TOTAL_ROUNDS,
        avg_pumps: Math.round(pumpsCount / TOTAL_ROUNDS)
      };
      if (onComplete) onComplete(metrics);
    } else {
      setRound((prev) => prev + 1);
      setPotentialPoints(10);
      setPumpsCount(0);
      setBalloonScale(1.0);
      setIsPopped(false);
    }
  };

  const restartGame = () => {
    setRound(1);
    setPotentialPoints(10);
    setBankedPoints(0);
    setPumpsCount(0);
    setPoppedCount(0);
    setBalloonScale(1.0);
    setIsPopped(false);
    setGameHistory([]);
    setIsFinished(false);
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
              Cognitive Game 1 of 9
            </span>
            <span className="text-xs font-semibold text-slate-400">Round {round} of {TOTAL_ROUNDS}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Risk-Reward Investment Challenge</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pump the balloon to multiply potential return. Click BANK to secure current round points before it bursts!
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">Banked Points</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{bankedPoints}</div>
        </div>
      </div>

      {/* Main Game Arena */}
      {!isFinished ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Balloon Display */}
          <div className="md:col-span-8 h-64 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-800/80 text-[11px] font-mono font-bold text-indigo-300">
              Round Potential: +{potentialPoints} pts
            </div>

            {/* Balloon Element */}
            <div
              className={`transition-transform duration-300 flex items-center justify-center rounded-full shadow-2xl cursor-pointer ${
                isPopped ? 'bg-red-500/20 text-red-500 border-2 border-dashed border-red-500' : 'bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 text-white'
              }`}
              style={{
                width: `${Math.min(180, 80 * balloonScale)}px`,
                height: `${Math.min(180, 80 * balloonScale)}px`
              }}
              onClick={handlePump}
            >
              {isPopped ? (
                <div className="text-center font-bold text-xs">POP! (Round Lost)</div>
              ) : (
                <div className="text-center font-black text-lg">+{potentialPoints}</div>
              )}
            </div>

            <div className="absolute bottom-3 text-xs text-slate-400 font-medium">
              Pumps in this round: <strong className="text-white font-mono">{pumpsCount}</strong>
            </div>
          </div>

          {/* Controls */}
          <div className="md:col-span-4 space-y-4">
            <button
              onClick={handlePump}
              disabled={isPopped}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Pump Balloon (+Pts)</span>
            </button>

            <button
              onClick={handleBank}
              disabled={isPopped || potentialPoints <= 10}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>BANK Points Now</span>
            </button>
          </div>
        </div>
      ) : (
        /* Finished View */
        <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Risk-Reward Challenge Complete</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Final Banked Score: <strong className="text-indigo-600 font-mono text-base">{bankedPoints} Pts</strong> • Pops: {poppedCount}
            </p>
          </div>
          {!isBatteryMode && (
            <button
              onClick={restartGame}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition shadow-md"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
