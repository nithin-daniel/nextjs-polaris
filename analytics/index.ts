/**
 * Analytics Module
 * 
 * Unified analytics system with clean architecture and dependency injection.
 * Provides type-safe event tracking with pluggable storage backends.
 */

// Core exports
export * from './types';
export * from './service';
export * from './factory';
export * from './helpers';

// Storage implementations
export * from './storage/localStorage';
export * from './storage/http';

// Session management
export * from './session/manager';

// React integration
export * from './react/context';

// Re-export factory for convenience
export { AnalyticsFactory as Analytics } from './factory';

// Default service instance (for backward compatibility)
export const analytics = AnalyticsFactory.createDefaultService();