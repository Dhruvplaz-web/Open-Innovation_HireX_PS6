import React from 'react';
import { PlacementReadinessCard } from '../components/cards/PlacementReadinessCard';
import { CampusEligibilityBenchmarksCard } from '../components/cards/CampusEligibilityBenchmarksCard';
import { RightSidePanel } from '../components/cards/RightSidePanel';
import { SEOHead } from '../components/common/SEOHead';
import { StudentProfile, TrendChartData, PeerScore, MatchedOpportunity, PlacementReadinessData, CampusBenchmarkCompany } from '../types';

interface DashboardViewProps {
  student: StudentProfile;
  chartData: TrendChartData;
  peers: PeerScore[];
  opportunities: MatchedOpportunity[];
  learningStats: any;
  placementReadiness?: PlacementReadinessData;
  campusBenchmarks?: CampusBenchmarkCompany[];
  onNavigateTab: (tab: string) => void;
  onOpenAssessment: () => void;
  onSelectOpportunity?: (opp: MatchedOpportunity) => void;
  onOpenModal?: (modal: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  opportunities,
  learningStats,
  placementReadiness,
  campusBenchmarks,
  onNavigateTab,
  onOpenAssessment,
  onSelectOpportunity,
  onOpenModal
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <SEOHead
        title="HireX | Placement Command Center"
        description="HireX Placement Command Center connects students, academia and recruiters through verified skill assessments, explainable AI matching, internships, jobs and placement telemetry."
        path="/"
      />

      {/* Main 2-Column Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: 2/3 width (Placement Readiness Card + Campus Drive Eligibility Benchmarks) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <PlacementReadinessCard
            student={student}
            placementReadiness={placementReadiness}
            onNavigateTab={onNavigateTab}
            onOpenAssessment={onOpenAssessment}
          />

          <CampusEligibilityBenchmarksCard
            student={student}
            benchmarks={campusBenchmarks}
            onNavigateTab={onNavigateTab}
          />
        </div>

        {/* Right Column: 1/3 width (Matched Opportunities & User Skills Proficiency) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <RightSidePanel
            opportunities={opportunities}
            role="student"
            student={student}
            learningStats={learningStats}
            onNavigateTab={onNavigateTab}
            onApply={(opp) => {
              if (onSelectOpportunity) {
                onSelectOpportunity(opp);
              } else {
                onNavigateTab('opportunities');
              }
            }}
            openModal={(m) => {
              if (onOpenModal) {
                onOpenModal(m);
              } else {
                onNavigateTab('opportunities');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
