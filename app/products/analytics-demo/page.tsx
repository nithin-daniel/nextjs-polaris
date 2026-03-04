'use client';

import { useState, useEffect } from 'react';
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Box
} from '@shopify/polaris';
import { ProductTable, ProductModal } from '@/components';
import { useProducts } from '@/hooks';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Product } from '@/types/product';

/**
 * Analytics Demo Page
 * 
 * Demonstrates the analytics tracking system integrated with
 * ProductTable and ProductModal components.
 */
export default function AnalyticsDemoPage() {
  const { products, loading, error } = useProducts();
  const analytics = useAnalytics();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Track page load
  useEffect(() => {
    console.log('[Analytics Demo] Page loaded, tracking will be automatic via useAnalytics hook');
  }, []);

  // Handle product table row clicks
  const handleRowClick = (product: Product) => {
    console.log('[Analytics Demo] Product clicked:', product.title);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle product actions
  const handleProductAction = (action: string, product: Product) => {
    console.log('[Analytics Demo] Product action:', action, product.title);
    
    // Track specific actions
    if (action === 'edit') {
      console.log('Edit action tracked automatically by ProductTable');
    } else if (action === 'delete') {
      console.log('Delete action tracked automatically by ProductTable');
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    console.log(`[Analytics Demo] Bulk ${action} on ${selectedIds.length} products`);
    
    // Track bulk action
    analytics.trackBulkAction(
      action as 'delete' | 'export' | 'edit' | 'duplicate',
      selectedIds,
      true // Simulate success
    );

    // Clear selection
    setSelectedIds([]);
  };

  // Handle modal actions
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    console.log('[Analytics Demo] Add to cart:', selectedProduct.title);
    // The ProductModal will automatically track this as 'add_to_cart' action
    
    setIsModalOpen(false);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Simulate search
  const handleSearch = () => {
    const query = 'test search';
    const resultCount = products.length;
    
    analytics.trackSearch(query, resultCount, {
      filters: { category: 'electronics' },
      sortBy: 'price'
    });
    
    console.log(`[Analytics Demo] Search tracked: "${query}" with ${resultCount} results`);
  };

  // Simulate error
  const handleSimulateError = () => {
    const error = new Error('Simulated API error for testing');
    
    analytics.trackError('api', error.message, {
      errorCode: 500,
      context: {
        action: 'simulate_error',
        timestamp: Date.now()
      }
    });
    
    console.log('[Analytics Demo] Error tracked:', error.message);
  };

  if (loading) {
    return (
      <Page title="Analytics Demo - Loading">
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <Text as="p" alignment="center">Loading products...</Text>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Analytics Demo - Error">
        <Layout>
          <Layout.Section>
            <Card>
              <Box padding="400">
                <Text as="p" tone="critical">Error loading products: {error}</Text>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Analytics Demo"
      subtitle={`${products.length} products loaded • ${selectedIds.length} selected`}
      backAction={{ content: 'Products', url: '/products' }}
    >
      <Layout>
        {/* Analytics Info */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Analytics Tracking Demo</Text>
                <Text as="p" variant="bodyMd">
                  This page demonstrates automatic analytics tracking. All interactions 
                  are logged to localStorage and can be viewed in the Analytics Dashboard.
                </Text>
                
                <InlineStack gap="200">
                  <Badge tone="success">Page Views: Auto-tracked</Badge>
                  <Badge tone="info">Product Clicks: Auto-tracked</Badge>
                  <Badge tone="attention">Modal Opens/Closes: Auto-tracked</Badge>
                  <Badge tone="warning">Bulk Actions: Manual tracking</Badge>
                </InlineStack>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* Demo Actions */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Manual Tracking Examples</Text>
                <InlineStack gap="200">
                  <Button onClick={handleSearch}>
                    Simulate Search
                  </Button>
                  <Button onClick={handleSimulateError} tone="critical">
                    Simulate Error
                  </Button>
                  <Button 
                    onClick={() => handleBulkAction('export')} 
                    disabled={selectedIds.length === 0}
                  >
                    Export Selected ({selectedIds.length.toString()})
                  </Button>
                  <Button 
                    onClick={() => handleBulkAction('delete')} 
                    disabled={selectedIds.length === 0}
                    tone="critical"
                  >
                    Delete Selected ({selectedIds.length.toString()})
                  </Button>
                </InlineStack>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>

        {/* Product Table */}
        <Layout.Section>
          <ProductTable
            products={products}
            loading={loading}
            onRowClick={handleRowClick}
            onAction={handleProductAction}
            onSelectionChange={setSelectedIds}
            selectedIds={selectedIds}
            selectable={true}
          />
        </Layout.Section>

        {/* Analytics Instructions */}
        <Layout.Section>
          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">View Analytics Data</Text>
                <Text as="p" variant="bodyMd">
                  After interacting with products, visit the Analytics Dashboard to see 
                  aggregated data about page views, product interactions, and user behavior.
                </Text>
                <InlineStack gap="200">
                  <Button url="/analytics" variant="primary">
                    View Analytics Dashboard
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('Current session:', analytics);
                      alert('Check the browser console for current analytics data');
                    }}
                  >
                    Log Current Data
                  </Button>
                </InlineStack>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        open={isModalOpen}
        onClose={handleCloseModal}
        primaryAction={{
          content: 'Add to Cart',
          onAction: handleAddToCart
        }}
        secondaryActions={[
          {
            content: 'Edit Product',
            onAction: () => {
              console.log('[Analytics Demo] Edit from modal');
              handleCloseModal();
            }
          }
        ]}
      />
    </Page>
  );
}