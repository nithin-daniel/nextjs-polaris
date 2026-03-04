import { v4 as uuidv4 } from 'uuid';
import { ISessionManager, SessionError } from '../types';

/**
 * Session Manager
 * 
 * Handles session lifecycle with timeout management and persistence.
 */
export class SessionManager implements ISessionManager {
  private readonly storageKey: string;
  private readonly sessionTimeout: number;
  private currentSessionId: string | null = null;
  private sessionStartTime: number | null = null;
  private lastActivityTime: number | null = null;

  constructor(
    sessionTimeout = 30 * 60 * 1000, // 30 minutes
    storageKey = 'analytics_session'
  ) {
    this.sessionTimeout = sessionTimeout;
    this.storageKey = storageKey;
    this.initializeSession();
  }

  getCurrentSession(): string {
    if (!this.currentSessionId || this.isCurrentSessionExpired()) {
      this.startNewSession();
    } else {
      this.updateActivity();
    }
    
    return this.currentSessionId!;
  }

  isSessionExpired(sessionId: string): boolean {
    if (sessionId !== this.currentSessionId) {
      return true;
    }
    
    return this.isCurrentSessionExpired();
  }

  extendSession(sessionId: string): void {
    if (sessionId === this.currentSessionId && !this.isCurrentSessionExpired()) {
      this.updateActivity();
    }
  }

  endSession(sessionId: string): void {
    if (sessionId === this.currentSessionId) {
      this.clearSession();
    }
  }

  private initializeSession(): void {
    if (typeof window === 'undefined') {
      this.startNewSession();
      return;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const session = JSON.parse(stored);
        const now = Date.now();
        
        if (session.sessionId && 
            session.lastActivityTime && 
            (now - session.lastActivityTime) < this.sessionTimeout) {
          // Restore existing session
          this.currentSessionId = session.sessionId;
          this.sessionStartTime = session.startTime;
          this.lastActivityTime = session.lastActivityTime;
          this.updateActivity();
          return;
        }
      }
    } catch (error) {
      // Ignore parsing errors, start fresh
    }
    
    this.startNewSession();
  }

  private startNewSession(): void {
    const now = Date.now();
    this.currentSessionId = uuidv4();
    this.sessionStartTime = now;
    this.lastActivityTime = now;
    this.persistSession();
  }

  private isCurrentSessionExpired(): boolean {
    if (!this.lastActivityTime) {
      return true;
    }
    
    return (Date.now() - this.lastActivityTime) >= this.sessionTimeout;
  }

  private updateActivity(): void {
    this.lastActivityTime = Date.now();
    this.persistSession();
  }

  private persistSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const sessionData = {
        sessionId: this.currentSessionId,
        startTime: this.sessionStartTime,
        lastActivityTime: this.lastActivityTime,
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
    } catch (error) {
      throw new SessionError('Failed to persist session', error);
    }
  }

  private clearSession(): void {
    this.currentSessionId = null;
    this.sessionStartTime = null;
    this.lastActivityTime = null;
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
}