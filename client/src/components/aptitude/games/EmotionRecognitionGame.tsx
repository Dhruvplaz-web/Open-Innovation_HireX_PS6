import React, { useState } from 'react';
import { Smile, Frown, Flame, Zap, Eye } from 'lucide-react';

interface Props {
  onComplete?: (metrics: any) => void;
  isBatteryMode?: boolean;
}

interface ExpressionCard {
  emotion: 'Joy' | 'Anger' | 'Surprise' | 'Fear' | 'Neutral' | 'Sadness';
  faceSvg: string;
}

const FACES: ExpressionCard[] = [
  { emotion: 'Joy', faceSvg: '😊' },
  { emotion: 'Anger', faceSvg: '😠' },
  { emotion: 'Surprise', faceSvg: '😲' },
  { emotion: 'Fear', faceSvg: '😨' },
  { emotion: 'Neutral', faceSvg: '😐' },
  { emotion: 'Sadness', faceSvg: '😢' }
];

export const EmotionRecognitionGame: React.FC<Props> = ({ onComplete, isBatteryMode }) => {
  const [trial, setTrial] = useState<number>(1);
  const [currentFace, setCurrentFace] = useState<ExpressionCard>(FACES[0]);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const TOTAL_TRIALS = 6;

  const handleSelectEmotion = (selectedEmotion: string) => {
    const isCorrect = selectedEmotion === currentFace.emotion;
    if (isCorrect) setScore((prev) => prev + 1);

    if (trial >= TOTAL_TRIALS) {
      setIsFinished(true);
      const accuracy = Math.round(((isCorrect ? score + 1 : score) / TOTAL_TRIALS) * 100);
      const metrics = { accuracy, total_trials: TOTAL_TRIALS };
      if (onComplete) onComplete(metrics);
    } else {
      setTrial((prev) => prev + 1);
      const nextFace = FACES[trial % FACES.length];
      setCurrentFace(nextFace);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300">
              Cognitive Game 8 of 9
            </span>
            <span className="text-xs font-semibold text-slate-400">Trial {trial} of {TOTAL_TRIALS}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Emotion & Micro-Expression Recognition</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Identify the perceived emotional state of the character as rapidly as possible.
          </p>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          <div className="h-56 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
            <div className="text-8xl select-none animate-bounce">
              {currentFace.faceSvg}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['Joy', 'Anger', 'Surprise', 'Fear', 'Neutral', 'Sadness'].map((emo) => (
              <button
                key={emo}
                onClick={() => handleSelectEmotion(emo)}
                className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition shadow-sm cursor-pointer"
              >
                {emo}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-center space-y-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Emotion Recognition Assessment Complete</h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Performance indicates stronger emotion-recognition accuracy in this assessment: <strong className="text-violet-600 font-mono text-base">{Math.round((score / TOTAL_TRIALS) * 100)}%</strong>
          </p>
          {!isBatteryMode && (
            <button
              onClick={() => {
                setTrial(1);
                setScore(0);
                setCurrentFace(FACES[0]);
                setIsFinished(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-500 transition shadow-md"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
