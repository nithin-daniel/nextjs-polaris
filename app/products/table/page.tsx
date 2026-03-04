'use client';

import { useState, useCallback } from 'react';
import { 
  Page, 
  Layout, 
  Banner,
  Button,
  ButtonGroup,
  Text
} from '@shopify/polaris';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { useProducts } from '@/hooks';
import { ProductTable, ProductModal } from '@/components';

export default function ProductTablePage() {
  const router = useRouter();
  const { products, loading, error, refreshProducts } = useProducts();
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      subtitle={`${products.length} products in table format`}
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

        {bulkActions}

        <Layout.Section>
          <ProductTable
            products={products}
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