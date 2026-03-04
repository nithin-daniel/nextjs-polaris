import { AnalyticsEvent, PageViewData, UserActionData, ErrorData } from './types';

/**
 * Analytics Helper Functions
 * 
 * Convenience functions for common tracking scenarios.
 * Provides a simple API while maintaining type safety.
 */

// Page tracking helpers
export function createPageViewEvent(
  path: string,
  title?: string,
  loadTime?: number,
  referrer?: string
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return {
    type: 'page_view',
    data: {
      path,
      title: title || (typeof document !== 'undefined' ? document.title : undefined),
      loadTime,
      referrer,
    },
  };
}

// User action helpers
export function createUserActionEvent(
  action: string,
  target: string,
  context?: Record<string, unknown>
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return {
    type: 'user_action',
    data: {
      action,
      target,
      context,
    },
  };
}

// Product interaction helpers
export function createProductClickEvent(
  productId: string,
  productName?: string,
  action = 'click',
  position?: number
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createUserActionEvent('product_interaction', 'product', {
    productId,
    productName,
    action,
    position,
  });
}

export function createProductViewEvent(
  productId: string,
  productName?: string,
  context?: Record<string, unknown>
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createUserActionEvent('product_view', 'product', {
    productId,
    productName,
    ...context,
  });
}

// Modal interaction helpers
export function createModalOpenEvent(
  modalType: string,
  modalSize?: string,
  trigger?: string
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createUserActionEvent('modal_open', 'modal', {
    modalType,
    modalSize,
    trigger,
  });
}

export function createModalCloseEvent(
  modalType: string,
  duration?: number,
  modalSize?: string
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createUserActionEvent('modal_close', 'modal', {
    modalType,
    modalSize,
    duration,
  });
}

// Button interaction helpers
export function createButtonClickEvent(
  buttonName: string,
  context?: Record<string, unknown>
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createUserActionEvent('button_click', 'button', {
    buttonName,
    ...context,
  });
}

// Form interaction helpers
export function createFormSubmitEvent(
  formName: string,
  success: boolean,
  errors?: string[]
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createUserActionEvent('form_submit', 'form', {
    formName,
    success,
    errors,
  });
}

// Search helpers
export function createSearchEvent(
  query: string,
  resultCount?: number,
  filters?: Record<string, unknown>
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createUserActionEvent('search', 'search_box', {
    query,
    resultCount,
    filters,
  });
}

// Error tracking helpers
export function createErrorEvent(
  message: string,
  level: 'error' | 'warning' | 'info' = 'error',
  stack?: string,
  context?: Record<string, unknown>
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return {
    type: 'error',
    data: {
      message,
      level,
      stack,
      context,
    },
  };
}

export function createApiErrorEvent(
  endpoint: string,
  status: number,
  message: string,
  context?: Record<string, unknown>
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createErrorEvent(
    `API Error: ${status} ${message}`,
    'error',
    undefined,
    {
      endpoint,
      status,
      type: 'api_error',
      ...context,
    }
  );
}

// Bulk action helpers
export function createBulkActionEvent(
  action: string,
  itemType: string,
  itemCount: number,
  success: boolean
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createUserActionEvent('bulk_action', itemType, {
    action,
    itemCount,
    success,
  });
}

// Navigation helpers
export function createNavigationEvent(
  from: string,
  to: string,
  method: 'link' | 'button' | 'breadcrumb' | 'back' = 'link'
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createUserActionEvent('navigation', 'page', {
    from,
    to,
    method,
  });
}

// Performance helpers
export function createPerformanceEvent(
  metric: string,
  value: number,
  unit: string,
  context?: Record<string, unknown>
): Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'> {
  return createUserActionEvent('performance_metric', 'application', {
    metric,
    value,
    unit,
    ...context,
  });
}