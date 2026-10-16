import React from 'react';
import { Home, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { SEOHead } from './SEOHead';

interface NotFoundViewProps {
  onBackHome?: () => void;
  onGoToDashboard?: () => void;
  onReturnHome?: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ 
  onBackHome, 
  onGoToDashboard, 
  onReturnHome 
}) => {
  const handleHome = onBackHome || onReturnHome || (() => { window.location.href = '/'; });
  const handleDashboard = onGoToDashboard || onReturnHome || handleHome;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 min-h-[60vh]">
      <SEOHead
        title="404 - Page Not Found | HireX"
        description="The requested page could not be found."
        path="/404"
        noIndex={true}
      />

      <div className="w-20 h-20 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 flex items-center justify-center mb-6 shadow-sm">
        <span className="text-3xl font-black font-mono tracking-tight">404</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        Page Not Found
      </h1>

      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleHome}
          className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition active:scale-95 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={handleDashboard}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Go to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
