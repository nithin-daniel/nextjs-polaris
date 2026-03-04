'use client';

import React, { useState, useEffect } from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  DataTable,
  EmptyState,
  Button,
  Select,
  Box
} from '@shopify/polaris';
import { analyticsService } from '@/services/analyticsService';
import { AnalyticsAggregator } from '@/utils/analyticsAggregator';
import {
  AnalyticsEvent,
  PageAnalytics,
  ProductAnalytics,
  SessionAnalytics
} from '@/types/analytics';

/**
 * Analytics Dashboard Component
 * 
 * Displays aggregated analytics data from localStorage.
 * Provides insights into user behavior, popular products,
 * and application performance.
 */
export const AnalyticsDashboard: React.FC = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [pageAnalytics, setPageAnalytics] = useState<PageAnalytics[]>([]);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics[]>([]);
  const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    setLoading(true);
    
    try {
      // Get all events
      const allEvents = analyticsService.getEvents();
      
      // Filter by time range
      const now = Date.now();
      const timeRanges = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };
      
      const filteredEvents = allEvents.filter(
        event => (now - event.timestamp) <= timeRanges[timeRange]
      );
      
      setEvents(filteredEvents);
      
      // Aggregate data
      const pages = AnalyticsAggregator.aggregatePageAnalytics(filteredEvents);
      const products = AnalyticsAggregator.aggregateProductAnalytics(filteredEvents);
      const sessions = AnalyticsAggregator.aggregateSessionAnalytics(filteredEvents);
      
      setPageAnalytics(pages);
      setProductAnalytics(products);
      setSessionAnalytics(sessions);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      analyticsService.clearAllData();
      loadAnalyticsData();
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  };

  const timeRangeOptions = [
    { label: 'Last 24 Hours', value: 'day' },
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' }
  ];

  if (loading) {
    return (
      <Page title="Analytics Dashboard">
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <Text as="p" variant="bodyMd" alignment="center">
                  Loading analytics data...
                </Text>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (events.length === 0) {
    return (
      <Page title="Analytics Dashboard">
        <Layout>
          <Layout.Section>
            <EmptyState
              heading="No analytics data yet"
              action={{
                content: 'Clear Data',
                onAction: clearAllData
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Start using the application to generate analytics data.</p>
            </EmptyState>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Prepare data tables
  const pageTableRows = pageAnalytics.map(page => [
    page.pageName,
    formatNumber(page.totalViews),
    formatNumber(page.uniqueViews),
    `${page.bounceRate.toFixed(1)}%`,
    `${page.averageLoadTime.toFixed(0)}ms`
  ]);

  const productTableRows = productAnalytics.slice(0, 10).map(product => [
    product.productTitle,
    formatNumber(product.totalClicks),
    formatNumber(product.uniqueClicks),
    `${product.conversionRate.toFixed(1)}%`,
    Object.entries(product.clicksByAction)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([action]) => action)
      .join(', ')
  ]);

  const errorAnalytics = AnalyticsAggregator.getErrorAnalytics(events);
  const funnelData = AnalyticsAggregator.getFunnelAnalysis(events);

  return (
    <Page 
      title="Analytics Dashboard"
      primaryAction={{
        content: 'Refresh Data',
        onAction: loadAnalyticsData
      }}
      secondaryActions={[
        {
          content: 'Clear All Data',
          onAction: clearAllData,
          destructive: true
        }
      ]}
    >
      <Layout>
        {/* Controls */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <InlineStack align="space-between">
                <Text as="h3" variant="headingMd">Time Range</Text>
                <Select
                  label=""
                  options={timeRangeOptions}
                  value={timeRange}
                  onChange={(value) => setTimeRange(value as 'day' | 'week' | 'month')}
                />
              </InlineStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* Overview Cards */}
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Total Events</Text>
                  <Text as="span" variant="heading2xl">{formatNumber(events.length)}</Text>
                </BlockStack>
              </Box>
            </Card>
            
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Sessions</Text>
                  <Text as="span" variant="heading2xl">
                    {sessionAnalytics ? formatNumber(sessionAnalytics.totalSessions) : '0'}
                  </Text>
                  {sessionAnalytics && (
                    <Text as="span" variant="bodySm" tone="subdued">
                      Avg: {formatDuration(sessionAnalytics.averageDuration)}
                    </Text>
                  )}
                </BlockStack>
              </Box>
            </Card>
            
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Page Views</Text>
                  <Text as="span" variant="heading2xl">
                    {formatNumber(events.filter(e => e.type === 'page_view').length)}
                  </Text>
                  {sessionAnalytics && (
                    <Text as="span" variant="bodySm" tone="subdued">
                      Avg per session: {sessionAnalytics.averagePageViews.toFixed(1)}
                    </Text>
                  )}
                </BlockStack>
              </Box>
            </Card>
            
            <Card>
              <Box padding="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Errors</Text>
                  <Text as="span" variant="heading2xl">
                    {formatNumber(errorAnalytics.totalErrors)}
                  </Text>
                  {errorAnalytics.totalErrors > 0 && (
                    <Badge tone="critical">Needs Attention</Badge>
                  )}
                </BlockStack>
              </Box>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Page Analytics */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Page Performance</Text>
                {pageTableRows.length > 0 ? (
                  <DataTable
                    columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'numeric']}
                    headings={['Page', 'Total Views', 'Unique Views', 'Bounce Rate', 'Load Time']}
                    rows={pageTableRows}
                  />
                ) : (
                  <Text as="p" variant="bodyMd" tone="subdued">No page data available</Text>
                )}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* Product Analytics */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Top Products</Text>
                {productTableRows.length > 0 ? (
                  <DataTable
                    columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'text']}
                    headings={['Product', 'Total Clicks', 'Unique Clicks', 'Conversion Rate', 'Top Actions']}
                    rows={productTableRows}
                  />
                ) : (
                  <Text as="p" variant="bodyMd" tone="subdued">No product data available</Text>
                )}
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* Funnel Analysis */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Conversion Funnel</Text>
                <BlockStack gap="300">
                  {funnelData.map((step, index) => (
                    <Box key={step.step} padding="300">
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodyMd">{step.step}</Text>
                        <InlineStack gap="200">
                          <Text as="span" variant="bodyMd">{formatNumber(step.count)}</Text>
                          {step.dropoffRate > 0 && (
                            <Badge tone="warning">
                              {`-${step.dropoffRate.toFixed(1)}%`}
                            </Badge>
                          )}
                        </InlineStack>
                      </InlineStack>
                    </Box>
                  ))}
                </BlockStack>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* Error Analysis */}
        {errorAnalytics.totalErrors > 0 && (
          <Layout.Section>
            <Card>
              <Box padding="400">
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">Error Analysis</Text>
                  <InlineStack gap="400">
                    <Box>
                      <BlockStack gap="200">
                        <Text as="span" variant="bodyMd">Errors by Type</Text>
                        {Object.entries(errorAnalytics.errorsByType).map(([type, count]) => (
                          <InlineStack key={type} align="space-between">
                            <Text as="span" variant="bodySm">{type}</Text>
                            <Badge tone="critical">{count.toString()}</Badge>
                          </InlineStack>
                        ))}
                      </BlockStack>
                    </Box>
                    
                    <Box>
                      <BlockStack gap="200">
                        <Text as="span" variant="bodyMd">Top Error Messages</Text>
                        {errorAnalytics.topErrors.slice(0, 5).map(error => (
                          <Box key={error.message}>
                            <InlineStack align="space-between">
                              <Text as="span" variant="bodySm" breakWord>
                                {error.message.substring(0, 50)}...
                              </Text>
                              <Badge tone="critical">{error.count.toString()}</Badge>
                            </InlineStack>
                          </Box>
                        ))}
                      </BlockStack>
                    </Box>
                  </InlineStack>
                </BlockStack>
              </Box>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
};

export default AnalyticsDashboard;