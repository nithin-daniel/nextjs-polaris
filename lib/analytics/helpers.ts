import { analytics } from './service';
import { PageViewEvent, UserActionEvent, ErrorEvent } from './types';

/**
 * Analytics Helper Functions
 * 
 * Convenience methods for common tracking scenarios
 */

/**
 * Track page view
 */
export const trackPageView = async (path: string, title?: string, loadTime?: number) => {
  await analytics.trackEvent({
    type: 'page_view',
    data: {
      path,
      title: title || document?.title,
      loadTime
    }
  });
};

/**
 * Track user action (click, form submit, etc.)
 */
export const trackUserAction = async (
  action: string, 
  target: string, 
  metadata?: Record<string, any>
) => {
  await analytics.trackEvent({
    type: 'user_action',
    data: {
      action,
      target,
      metadata
    }
  });
};

/**
 * Track error
 */
export const trackError = async (
  message: string, 
  stack?: string, 
  context?: Record<string, any>
) => {
  await analytics.trackEvent({
    type: 'error',
    data: {
      message,
      stack,
      context
    }
  });
};

/**
 * Common product tracking helpers
 */
export const trackProduct = {
  view: (productId: string, productName?: string) =>
    trackUserAction('product_view', 'product', { productId, productName }),
    
  click: (productId: string, position?: number) =>
    trackUserAction('product_click', 'product', { productId, position }),
    
  addToCart: (productId: string, quantity?: number, price?: number) =>
    trackUserAction('add_to_cart', 'product', { productId, quantity, price }),
    
  remove: (productId: string) =>
    trackUserAction('product_remove', 'product', { productId })
};

/**
 * Modal tracking helpers
 */
export const trackModal = {
  open: (modalType: string, context?: Record<string, any>) =>
    trackUserAction('modal_open', 'modal', { modalType, ...context }),
    
  close: (modalType: string, duration?: number) =>
    trackUserAction('modal_close', 'modal', { modalType, duration })
};

/**
 * Search tracking
 */
export const trackSearch = async (
  query: string, 
  resultCount?: number, 
  filters?: Record<string, any>
) => {
  await trackUserAction('search', 'search_box', {
    query,
    resultCount,
    filters
  });
};

/**
 * Form tracking
 */
export const trackForm = {
  start: (formName: string) =>
    trackUserAction('form_start', 'form', { formName }),
    
  submit: (formName: string, success: boolean, errors?: string[]) =>
    trackUserAction('form_submit', 'form', { formName, success, errors }),
    
  abandon: (formName: string, completionRate?: number) =>
    trackUserAction('form_abandon', 'form', { formName, completionRate })
};

export { analytics } from './service';