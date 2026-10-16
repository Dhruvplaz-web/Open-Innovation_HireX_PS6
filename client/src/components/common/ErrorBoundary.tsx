import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, ShieldAlert, Lock, FileQuestion, ServerCrash } from 'lucide-react';
import { SEOHead } from './SEOHead';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  statusCode: number;
}

export interface ErrorStatusViewProps {
  statusCode: 400 | 401 | 403 | 404 | 500 | number;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onNavigateHome?: () => void;
}

export const ErrorStatusView: React.FC<ErrorStatusViewProps> = ({
  statusCode,
  title,
  message,
  onRetry,
  onNavigateHome = () => { window.location.href = '/'; }
}) => {
  const getErrorDetails = () => {
    switch (statusCode) {
      case 400:
        return {
          icon: AlertCircle,
          defaultTitle: 'Bad Request',
          defaultMessage: 'The request could not be processed due to invalid parameters or formatting.',
          color: 'text-amber-500'
        };
      case 401:
        return {
          icon: Lock,
          defaultTitle: 'Session Expired or Unauthorized',
          defaultMessage: 'Your authentication credentials could not be verified. Please log in again to continue.',
          color: 'text-indigo-500'
        };
      case 403:
        return {
          icon: ShieldAlert,
          defaultTitle: 'Access Forbidden',
          defaultMessage: 'You do not have the required permissions or verified role credentials to access this resource.',
          color: 'text-rose-500'
        };
      case 404:
        return {
          icon: FileQuestion,
          defaultTitle: 'Resource Not Found',
          defaultMessage: "The page or verified asset you're looking for doesn't exist or may have been moved.",
          color: 'text-slate-600 dark:text-slate-400'
        };
      case 500:
      default:
        return {
          icon: ServerCrash,
          defaultTitle: 'System Error',
          defaultMessage: 'An unexpected application error occurred. Our team has been notified and services remain isolated.',
          color: 'text-rose-600'
        };
    }
  };

  const details = getErrorDetails();
  const IconComponent = details.icon;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 min-h-[50vh]">
      <SEOHead
        title={`${statusCode} - ${title || details.defaultTitle} | HireX`}
        description="An error occurred while loading this view."
        path={`/error/${statusCode}`}
        noIndex={true}
      />

      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm">
        <IconComponent className={`w-8 h-8 ${details.color}`} />
      </div>

      <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-3">
        ERROR {statusCode}
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
        {title || details.defaultTitle}
      </h1>

      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
        {message || details.defaultMessage}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}

        <button
          onClick={onNavigateHome}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition active:scale-95 focus-visible:outline-slate-900 dark:focus-visible:outline-white"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </button>
      </div>
    </div>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    statusCode: 500
  };

  public static getDerivedStateFromError(error: Error): State {
    // If the error message or name denotes 401/403/404, capture it
    let code = 500;
    if (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')) code = 401;
    else if (error.message.includes('403') || error.message.toLowerCase().includes('forbidden')) code = 403;
    else if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) code = 404;
    else if (error.message.includes('400')) code = 400;

    return { hasError: true, statusCode: code };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Production hygiene: log sanitarily without exposing sensitive state to clients
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, statusCode: 500 });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorStatusView
          statusCode={this.state.statusCode}
          onRetry={this.handleReset}
          onNavigateHome={() => {
            this.setState({ hasError: false, statusCode: 500 });
            window.location.href = '/';
          }}
        />
      );
    }

    return this.props.children;
  }
}
