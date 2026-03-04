import { AnalyticsService } from './service';
import { SessionManager } from './session/manager';
import { LocalStorageEventStorage } from './storage/localStorage';
import { HttpEventStorage } from './storage/http';
import { IAnalyticsService, AnalyticsConfig } from './types';

/**
 * Analytics Factory
 * 
 * Provides pre-configured analytics service instances.
 * Handles dependency injection and common configurations.
 */
export class AnalyticsFactory {
  /**
   * Create analytics service with localStorage backend
   */
  static createLocalStorageService(config?: Partial<AnalyticsConfig>): IAnalyticsService {
    const storage = new LocalStorageEventStorage();
    const sessionManager = new SessionManager();
    
    return new AnalyticsService(storage, sessionManager, {
      enableLocalStorage: true,
      ...config
    });
  }

  /**
   * Create analytics service with HTTP backend
   */
  static createHttpService(
    baseUrl: string,
    config?: Partial<AnalyticsConfig>
  ): IAnalyticsService {
    const storage = new HttpEventStorage(baseUrl);
    const sessionManager = new SessionManager();
    
    return new AnalyticsService(storage, sessionManager, {
      enableLocalStorage: false,
      ...config
    });
  }

  /**
   * Create analytics service with hybrid approach
   * (localStorage with HTTP backup)
   */
  static createHybridService(
    baseUrl: string,
    config?: Partial<AnalyticsConfig>
  ): IAnalyticsService {
    // TODO: Implement hybrid storage that tries HTTP first, falls back to localStorage
    return this.createLocalStorageService(config);
  }

  /**
   * Create service based on environment
   */
  static createDefaultService(): IAnalyticsService {
    if (typeof window === 'undefined') {
      // Server-side rendering - use memory-only implementation
      return this.createLocalStorageService({ enableLocalStorage: false });
    }
    
    // Client-side - use localStorage
    return this.createLocalStorageService();
  }
}