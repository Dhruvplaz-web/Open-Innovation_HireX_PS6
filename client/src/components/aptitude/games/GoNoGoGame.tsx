import React, { useState, useEffect, useRef } from 'react';
import { GameShell, GamePhase } from '../GameShell';
import { GameMetadata, GameResult } from '../../../types/aptitude';
import { Activity, Zap, CheckCircle2, XCircle } from 'lucide-react';

const METADATA: GameMetadata = {
  id: 'go_no_go',
  name: 'Reaction Speed & Go-No-Go',
  skill: 'Attention Focus & Impulse Control',
  skillCategory: 'Speed',
  duration: '2 mins',
  difficulty: 'Fast-Paced',
  description: 'Tap rapidly whenever the GREEN signal appears. Exercise impulse control and DO NOT tap on the RED distractor!',
  mncReference: 'Arctic Shores / Revelian style',
  skillsEvaluated: ['Motor Reaction Time', 'Inhibitory Control', 'Sustained Vigilance', 'Impulse Error Suppression'],
  iconName: 'GoNoGo'
};

interface Props {
  onComplete?: (result: GameResult) => void;
  onExit?: () => void;
}

export const GoNoGoGame: React.FC<Props> = ({ onComplete, onExit }) => {
  const [phase, setPhase] = useState<GamePhase>('INSTRUCTIONS');
  const [trial, setTrial] = useState<number>(0);
  const [stimulus, setStimulus] = useState<'NONE' | 'GO' | 'NOGO'>('NONE');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [falseAlarms, setFalseAlarms] = useState<number>(0); // tapped on red
  const [misses, setMisses] = useState<number>(0); // failed to tap on green
  const [hits, setHits] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const stimulusStartTimeRef = useRef<number>(0);
  const timeoutRef = useRef<any>(null);
  const trialResponseRef = useRef<boolean>(false);

  const TOTAL_TRIALS = phase === 'PRACTICE' ? 3 : 12;

  const nextTrial = () => {
    trialResponseRef.current = false;
    setStimulus('NONE');
    setFeedback('');

    // Jittered delay between 700ms and 2000ms
    const delay = 700 + Math.random() * 1300;
    timeoutRef.current = setTimeout(() => {
      // 70% GO (green), 30% NO-GO (red)
      const isGo = Math.random() < 0.7;
      const targetType = isGo ? 'GO' : 'NOGO';
      setStimulus(targetType);
      stimulusStartTimeRef.current = Date.now();

      // Stimulus disappears after 850ms
      timeoutRef.current = setTimeout(() => {
        if (!trialResponseRef.current) {
          if (targetType === 'GO') {
            setMisses((prev) => prev + 1);
            setFeedback('Missed Green Target!');
          } else {
            // Correctly avoided tapping red!
            setHits((prev) => prev + 1);
            setFeedback('Good Inhibit! (Held back)');
          }
        }
        setTrial((prev) => {
          const nextT = prev + 1;
          if (nextT >= TOTAL_TRIALS) {
            finishGame();
            return nextT;
          } else {
            setTimeout(nextTrial, 500);
            return nextT;
          }
        });
      }, 850);
    }, delay);
  };

  const handleTap = () => {
    if (trialResponseRef.current) return;
    trialResponseRef.current = true;

    if (stimulus === 'NONE') {
      // Premature tap
      setFalseAlarms((prev) => prev + 1);
      setFeedback('Too early! Wait for the signal.');
      return;
    }

    if (stimulus === 'GO') {
      const rt = Date.now() - stimulusStartTimeRef.current;
      setReactionTimes((prev) => [...prev, rt]);
      setHits((prev) => prev + 1);
      setFeedback(`Fast! ${rt}ms`);
    } else if (stimulus === 'NOGO') {
      setFalseAlarms((prev) => prev + 1);
      setFeedback('Penalty! Tapped on RED (Inhibition Failure)');
    }
  };

  const finishGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (phase === 'PRACTICE') {
      setPhase('PLAYING');
      resetGame();
      return;
    }

    const avgRT = reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 400;

    const totalValid = hits;
    const accuracy = Math.round((totalValid / TOTAL_TRIALS) * 100);
    const score = Math.max(100, Math.round((1000 - avgRT) * 1.5) - (falseAlarms * 150));

    const res: GameResult = {
      gameId: METADATA.id,
      gameName: METADATA.name,
      score: Math.max(200, score),
      accuracyPct: Math.max(20, accuracy),
      reactionTimeMs: avgRT,
      roundsCompleted: TOTAL_TRIALS,
      percentile: avgRT < 300 ? 95 : (avgRT < 380 ? 86 : 74),
      skills: {
        memory: 60,
        speed: Math.min(99, Math.max(40, Math.round((700 - avgRT) / 3.5))),
        logic: 70,
        focus: Math.max(30, 95 - falseAlarms * 15),
        risk: 65,
        spatial: 60
      },
      tips: [
        `Average Reaction Time: ${avgRT}ms. Elite tech applicants average below 320ms.`,
        'Inhibition is just as important as speed: zero false alarms on Red signals shows strong impulse control.'
      ],
      roleMatches: ['High-Frequency Systems', 'DevOps / Incident Response', 'Mobile Engineer']
    };

    setGameResult(res);
    setPhase('RESULT');
    if (onComplete) onComplete(res);
  };

  const resetGame = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTrial(0);
    setStimulus('NONE');
    setReactionTimes([]);
    setFalseAlarms(0);
    setMisses(0);
    setHits(0);
    setFeedback('');
  };

  useEffect(() => {
    if (phase === 'PRACTICE' || phase === 'PLAYING') {
      resetGame();
      nextTrial();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
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
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold font-mono">
              TAP!
            </div>
            <div className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold font-mono">
              HOLD!
            </div>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>1. Tap the arena as fast as you can when <strong>GREEN</strong> appears.</p>
            <p>2. DO NOT tap when <strong>RED</strong> appears (inhibit action).</p>
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
            <span className="text-[10px] text-slate-400 uppercase block">Hits</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{hits}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Impulse Errors</span>
            <strong className="text-rose-600 dark:text-rose-400 font-bold">{falseAlarms}</strong>
          </div>
        </div>

        {/* Reaction Area / Touch Target */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleTap}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleTap();
            }
          }}
          className="h-64 rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 flex flex-col items-center justify-center cursor-pointer select-none relative overflow-hidden transition-all duration-100 active:scale-98 shadow-inner"
        >
          {stimulus === 'NONE' && (
            <div className="space-y-2 text-slate-400 dark:text-slate-500 font-mono">
              <span className="text-sm font-bold block animate-pulse">Wait for signal...</span>
              <span className="text-[10px] block">Click or press Spacebar immediately on Green</span>
            </div>
          )}

          {stimulus === 'GO' && (
            <div className="w-36 h-36 rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/50 flex flex-col items-center justify-center text-white text-base font-black font-mono animate-scale-up">
              <span>TAP NOW!</span>
              <span className="text-[10px] font-mono opacity-80">(GREEN)</span>
            </div>
          )}

          {stimulus === 'NOGO' && (
            <div className="w-36 h-36 rounded-full bg-rose-600 shadow-2xl shadow-rose-600/50 flex flex-col items-center justify-center text-white text-base font-black font-mono animate-scale-up">
              <span>DO NOT TAP!</span>
              <span className="text-[10px] font-mono opacity-80">(RED)</span>
            </div>
          )}

          {/* Feedback Overlay */}
          {feedback && (
            <div className="absolute bottom-3 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              {feedback}
            </div>
          )}
        </div>

        <p className="text-[11px] font-mono text-slate-400">
          Tip: You can use your Mouse Click, Screen Tap, or the <strong>SPACEBAR</strong> on your keyboard.
        </p>
      </div>
    </GameShell>
  );
};
