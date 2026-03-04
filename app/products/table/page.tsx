'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  Page, 
  Layout, 
  Banner,
  Button,
  ButtonGroup,
  Text,
  Tabs,
  Card,
  Box
} from '@shopify/polaris';
import { useRouter } from 'next/navigation';
import { Product, ProductStatus } from '@/types/product';
import { useProducts } from '@/hooks';
import { ProductTable, ProductModal } from '@/components';
import { filterProducts } from '@/utils/productFilters';

export default function ProductTablePage() {
  const router = useRouter();
  const { products, loading, error, refreshProducts } = useProducts();
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Status filter state
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter products by status
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    const statusFilters: (ProductStatus | 'all')[] = ['all', 'active', 'draft', 'archived'];
    const currentFilter = statusFilters[selectedTab];
    
    if (currentFilter === 'all') {
      return products;
    }
    
    return filterProducts(products, { status: [currentFilter] });
  }, [products, selectedTab]);
  
  // Navigation tabs with counts
  const tabs = useMemo(() => [
    { id: 'all', content: 'All', badge: products?.length.toString() || '0' },
    { id: 'active', content: 'Active', badge: products?.filter(p => p.status === 'active').length.toString() || '0' },
    { id: 'draft', content: 'Draft', badge: products?.filter(p => p.status === 'draft').length.toString() || '0' },
    { id: 'archived', content: 'Archived', badge: products?.filter(p => p.status === 'archived').length.toString() || '0' },
  ], [products]);

  // Handle row click
  const handleRowClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  // Handle selection changes
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
    console.log(`Bulk action: ${action} on products:`, selectedIds);
    // Implement bulk operations here
  }, [selectedIds]);

  // Handle individual actions
  const handleAction = useCallback((action: string, product: Product) => {
    console.log(`Action: ${action} on product:`, product.title);
    
    switch (action) {
      case 'view':
        handleRowClick(product);
        break;
      case 'edit':
        // Navigate to edit page or open edit modal
        console.log('Edit product:', product.id);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }, [handleRowClick]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  // Bulk action buttons
  const bulkActions = selectedIds.length > 0 && (
    <Layout.Section>
      <div style={{ marginBottom: '16px' }}>
        <Text variant="bodyMd" as="p">
          {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected
        </Text>
        <ButtonGroup>
          <Button onClick={() => handleBulkAction('export')}>
            Export Selected
          </Button>
          <Button onClick={() => handleBulkAction('delete')} tone="critical">
            Delete Selected
          </Button>
          <Button onClick={() => setSelectedIds([])}>
            Clear Selection
          </Button>
        </ButtonGroup>
      </div>
    </Layout.Section>
  );

  return (
    <Page
      title="Products Table"
      subtitle={`${filteredProducts.length} products in table format`}
      primaryAction={{
        content: 'Refresh',
        onAction: refreshProducts,
      }}
      secondaryActions={[
        {
          content: 'Card View',
          onAction: () => router.push('/products'),
        },
        {
          content: 'Modal Demo',
          onAction: () => router.push('/products/modal'),
        },
        {
          content: 'Add Product',
          onAction: () => console.log('Add product'),
        },
      ]}
      backAction={{
        content: 'Products',
        onAction: () => router.push('/products'),
      }}
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner
              title="Error loading products"
              tone="critical"
              onDismiss={() => window.location.reload()}
            >
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        )}

        {/* Status Navigation Tabs */}
        <Layout.Section>
          <Card>
            <Box paddingBlockEnd="400">
              <Tabs
                tabs={tabs}
                selected={selectedTab}
                onSelect={setSelectedTab}
                fitted
              />
            </Box>
          </Card>
        </Layout.Section>

        {bulkActions}

        <Layout.Section>
          <ProductTable
            products={filteredProducts}
            loading={loading}
            onRowClick={handleRowClick}
            onSelectionChange={handleSelectionChange}
            selectedIds={selectedIds}
            selectable={true}
            showActions={true}
            onAction={handleAction}
            emptyStateMessage="No products available. Try refreshing or adding new products."
          />
        </Layout.Section>

        {/* Product Detail Modal */}
        <ProductModal
          product={selectedProduct}
          open={isModalOpen}
          onClose={closeModal}
          primaryAction={{
            content: 'Add to Cart',
            onAction: () => {
              console.log('Add to cart:', selectedProduct?.title);
              closeModal();
            },
          }}
          secondaryActions={[
            {
              content: 'Edit Product',
              onAction: () => {
                console.log('Edit product:', selectedProduct?.id);
                closeModal();
              },
            },
            {
              content: 'Close',
              onAction: closeModal,
            },
          ]}
          showCategory={true}
          showRating={true}
          size="large"
        />
      </Layout>
    </Page>
  );
}