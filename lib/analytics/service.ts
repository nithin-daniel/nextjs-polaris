'use client';

import { v4 as uuidv4 } from 'uuid';
import { AnalyticsEvent, EventFilter, AnalyticsConfig, BaseEvent } from './types';

/**
 * Lightweight Analytics Service
 * 
 * Simple, strongly typed analytics with localStorage storage.
 * Designed for easy migration to backend services.
 */
export class LightweightAnalyticsService {
  private config: AnalyticsConfig;
  private sessionId: string;
  private readonly STORAGE_KEY = 'analytics_events';
  private readonly SESSION_KEY = 'analytics_session';

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      storage: 'localStorage',
      maxEvents: 1000,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      ...config
    };
    
    this.sessionId = this.initializeSession();
  }

  /**
   * Track an analytics event
   */
  async trackEvent<T extends AnalyticsEvent>(eventData: Pick<T, 'type' | 'data'>): Promise<void> {
    const fullEvent: T = {
      id: uuidv4(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...eventData
    } as T;

    if (this.config.storage === 'localStorage') {
      this.storeEventLocally(fullEvent);
    } else {
      await this.sendEventToBackend(fullEvent);
    }
  }

  /**
   * Get events with optional filtering
   */
  async getEvents(filter: EventFilter = {}): Promise<AnalyticsEvent[]> {
    if (this.config.storage === 'localStorage') {
      return this.getEventsFromStorage(filter);
    } else {
      return this.fetchEventsFromBackend(filter);
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Clear all stored events
   */
  async clearEvents(): Promise<void> {
    if (this.config.storage === 'localStorage') {
      localStorage.removeItem(this.STORAGE_KEY);
    } else {
      // Backend clear implementation
      await this.clearEventsFromBackend();
    }
  }

  /**
   * Switch to backend storage
   */
  switchToBackend(endpoint: string): void {
    this.config.storage = 'backend';
    this.config.endpoint = endpoint;
  }

  // Private methods

  private initializeSession(): string {
    if (typeof window === 'undefined') return uuidv4();
    
    const stored = localStorage.getItem(this.SESSION_KEY);
    if (stored) {
      const { sessionId, timestamp } = JSON.parse(stored);
      const now = Date.now();
      
      // Check if session is still valid
      if (now - timestamp < this.config.sessionTimeout!) {
        // Update timestamp
        localStorage.setItem(this.SESSION_KEY, JSON.stringify({ sessionId, timestamp: now }));
        return sessionId;
      }
    }
    
    // Create new session
    const newSessionId = uuidv4();
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ 
      sessionId: newSessionId, 
      timestamp: Date.now() 
    }));
    return newSessionId;
  }

  private storeEventLocally(event: AnalyticsEvent): void {
    if (typeof window === 'undefined') return;
    
    try {
      const existing = localStorage.getItem(this.STORAGE_KEY);
      const events: AnalyticsEvent[] = existing ? JSON.parse(existing) : [];
      
      events.push(event);
      
      // Limit stored events
      if (events.length > this.config.maxEvents!) {
        events.splice(0, events.length - this.config.maxEvents!);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  private getEventsFromStorage(filter: EventFilter): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      let events: AnalyticsEvent[] = JSON.parse(stored);
      
      // Apply filters
      if (filter.type) {
        events = events.filter(e => e.type === filter.type);
      }
      
      if (filter.sessionId) {
        events = events.filter(e => e.sessionId === filter.sessionId);
      }
      
      if (filter.startDate) {
        events = events.filter(e => e.timestamp >= filter.startDate!.getTime());
      }
      
      if (filter.endDate) {
        events = events.filter(e => e.timestamp <= filter.endDate!.getTime());
      }
      
      // Apply limit
      if (filter.limit) {
        events = events.slice(-filter.limit);
      }
      
      return events.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.warn('Failed to get analytics events:', error);
      return [];
    }
  }

  private async sendEventToBackend(event: AnalyticsEvent): Promise<void> {
    if (!this.config.endpoint) {
      throw new Error('Backend endpoint not configured');
    }
    
    try {
      await fetch(`${this.config.endpoint}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send event to backend:', error);
      throw error;
    }
  }

  private async fetchEventsFromBackend(filter: EventFilter): Promise<AnalyticsEvent[]> {
    if (!this.config.endpoint) {
      throw new Error('Backend endpoint not configured');
    }
    
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.sessionId) params.append('sessionId', filter.sessionId);
      if (filter.limit) params.append('limit', filter.limit.toString());
      
      const response = await fetch(`${this.config.endpoint}/events?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch events from backend:', error);
      throw error;
    }
  }

  private async clearEventsFromBackend(): Promise<void> {
    if (!this.config.endpoint) {
      throw new Error('Backend endpoint not configured');
    }
    
    try {
      await fetch(`${this.config.endpoint}/events`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to clear events from backend:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analytics = new LightweightAnalyticsService();

export default analytics;