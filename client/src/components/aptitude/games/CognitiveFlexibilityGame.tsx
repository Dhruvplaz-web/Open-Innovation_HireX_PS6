import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  onComplete?: (metrics: any) => void;
  isBatteryMode?: boolean;
}

type RuleType = 'COLOR' | 'SHAPE' | 'COUNT';

interface CardItem {
  color: 'Red' | 'Blue' | 'Green';
  shape: 'Circle' | 'Square' | 'Triangle';
  count: 1 | 2 | 3;
}

export const CognitiveFlexibilityGame: React.FC<Props> = ({ onComplete, isBatteryMode }) => {
  const [activeRule, setActiveRule] = useState<RuleType>('COLOR');
  const [currentCard, setCurrentCard] = useState<CardItem>({ color: 'Red', shape: 'Circle', count: 1 });
  const [targetCategory, setTargetCategory] = useState<string>('Red');

  const [score, setScore] = useState<number>(0);
  const [trialsCount, setTrialsCount] = useState<number>(0);
  const [switchCostMs, setSwitchCostMs] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'NONE' | 'CORRECT' | 'WRONG'>('NONE');

  const lastSwitchTimeRef = useRef<number>(Date.now());
  const trialStartTimeRef = useRef<number>(Date.now());
  const TOTAL_TRIALS = 15;

  const rulesList: RuleType[] = ['COLOR', 'SHAPE', 'COUNT'];
  const colors: ('Red' | 'Blue' | 'Green')[] = ['Red', 'Blue', 'Green'];
  const shapes: ('Circle' | 'Square' | 'Triangle')[] = ['Circle', 'Square', 'Triangle'];
  const counts: (1 | 2 | 3)[] = [1, 2, 3];

  useEffect(() => {
    generateNextTrial('COLOR');
  }, []);

  const generateNextTrial = (forcedRule?: RuleType) => {
    const shouldSwitch = trialsCount > 0 && trialsCount % 4 === 0;
    const rule = forcedRule || (shouldSwitch ? rulesList[Math.floor(Math.random() * rulesList.length)] : activeRule);

    if (shouldSwitch && rule !== activeRule) {
      lastSwitchTimeRef.current = Date.now();
    }

    setActiveRule(rule);

    const randCard: CardItem = {
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      count: counts[Math.floor(Math.random() * counts.length)]
    };
    setCurrentCard(randCard);
    trialStartTimeRef.current = Date.now();
  };

  const handleSelection = (selectedVal: string) => {
    if (isFinished) return;

    const reactionTime = Date.now() - trialStartTimeRef.current;
    let expectedVal = '';

    if (activeRule === 'COLOR') expectedVal = currentCard.color;
    else if (activeRule === 'SHAPE') expectedVal = currentCard.shape;
    else if (activeRule === 'COUNT') expectedVal = String(currentCard.count);

    const isCorrect = selectedVal === expectedVal;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback('CORRECT');
    } else {
      setFeedback('WRONG');
    }

    const nextTrials = trialsCount + 1;
    setTrialsCount(nextTrials);

    if (nextTrials >= TOTAL_TRIALS) {
      setIsFinished(true);
      const metrics = {
        accuracy: Math.round(((isCorrect ? score + 1 : score) / TOTAL_TRIALS) * 100),
        switch_cost_ms: Math.round(reactionTime),
        total_trials: TOTAL_TRIALS
      };
      if (onComplete) onComplete(metrics);
    } else {
      setTimeout(() => {
        setFeedback('NONE');
        generateNextTrial();
      }, 400);
    }
  };

  const getOptionsForActiveRule = () => {
    if (activeRule === 'COLOR') return ['Red', 'Blue', 'Green'];
    if (activeRule === 'SHAPE') return ['Circle', 'Square', 'Triangle'];
    return ['1', '2', '3'];
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
              Cognitive Game 3 of 9
            </span>
            <span className="text-xs font-semibold text-slate-400">Rule Trial {trialsCount + 1} of {TOTAL_TRIALS}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Cognitive Flexibility & Rule-Switching</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sort the displayed card based on the current active rule header. The rule shifts dynamically!
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ACTIVE RULE: SORT BY {activeRule}
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Card Presentation Box */}
          <div className="h-52 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden space-y-3">
            <div className="flex items-center gap-3">
              {Array.from({ length: currentCard.count }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 flex items-center justify-center font-bold text-white shadow-lg ${
                    currentCard.shape === 'Circle' ? 'rounded-full' : currentCard.shape === 'Square' ? 'rounded-xl' : 'clip-polygon'
                  }`}
                  style={{
                    backgroundColor: currentCard.color === 'Red' ? '#ef4444' : currentCard.color === 'Blue' ? '#3b82f6' : '#10b981'
                  }}
                >
                  {currentCard.shape === 'Triangle' ? '▲' : ''}
                </div>
              ))}
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Card: {currentCard.count} {currentCard.color} {currentCard.shape}{currentCard.count > 1 ? 's' : ''}
            </div>

            {feedback === 'CORRECT' && (
              <div className="absolute top-3 right-3 text-emerald-400 text-xs font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Adapted!
              </div>
            )}
            {feedback === 'WRONG' && (
              <div className="absolute top-3 right-3 text-red-400 text-xs font-bold flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Rule Error!
              </div>
            )}
          </div>

          {/* Option Buttons mapped to Active Rule */}
          <div className="grid grid-cols-3 gap-4">
            {getOptionsForActiveRule().map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelection(opt)}
                className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm transition shadow-sm cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center space-y-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Rule-Switching Flexibility Assessment Complete</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Accuracy: <strong className="text-purple-600 font-mono text-base">{Math.round((score / TOTAL_TRIALS) * 100)}%</strong> ({score} / {TOTAL_TRIALS} Correct)
          </p>
          {!isBatteryMode && (
            <button
              onClick={() => {
                setScore(0);
                setTrialsCount(0);
                setIsFinished(false);
                generateNextTrial('COLOR');
              }}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition shadow-md"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
