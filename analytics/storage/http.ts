import { IEventStorage, AnalyticsEvent, EventQuery, StorageError } from '../types';

/**
 * HTTP-based storage implementation.
 * 
 * Sends events to backend API with retry logic and error handling.
 */
export class HttpEventStorage implements IEventStorage {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(
    baseUrl: string,
    options: {
      timeout?: number;
      maxRetries?: number;
    } = {}
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = options.timeout ?? 5000;
    this.maxRetries = options.maxRetries ?? 3;
  }

  async store(events: AnalyticsEvent[]): Promise<void> {
    await this.withRetry(async () => {
      const response = await this.request('/events', {
        method: 'POST',
        body: JSON.stringify({ events }),
      });
      
      if (!response.ok) {
        throw new StorageError(
          `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, url: response.url }
        );
      }
    });
  }

  async query(query: EventQuery = {}): Promise<AnalyticsEvent[]> {
    const params = new URLSearchParams();
    
    if (query.type) {
      const types = Array.isArray(query.type) ? query.type : [query.type];
      types.forEach(type => params.append('type', type));
    }
    
    if (query.sessionId) params.set('sessionId', query.sessionId);
    if (query.dateRange) {
      params.set('start', query.dateRange.start.toString());
      params.set('end', query.dateRange.end.toString());
    }
    if (query.limit) params.set('limit', query.limit.toString());
    if (query.offset) params.set('offset', query.offset.toString());
    
    const url = `/events${params.toString() ? `?${params}` : ''}`;
    
    return this.withRetry(async () => {
      const response = await this.request(url);
      
      if (!response.ok) {
        throw new StorageError(
          `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, url: response.url }
        );
      }
      
      const data = await response.json();
      return data.events || [];
    });
  }

  async clear(): Promise<void> {
    await this.withRetry(async () => {
      const response = await this.request('/events', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new StorageError(
          `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, url: response.url }
        );
      }
    });
  }

  private async request(path: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });
      
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new StorageError('Request timeout', { timeout: this.timeout });
      }
      throw new StorageError('Network error', error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.maxRetries) {
          break;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new StorageError(
      `Failed after ${this.maxRetries} attempts: ${lastError!.message}`,
      lastError
    );
  }
}