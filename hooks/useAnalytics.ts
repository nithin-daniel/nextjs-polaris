'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsService } from '@/services/analyticsService';

/**
 * Analytics Hook
 * 
 * Provides easy-to-use analytics tracking methods for React components.
 * Automatically handles page view tracking and provides methods for
 * tracking user interactions.
 */
export const useAnalytics = () => {
  const pathname = usePathname();
  const pageLoadStartTime = useRef<number>(Date.now());
  const modalOpenTimes = useRef<Map<string, number>>(new Map());

  // Auto-track page views
  useEffect(() => {
    const loadTime = Date.now() - pageLoadStartTime.current;
    const pageName = pathname.replace('/', '') || 'home';
    
    analyticsService.trackPageView(pageName, document.title, loadTime);
  }, [pathname]);

  // Track product interactions
  const trackProductClick = useCallback((
    productId: string,
    productTitle: string,
    productPrice: number,
    action: 'view' | 'edit' | 'delete' | 'add_to_cart',
    options?: {
      productCategory?: string;
      position?: number;
      listType?: 'table' | 'grid' | 'search_results';
    }
  ) => {
    analyticsService.trackProductClick(
      productId,
      productTitle,
      productPrice,
      action,
      options
    );
  }, []);

  // Track modal interactions with automatic timing
  const trackModalOpen = useCallback((modalType: string, options?: {
    modalSize?: 'small' | 'medium' | 'large' | 'fullScreen';
    trigger?: string;
    productId?: string;
  }) => {
    const openTime = Date.now();
    modalOpenTimes.current.set(modalType, openTime);
    
    analyticsService.trackModalOpen(modalType, options);
  }, []);

  const trackModalClose = useCallback((modalType: string, options?: {
    modalSize?: 'small' | 'medium' | 'large' | 'fullScreen';
    productId?: string;
  }) => {
    const openTime = modalOpenTimes.current.get(modalType);
    const duration = openTime ? Date.now() - openTime : 0;
    
    modalOpenTimes.current.delete(modalType);
    analyticsService.trackModalClose(modalType, duration, options);
  }, []);

  // Track bulk actions
  const trackBulkAction = useCallback((
    action: 'delete' | 'export' | 'edit' | 'duplicate',
    itemIds: string[],
    success: boolean,
    errorMessage?: string
  ) => {
    analyticsService.trackBulkAction(action, itemIds, success, errorMessage);
  }, []);

  // Track search
  const trackSearch = useCallback((
    query: string,
    resultCount: number,
    options?: {
      filters?: Record<string, any>;
      sortBy?: string;
    }
  ) => {
    analyticsService.trackSearch(query, resultCount, options);
  }, []);

  // Track errors
  const trackError = useCallback((
    errorType: 'api' | 'client' | 'network' | 'validation',
    errorMessage: string,
    options?: {
      errorCode?: string | number;
      stackTrace?: string;
      context?: Record<string, any>;
    }
  ) => {
    analyticsService.trackError(errorType, errorMessage, options);
  }, []);

  // Custom event tracking
  const trackCustomEvent = useCallback((eventType: string, properties: Record<string, any>) => {
    // For custom events not covered by the predefined types
    // Track custom event with analytics service
    // TODO: Replace with unified analytics system
    console.debug('[Analytics] Custom event:', eventType, properties);
    // You could extend the analytics service to handle custom events
  }, []);

  return {
    trackProductClick,
    trackModalOpen,
    trackModalClose,
    trackBulkAction,
    trackSearch,
    trackError,
    trackCustomEvent
  };
};

/**
 * Page Analytics Hook
 * 
 * Provides access to current session data and page analytics
 */
export const usePageAnalytics = () => {
  const getCurrentSession = useCallback(() => {
    return analyticsService.getCurrentSession();
  }, []);

  const getEvents = useCallback((filter?: { type?: string; sessionId?: string }) => {
    return analyticsService.getEvents(filter as any);
  }, []);

  const clearAnalyticsData = useCallback(() => {
    analyticsService.clearAllData();
  }, []);

  return {
    getCurrentSession,
    getEvents,
    clearAnalyticsData
  };
};

export default useAnalytics;