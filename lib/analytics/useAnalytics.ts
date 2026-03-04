'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from './service';
import { trackPageView, trackUserAction, trackError } from './helpers';
import { EventFilter, AnalyticsEvent } from './types';

/**
 * React Hook for Analytics
 * 
 * Provides easy analytics integration for React components
 */
export const useAnalytics = () => {
  const pathname = usePathname();

  // Auto-track page views
  useEffect(() => {
    if (pathname) {
      const startTime = performance.now();
      
      // Track page view on route change
      const timer = setTimeout(() => {
        const loadTime = performance.now() - startTime;
        trackPageView(pathname, document.title, loadTime);
      }, 100); // Small delay to ensure page is loaded
      
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Tracking methods
  const track = useMemo(() => ({
    pageView: trackPageView,
    userAction: trackUserAction,
    error: trackError,
    
    // Product specific
    productView: (id: string, name?: string) => 
      trackUserAction('product_view', 'product', { id, name }),
      
    productClick: (id: string, position?: number) => 
      trackUserAction('product_click', 'product', { id, position }),
      
    // UI interactions
    buttonClick: (buttonName: string, context?: Record<string, any>) => 
      trackUserAction('button_click', 'button', { buttonName, ...context }),
      
    modalOpen: (modalType: string) => 
      trackUserAction('modal_open', 'modal', { modalType }),
      
    modalClose: (modalType: string, duration?: number) => 
      trackUserAction('modal_close', 'modal', { modalType, duration }),
      
    // Custom event
    custom: (action: string, target: string, metadata?: Record<string, any>) => 
      trackUserAction(action, target, metadata)
  }), []);

  // Data retrieval
  const getEvents = useCallback(async (filter?: EventFilter): Promise<AnalyticsEvent[]> => {
    return analytics.getEvents(filter);
  }, []);

  const getSessionId = useCallback(() => {
    return analytics.getSessionId();
  }, []);

  const clearEvents = useCallback(async () => {
    return analytics.clearEvents();
  }, []);

  return {
    track,
    getEvents,
    getSessionId,
    clearEvents
  };
};

export default useAnalytics;