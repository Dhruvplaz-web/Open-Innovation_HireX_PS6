import React, { useState } from 'react';
import { GameMetadata, GameResult } from '../../types/aptitude';
import { ResultRadar } from './ResultRadar';
import {
  Play,
  RotateCcw,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Shield,
  HelpCircle,
  Zap,
  Flame,
  ChevronRight,
  X
} from 'lucide-react';

export type GamePhase = 'INSTRUCTIONS' | 'PRACTICE' | 'PLAYING' | 'RESULT';

interface Props {
  game: GameMetadata;
  phase: GamePhase;
  onSetPhase: (phase: GamePhase) => void;
  onExit: () => void;
  children: React.ReactNode;
  result?: GameResult | null;
  onPlayAgain: () => void;
  instructionDemo?: React.ReactNode;
  practiceTip?: string;
}

export const GameShell: React.FC<Props> = ({
  game,
  phase,
  onSetPhase,
  onExit,
  children,
  result,
  onPlayAgain,
  instructionDemo,
  practiceTip = 'This is a single practice trial to get you comfortable with the controls. Points earned in practice do not count towards your official score.'
}) => {
  return (
    <div className="rounded-3xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Top Banner Navigation */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{game.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono">
                {game.mncReference}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Target Skill: {game.skill}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-600 dark:text-slate-300 hover:text-purple-600 text-xs font-bold transition shadow-sm cursor-pointer"
            title="Go back to Gamified Arena"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Arena</span>
          </button>
          <button
            onClick={onExit}
            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
            aria-label="Close and Return to Gamified Arena"
            title="Close and Return to Gamified Arena"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body per Phase */}
      <div className="p-6 sm:p-8">
        {/* PHASE 1: INSTRUCTIONS */}
        {phase === 'INSTRUCTIONS' && (
          <div className="space-y-6 max-w-2xl mx-auto py-2">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300">
                Cognitive Assessment Protocol
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{game.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                {game.description}
              </p>
            </div>

            {/* Assessment Specs Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Duration</span>
                <strong className="text-slate-800 dark:text-slate-200">{game.duration}</strong>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Difficulty</span>
                <strong className="text-purple-600 dark:text-purple-400">{game.difficulty}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Best Score</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{game.bestScore || 0} pts</strong>
              </div>
            </div>

            {/* Interactive Demo or Visual Guide */}
            {instructionDemo && (
              <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Interactive Demo & Rules
                </span>
                {instructionDemo}
              </div>
            )}

            {/* MNC Evaluation Insight */}
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" /> Why MNCs Test This Skill:
              </span>
              <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-400">
                Top quantitative and software tech hiring teams use this exact gamified micro-test to evaluate mental agility, risk calibration, and processing speed under pressure without demographic bias.
              </p>
            </div>

            {/* Launch Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={onExit}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Arena</span>
              </button>

              <button
                onClick={() => onSetPhase('PRACTICE')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Try Practice Round</span>
              </button>

              <button
                onClick={() => onSetPhase('PLAYING')}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Scored Game</span>
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: PRACTICE ROUND WATERMARK */}
        {phase === 'PRACTICE' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>PRACTICE ROUND (Not Scored) — {practiceTip}</span>
              </div>
              <button
                onClick={() => onSetPhase('PLAYING')}
                className="px-3 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold hover:bg-amber-700 transition cursor-pointer"
              >
                Skip to Scored Game →
              </button>
            </div>

            {children}
          </div>
        )}

        {/* PHASE 3: PLAYING */}
        {phase === 'PLAYING' && (
          <div className="space-y-4">
            {children}
          </div>
        )}

        {/* PHASE 4: RESULT SCREEN */}
        {phase === 'RESULT' && result && (
          <div className="space-y-8 max-w-3xl mx-auto py-2">
            {/* Top Badge */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Assessment Complete!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Performance recorded against benchmark corporate cohort.
              </p>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-center">
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase block">Game Score</span>
                <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono mt-1 block">
                  {result.score}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase block">Accuracy</span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1 block">
                  {result.accuracyPct}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-center">
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase block">Reaction Time</span>
                <span className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono mt-1 block">
                  {result.reactionTimeMs ? `${result.reactionTimeMs}ms` : 'Fast'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-center">
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase block">Percentile</span>
                <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-1 block">
                  Top {100 - result.percentile}%
                </span>
              </div>
            </div>

            {/* Skill Radar Chart & Breakdown */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                  Cognitive Skill Profile
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Multi-Dimensional Competency Map
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Evaluated across Working Memory, Decision Speed, Inductive Logic, Sustained Focus, Calculated Risk, and Spatial Acuity.
                </p>

                {/* Role matches */}
                {result.roleMatches?.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Strong Corporate Fit For:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.roleMatches.map((r, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          🎯 {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <ResultRadar skills={result.skills} size={280} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onPlayAgain}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>

              <button
                onClick={onExit}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Return to Games Arena
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
