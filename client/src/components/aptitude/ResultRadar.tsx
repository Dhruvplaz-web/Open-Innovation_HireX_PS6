import React from 'react';
import { CognitiveSkillScores } from '../../types/aptitude';

interface Props {
  skills: CognitiveSkillScores;
  size?: number;
  showLabels?: boolean;
  className?: string;
}

export const ResultRadar: React.FC<Props> = ({
  skills,
  size = 320,
  showLabels = true,
  className = ''
}) => {
  const center = size / 2;
  const radius = (size / 2) - (showLabels ? 50 : 20);

  const axes: { key: keyof CognitiveSkillScores; label: string; angle: number }[] = [
    { key: 'memory', label: 'Memory', angle: -Math.PI / 2 },
    { key: 'speed', label: 'Speed', angle: -Math.PI / 6 },
    { key: 'logic', label: 'Logic', angle: Math.PI / 6 },
    { key: 'focus', label: 'Focus', angle: Math.PI / 2 },
    { key: 'risk', label: 'Risk', angle: (5 * Math.PI) / 6 },
    { key: 'spatial', label: 'Spatial', angle: -(5 * Math.PI) / 6 }
  ];

  // Helper to calculate X, Y on circle for an angle and normalized magnitude (0 to 1)
  const getPoint = (angle: number, valueRatio: number) => {
    const r = radius * Math.max(0.05, Math.min(1, valueRatio));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Generate concentric polygon grid paths at 25%, 50%, 75%, 100%
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = gridLevels.map((lvl) => {
    const points = axes.map((a) => {
      const pt = getPoint(a.angle, lvl);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }).join(' ');
    return { level: lvl, points };
  });

  // Calculate candidate polygon points
  const candidatePoints = axes.map((a) => {
    const val = skills[a.key] || 50;
    const pt = getPoint(a.angle, val / 100);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        aria-label="Cognitive skill radar chart"
      >
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Center Glow */}
        <circle cx={center} cy={center} r={radius} fill="url(#centerGlow)" />

        {/* Concentric Grid Polygons */}
        {gridPolygons.map((gp, i) => (
          <polygon
            key={i}
            points={gp.points}
            fill="none"
            stroke="currentColor"
            strokeDasharray={gp.level < 1 ? '3 3' : 'none'}
            className="text-slate-200 dark:text-slate-800"
            strokeWidth={gp.level === 1 ? '1.5' : '1'}
          />
        ))}

        {/* Axis Lines from Center */}
        {axes.map((a, i) => {
          const edgePt = getPoint(a.angle, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={edgePt.x}
              y2={edgePt.y}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="1"
            />
          );
        })}

        {/* Candidate Polygon Fill & Stroke */}
        <polygon
          points={candidatePoints}
          fill="url(#radarGradient)"
          stroke="#6366f1"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out drop-shadow-md"
        />

        {/* Vertex Dots */}
        {axes.map((a, i) => {
          const val = skills[a.key] || 50;
          const pt = getPoint(a.angle, val / 100);
          return (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#6366f1"
                className="ring-2 ring-white dark:ring-slate-900"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="7"
                fill="#6366f1"
                opacity="0.3"
                className="animate-pulse"
              />
            </g>
          );
        })}

        {/* Axis Labels */}
        {showLabels && axes.map((a, i) => {
          const labelDist = radius + 22;
          const lx = center + labelDist * Math.cos(a.angle);
          const ly = center + labelDist * Math.sin(a.angle);
          const val = Math.round(skills[a.key] || 50);

          let textAnchor: 'start' | 'end' | 'middle' = 'middle';
          if (Math.abs(Math.cos(a.angle)) > 0.3) {
            textAnchor = Math.cos(a.angle) > 0 ? 'start' : 'end';
          }

          return (
            <g key={i}>
              <text
                x={lx}
                y={ly - 4}
                textAnchor={textAnchor}
                className="text-[11px] font-bold fill-slate-700 dark:fill-slate-300 tracking-tight"
              >
                {a.label}
              </text>
              <text
                x={lx}
                y={ly + 10}
                textAnchor={textAnchor}
                className="text-[10px] font-mono font-black fill-indigo-600 dark:fill-indigo-400"
              >
                {val}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
