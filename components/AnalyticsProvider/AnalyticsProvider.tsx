'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { AnalyticsConfig } from '@/types/analytics';

/**
 * Analytics Context
 */
interface AnalyticsContextType {
  trackError: (error: Error, context?: Record<string, any>) => void;
  trackPerformance: (metric: string, value: number) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

/**
 * Analytics Provider Props
 */
interface AnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<AnalyticsConfig>;
  enableErrorBoundary?: boolean;
}

/**
 * Analytics Provider Component
 * 
 * Provides analytics context and automatic error tracking.
 * Wraps the app to enable global analytics functionality.
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  config,
  enableErrorBoundary = true
}) => {
  useEffect(() => {
    // Update analytics config if provided
    if (config) {
      analyticsService.updateConfig(config);
    }

    // Set up global error tracking
    const handleGlobalError = (event: ErrorEvent) => {
      analyticsService.trackError(
        'client',
        event.message,
        {
          stackTrace: event.error?.stack,
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analyticsService.trackError(
        'client',
        `Unhandled Promise Rejection: ${event.reason}`,
        {
          context: {
            reason: event.reason,
            type: 'unhandledrejection'
          }
        }
      );
    };

    // Add global error listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      analyticsService.destroy();
    };
  }, [config]);

  const trackError = (error: Error, context?: Record<string, any>) => {
    analyticsService.trackError(
      'client',
      error.message,
      {
        stackTrace: error.stack,
        context
      }
    );
  };

  const trackPerformance = (metric: string, value: number) => {
    // Track custom performance metrics
    console.log('[Analytics] Performance metric:', metric, value);
    // You could extend this to track specific performance events
  };

  const contextValue: AnalyticsContextType = {
    trackError,
    trackPerformance
  };

  if (enableErrorBoundary) {
    return (
      <AnalyticsContext.Provider value={contextValue}>
        <AnalyticsErrorBoundary>
          {children}
        </AnalyticsErrorBoundary>
      </AnalyticsContext.Provider>
    );
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

/**
 * Error Boundary for Analytics Tracking
 */
class AnalyticsErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track the error
    analyticsService.trackError(
      'client',
      error.message,
      {
        stackTrace: error.stack,
        context: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        }
      }
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>An error occurred and has been tracked. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '10px 20px', 
              marginTop: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to use analytics context
 */
export const useAnalyticsContext = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider');
  }
  return context;
};

export default AnalyticsProvider;