import React from 'react';
import { CodeLabView } from './CodeLabView';

/**
 * Standalone CodeLab App Wrapper
 * Can be rendered directly as the root component or mounted in any existing React app.
 */
export const CodeLabApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans antialiased">
      <CodeLabView />
    </div>
  );
};

export default CodeLabApp;
