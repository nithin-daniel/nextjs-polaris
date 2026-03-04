import {
  AnalyticsEvent,
  PageAnalytics,
  ProductAnalytics,
  SessionAnalytics,
  PageViewEvent,
  ProductClickEvent,
  SessionEvent
} from '@/types/analytics';

/**
 * Analytics Aggregation Utilities
 * 
 * Provides methods to aggregate and analyze stored analytics events
 * for insights and reporting without backend processing.
 */
export class AnalyticsAggregator {
  /**
   * Aggregate page analytics from events
   */
  static aggregatePageAnalytics(events: AnalyticsEvent[]): PageAnalytics[] {
    const pageViews = events.filter(e => e.type === 'page_view') as PageViewEvent[];
    const pageMap = new Map<string, PageAnalytics>();

    pageViews.forEach(event => {
      const pageName = event.properties.pageName;
      
      if (!pageMap.has(pageName)) {
        pageMap.set(pageName, {
          pageName,
          totalViews: 0,
          uniqueViews: 0,
          averageLoadTime: 0,
          bounceRate: 0,
          topReferrers: [],
          viewsByHour: {}
        });
      }

      const analytics = pageMap.get(pageName)!;
      analytics.totalViews++;

      // Track load times
      if (event.properties.loadTime) {
        const currentAvg = analytics.averageLoadTime;
        const currentCount = analytics.totalViews - 1;
        analytics.averageLoadTime = ((currentAvg * currentCount) + event.properties.loadTime) / analytics.totalViews;
      }

      // Track views by hour
      const hour = new Date(event.timestamp).getHours();
      const hourKey = `${hour}:00`;
      analytics.viewsByHour[hourKey] = (analytics.viewsByHour[hourKey] || 0) + 1;
    });

    // Calculate unique views (by session)
    pageViews.forEach(event => {
      const pageName = event.properties.pageName;
      const analytics = pageMap.get(pageName)!;
      
      const sessionsForPage = new Set(
        pageViews
          .filter(e => e.properties.pageName === pageName)
          .map(e => e.sessionId)
      );
      
      analytics.uniqueViews = sessionsForPage.size;
    });

    // Calculate top referrers
    pageViews.forEach(event => {
      if (event.referrer) {
        const pageName = event.properties.pageName;
        const analytics = pageMap.get(pageName)!;
        
        const existingReferrer = analytics.topReferrers.find(r => r.url === event.referrer);
        if (existingReferrer) {
          existingReferrer.count++;
        } else {
          analytics.topReferrers.push({ url: event.referrer, count: 1 });
        }
      }
    });

    // Sort referrers and keep top 10
    Array.from(pageMap.values()).forEach(analytics => {
      analytics.topReferrers = analytics.topReferrers
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    });

    // Calculate bounce rates
    const sessionEvents = events.filter(e => e.type === 'session_end') as SessionEvent[];
    sessionEvents.forEach(sessionEvent => {
      if (sessionEvent.properties.pageCount === 1) {
        // Single page session = bounce
        const sessionPageViews = pageViews.filter(pv => pv.sessionId === sessionEvent.sessionId);
        if (sessionPageViews.length > 0) {
          const pageName = sessionPageViews[0].properties.pageName;
          const analytics = pageMap.get(pageName);
          if (analytics) {
            analytics.bounceRate++;
          }
        }
      }
    });

    // Convert bounce count to rate
    Array.from(pageMap.values()).forEach(analytics => {
      analytics.bounceRate = analytics.uniqueViews > 0 
        ? (analytics.bounceRate / analytics.uniqueViews) * 100 
        : 0;
    });

    return Array.from(pageMap.values());
  }

  /**
   * Aggregate product analytics from events
   */
  static aggregateProductAnalytics(events: AnalyticsEvent[]): ProductAnalytics[] {
    const productClicks = events.filter(e => e.type === 'product_click') as ProductClickEvent[];
    const productMap = new Map<string, ProductAnalytics>();

    productClicks.forEach(event => {
      const productId = event.properties.productId;
      
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productTitle: event.properties.productTitle,
          totalClicks: 0,
          uniqueClicks: 0,
          clicksByAction: {},
          averagePosition: 0,
          conversionRate: 0
        });
      }

      const analytics = productMap.get(productId)!;
      analytics.totalClicks++;

      // Track clicks by action
      const action = event.properties.action;
      analytics.clicksByAction[action] = (analytics.clicksByAction[action] || 0) + 1;

      // Track positions for average calculation
      if (event.properties.position !== undefined) {
        const currentAvg = analytics.averagePosition;
        const currentCount = analytics.totalClicks - 1;
        analytics.averagePosition = ((currentAvg * currentCount) + event.properties.position) / analytics.totalClicks;
      }
    });

    // Calculate unique clicks (by session)
    productClicks.forEach(event => {
      const productId = event.properties.productId;
      const analytics = productMap.get(productId)!;
      
      const sessionsForProduct = new Set(
        productClicks
          .filter(e => e.properties.productId === productId)
          .map(e => e.sessionId)
      );
      
      analytics.uniqueClicks = sessionsForProduct.size;
    });

    // Calculate conversion rate (add_to_cart / total clicks)
    Array.from(productMap.values()).forEach(analytics => {
      const addToCartClicks = analytics.clicksByAction['add_to_cart'] || 0;
      analytics.conversionRate = analytics.totalClicks > 0 
        ? (addToCartClicks / analytics.totalClicks) * 100 
        : 0;
    });

    return Array.from(productMap.values());
  }

  /**
   * Aggregate session analytics from events
   */
  static aggregateSessionAnalytics(events: AnalyticsEvent[]): SessionAnalytics {
    const sessionStarts = events.filter(e => e.type === 'session_start');
    const sessionEnds = events.filter(e => e.type === 'session_end') as SessionEvent[];
    const pageViews = events.filter(e => e.type === 'page_view') as PageViewEvent[];

    const analytics: SessionAnalytics = {
      totalSessions: sessionStarts.length,
      averageDuration: 0,
      averagePageViews: 0,
      bounceRate: 0,
      topPages: [],
      sessionsByHour: {}
    };

    // Calculate average session duration
    if (sessionEnds.length > 0) {
      const totalDuration = sessionEnds.reduce((sum, session) => {
        return sum + (session.properties.duration || 0);
      }, 0);
      analytics.averageDuration = totalDuration / sessionEnds.length;
    }

    // Calculate average page views per session
    if (sessionEnds.length > 0) {
      const totalPageViews = sessionEnds.reduce((sum, session) => {
        return sum + (session.properties.pageCount || 0);
      }, 0);
      analytics.averagePageViews = totalPageViews / sessionEnds.length;
    }

    // Calculate bounce rate (sessions with 1 page view)
    const bounces = sessionEnds.filter(session => session.properties.pageCount === 1).length;
    analytics.bounceRate = sessionEnds.length > 0 ? (bounces / sessionEnds.length) * 100 : 0;

    // Calculate top pages
    const pageViewCounts = new Map<string, number>();
    pageViews.forEach(pageView => {
      const pageName = pageView.properties.pageName;
      pageViewCounts.set(pageName, (pageViewCounts.get(pageName) || 0) + 1);
    });

    analytics.topPages = Array.from(pageViewCounts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Calculate sessions by hour
    sessionStarts.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      const hourKey = `${hour}:00`;
      analytics.sessionsByHour[hourKey] = (analytics.sessionsByHour[hourKey] || 0) + 1;
    });

    return analytics;
  }

  /**
   * Get time-based analytics (daily, weekly, monthly)
   */
  static getTimeBasedAnalytics(
    events: AnalyticsEvent[],
    period: 'day' | 'week' | 'month'
  ): Record<string, number> {
    const result: Record<string, number> = {};
    
    events.forEach(event => {
      const date = new Date(event.timestamp);
      let key: string;
      
      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      result[key] = (result[key] || 0) + 1;
    });
    
    return result;
  }

  /**
   * Get funnel analysis (e.g., page view -> product click -> add to cart)
   */
  static getFunnelAnalysis(events: AnalyticsEvent[]): {
    step: string;
    count: number;
    dropoffRate: number;
  }[] {
    const pageViews = events.filter(e => e.type === 'page_view').length;
    const productClicks = events.filter(e => e.type === 'product_click').length;
    const addToCarts = events.filter(e => 
      e.type === 'product_click' && 
      (e as ProductClickEvent).properties.action === 'add_to_cart'
    ).length;
    
    return [
      {
        step: 'Page Views',
        count: pageViews,
        dropoffRate: 0
      },
      {
        step: 'Product Clicks',
        count: productClicks,
        dropoffRate: pageViews > 0 ? ((pageViews - productClicks) / pageViews) * 100 : 0
      },
      {
        step: 'Add to Cart',
        count: addToCarts,
        dropoffRate: productClicks > 0 ? ((productClicks - addToCarts) / productClicks) * 100 : 0
      }
    ];
  }

  /**
   * Get error analytics
   */
  static getErrorAnalytics(events: AnalyticsEvent[]): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByPage: Record<string, number>;
    topErrors: Array<{ message: string; count: number }>;
  } {
    const errorEvents = events.filter(e => e.type === 'error');
    
    const errorsByType: Record<string, number> = {};
    const errorsByPage: Record<string, number> = {};
    const errorMessages = new Map<string, number>();
    
    errorEvents.forEach(event => {
      const errorEvent = event as any; // Type assertion for error properties
      const errorType = errorEvent.properties?.errorType || 'unknown';
      const errorMessage = errorEvent.properties?.errorMessage || 'Unknown error';
      const page = new URL(event.url).pathname;
      
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      errorsByPage[page] = (errorsByPage[page] || 0) + 1;
      errorMessages.set(errorMessage, (errorMessages.get(errorMessage) || 0) + 1);
    });
    
    const topErrors = Array.from(errorMessages.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      totalErrors: errorEvents.length,
      errorsByType,
      errorsByPage,
      topErrors
    };
  }
}

export default AnalyticsAggregator;