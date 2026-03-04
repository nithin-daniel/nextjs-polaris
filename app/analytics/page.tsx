'use client';

import { Card, Page, Button, Text, BlockStack, InlineStack } from '@shopify/polaris';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <Page 
      title="Analytics"
      subtitle="Choose your analytics view"
    >
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Internal Dashboard
            </Text>
            <Text as="p">
              View key metrics including product clicks, modal opens, sessions, and most viewed products.
            </Text>
            <InlineStack align="start">
              <Button 
                variant="primary"
                onClick={() => router.push('/analytics/dashboard')}
              >
                Open Dashboard
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Lightweight Demo
            </Text>
            <Text as="p">
              Interactive demo of the lightweight analytics service with real-time event tracking.
            </Text>
            <InlineStack align="start">
              <Button 
                onClick={() => router.push('/analytics/lightweight-demo')}
              >
                View Demo
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Comprehensive Dashboard
            </Text>
            <Text as="p">
              Full-featured analytics dashboard with advanced visualization and filtering.
            </Text>
            <InlineStack align="start">
              <Button 
                onClick={() => router.push('/products/analytics-demo')}
              >
                View Full Dashboard
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}