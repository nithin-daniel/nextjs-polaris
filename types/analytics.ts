/**
 * Analytics Event Schema
 * 
 * Defines the structure for all trackable events in the application.
 * Each event follows a consistent schema for easy aggregation and analysis.
 */

// Base event interface that all events must extend
export interface BaseEvent {
  id: string;                    // Unique event ID (UUID)
  timestamp: number;             // Unix timestamp
  sessionId: string;             // Session identifier
  userId?: string;               // Optional user identifier
  type: EventType;               // Event type discriminator
  source: 'web' | 'mobile';     // Platform source
  userAgent: string;             // Browser/device info
  url: string;                   // Current page URL
  referrer?: string;             // Previous page URL
}

// Event type enumeration
export type EventType = 
  | 'page_view'
  | 'product_click'
  | 'modal_open'
  | 'modal_close'
  | 'bulk_action'
  | 'search'
  | 'error'
  | 'session_start'
  | 'session_end';

// Page view event
export interface PageViewEvent extends BaseEvent {
  type: 'page_view';
  properties: {
    pageName: string;            // Page identifier (e.g., 'products', 'dashboard')
    pageTitle: string;           // Page title
    loadTime?: number;           // Page load time in ms
    previousPage?: string;       // Previous page name
  };
}

// Product interaction event
export interface ProductClickEvent extends BaseEvent {
  type: 'product_click';
  properties: {
    productId: string;           // Product identifier
    productTitle: string;        // Product name
    productPrice: number;        // Product price
    productCategory?: string;    // Product category
    action: 'view' | 'edit' | 'delete' | 'add_to_cart'; // Action taken
    position?: number;           // Position in list (for ranking)
    listType?: 'table' | 'grid' | 'search_results'; // Context
  };
}

// Modal interaction event
export interface ModalEvent extends BaseEvent {
  type: 'modal_open' | 'modal_close';
  properties: {
    modalType: string;           // Modal identifier (e.g., 'product_detail', 'confirmation')
    modalSize?: 'small' | 'medium' | 'large' | 'fullScreen';
    trigger?: string;            // What triggered the modal
    duration?: number;           // Time modal was open (for close events)
    productId?: string;          // Associated product (if applicable)
  };
}

// Bulk action event
export interface BulkActionEvent extends BaseEvent {
  type: 'bulk_action';
  properties: {
    action: 'delete' | 'export' | 'edit' | 'duplicate';
    itemCount: number;           // Number of items selected
    itemIds: string[];           // IDs of affected items
    success: boolean;            // Whether action succeeded
    errorMessage?: string;       // Error details if failed
  };
}

// Search event
export interface SearchEvent extends BaseEvent {
  type: 'search';
  properties: {
    query: string;               // Search query
    resultCount: number;         // Number of results
    filters?: Record<string, any>; // Applied filters
    sortBy?: string;             // Sort criteria
  };
}

// Error event
export interface ErrorEvent extends BaseEvent {
  type: 'error';
  properties: {
    errorType: 'api' | 'client' | 'network' | 'validation';
    errorMessage: string;        // Error description
    errorCode?: string | number; // Error code
    stackTrace?: string;         // Stack trace (if available)
    context?: Record<string, any>; // Additional context
  };
}

// Session events
export interface SessionEvent extends BaseEvent {
  type: 'session_start' | 'session_end';
  properties: {
    duration?: number;           // Session duration in ms (for end events)
    pageCount?: number;          // Pages visited in session
    eventCount?: number;         // Total events in session
    exitPage?: string;           // Last page visited (for end events)
  };
}

// Union type for all possible events
export type AnalyticsEvent = 
  | PageViewEvent
  | ProductClickEvent
  | ModalEvent
  | BulkActionEvent
  | SearchEvent
  | ErrorEvent
  | SessionEvent;

// Session data structure
export interface SessionData {
  id: string;
  startTime: number;
  lastActivityTime: number;
  pageViews: number;
  events: number;
  isActive: boolean;
}

// Analytics configuration
export interface AnalyticsConfig {
  sessionTimeout: number;      // Session timeout in ms (default: 30 min)
  maxEventsInMemory: number;   // Max events to keep in memory (default: 1000)
  batchSize: number;           // Events to process at once (default: 10)
  enableDebugMode: boolean;    // Enable console logging
  trackingEnabled: boolean;    // Global tracking toggle
}

// Aggregated analytics data structures
export interface PageAnalytics {
  pageName: string;
  totalViews: number;
  uniqueViews: number;
  averageLoadTime: number;
  bounceRate: number;
  topReferrers: Array<{ url: string; count: number }>;
  viewsByHour: Record<string, number>;
}

export interface ProductAnalytics {
  productId: string;
  productTitle: string;
  totalClicks: number;
  uniqueClicks: number;
  clicksByAction: Record<string, number>;
  averagePosition: number;
  conversionRate: number;
}

export interface SessionAnalytics {
  totalSessions: number;
  averageDuration: number;
  averagePageViews: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  sessionsByHour: Record<string, number>;
}