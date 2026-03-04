'use client';

import React, { useEffect, useRef } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * Higher-Order Component for Analytics Tracking
 * 
 * Automatically tracks component mount/unmount and provides
 * analytics methods to wrapped components.
 */
export interface WithAnalyticsProps {
  analytics: ReturnType<typeof useAnalytics>;
}

export interface AnalyticsOptions {
  trackMount?: boolean;
  trackUnmount?: boolean;
  componentName?: string;
  trackErrors?: boolean;
}

export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: AnalyticsOptions = {}
) {
  const {
    trackMount = false,
    trackUnmount = false,
    componentName,
    trackErrors = true
  } = options;

  const componentDisplayName = componentName || WrappedComponent.displayName || WrappedComponent.name;

  const WithAnalyticsComponent = (props: P) => {
    const analytics = useAnalytics();
    const mountTime = useRef<number>(Date.now());

    useEffect(() => {
      if (trackMount) {
        console.log(`[Analytics] Component mounted: ${componentDisplayName}`);
        // You could track component mounts as custom events
      }

      return () => {
        if (trackUnmount) {
          const timeOnComponent = Date.now() - mountTime.current;
          console.log(`[Analytics] Component unmounted: ${componentDisplayName}, time: ${timeOnComponent}ms`);
          // You could track component time-on-page as custom events
        }
      };
    }, [componentDisplayName]);

    // Error boundary for the wrapped component
    if (trackErrors) {
      try {
        return <WrappedComponent {...props} analytics={analytics} />;
      } catch (error) {
        analytics.trackError(
          'client',
          `Component error in ${componentDisplayName}: ${error}`,
          {
            context: {
              component: componentDisplayName,
              props: Object.keys(props as any)
            }
          }
        );
        throw error; // Re-throw to let error boundary handle it
      }
    }

    return <WrappedComponent {...props} analytics={analytics} />;
  };

  WithAnalyticsComponent.displayName = `withAnalytics(${componentDisplayName})`;

  return WithAnalyticsComponent;
}

export default withAnalytics;