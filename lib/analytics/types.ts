/**
 * Lightweight Analytics Types
 * 
 * Strongly typed event system for client-side analytics
 * with easy backend migration path.
 */

// Base event structure
export interface BaseEvent {
  id: string;
  timestamp: number;
  sessionId: string;
  type: string;
}

// Specific event types
export interface PageViewEvent extends BaseEvent {
  type: 'page_view';
  data: {
    path: string;
    title?: string;
    loadTime?: number;
  };
}

export interface UserActionEvent extends BaseEvent {
  type: 'user_action';
  data: {
    action: string;
    target: string;
    metadata?: Record<string, any>;
  };
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  data: {
    message: string;
    stack?: string;
    context?: Record<string, any>;
  };
}

// Union of all event types
export type AnalyticsEvent = PageViewEvent | UserActionEvent | ErrorEvent;

// Query filters
export interface EventFilter {
  type?: string;
  sessionId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

// Analytics configuration
export interface AnalyticsConfig {
  storage: 'localStorage' | 'backend';
  endpoint?: string;
  maxEvents?: number;
  sessionTimeout?: number;
}