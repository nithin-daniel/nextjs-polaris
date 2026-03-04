/**
 * Analytics Core Types
 * 
 * Unified type system for analytics events with consistent schema.
 * Designed for type safety and easy backend migration.
 */

// Core event interface
export interface AnalyticsEvent {
  readonly id: string;
  readonly timestamp: number;
  readonly sessionId: string;
  readonly type: EventType;
  readonly data: EventData;
  readonly metadata?: EventMetadata;
}

// Event types (extensible enum pattern)
export type EventType = 
  | 'page_view'
  | 'user_action'
  | 'error'
  | 'session_lifecycle';

// Event data (discriminated union)
export type EventData = 
  | PageViewData
  | UserActionData
  | ErrorData
  | SessionLifecycleData;

// Specific event data types
export interface PageViewData {
  path: string;
  title?: string;
  loadTime?: number;
  referrer?: string;
}

export interface UserActionData {
  action: string;
  target: string;
  context?: Record<string, unknown>;
}

export interface ErrorData {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, unknown>;
}

export interface SessionLifecycleData {
  event: 'start' | 'end';
  duration?: number;
  pageCount?: number;
}

// Event metadata (optional enrichment)
export interface EventMetadata {
  userAgent?: string;
  viewport?: { width: number; height: number };
  timezone?: string;
  userId?: string;
}

// Query and filtering
export interface EventQuery {
  type?: EventType | EventType[];
  sessionId?: string;
  dateRange?: {
    start: number;
    end: number;
  };
  limit?: number;
  offset?: number;
}

// Configuration
export interface AnalyticsConfig {
  sessionTimeout: number;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  enableLocalStorage: boolean;
  enableDebugMode: boolean;
}

// Service contracts
export interface IEventStorage {
  store(events: AnalyticsEvent[]): Promise<void>;
  query(query: EventQuery): Promise<AnalyticsEvent[]>;
  clear(): Promise<void>;
}

export interface ISessionManager {
  getCurrentSession(): string;
  isSessionExpired(sessionId: string): boolean;
  extendSession(sessionId: string): void;
  endSession(sessionId: string): void;
}

export interface IAnalyticsService {
  track(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>): Promise<void>;
  query(query?: EventQuery): Promise<AnalyticsEvent[]>;
  flush(): Promise<void>;
  clear(): Promise<void>;
  readonly isDebugMode: boolean;
}

// Error types
export class AnalyticsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: unknown
  ) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export class StorageError extends AnalyticsError {
  constructor(message: string, context?: unknown) {
    super(message, 'STORAGE_ERROR', context);
  }
}

export class SessionError extends AnalyticsError {
  constructor(message: string, context?: unknown) {
    super(message, 'SESSION_ERROR', context);
  }
}