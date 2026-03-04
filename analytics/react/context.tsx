'use client';

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { IAnalyticsService, AnalyticsEvent, EventQuery } from '../types';
import { AnalyticsFactory } from '../factory';

/**
 * Analytics React Context
 * 
 * Provides analytics service through React context with proper lifecycle management.
 */
interface AnalyticsContextValue {
  service: IAnalyticsService;
  track: (event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>) => Promise<void>;
  query: (query?: EventQuery) => Promise<AnalyticsEvent[]>;
  flush: () => Promise<void>;
  clear: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
  service?: IAnalyticsService;
  children: ReactNode;
}

/**
 * Analytics Provider Component
 * 
 * Wraps app with analytics context and handles service lifecycle.
 */
export function AnalyticsProvider({ 
  service: providedService, 
  children 
}: AnalyticsProviderProps) {
  const serviceRef = useRef<IAnalyticsService | null>(null);
  
  // Initialize service
  if (!serviceRef.current) {
    serviceRef.current = providedService || AnalyticsFactory.createDefaultService();
  }
  
  const service = serviceRef.current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('destroy' in service) {
        (service as any).destroy();
      }
    };
  }, [service]);

  const contextValue: AnalyticsContextValue = {
    service,
    track: (event) => service.track(event),
    query: (query) => service.query(query),
    flush: () => service.flush(),
    clear: () => service.clear(),
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access analytics service
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);
  
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  
  return context;
}

/**
 * Hook for automatic page view tracking
 */
export function usePageTracking(path?: string, title?: string) {
  const { track } = useAnalytics();
  
  useEffect(() => {
    const startTime = performance.now();
    
    // Small delay to ensure page is loaded
    const timer = setTimeout(() => {
      const loadTime = performance.now() - startTime;
      
      track({
        type: 'page_view',
        data: {
          path: path || window.location.pathname,
          title: title || document.title,
          loadTime,
          referrer: document.referrer || undefined,
        },
      }).catch((error) => {
        console.warn('Failed to track page view:', error);
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [path, title, track]);
}

/**
 * Hook for session lifecycle tracking
 */
export function useSessionTracking() {
  const { track } = useAnalytics();
  
  useEffect(() => {
    // Track session start
    track({
      type: 'session_lifecycle',
      data: {
        event: 'start',
      },
    }).catch((error) => {
      console.warn('Failed to track session start:', error);
    });
    
    // Track session end on unload
    const handleUnload = () => {
      track({
        type: 'session_lifecycle',
        data: {
          event: 'end',
        },
      }).catch(() => {
        // Ignore errors during unload
      });
    };
    
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [track]);
}