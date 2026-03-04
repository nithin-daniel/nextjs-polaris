'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  DataTable,
  Spinner,
  Button,
  Icon
} from '@shopify/polaris';
import {
  ViewIcon,
  ChartVerticalIcon
} from '@shopify/polaris-icons';
import { useRouter } from 'next/navigation';
import { useAnalytics } from '@/lib/analytics';
import { AnalyticsEvent, UserActionEvent, PageViewEvent } from '@/lib/analytics/types';

interface DashboardMetrics {
  totalProductClicks: number;
  totalModalOpens: number;
  totalSessions: number;
  mostViewedProduct: {
    id: string;
    name: string;
    views: number;
  } | null;
}

interface ProductViewData {
  [key: string]: {
    id: string;
    name: string;
    views: number;
  };
}

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { getEvents } = useAnalytics();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const allEvents = await getEvents();
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load analytics events:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Clean aggregation logic
  const metrics = useMemo((): DashboardMetrics => {
    const userActionEvents = events.filter(
      (event): event is UserActionEvent => event.type === 'user_action'
    );

    // Count product clicks
    const totalProductClicks = userActionEvents.filter(
      event => 
        event.data.action === 'product_click' || 
        event.data.action === 'view_details'
    ).length;

    // Count modal opens
    const totalModalOpens = userActionEvents.filter(
      event => event.data.action === 'modal_open'
    ).length;

    // Count unique sessions
    const uniqueSessions = new Set(
      events.map(event => event.sessionId)
    );
    const totalSessions = uniqueSessions.size;

    // Find most viewed product
    const productViews: ProductViewData = {};
    
    userActionEvents.forEach(event => {
      if (event.data.action === 'product_view' || event.data.action === 'view_details') {
        const productId = event.data.metadata?.productId || event.data.metadata?.id;
        const productName = event.data.metadata?.productTitle || 
                           event.data.metadata?.productName || 
                           event.data.metadata?.name || 
                           `Product ${productId}`;
        
        if (productId) {
          const key = productId.toString();
          if (!productViews[key]) {
            productViews[key] = {
              id: key,
              name: productName,
              views: 0
            };
          }
          productViews[key].views++;
        }
      }
    });

    const mostViewedProduct = Object.values(productViews).reduce(
      (max, current) => !max || current.views > max.views ? current : max,
      null as ProductViewData[string] | null
    );

    return {
      totalProductClicks,
      totalModalOpens,
      totalSessions,
      mostViewedProduct
    };
  }, [events]);

  // Recent activity data for table
  const recentActivity = useMemo(() => {
    const recent = events
      .filter(event => event.type === 'user_action')
      .slice(-10)
      .reverse()
      .map(event => {
        const userEvent = event as UserActionEvent;
        return [
          new Date(event.timestamp).toLocaleTimeString(),
          userEvent.data.action,
          userEvent.data.target,
          userEvent.data.metadata?.productId || userEvent.data.metadata?.modalType || '-'
        ];
      });

    return recent;
  }, [events]);

  if (loading) {
    return (
      <Page title="Analytics Dashboard">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400" align="center">
                <Spinner accessibilityLabel="Loading analytics" size="large" />
                <Text variant="bodyMd" as="p" alignment="center">
                  Loading analytics data...
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Analytics Dashboard"
      subtitle={`Data from ${events.length} events`}
      backAction={{ url: '/analytics' }}
      primaryAction={{
        content: 'Refresh Data',
        onAction: loadEvents,
      }}
    >
      <Layout>
        {/* Key Metrics */}
        <Layout.Section>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              Key Metrics
            </Text>
            
            <InlineStack gap="400" wrap={false}>
              <div style={{ flex: 1 }}>
                <Card>
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="start">
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" tone="subdued">
                          Product Clicks
                        </Text>
                        <Text as="p" variant="heading2xl">
                          {metrics.totalProductClicks.toLocaleString()}
                        </Text>
                      </BlockStack>
                      <Icon source={ViewIcon} tone="base" />
                    </InlineStack>
                  </BlockStack>
                </Card>
              </div>

              <div style={{ flex: 1 }}>
                <Card>
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="start">
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" tone="subdued">
                          Modal Opens
                        </Text>
                        <Text as="p" variant="heading2xl">
                          {metrics.totalModalOpens.toLocaleString()}
                        </Text>
                      </BlockStack>
                      <Icon source={ViewIcon} tone="base" />
                    </InlineStack>
                  </BlockStack>
                </Card>
              </div>

              <div style={{ flex: 1 }}>
                <Card>
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="start">
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" tone="subdued">
                          Total Sessions
                        </Text>
                        <Text as="p" variant="heading2xl">
                          {metrics.totalSessions.toLocaleString()}
                        </Text>
                      </BlockStack>
                      <Icon source={ChartVerticalIcon} tone="base" />
                    </InlineStack>
                  </BlockStack>
                </Card>
              </div>

              <div style={{ flex: 1 }}>
                <Card>
                  <BlockStack gap="200">
                    <InlineStack align="space-between" blockAlign="start">
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" tone="subdued">
                          Most Viewed Product
                        </Text>
                        {metrics.mostViewedProduct ? (
                          <>
                            <Text as="p" variant="headingMd" truncate>
                              {metrics.mostViewedProduct.name}
                            </Text>
                            <Badge tone="success">
                              {`${metrics.mostViewedProduct.views} views`}
                            </Badge>
                          </>
                        ) : (
                          <Text as="p" variant="bodyMd" tone="subdued">
                            No data
                          </Text>
                        )}
                      </BlockStack>
                      <Icon source={ChartVerticalIcon} tone="base" />
                    </InlineStack>
                  </BlockStack>
                </Card>
              </div>
            </InlineStack>
          </BlockStack>
        </Layout.Section>

        {/* Recent Activity */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h3" variant="headingMd">
                  Recent Activity
                </Text>
                <Badge tone="info">Last 10 events</Badge>
              </InlineStack>
              
              {recentActivity.length > 0 ? (
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text']}
                  headings={['Time', 'Action', 'Target', 'Details']}
                  rows={recentActivity}
                />
              ) : (
                <BlockStack gap="200" align="center">
                  <Text as="p" tone="subdued">
                    No recent activity to display
                  </Text>
                  <Button onClick={() => router.push('/products')}>
                    Visit Products Page
                  </Button>
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}