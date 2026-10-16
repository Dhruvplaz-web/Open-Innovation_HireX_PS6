import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AssessmentPhase = 'idle' | 'instructions' | 'system_check' | 'active_exam' | 'completed' | 'disqualified';

interface AssessmentContextType {
  isAssessmentActive: boolean;
  setIsAssessmentActive: (active: boolean) => void;
  assessmentPhase: AssessmentPhase;
  setAssessmentPhase: (phase: AssessmentPhase) => void;
  violationsCount: number;
  setViolationsCount: (count: number | ((prev: number) => number)) => void;
  activeAssessmentId: string | null;
  setActiveAssessmentId: (id: string | null) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAssessmentActive, setIsAssessmentActiveState] = useState<boolean>(false);
  const [assessmentPhase, setAssessmentPhase] = useState<AssessmentPhase>('idle');
  const [violationsCount, setViolationsCount] = useState<number>(0);
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);

  const setIsAssessmentActive = useCallback((active: boolean) => {
    setIsAssessmentActiveState(active);
    if (!active) {
      setAssessmentPhase('idle');
      setViolationsCount(0);
    }
  }, []);

  // Broadcast window custom event for any listening sub-components
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('skillbridge_assessment_state_change', {
        detail: { isAssessmentActive, assessmentPhase }
      })
    );
  }, [isAssessmentActive, assessmentPhase]);

  return (
    <AssessmentContext.Provider
      value={{
        isAssessmentActive,
        setIsAssessmentActive,
        assessmentPhase,
        setAssessmentPhase,
        violationsCount,
        setViolationsCount,
        activeAssessmentId,
        setActiveAssessmentId
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = (): AssessmentContextType => {
  const context = useContext(AssessmentContext);
  if (!context) {
    // Return safe default fallback if used outside provider
    return {
      isAssessmentActive: false,
      setIsAssessmentActive: () => {},
      assessmentPhase: 'idle',
      setAssessmentPhase: () => {},
      violationsCount: 0,
      setViolationsCount: () => {},
      activeAssessmentId: null,
      setActiveAssessmentId: () => {}
    };
  }
  return context;
};
