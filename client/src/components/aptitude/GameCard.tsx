import React from 'react';
import { GameMetadata } from '../../types/aptitude';
import {
  Zap,
  Brain,
  Layers,
  Activity,
  RefreshCw,
  Hash,
  Sparkles,
  Compass,
  Play,
  Clock,
  Award,
  Flame,
  ArrowRight
} from 'lucide-react';

interface Props {
  game: GameMetadata;
  onPlay: (gameId: string) => void;
  bestScore?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Balloon: Zap,
  Memory: Brain,
  Matrix: Layers,
  GoNoGo: Activity,
  Stroop: RefreshCw,
  NumberLogic: Hash,
  Emotion: Sparkles,
  Spatial: Compass
};

export const GameCard: React.FC<Props> = ({ game, onPlay, bestScore }) => {
  const IconComponent = ICON_MAP[game.iconName] || Zap;

  const getDifficultyBadge = (diff: GameMetadata['difficulty']) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'Fast-Paced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300';
      case 'Challenging':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="group relative p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 transition-transform group-hover:scale-105">
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300/80">
              {game.mncReference}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getDifficultyBadge(game.difficulty)}`}>
              {game.difficulty}
            </span>
          </div>
        </div>

        {/* Game Title & Skills */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {game.name}
        </h3>
        <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 block mt-0.5">
          Measures: {game.skill}
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
          {game.description}
        </p>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {game.skillsEvaluated.map((sk, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {sk}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Meta & Play Button */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {game.duration}
          </span>
          {bestScore !== undefined && bestScore > 0 && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <Award className="w-3.5 h-3.5" />
              Best: {bestScore}
            </span>
          )}
        </div>

        <button
          onClick={() => onPlay(game.id)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 group-hover:shadow-purple-500/25 group-hover:shadow-lg"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Play</span>
        </button>
      </div>
    </div>
  );
};
