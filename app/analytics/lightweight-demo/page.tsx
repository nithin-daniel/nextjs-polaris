'use client';

import { Card, Page, Button, Text, Badge, BlockStack, InlineStack } from '@shopify/polaris';
import { useState, useEffect } from 'react';
import { useAnalytics } from '../../../lib/analytics';
import { AnalyticsEvent } from '../../../lib/analytics/types';

export default function LightweightAnalyticsDemo() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const { track, getEvents, clearEvents } = useAnalytics();

  const loadEvents = async () => {
    const allEvents = await getEvents();
    setEvents(allEvents);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleButtonClick = () => {
    track.buttonClick('demo-button', { page: 'lightweight-demo' });
    setTimeout(loadEvents, 100); // Refresh events after tracking
  };

  const handleProductView = () => {
    track.productView('demo-product-123', 'Demo Product');
    setTimeout(loadEvents, 100);
  };

  const handleError = () => {
    track.error('Demo error message', 'Error: Demo stack trace', { context: 'demo' });
    setTimeout(loadEvents, 100);
  };

  const handleClear = async () => {
    await clearEvents();
    await loadEvents();
  };

  return (
    <Page title="Lightweight Analytics Demo" backAction={{ url: '/analytics' }}>
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">
              Test Analytics Events
            </Text>
            <InlineStack gap="200">
              <Button onClick={handleButtonClick}>Track Button Click</Button>
              <Button onClick={handleProductView}>Track Product View</Button>
              <Button onClick={handleError} tone="critical">Track Error</Button>
              <Button onClick={handleClear}>Clear Events</Button>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Recent Events
              </Text>
              <Badge tone="info">{`${events.length} events`}</Badge>
            </InlineStack>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <BlockStack gap="200">
                {events.length === 0 ? (
                  <Text as="p" tone="subdued">No events tracked yet</Text>
                ) : (
                  events.slice().reverse().map((event, index) => (
                    <div key={event.id} style={{ 
                      padding: '8px', 
                      border: '1px solid #e1e3e5', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      <InlineStack align="space-between">
                        <Badge tone={event.type === 'error' ? 'critical' : 'success'}>
                          {event.type}
                        </Badge>
                        <Text as="span" variant="bodySm" tone="subdued">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </Text>
                      </InlineStack>
                      <pre style={{ 
                        margin: '4px 0 0 0', 
                        fontSize: '11px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </BlockStack>
            </div>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}