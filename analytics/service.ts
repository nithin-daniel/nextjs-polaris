import { v4 as uuidv4 } from 'uuid';
import {
  IAnalyticsService,
  IEventStorage,
  ISessionManager,
  AnalyticsEvent,
  EventQuery,
  AnalyticsConfig,
  AnalyticsError
} from './types';

/**
 * Analytics Service
 * 
 * Core analytics implementation with dependency injection.
 * Handles event batching, error recovery, and storage abstraction.
 */
export class AnalyticsService implements IAnalyticsService {
  private readonly storage: IEventStorage;
  private readonly sessionManager: ISessionManager;
  private readonly config: AnalyticsConfig;
  private eventBuffer: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  constructor(
    storage: IEventStorage,
    sessionManager: ISessionManager,
    config: Partial<AnalyticsConfig> = {}
  ) {
    this.storage = storage;
    this.sessionManager = sessionManager;
    this.config = {
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      batchSize: 10,
      flushInterval: 5000, // 5 seconds
      maxRetries: 3,
      enableLocalStorage: true,
      enableDebugMode: false,
      ...config
    };
    
    this.scheduleFlush();
    this.setupUnloadHandler();
  }

  async track(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>): Promise<void> {
    if (this.isDestroyed) {
      throw new AnalyticsError('Service has been destroyed', 'SERVICE_DESTROYED');
    }

    try {
      const fullEvent: AnalyticsEvent = {
        ...event,
        id: uuidv4(),
        timestamp: Date.now(),
        sessionId: this.sessionManager.getCurrentSession(),
      };
      
      this.eventBuffer.push(fullEvent);
      
      // Auto-flush if buffer is full
      if (this.eventBuffer.length >= this.config.batchSize) {
        await this.flush();
      }
    } catch (error) {
      throw new AnalyticsError(
        'Failed to track event',
        'TRACK_ERROR',
        { event, error }
      );
    }
  }

  async query(query: EventQuery = {}): Promise<AnalyticsEvent[]> {
    if (this.isDestroyed) {
      throw new AnalyticsError('Service has been destroyed', 'SERVICE_DESTROYED');
    }

    try {
      return await this.storage.query(query);
    } catch (error) {
      throw new AnalyticsError(
        'Failed to query events',
        'QUERY_ERROR',
        { query, error }
      );
    }
  }

  async flush(): Promise<void> {
    if (this.isDestroyed || this.eventBuffer.length === 0) {
      return;
    }

    const events = [...this.eventBuffer];
    this.eventBuffer = [];
    
    try {
      await this.storage.store(events);
      this.resetFlushTimer();
    } catch (error) {
      // Put events back in buffer for retry
      this.eventBuffer.unshift(...events);
      throw new AnalyticsError(
        'Failed to flush events',
        'FLUSH_ERROR',
        { eventCount: events.length, error }
      );
    }
  }

  async clear(): Promise<void> {
    if (this.isDestroyed) {
      throw new AnalyticsError('Service has been destroyed', 'SERVICE_DESTROYED');
    }

    try {
      this.eventBuffer = [];
      await this.storage.clear();
    } catch (error) {
      throw new AnalyticsError(
        'Failed to clear events',
        'CLEAR_ERROR',
        error
      );
    }
  }

  /**
   * Check if debug mode is enabled
   */
  get isDebugMode(): boolean {
    return this.config.enableDebugMode;
  }

  /**
   * Gracefully shutdown the service
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Final flush
    try {
      await this.flush();
    } catch (error) {
      // Ignore errors during shutdown
    }
  }

  private scheduleFlush(): void {
    this.resetFlushTimer();
  }

  private resetFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    
    if (!this.isDestroyed) {
      this.flushTimer = setTimeout(() => {
        this.flush().catch(() => {
          // Retry on next interval
          this.resetFlushTimer();
        });
      }, this.config.flushInterval);
    }
  }

  private setupUnloadHandler(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const handleUnload = () => {
      // Synchronous flush for page unload
      if (this.eventBuffer.length > 0) {
        try {
          // Use sendBeacon if available for reliable delivery
          if ('sendBeacon' in navigator && this.config.enableLocalStorage) {
            const data = JSON.stringify(this.eventBuffer);
            navigator.sendBeacon('/api/analytics/events', data);
          }
        } catch (error) {
          // Fallback to localStorage
          if (this.config.enableLocalStorage) {
            try {
              const existing = localStorage.getItem('analytics_pending') || '[]';
              const pending = JSON.parse(existing);
              pending.push(...this.eventBuffer);
              localStorage.setItem('analytics_pending', JSON.stringify(pending));
            } catch {
              // Ignore storage errors during unload
            }
          }
        }
      }
    };
    
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
  }
}