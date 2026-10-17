import React, { useState, useEffect, useRef } from 'react';
import { GameShell, GamePhase } from '../GameShell';
import { GameMetadata, GameResult } from '../../../types/aptitude';
import { Brain, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

const METADATA: GameMetadata = {
  id: 'memory_grid',
  name: 'Memory Grid & Digit Span',
  skill: 'Working Memory & Sequential Recall',
  skillCategory: 'Memory',
  duration: '3 mins',
  difficulty: 'Medium',
  description: 'Memorize the highlighted tile sequence of increasing length and reproduce it in exact order.',
  mncReference: 'Cubiks / pymetrics / Revelian style',
  skillsEvaluated: ['Working Memory Span', 'Pattern Retention', 'Attention Focus', 'Sequential Latency'],
  iconName: 'Memory'
};

interface Props {
  onComplete?: (result: GameResult) => void;
  onExit?: () => void;
  isBatteryMode?: boolean;
}

export const MemoryGridGame: React.FC<Props> = ({ onComplete, onExit }) => {
  const [phase, setPhase] = useState<GamePhase>('INSTRUCTIONS');
  const [gridSize] = useState<number>(9); // 3x3 grid
  const [level, setLevel] = useState<number>(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'SHOWING' | 'WAITING_INPUT' | 'SUCCESS' | 'FAILED'>('SHOWING');
  const [score, setScore] = useState<number>(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const MAX_LEVELS = phase === 'PRACTICE' ? 1 : 5;

  // Start new level sequence
  const startLevel = (currentLevel: number) => {
    const seqLength = 2 + currentLevel; // Level 1 = 3 tiles, Level 2 = 4 tiles, etc.
    const newSeq: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      newSeq.push(Math.floor(Math.random() * gridSize));
    }
    setSequence(newSeq);
    setUserSequence([]);
    setGameState('SHOWING');
    playSequence(newSeq);
  };

  const playSequence = async (seq: number[]) => {
    setActiveTile(null);
    await new Promise((r) => setTimeout(r, 600));

    for (let i = 0; i < seq.length; i++) {
      setActiveTile(seq[i]);
      await new Promise((r) => setTimeout(r, 650));
      setActiveTile(null);
      await new Promise((r) => setTimeout(r, 250));
    }

    setGameState('WAITING_INPUT');
  };

  const handleTileClick = (tileIdx: number) => {
    if (gameState !== 'WAITING_INPUT') return;

    const nextExpected = sequence[userSequence.length];
    const newUserSeq = [...userSequence, tileIdx];
    setUserSequence(newUserSeq);
    setActiveTile(tileIdx);
    setTimeout(() => setActiveTile(null), 200);

    if (tileIdx !== nextExpected) {
      // Mistake made
      setGameState('FAILED');
      setTimeout(() => {
        if (phase === 'PRACTICE') {
          startLevel(1);
        } else {
          finishGame(score);
        }
      }, 1000);
      return;
    }

    if (newUserSeq.length === sequence.length) {
      // Level completed!
      setGameState('SUCCESS');
      const roundPoints = level * 200;
      const newScore = score + roundPoints;
      setScore(newScore);

      setTimeout(() => {
        if (level >= MAX_LEVELS) {
          if (phase === 'PRACTICE') {
            setPhase('PLAYING');
            resetGame();
          } else {
            finishGame(newScore);
          }
        } else {
          setLevel((prev) => prev + 1);
          startLevel(level + 1);
        }
      }, 900);
    }
  };

  const finishGame = (finalScore: number) => {
    const maxSpan = 2 + level;
    const res: GameResult = {
      gameId: METADATA.id,
      gameName: METADATA.name,
      score: finalScore,
      accuracyPct: Math.min(100, Math.round((level / 5) * 100)),
      reactionTimeMs: 380,
      roundsCompleted: level,
      percentile: Math.min(97, 65 + level * 6),
      skills: {
        memory: Math.min(98, 60 + level * 7),
        speed: 72,
        logic: 75,
        focus: Math.min(95, 65 + level * 6),
        risk: 50,
        spatial: 70
      },
      tips: [
        `You reached a working memory span of ${maxSpan} chunks. The corporate benchmark for top analysts is 6-7 items.`,
        'Use phonological chunking or spatial mental linking to expand your short-term buffer.'
      ],
      roleMatches: ['Software Engineer', 'Data Scientist', 'Financial Analyst']
    };
    setGameResult(res);
    setPhase('RESULT');
    if (onComplete) onComplete(res);
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setSequence([]);
    setUserSequence([]);
    setActiveTile(null);
    setGameState('SHOWING');
  };

  useEffect(() => {
    if (phase === 'PRACTICE' || phase === 'PLAYING') {
      startLevel(1);
    }
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
          <div className="grid grid-cols-3 gap-2 w-28">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className={`h-8 rounded-lg border flex items-center justify-center text-[10px] font-mono ${
                  i === 4 ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>1. Watch the tiles light up sequentially.</p>
            <p>2. Wait until the prompt says <strong>Your Turn</strong>.</p>
            <p>3. Tap the tiles in the exact sequence.</p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-center max-w-md mx-auto py-4">
        {/* HUD */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Level</span>
            <strong className="text-slate-900 dark:text-white font-bold">{level} of {MAX_LEVELS}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Sequence Length</span>
            <strong className="text-indigo-600 dark:text-indigo-400 font-black">{2 + level} items</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">Points</span>
            <strong className="text-purple-600 dark:text-purple-400 font-black">{score}</strong>
          </div>
        </div>

        {/* State prompt */}
        <div className="text-xs font-mono font-bold tracking-wide">
          {gameState === 'SHOWING' && (
            <span className="text-purple-600 dark:text-purple-400 animate-pulse">
              Memorize Pattern Sequence... ({sequence.length} steps)
            </span>
          )}
          {gameState === 'WAITING_INPUT' && (
            <span className="text-emerald-600 dark:text-emerald-400">
              Your Turn! Click tiles in exact order ({userSequence.length} / {sequence.length})
            </span>
          )}
          {gameState === 'SUCCESS' && (
            <span className="text-emerald-500 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Perfect! Advancing to next sequence...
            </span>
          )}
          {gameState === 'FAILED' && (
            <span className="text-rose-500">
              Sequence Mismatch! Game over.
            </span>
          )}
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-3 w-64 h-64 mx-auto p-3 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
            const isFlashing = activeTile === idx;
            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                disabled={gameState !== 'WAITING_INPUT'}
                className={`rounded-xl border transition-all duration-150 transform cursor-pointer flex items-center justify-center text-sm font-bold font-mono select-none ${
                  isFlashing
                    ? 'bg-gradient-to-t from-indigo-500 to-purple-500 border-white text-white shadow-xl scale-95 ring-4 ring-indigo-400/40'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-400'
                } ${gameState !== 'WAITING_INPUT' ? 'cursor-default' : 'active:scale-90'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
};
