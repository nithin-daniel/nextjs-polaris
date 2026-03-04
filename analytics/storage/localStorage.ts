import { IEventStorage, AnalyticsEvent, EventQuery, StorageError } from '../types';

/**
 * LocalStorage implementation of event storage.
 * 
 * Handles client-side persistence with automatic cleanup
 * and query capabilities.
 */
export class LocalStorageEventStorage implements IEventStorage {
  private readonly storageKey: string;
  private readonly maxEvents: number;

  constructor(
    storageKey = 'analytics_events',
    maxEvents = 10000
  ) {
    this.storageKey = storageKey;
    this.maxEvents = maxEvents;
  }

  async store(events: AnalyticsEvent[]): Promise<void> {
    if (typeof window === 'undefined') {
      throw new StorageError('LocalStorage not available in server environment');
    }

    try {
      const existing = await this.getAllEvents();
      const combined = [...existing, ...events];
      
      // Maintain size limit (FIFO)
      const trimmed = combined.length > this.maxEvents 
        ? combined.slice(-this.maxEvents)
        : combined;
      
      localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
    } catch (error) {
      throw new StorageError('Failed to store events', error);
    }
  }

  async query(query: EventQuery = {}): Promise<AnalyticsEvent[]> {
    try {
      let events = await this.getAllEvents();
      
      // Apply filters
      if (query.type) {
        const types = Array.isArray(query.type) ? query.type : [query.type];
        events = events.filter(event => types.includes(event.type));
      }
      
      if (query.sessionId) {
        events = events.filter(event => event.sessionId === query.sessionId);
      }
      
      if (query.dateRange) {
        events = events.filter(event => 
          event.timestamp >= query.dateRange!.start &&
          event.timestamp <= query.dateRange!.end
        );
      }
      
      // Sort by timestamp (newest first)
      events.sort((a, b) => b.timestamp - a.timestamp);
      
      // Apply pagination
      if (query.offset || query.limit) {
        const start = query.offset || 0;
        const end = query.limit ? start + query.limit : undefined;
        events = events.slice(start, end);
      }
      
      return events;
    } catch (error) {
      throw new StorageError('Failed to query events', error);
    }
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new StorageError('LocalStorage not available in server environment');
    }

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      throw new StorageError('Failed to clear events', error);
    }
  }

  private async getAllEvents(): Promise<AnalyticsEvent[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Corrupted data, return empty array
      return [];
    }
  }
}