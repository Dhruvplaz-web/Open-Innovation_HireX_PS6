import React, { useState, useEffect } from 'react';
import { LeftIconRail } from './components/layout/LeftIconRail';
import { TopNavBar } from './components/layout/TopNavBar';
import { HeroPerformanceCard } from './components/cards/HeroPerformanceCard';
import { RightSidePanel } from './components/cards/RightSidePanel';
import { StudentProgressCard } from './components/cards/StudentProgressCard';
import { FriendsScoreCard } from './components/cards/FriendsScoreCard';
import { AgentChatDrawer } from './components/cards/AgentChatDrawer';
import { OpportunityModal } from './components/modals/OpportunityModal';
import { AuthModal } from './components/modals/AuthModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { AboutModal } from './components/modals/AboutModal';
import { ContactModal } from './components/modals/ContactModal';
import { LegalModal } from './components/modals/LegalModal';
import { AssessmentModal } from './components/modals/AssessmentModal';
import { OpportunitiesExplorerModal } from './components/modals/OpportunitiesExplorerModal';
import { CookieBanner } from './components/common/CookieBanner';
import { FloatingCopilotButton } from './components/common/FloatingCopilotButton';
import { NotFoundView } from './components/common/NotFoundView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SkipToContent } from './components/common/SkipToContent';
import { GlobalFooter } from './components/common/GlobalFooter';

// Public Flagship Landing Page
import { LandingPageView } from './views/LandingPageView';

// Dedicated Standalone Auth Page (Login & Sign Up)
import { AuthView } from './views/AuthView';

// 5 Dedicated Flagship Views + Profile + Skill Journey
import { DashboardView } from './views/DashboardView';
import { OpportunitiesView } from './views/OpportunitiesView';
import { CodeLabView } from './views/CodeLabView';
import { AptitudeArenaView } from './views/AptitudeArenaView';
import { PortfolioTranscriptView } from './views/PortfolioTranscriptView';
import { ProfileView } from './views/ProfileView';
import { SkillVerificationView } from './views/SkillVerificationView';
import { VerifiedSkillPassport } from './components/passport/VerifiedSkillPassport';

// Dedicated Role-Specific Connected Ecosystem Portals
import { AcademicianPortalView } from './views/AcademicianPortalView';
import { RecruiterPortalView } from './views/RecruiterPortalView';
import { AdminPortalView } from './views/AdminPortalView';
import { CollaborationHubView } from './views/CollaborationHubView';

// Public Legal & Information Views
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { TermsOfServiceView } from './views/TermsOfServiceView';
import { CookiePolicyView } from './views/CookiePolicyView';
import { AccessibilityView } from './views/AccessibilityView';

import { Role, StudentProfile, MatchedOpportunity, TrendChartData, PeerScore } from './types';
import { apiService, FALLBACK_STUDENT, FALLBACK_OPPORTUNITIES, FALLBACK_CHART, FALLBACK_PEERS } from './services/api';
import { useAuth } from './context/AuthContext';
import { useAssessment } from './context/AssessmentContext';

export const App: React.FC = () => {
  // Authentication & Firebase user profile state
  const { userProfile } = useAuth();
  const { isAssessmentActive, setIsAssessmentActive } = useAssessment();

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(false);
  const toggleDark = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Role state: 'student' | 'recruiter' | 'academician' | 'admin'
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    return (localStorage.getItem('skillbridge_auth_role') as Role) || 'student';
  });

  // Active navigation tab (Default to 'landing' if user has no saved role session and is on root path)
  const [activeTab, setActiveTab] = useState<string>(() => {
    const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
    if (cleanPath === '/' || cleanPath === '/landing') {
      return 'landing';
    }
    if (cleanPath === '/login' || cleanPath === '/auth') {
      return 'login';
    }
    if (cleanPath === '/signup') {
      return 'signup';
    }
    return 'dashboard';
  });

  // URL-First Route Synchronizer
  useEffect(() => {
    const getTabFromPath = (path: string): string => {
      const cleanPath = path.replace(/\/+$/, '') || '/';
      if (cleanPath === '/' || cleanPath === '/landing') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('linkedin_status')) {
          return 'passport';
        }
        return 'landing';
      }
      if (cleanPath === '/login' || cleanPath === '/auth') {
        return 'login';
      }
      if (cleanPath === '/signup') {
        return 'signup';
      }
      if (cleanPath === '/dashboard') return 'dashboard';
      if (cleanPath === '/passport' || cleanPath === '/skill-passport' || cleanPath === '/workflow' || cleanPath === '/journey') return 'passport';
      if (cleanPath === '/collaboration' || cleanPath === '/project-hub' || cleanPath === '/projects') return 'collaboration';
      if (cleanPath === '/opportunities') return 'opportunities';
      if (cleanPath === '/codelab' || cleanPath === '/code-lab') return 'codelab';
      if (cleanPath === '/aptitude') return 'aptitude';
      if (cleanPath === '/transcript') return 'transcript';
      if (cleanPath === '/profile') return 'profile';
      if (cleanPath === '/about') return 'about';
      if (cleanPath === '/contact') return 'contact';
      if (cleanPath === '/privacy-policy') return 'privacy-policy';
      if (cleanPath === '/terms-of-service') return 'terms-of-service';
      if (cleanPath === '/cookie-policy') return 'cookie-policy';
      if (cleanPath === '/accessibility') return 'accessibility';
      if (cleanPath === '/404') return '404';
      return 'landing';
    };

    const initialTab = getTabFromPath(window.location.pathname);
    setActiveTab(initialTab);

    const handlePopState = () => {
      const popTab = getTabFromPath(window.location.pathname);
      setActiveTab(popTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    const routeMap: Record<string, string> = {
      landing: '/',
      login: '/login',
      signup: '/signup',
      auth: '/login',
      dashboard: '/dashboard',
      passport: '/passport',
      'skill-passport': '/passport',
      workflow: '/passport',
      journey: '/passport',
      collaboration: '/collaboration',
      'project-hub': '/collaboration',
      projects: '/collaboration',
      opportunities: '/opportunities',
      codelab: '/codelab',
      'code-lab': '/code-lab',
      aptitude: '/aptitude',
      transcript: '/transcript',
      profile: '/profile',
      about: '/about',
      contact: '/contact',
      'privacy-policy': '/privacy-policy',
      'terms-of-service': '/terms-of-service',
      'cookie-policy': '/cookie-policy',
      accessibility: '/accessibility',
      '404': '/404'
    };
    const path = routeMap[tab] || `/${tab}`;
    if (window.location.pathname !== path) {
      window.history.pushState({ tab }, '', path);
    }
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEnterRoleFromLanding = (role: Role) => {
    setCurrentRole(role);
    localStorage.setItem('skillbridge_auth_role', role);
    handleNavigateTab('dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('skillbridge_auth_role');
    handleNavigateTab('landing');
  };

  // Data states
  const [student, setStudent] = useState<StudentProfile>(FALLBACK_STUDENT);

  // Synchronize state with Firebase userProfile
  useEffect(() => {
    if (userProfile) {
      setCurrentRole(userProfile.role);
      localStorage.setItem('skillbridge_auth_role', userProfile.role);
      if (userProfile.role === 'student') {
        setStudent(prev => ({
          ...prev,
          name: userProfile.displayName || prev.name,
          email: userProfile.email || prev.email,
          college: userProfile.college || prev.college,
          department: userProfile.department || prev.department,
          year: userProfile.year || prev.year,
          cgpa: userProfile.cgpa || prev.cgpa,
          target_role: userProfile.targetRole || prev.target_role,
          avatar: userProfile.photoURL || prev.avatar,
        }));
      }
    }
  }, [userProfile]);

  const [opportunities, setOpportunities] = useState<MatchedOpportunity[]>(FALLBACK_OPPORTUNITIES);
  const [chartData, setChartData] = useState<TrendChartData>(FALLBACK_CHART);
  const [peers, setPeers] = useState<PeerScore[]>(FALLBACK_PEERS);
  const [learningStats, setLearningStats] = useState<any>({
    verified_score: 88,
    finished_lessons: 65,
    ongoing_lessons: 38,
    completed_assessments: 14,
    rank: 4,
    skills_breakdown: [
      { skill: "Python", score: 92, level: "Advanced", verified: true },
      { skill: "React", score: 89, level: "Advanced", verified: true },
      { skill: "FastAPI", score: 84, level: "Intermediate", verified: true },
      { skill: "Machine Learning", score: 82, level: "Intermediate", verified: true }
    ]
  });

  // Modal states & Co-Pilot launcher
  const [activeModal, setActiveModal] = useState<string>('none');
  const [selectedOpportunity, setSelectedOpportunity] = useState<MatchedOpportunity | null>(null);
  const [agentInitialPrompt, setAgentInitialPrompt] = useState<string | undefined>(undefined);

  // Dynamic Skill / Certificate Verification handler
  const handleVerificationSuccess = (newScore: number, newMatchPct: number, skillName: string) => {
    setStudent((prev) => ({
      ...prev,
      verified_score: newScore,
      skills: {
        ...prev.skills,
        [skillName]: { level: "Advanced", score: newScore, verified: true }
      }
    }));

    setLearningStats((prev: any) => ({
      ...prev,
      verified_score: newScore,
      completed_assessments: (prev?.completed_assessments || 14) + 1
    }));

    setOpportunities((prev) =>
      prev.map((opp, idx) =>
        idx === 0
          ? {
              ...opp,
              match_percentage: newMatchPct,
              explanation: `Outstanding fit! Your newly verified ${skillName} boosted your match score to ${newMatchPct}%.`
            }
          : opp
      )
    );
  };

  // Load role-specific data
  useEffect(() => {
    const fetchData = async () => {
      if (currentRole === 'student') {
        const studentId = userProfile?.uid || 'std_1';
        const data = await apiService.getStudentDashboard(studentId);
        if (data.student) {
          setStudent(prev => ({
            ...data.student,
            name: userProfile?.displayName || prev.name || data.student.name,
            email: userProfile?.email || prev.email || data.student.email,
            college: userProfile?.college || prev.college || data.student.college,
            department: userProfile?.department || prev.department || data.student.department,
            year: userProfile?.year || prev.year || data.student.year,
            cgpa: userProfile?.cgpa ?? prev.cgpa ?? data.student.cgpa,
            target_role: userProfile?.targetRole || prev.target_role || data.student.target_role,
            avatar: userProfile?.photoURL || prev.avatar || data.student.avatar,
            bio: userProfile?.bio || prev.bio || data.student.bio
          }));
        }
        if (data.matched_opportunities) setOpportunities(data.matched_opportunities);
        if (data.chart_data) setChartData(data.chart_data);
        if (data.peer_scores) setPeers(data.peer_scores);
        if (data.learning_stats) setLearningStats(data.learning_stats);
      } else if (currentRole === 'recruiter') {

        const data = await apiService.getRecruiterDashboard();
        if (data.chart_data) setChartData(data.chart_data);
        const mappedOpps: MatchedOpportunity[] = data.top_candidates.map((cand: any, idx: number) => ({
          opportunity_id: cand.student_id,
          title: `${cand.name} (${cand.verified_score}/100)`,
          company: `${cand.college} • CGPA ${cand.cgpa}`,
          match_percentage: cand.match_percentage,
          matched_skills: cand.matched_skills,
          missing_skills: cand.missing_skills,
          stipend: "Shortlisted",
          location: "Pune",
          duration: "Ready to Join",
          deadline: "Interview Pending",
          color_theme: idx === 0 ? 'pink' : idx === 1 ? 'indigo' : 'peach',
          explanation: cand.explanation
        }));
        setOpportunities(mappedOpps);
      } else if (currentRole === 'academician') {
        const data = await apiService.getAcademicianDashboard();
        if (data.chart_data) setChartData(data.chart_data);
        const mappedModules: MatchedOpportunity[] = data.curriculum.missing_industry_skills.map((mod: any, idx: number) => ({
          opportunity_id: `mod_${idx}`,
          title: `Missing: ${mod.skill}`,
          company: `Hiring Demand: ${mod.market_demand_increase}`,
          match_percentage: 100 - (idx * 14),
          matched_skills: ["Syllabus Revision", "Practical Lab"],
          missing_skills: [mod.urgency + " Urgency"],
          stipend: "AICTE Credit",
          location: "SPPU Curriculum",
          duration: "4 Weeks",
          deadline: "Sem 6 Elective",
          color_theme: idx === 0 ? 'pink' : idx === 1 ? 'indigo' : 'peach',
          explanation: `Incorporate into Semester 6 syllabus to boost student campus placement eligibility by 24%.`
        }));
        setOpportunities(mappedModules);
      } else {
        const data = await apiService.getAdminDashboard();
        if (data.chart_data) setChartData(data.chart_data);
      }
    };

    fetchData();
  }, [currentRole]);

  // Handle Opening Co-Pilot with query (Strictly suppressed during active assessments)
  const handleOpenCoPilot = (prompt?: string) => {
    if (isAssessmentActive) return;
    setAgentInitialPrompt(prompt);
    setActiveModal('agent');
  };

  const currentUserName = userProfile?.displayName || (
    currentRole === 'student'
      ? student.name
      : currentRole === 'recruiter'
      ? 'Priya Sharma'
      : currentRole === 'academician'
      ? 'Dr. Rajesh Kulkarni'
      : 'Admin Controller'
  );

  const currentUserTitle = userProfile?.companyName || userProfile?.college || (
    currentRole === 'student'
      ? `${student.department}, ${student.college}`
      : currentRole === 'recruiter'
      ? 'Barclays Pune Campus Talent'
      : currentRole === 'academician'
      ? 'HOD Computer Engineering'
      : 'System Administrator'
  );

  const currentUserAvatar = userProfile?.photoURL || (
    currentRole === 'student'
      ? student.avatar
      : currentRole === 'recruiter'
      ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
      : currentRole === 'academician'
      ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'
      : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  );

  // If on Landing Page, render the dedicated full-width Landing Page Experience
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-porcelain-100 dark:bg-porcelain-950 text-slate-800 dark:text-slate-100 selection:bg-brand-indigo/20 select-none">
        <SkipToContent targetId="main-content" />
        <main id="main-content" tabIndex={-1} className="outline-none">
          <LandingPageView
            onEnterRole={handleEnterRoleFromLanding}
            onOpenAuthModal={() => handleNavigateTab('login')}
            onNavigateTab={handleNavigateTab}
            isDark={isDark}
            toggleDark={toggleDark}
          />
          <GlobalFooter onNavigateTab={handleNavigateTab} />
        </main>

        <AuthModal
          isOpen={activeModal === 'auth'}
          onClose={() => setActiveModal('none')}
          onSelectRole={(r) => {
            handleEnterRoleFromLanding(r);
            setActiveModal('none');
          }}
        />

        <CookieBanner openLegalModal={() => setActiveModal('legal')} />

        <LegalModal
          isOpen={activeModal === 'legal'}
          onClose={() => setActiveModal('none')}
        />
      </div>
    );
  }

  // If on Dedicated Auth Page (Login / Sign Up), render full-screen Auth Experience
  if (activeTab === 'login' || activeTab === 'signup' || activeTab === 'auth') {
    return (
      <div className={`min-h-screen ${isDark ? 'dark bg-[#0f1019] text-slate-100' : 'bg-[#f4f5fa] text-slate-900'} selection:bg-brand-indigo/20 select-none transition-colors duration-200`}>
        <SkipToContent targetId="main-content" />
        <main id="main-content" tabIndex={-1} className="outline-none">
          <AuthView
            onEnterRole={handleEnterRoleFromLanding}
            onNavigateTab={handleNavigateTab}
            initialMode={activeTab === 'signup' ? 'signup' : 'signin'}
            isDark={isDark}
            toggleDark={toggleDark}
          />
        </main>

        <CookieBanner openLegalModal={() => setActiveModal('legal')} />

        <LegalModal
          isOpen={activeModal === 'legal'}
          onClose={() => setActiveModal('none')}
        />
      </div>
    );
  }

  // Render view depending on activeTab (Portal Workspace Mode)
  const renderMainView = () => {
    // 1. Universal Public & Legal Views
    if (activeTab === 'about') {
      return <AboutView onNavigateTab={handleNavigateTab} />;
    }
    if (activeTab === 'contact') {
      return <ContactView onNavigateTab={handleNavigateTab} />;
    }
    if (activeTab === 'privacy-policy') {
      return <PrivacyPolicyView onNavigateTab={handleNavigateTab} />;
    }
    if (activeTab === 'terms-of-service') {
      return <TermsOfServiceView onNavigateTab={handleNavigateTab} />;
    }
    if (activeTab === 'cookie-policy') {
      return <CookiePolicyView onNavigateTab={handleNavigateTab} />;
    }
    if (activeTab === 'accessibility') {
      return <AccessibilityView onNavigateTab={handleNavigateTab} />;
    }
    if (activeTab === '404') {
      return (
        <NotFoundView 
          onBackHome={() => handleNavigateTab('landing')} 
          onGoToDashboard={() => handleNavigateTab('dashboard')} 
        />
      );
    }

    // Universal Collaboration & Research Hub across all 4 roles
    if (activeTab === 'collaboration' || activeTab === 'project-hub' || activeTab === 'projects') {
      return (
        <CollaborationHubView
          currentRole={currentRole}
          onNavigateTab={handleNavigateTab}
          onOpenAssessment={() => setActiveModal('assessment')}
        />
      );
    }

    // 2. Student Portal Views
    if (currentRole === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <DashboardView
              student={student}
              chartData={chartData}
              peers={peers}
              opportunities={opportunities}
              learningStats={learningStats}
              onNavigateTab={handleNavigateTab}
              onOpenAssessment={() => setActiveModal('assessment')}
              onSelectOpportunity={(opp) => {
                setSelectedOpportunity(opp);
                setActiveModal('opportunity_detail');
              }}
              onOpenModal={setActiveModal}
            />
          );
        case 'passport':
        case 'skill-passport':
        case 'skill-verification':
        case 'verification':
        case 'workflow':
        case 'journey':
          return (
            <SkillVerificationView
              studentId={student.id}
              studentName={student.name}
              onNavigateTab={handleNavigateTab}
            />
          );
        case 'opportunities':
          return (
            <OpportunitiesView
              opportunities={opportunities}
              student={student}
              onOpenOpportunityDetail={(opp) => {
                setSelectedOpportunity(opp);
                setActiveModal('opportunity_detail');
              }}
              onOpenCoPilot={handleOpenCoPilot}
            />
          );
        case 'codelab':
        case 'code-lab':
          return <CodeLabView />;
        case 'aptitude':
          return <AptitudeArenaView />;
        case 'transcript':
          return <PortfolioTranscriptView student={student} />;
        case 'profile':
          return (
            <ProfileView
              student={student}
              initialTab="dossier"
              onOpenAssessment={() => setActiveModal('assessment')}
              onNavigateTab={handleNavigateTab}
            />
          );
        case 'incognito':
        case 'talent-visibility':
          return (
            <ProfileView
              student={student}
              initialTab="incognito"
              onOpenAssessment={() => setActiveModal('assessment')}
              onNavigateTab={handleNavigateTab}
            />
          );
        default:
          return (
            <NotFoundView 
              onBackHome={() => handleNavigateTab('landing')} 
              onGoToDashboard={() => handleNavigateTab('dashboard')} 
            />
          );
      }
    }

    // 3. Academician / TPO Perspective
    if (currentRole === 'academician') {
      return (
        <AcademicianPortalView
          onNavigateTab={handleNavigateTab}
          academicianEmail={userProfile?.email || 'dr.patil@jspmrscoe.edu.in'}
        />
      );
    }

    // 4. Recruiter / Corporate Perspective
    if (currentRole === 'recruiter') {
      return (
        <RecruiterPortalView
          onNavigateTab={handleNavigateTab}
          recruiterEmail={userProfile?.email || 'priya.sharma@barclays.com'}
        />
      );
    }

    // 5. Platform Admin Perspective
    if (currentRole === 'admin') {
      return (
        <AdminPortalView
          onNavigateTab={handleNavigateTab}
        />
      );
    }

    // Fallback Default
    return (
      <NotFoundView
        onBackHome={() => handleNavigateTab('landing')}
        onGoToDashboard={() => handleNavigateTab('dashboard')}
      />
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-porcelain-100 dark:bg-porcelain-950 text-slate-800 dark:text-slate-100 selection:bg-brand-indigo/20 select-none">
      {/* Accessible Skip To Content Target */}
      <SkipToContent targetId="main-content" />

      {/* 1. Left Icon Navigation Rail */}
      <LeftIconRail
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        isDark={isDark}
        toggleDark={toggleDark}
        openModal={setActiveModal}
        currentRole={currentRole}
      />

      {/* 2. Main Application Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <TopNavBar
          currentRole={currentRole}
          setRole={(r) => handleEnterRoleFromLanding(r)}
          activeTab={activeTab}
          setActiveTab={handleNavigateTab}
          openModal={setActiveModal}
          userName={currentUserName}
          userAvatar={currentUserAvatar}
          userTitle={currentUserTitle}
          onGoToLanding={() => handleNavigateTab('landing')}
          onSignOut={handleSignOut}
        />

        {/* Content Body with Error Boundary Isolation */}
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 md:px-8 pb-8 overflow-y-auto outline-none">
          <ErrorBoundary>
            {renderMainView()}
            <GlobalFooter onNavigateTab={handleNavigateTab} />
          </ErrorBoundary>
        </main>
      </div>

      {/* 3. Floating Autonomous AI Co-Pilot Button (Strictly unmounted during active assessments) */}
      {!isAssessmentActive && (
        <FloatingCopilotButton
          disabled={isAssessmentActive}
          onOpenAgent={(prompt) => handleOpenCoPilot(prompt)}
        />
      )}

      {/* Modals & Slide-Overs */}
      <AgentChatDrawer
        isOpen={activeModal === 'agent' && !isAssessmentActive}
        onClose={() => {
          setActiveModal('none');
          setAgentInitialPrompt(undefined);
        }}
        role={currentRole}
        userId={student.id}
        initialPrompt={agentInitialPrompt}
      />

      <OpportunityModal
        isOpen={activeModal === 'opportunity_detail'}
        onClose={() => {
          setActiveModal('none');
          setSelectedOpportunity(null);
        }}
        opportunity={selectedOpportunity}
        role={currentRole}
      />

      <AuthModal
        isOpen={activeModal === 'auth'}
        onClose={() => setActiveModal('none')}
        onSelectRole={(r) => {
          handleEnterRoleFromLanding(r);
          setActiveModal('none');
        }}
      />

      <ProfileModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal('none')}
        student={student}
        onOpenAssessment={() => {
          setIsAssessmentActive(true);
          setActiveModal('assessment');
        }}
      />

      <AboutModal
        isOpen={activeModal === 'about'}
        onClose={() => setActiveModal('none')}
      />

      <ContactModal
        isOpen={activeModal === 'contact'}
        onClose={() => setActiveModal('none')}
      />

      <LegalModal
        isOpen={activeModal === 'legal'}
        onClose={() => setActiveModal('none')}
      />

      <AssessmentModal
        isOpen={activeModal === 'assessment'}
        onClose={() => {
          setActiveModal('none');
          setIsAssessmentActive(false);
        }}
        onVerificationSuccess={handleVerificationSuccess}
      />

      <OpportunitiesExplorerModal
        isOpen={activeModal === 'opportunities'}
        onClose={() => setActiveModal('none')}
        opportunities={opportunities}
        role={currentRole}
        onSelectOpportunity={(opp) => {
          setSelectedOpportunity(opp);
          setActiveModal('opportunity_detail');
        }}
      />

      {/* Cookie Consent Banner */}
      <CookieBanner openLegalModal={() => setActiveModal('legal')} />
    </div>
  );
};
