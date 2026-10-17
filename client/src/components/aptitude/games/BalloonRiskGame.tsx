import React, { useState, useEffect } from 'react';
import { GameShell, GamePhase } from '../GameShell';
import { GameMetadata, GameResult } from '../../../types/aptitude';
import { Zap, Flame, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

const METADATA: GameMetadata = {
  id: 'balloon_risk',
  name: 'Balloon Risk Assessment',
  skill: 'Risk-Taking & Strategic Decision Making',
  skillCategory: 'Risk',
  duration: '3 mins',
  difficulty: 'Medium',
  description: 'Pump the balloon to earn cash points. Cash out anytime to lock in your earnings, or risk another pump for higher return before it pops!',
  mncReference: 'pymetrics / Arctic Shores style',
  skillsEvaluated: ['Risk Appetite', 'Loss Aversion', 'Impulse Regulation', 'Calculated Bet Sizing'],
  iconName: 'Balloon'
};

interface Props {
  onComplete?: (result: GameResult) => void;
  onExit?: () => void;
  isBatteryMode?: boolean;
}

export const BalloonRiskGame: React.FC<Props> = ({ onComplete, onExit, isBatteryMode }) => {
  const [phase, setPhase] = useState<GamePhase>('INSTRUCTIONS');
  const [round, setRound] = useState<number>(1);
  const [potentialPoints, setPotentialPoints] = useState<number>(100);
  const [bankedPoints, setBankedPoints] = useState<number>(0);
  const [pumpsCount, setPumpsCount] = useState<number>(0);
  const [poppedCount, setPoppedCount] = useState<number>(0);
  const [balloonScale, setBalloonScale] = useState<number>(1.0);
  const [isPopped, setIsPopped] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const TOTAL_ROUNDS = phase === 'PRACTICE' ? 1 : 5;

  const handlePump = () => {
    if (isPopped) return;

    const newPumps = pumpsCount + 1;
    // Burst probability rises with pumps (max threshold ~ 9 pumps)
    const burstProbability = Math.min(0.85, 0.05 + newPumps * 0.11);
    const popped = Math.random() < burstProbability;

    if (popped) {
      setIsPopped(true);
      setIsShaking(true);
      setPoppedCount((prev) => prev + 1);
      setBalloonScale(0.3);

      setTimeout(() => {
        setIsShaking(false);
        advanceRound(false);
      }, 1200);
    } else {
      setPumpsCount(newPumps);
      setPotentialPoints((prev) => prev + 150 + newPumps * 50);
      setBalloonScale((prev) => Math.min(2.8, prev + 0.18));
    }
  };

  const handleCashOut = () => {
    if (isPopped) return;
    const newBanked = bankedPoints + potentialPoints;
    setBankedPoints(newBanked);
    advanceRound(true);
  };

  const advanceRound = (wasBanked: boolean) => {
    if (round >= TOTAL_ROUNDS) {
      // Completed game or practice
      if (phase === 'PRACTICE') {
        setTimeout(() => setPhase('PLAYING'), 600);
        resetGameState();
      } else {
        const finalBanked = wasBanked ? bankedPoints + potentialPoints : bankedPoints;
        const accuracy = Math.round(((TOTAL_ROUNDS - poppedCount - (wasBanked ? 0 : 1)) / TOTAL_ROUNDS) * 100);
        const res: GameResult = {
          gameId: METADATA.id,
          gameName: METADATA.name,
          score: finalBanked,
          accuracyPct: Math.max(20, accuracy),
          reactionTimeMs: 420,
          roundsCompleted: TOTAL_ROUNDS,
          percentile: Math.min(98, 70 + Math.round(finalBanked / 120)),
          skills: {
            memory: 65,
            speed: 78,
            logic: 82,
            focus: 80,
            risk: Math.min(95, 50 + pumpsCount * 5),
            spatial: 60
          },
          tips: [
            'Calculated risk-takers typically bank between 4-6 pumps to optimize expected value without excessive loss.',
            'Maintain steady pacing; avoid tilt after a balloon burst.'
          ],
          roleMatches: ['Quantitative Trading', 'Product Strategy', 'Risk Analyst']
        };
        setGameResult(res);
        setPhase('RESULT');
        if (onComplete) onComplete(res);
      }
    } else {
      setRound((prev) => prev + 1);
      setPotentialPoints(100);
      setPumpsCount(0);
      setBalloonScale(1.0);
      setIsPopped(false);
    }
  };

  const resetGameState = () => {
    setRound(1);
    setPotentialPoints(100);
    setBankedPoints(0);
    setPumpsCount(0);
    setPoppedCount(0);
    setBalloonScale(1.0);
    setIsPopped(false);
  };

  return (
    <GameShell
      game={METADATA}
      phase={phase}
      onSetPhase={(p) => {
        setPhase(p);
        resetGameState();
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
        resetGameState();
        setPhase('PLAYING');
      }}
      instructionDemo={
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="w-16 h-20 rounded-full bg-gradient-to-t from-purple-600 to-indigo-500 shadow-lg shadow-purple-500/30 flex items-center justify-center text-white text-xs font-bold font-mono">
            Pump!
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>1. Each pump adds <strong>+₹150 to ₹400</strong> potential points.</p>
            <p>2. Balloon burst chance increases with each pump.</p>
            <p>3. Click <strong>Cash Out / Bank</strong> to secure points safely.</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-center max-w-lg mx-auto py-4">
        {/* Header HUD */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Round</span>
            <strong className="text-slate-900 dark:text-white font-bold">{round} of {TOTAL_ROUNDS}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Potential Pool</span>
            <strong className="text-indigo-600 dark:text-indigo-400 text-sm font-black">₹{potentialPoints}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Banked Safe</span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-black">₹{bankedPoints}</strong>
          </div>
        </div>

        {/* Balloon Canvas / Animation Arena */}
        <div className="h-64 flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-indigo-50/20 to-purple-50/20 dark:from-slate-900/40 dark:to-slate-950/40 rounded-3xl border border-slate-200/60 dark:border-slate-800">
          {!isPopped ? (
            <div
              className={`w-20 h-24 rounded-full bg-gradient-to-t from-purple-600 via-indigo-500 to-pink-500 shadow-2xl flex flex-col items-center justify-center text-white transition-all duration-300 relative select-none ${
                isShaking ? 'animate-bounce' : ''
              }`}
              style={{
                transform: `scale(${balloonScale})`,
                boxShadow: `0 10px 30px rgba(99, 102, 241, ${Math.min(0.8, 0.2 + pumpsCount * 0.08)})`
              }}
            >
              <div className="absolute top-3 left-4 w-4 h-6 rounded-full bg-white/40 blur-[1px]" />
              <span className="text-[11px] font-black font-mono drop-shadow">₹{potentialPoints}</span>
              <span className="text-[8px] font-mono opacity-80">{pumpsCount} Pumps</span>
            </div>
          ) : (
            <div className="space-y-2 animate-fade-in">
              <div className="text-4xl">💥</div>
              <span className="text-xs font-bold text-rose-500 font-mono block">POP! Balloon Bursts!</span>
              <span className="text-[10px] text-slate-400 font-mono">Unbanked round points lost.</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePump}
            disabled={isPopped}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Pump Balloon (+₹150)</span>
          </button>

          <button
            onClick={handleCashOut}
            disabled={isPopped || potentialPoints <= 100}
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cash Out / Bank Money</span>
          </button>
        </div>
      </div>
    </GameShell>
  );
};
