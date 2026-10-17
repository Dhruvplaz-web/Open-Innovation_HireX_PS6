import React, { useState } from 'react';
import { GameShell, GamePhase } from '../GameShell';
import { GameMetadata, GameResult } from '../../../types/aptitude';
import { Sparkles, Users, Scale, Shield, CheckCircle2 } from 'lucide-react';

const METADATA: GameMetadata = {
  id: 'emotion_trust',
  name: 'Workplace Situational & Trust Simulator',
  skill: 'Behavioral Traits, Fairness & Teamwork',
  skillCategory: 'Logic',
  duration: '3 mins',
  difficulty: 'Medium',
  description: 'Navigate realistic engineering dilemmas mapping trade-offs across collaboration, fairness, risk appetite, and accountability.',
  mncReference: 'pymetrics / Arctic Shores behavioral round',
  skillsEvaluated: ['Team Collaboration', 'Fairness & Equity', 'Accountability', 'Risk Calibration'],
  iconName: 'Emotion'
};

interface Scenario {
  title: string;
  situation: string;
  options: {
    text: string;
    traitMap: { collaboration: number; fairness: number; accountability: number; risk: number };
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    title: 'Dilemma 1: Production Deadline vs Edge-Case Flaw',
    situation: 'Your team is 4 hours away from a high-visibility client demo. You discover a non-critical edge-case race condition that might affect 0.5% of concurrent queries.',
    options: [
      {
        text: 'Immediately notify the tech lead and client sponsor, postponing until a clean patch is tested.',
        traitMap: { collaboration: 85, fairness: 90, accountability: 95, risk: 40 }
      },
      {
        text: 'Deploy hotfix mitigation with active live telemetry, monitoring closely during the demo.',
        traitMap: { collaboration: 90, fairness: 85, accountability: 88, risk: 80 }
      },
      {
        text: 'Proceed as scheduled without mentioning it, fixing it in the next minor sprint release.',
        traitMap: { collaboration: 40, fairness: 30, accountability: 40, risk: 90 }
      }
    ]
  },
  {
    title: 'Dilemma 2: Shared Attribution & Credit',
    situation: 'A junior colleague contributed a key algorithmic optimization that reduced cloud bill by $40K, but did not present it at the executive quarterly townhall.',
    options: [
      {
        text: 'Present the architecture, explicitly spotlighting the junior engineer by name for the primary breakthrough.',
        traitMap: { collaboration: 98, fairness: 98, accountability: 95, risk: 50 }
      },
      {
        text: 'Frame the accomplishment entirely as a collective team effort without singling out individuals.',
        traitMap: { collaboration: 75, fairness: 70, accountability: 75, risk: 50 }
      },
      {
        text: 'Take individual credit as project lead since you oversaw the repository and architecture.',
        traitMap: { collaboration: 30, fairness: 25, accountability: 35, risk: 70 }
      }
    ]
  },
  {
    title: 'Dilemma 3: High-Risk Architectural Refactor',
    situation: 'The legacy monolith database is sluggish. You can either apply incremental SQL index patches or initiate a complete microservices decoupling that carries a 20% migration outage risk.',
    options: [
      {
        text: 'Advocate for the microservices decoupling to eliminate technical debt for the next 5 years.',
        traitMap: { collaboration: 80, fairness: 80, accountability: 85, risk: 90 }
      },
      {
        text: 'Stick strictly with conservative SQL indexing to guarantee zero uptime disruption today.',
        traitMap: { collaboration: 75, fairness: 80, accountability: 80, risk: 35 }
      },
      {
        text: 'Run a 2-week canary dual-write sandbox benchmark to empirically evaluate performance gain before committing.',
        traitMap: { collaboration: 95, fairness: 92, accountability: 95, risk: 75 }
      }
    ]
  }
];

interface Props {
  onComplete?: (result: GameResult) => void;
  onExit?: () => void;
}

export const EmotionTrustGame: React.FC<Props> = ({ onComplete, onExit }) => {
  const [phase, setPhase] = useState<GamePhase>('INSTRUCTIONS');
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [accumulatedTraits, setAccumulatedTraits] = useState<{
    collaboration: number[];
    fairness: number[];
    accountability: number[];
    risk: number[];
  }>({
    collaboration: [],
    fairness: [],
    accountability: [],
    risk: []
  });
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  const currentScenario = SCENARIOS[scenarioIndex % SCENARIOS.length];
  const TOTAL_SCENARIOS = phase === 'PRACTICE' ? 1 : SCENARIOS.length;

  const handleSelectOption = (opt: Scenario['options'][0]) => {
    const updated = {
      collaboration: [...accumulatedTraits.collaboration, opt.traitMap.collaboration],
      fairness: [...accumulatedTraits.fairness, opt.traitMap.fairness],
      accountability: [...accumulatedTraits.accountability, opt.traitMap.accountability],
      risk: [...accumulatedTraits.risk, opt.traitMap.risk]
    };
    setAccumulatedTraits(updated);

    if (scenarioIndex >= TOTAL_SCENARIOS - 1) {
      if (phase === 'PRACTICE') {
        setPhase('PLAYING');
        resetGame();
      } else {
        finishGame(updated);
      }
    } else {
      setScenarioIndex((prev) => prev + 1);
    }
  };

  const finishGame = (traits: typeof accumulatedTraits) => {
    const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const collabScore = avg(traits.collaboration);
    const fairnessScore = avg(traits.fairness);
    const accountScore = avg(traits.accountability);
    const riskScore = avg(traits.risk);

    const compositeScore = Math.round((collabScore + fairnessScore + accountScore + (100 - Math.abs(riskScore - 70))) / 4 * 10);

    const res: GameResult = {
      gameId: METADATA.id,
      gameName: METADATA.name,
      score: compositeScore,
      accuracyPct: 92,
      roundsCompleted: TOTAL_SCENARIOS,
      percentile: 94,
      skills: {
        memory: 70,
        speed: 75,
        logic: Math.round((fairnessScore + accountScore) / 2),
        focus: 85,
        risk: riskScore,
        spatial: 60
      },
      tips: [
        `High collaboration (${collabScore}%) and accountability (${accountScore}%) observed.`,
        'MNC engineering orgs favor candidates who take calculated bets while transparently communicating risks early.'
      ],
      roleMatches: ['Engineering Lead', 'Technical Project Manager', 'Solutions Architect']
    };

    setGameResult(res);
    setPhase('RESULT');
    if (onComplete) onComplete(res);
  };

  const resetGame = () => {
    setScenarioIndex(0);
    setAccumulatedTraits({
      collaboration: [],
      fairness: [],
      accountability: [],
      risk: []
    });
  };

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
        <div className="text-xs text-slate-300 space-y-1.5 py-3">
          <p>1. You will be placed in engineering leadership dilemmas.</p>
          <p>2. Choose the authentic action you would take under corporate pressure.</p>
          <p>3. Your choices construct your multi-trait behavioral fingerprint.</p>
        </div>
      }
    >
      <div className="space-y-6 max-w-xl mx-auto py-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <span className="font-bold text-slate-900 dark:text-white">
            Scenario {scenarioIndex + 1} of {TOTAL_SCENARIOS}
          </span>
          <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">
            Situational Judgment
          </span>
        </div>

        {/* Scenario Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {currentScenario.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentScenario.situation}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentScenario.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt)}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-500 dark:hover:border-purple-400 text-left font-medium text-xs transition cursor-pointer shadow-sm active:scale-98 text-slate-800 dark:text-slate-200 flex items-start gap-3 group"
            >
              <span className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="leading-relaxed">{opt.text}</span>
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
};
