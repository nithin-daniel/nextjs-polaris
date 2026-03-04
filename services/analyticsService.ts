'use client';

import { v4 as uuidv4 } from 'uuid';
import {
  AnalyticsEvent,
  BaseEvent,
  EventType,
  SessionData,
  AnalyticsConfig,
  PageViewEvent,
  ProductClickEvent,
  ModalEvent,
  BulkActionEvent,
  SearchEvent,
  ErrorEvent,
  SessionEvent
} from '@/types/analytics';

/**
 * Client-Side Analytics Service
 * 
 * Provides comprehensive event tracking without backend dependency.
 * All data is stored in localStorage with automatic session management.
 */
class AnalyticsService {
  private config: AnalyticsConfig;
  private sessionData: SessionData | null = null;
  private eventBuffer: AnalyticsEvent[] = [];
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxEventsInMemory: 1000,
      batchSize: 10,
      enableDebugMode: false,
      trackingEnabled: true,
      ...config
    };

    if (typeof window !== 'undefined') {
      this.initializeSession();
      this.startSessionMonitoring();
      this.loadEventBuffer();
    }
  }

  /**
   * Initialize or restore session
   */
  private initializeSession(): void {
    const existingSession = this.getStoredSession();
    const now = Date.now();

    if (existingSession && (now - existingSession.lastActivityTime) < this.config.sessionTimeout) {
      // Resume existing session
      this.sessionData = {
        ...existingSession,
        lastActivityTime: now,
        isActive: true
      };
      this.updateStoredSession();
    } else {
      // Start new session
      this.startNewSession();
    }
  }

  /**
   * Start a new session
   */
  private startNewSession(): void {
    const sessionId = uuidv4();
    const now = Date.now();

    this.sessionData = {
      id: sessionId,
      startTime: now,
      lastActivityTime: now,
      pageViews: 0,
      events: 0,
      isActive: true
    };

    this.updateStoredSession();
    this.trackSessionStart();
  }

  /**
   * Track session start event
   */
  private trackSessionStart(): void {
    if (!this.sessionData) return;

    const baseEvent = this.createBaseEvent('session_start');
    const event: SessionEvent = {
      ...baseEvent,
      type: 'session_start',
      properties: {}
    };

    this.trackEvent(event, false); // Don't increment session events for session start
  }

  /**
   * Monitor session activity and handle timeout
   */
  private startSessionMonitoring(): void {
    // Check session every minute
    this.sessionCheckInterval = setInterval(() => {
      if (this.sessionData && this.sessionData.isActive) {
        const now = Date.now();
        const timeSinceActivity = now - this.sessionData.lastActivityTime;

        if (timeSinceActivity >= this.config.sessionTimeout) {
          this.endSession();
        }
      }
    }, 60000); // Check every minute

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  /**
   * End the current session
   */
  private endSession(): void {
    if (!this.sessionData || !this.sessionData.isActive) return;

    const duration = Date.now() - this.sessionData.startTime;
    
    const baseEvent = this.createBaseEvent('session_end');
    const event: SessionEvent = {
      ...baseEvent,
      type: 'session_end',
      properties: {
        duration,
        pageCount: this.sessionData.pageViews,
        eventCount: this.sessionData.events,
        exitPage: window.location.pathname
      }
    };

    this.sessionData.isActive = false;
    this.updateStoredSession();
    this.trackEvent(event, false);
    this.flushEventBuffer();
  }

  /**
   * Create base event properties
   */
  private createBaseEvent(type: EventType): BaseEvent {
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionData?.id || 'unknown',
      type,
      source: 'web',
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer || undefined
    };
  }

  /**
   * Track any analytics event
   */
  public trackEvent(event: AnalyticsEvent, updateSession: boolean = true): void {
    if (!this.config.trackingEnabled) return;

    // Update session activity
    if (updateSession && this.sessionData) {
      this.sessionData.lastActivityTime = Date.now();
      this.sessionData.events++;
      this.updateStoredSession();
    }

    // Add to buffer
    this.eventBuffer.push(event);
    
    // Store events in localStorage
    this.storeEvent(event);
    
    // Debug logging
    if (this.config.enableDebugMode) {
      console.log('[Analytics]', event.type, event);
    }

    // Manage buffer size
    if (this.eventBuffer.length > this.config.maxEventsInMemory) {
      this.eventBuffer = this.eventBuffer.slice(-this.config.maxEventsInMemory);
    }
  }

  /**
   * Track page view
   */
  public trackPageView(pageName: string, pageTitle?: string, loadTime?: number): void {
    const baseEvent = this.createBaseEvent('page_view');
    const event: PageViewEvent = {
      ...baseEvent,
      type: 'page_view',
      properties: {
        pageName,
        pageTitle: pageTitle || document.title,
        loadTime,
        previousPage: this.getPreviousPage()
      }
    };

    if (this.sessionData) {
      this.sessionData.pageViews++;
    }

    this.setPreviousPage(pageName);
    this.trackEvent(event);
  }

  /**
   * Track product interaction
   */
  public trackProductClick(
    productId: string,
    productTitle: string,
    productPrice: number,
    action: 'view' | 'edit' | 'delete' | 'add_to_cart',
    options: {
      productCategory?: string;
      position?: number;
      listType?: 'table' | 'grid' | 'search_results';
    } = {}
  ): void {
    const baseEvent = this.createBaseEvent('product_click');
    const event: ProductClickEvent = {
      ...baseEvent,
      type: 'product_click',
      properties: {
        productId,
        productTitle,
        productPrice,
        action,
        ...options
      }
    };

    this.trackEvent(event);
  }

  /**
   * Track modal interactions
   */
  public trackModalOpen(
    modalType: string,
    options: {
      modalSize?: 'small' | 'medium' | 'large' | 'fullScreen';
      trigger?: string;
      productId?: string;
    } = {}
  ): void {
    const baseEvent = this.createBaseEvent('modal_open');
    const event: ModalEvent = {
      ...baseEvent,
      type: 'modal_open',
      properties: {
        modalType,
        ...options
      }
    };

    this.trackEvent(event);
  }

  public trackModalClose(
    modalType: string,
    duration: number,
    options: {
      modalSize?: 'small' | 'medium' | 'large' | 'fullScreen';
      productId?: string;
    } = {}
  ): void {
    const baseEvent = this.createBaseEvent('modal_close');
    const event: ModalEvent = {
      ...baseEvent,
      type: 'modal_close',
      properties: {
        modalType,
        duration,
        ...options
      }
    };

    this.trackEvent(event);
  }

  /**
   * Track bulk actions
   */
  public trackBulkAction(
    action: 'delete' | 'export' | 'edit' | 'duplicate',
    itemIds: string[],
    success: boolean,
    errorMessage?: string
  ): void {
    const baseEvent = this.createBaseEvent('bulk_action');
    const event: BulkActionEvent = {
      ...baseEvent,
      type: 'bulk_action',
      properties: {
        action,
        itemCount: itemIds.length,
        itemIds,
        success,
        errorMessage
      }
    };

    this.trackEvent(event);
  }

  /**
   * Track search actions
   */
  public trackSearch(
    query: string,
    resultCount: number,
    options: {
      filters?: Record<string, any>;
      sortBy?: string;
    } = {}
  ): void {
    const baseEvent = this.createBaseEvent('search');
    const event: SearchEvent = {
      ...baseEvent,
      type: 'search',
      properties: {
        query,
        resultCount,
        ...options
      }
    };

    this.trackEvent(event);
  }

  /**
   * Track errors
   */
  public trackError(
    errorType: 'api' | 'client' | 'network' | 'validation',
    errorMessage: string,
    options: {
      errorCode?: string | number;
      stackTrace?: string;
      context?: Record<string, any>;
    } = {}
  ): void {
    const baseEvent = this.createBaseEvent('error');
    const event: ErrorEvent = {
      ...baseEvent,
      type: 'error',
      properties: {
        errorType,
        errorMessage,
        ...options
      }
    };

    this.trackEvent(event);
  }

  /**
   * Storage methods
   */
  private getStoredSession(): SessionData | null {
    try {
      const stored = localStorage.getItem('analytics_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private updateStoredSession(): void {
    if (this.sessionData) {
      localStorage.setItem('analytics_session', JSON.stringify(this.sessionData));
    }
  }

  private storeEvent(event: AnalyticsEvent): void {
    try {
      const events = this.getStoredEvents();
      events.push(event);
      
      // Keep only recent events (last 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentEvents = events.filter(e => e.timestamp > weekAgo);
      
      localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  private getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('analytics_events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private loadEventBuffer(): void {
    this.eventBuffer = this.getStoredEvents();
  }

  private flushEventBuffer(): void {
    // In a real app, you might send events to an external service here
    if (this.config.enableDebugMode) {
      console.log('[Analytics] Session ended. Event buffer:', this.eventBuffer);
    }
  }

  private getPreviousPage(): string | undefined {
    return localStorage.getItem('analytics_previous_page') || undefined;
  }

  private setPreviousPage(pageName: string): void {
    localStorage.setItem('analytics_previous_page', pageName);
  }

  /**
   * Public API methods
   */
  public getEvents(filter?: Partial<{ type: EventType; sessionId: string }>): AnalyticsEvent[] {
    let events = this.getStoredEvents();
    
    if (filter) {
      if (filter.type) {
        events = events.filter(e => e.type === filter.type);
      }
      if (filter.sessionId) {
        events = events.filter(e => e.sessionId === filter.sessionId);
      }
    }
    
    return events;
  }

  public getCurrentSession(): SessionData | null {
    return this.sessionData;
  }

  public clearAllData(): void {
    localStorage.removeItem('analytics_events');
    localStorage.removeItem('analytics_session');
    localStorage.removeItem('analytics_previous_page');
    this.eventBuffer = [];
    this.sessionData = null;
  }

  public updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    this.endSession();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService({
  enableDebugMode: process.env.NODE_ENV === 'development'
});

export default analyticsService;