'use client';

import { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  Text,
  InlineStack,
  Badge,
} from '@shopify/polaris';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import { useProducts } from '@/hooks';
import { ProductModal } from '@/components';

export default function ProductModalExamplePage() {
  const router = useRouter();
  const { products, loading } = useProducts();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'small' | 'large'>('small');

  const openModal = (product: Product, size: 'small' | 'large' = 'small') => {
    setSelectedProduct(product);
    setModalSize(size);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = () => {
    console.log('Added to cart:', selectedProduct?.title);
    closeModal();
  };

  const handleEditProduct = () => {
    console.log('Edit product:', selectedProduct?.id);
    // In a real app, you might navigate to an edit page
    closeModal();
  };

  if (loading) {
    return (
      <Page title="Product Modal Examples">
        <Layout>
          <Layout.Section>
            <Card>
              <Text variant="bodyMd" as="p">Loading products...</Text>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Product Modal Examples"
      subtitle="Demonstrating the ProductModal component with different configurations"
      backAction={{
        content: 'Back to Products',
        onAction: () => router.push('/products'),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                ProductModal Component Demo
              </Text>
              <Text variant="bodyMd" as="p">
                Click on any product below to see the ProductModal in action with different sizes and configurations.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingSm" as="h3">
                Sample Products
              </Text>
              
              <BlockStack gap="300">
                {products.slice(0, 6).map((product) => (
                  <Card key={product.id} padding="400">
                    <InlineStack align="space-between" blockAlign="center">
                      <BlockStack gap="200">
                        <InlineStack gap="200" align="start">
                          <img
                            src={product.image}
                            alt={product.title}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                            }}
                          />
                          <BlockStack gap="100">
                            <Text variant="bodyMd" fontWeight="medium" as="span">
                              {product.title.length > 50 
                                ? `${product.title.substring(0, 50)}...` 
                                : product.title}
                            </Text>
                            <InlineStack gap="200">
                              <Badge tone="info">
                                {product.category}
                              </Badge>
                              <Text variant="bodyMd" fontWeight="bold" as="span">
                                ${product.price}
                              </Text>
                            </InlineStack>
                          </BlockStack>
                        </InlineStack>
                      </BlockStack>
                      
                      <InlineStack gap="200">
                        <Button
                          size="slim"
                          onClick={() => openModal(product, 'small')}
                        >
                          Compact View
                        </Button>
                        <Button
                          size="slim"
                          variant="primary"
                          onClick={() => openModal(product, 'large')}
                        >
                          Detailed View
                        </Button>
                      </InlineStack>
                    </InlineStack>
                  </Card>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">
                Features Demonstrated
              </Text>
              <BlockStack gap="200">
                <Text variant="bodyMd" as="p">
                  ✅ <strong>Controlled State:</strong> Modal open/close is fully controlled by parent component
                </Text>
                <Text variant="bodyMd" as="p">
                  ✅ <strong>Responsive Design:</strong> Two modal sizes (small for compact view, large for detailed view)
                </Text>
                <Text variant="bodyMd" as="p">
                  ✅ <strong>Product Display:</strong> Shows image, title, description, category, price, and rating
                </Text>
                <Text variant="bodyMd" as="p">
                  ✅ <strong>Custom Actions:</strong> Configurable primary and secondary actions
                </Text>
                <Text variant="bodyMd" as="p">
                  ✅ <strong>TypeScript Support:</strong> Fully typed props and interfaces
                </Text>
                <Text variant="bodyMd" as="p">
                  ✅ <strong>Accessible:</strong> Built on Polaris Modal with proper focus management
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* ProductModal Component */}
      <ProductModal
        product={selectedProduct}
        open={isModalOpen}
        onClose={closeModal}
        primaryAction={{
          content: 'Add to Cart',
          onAction: handleAddToCart,
        }}
        secondaryActions={[
          {
            content: 'Edit Product',
            onAction: handleEditProduct,
          },
          {
            content: 'Share',
            onAction: () => {
              navigator.share?.({
                title: selectedProduct?.title,
                text: selectedProduct?.description,
                url: window.location.href,
              }).catch(() => {
                console.log('Share not supported, copying to clipboard...');
              });
            },
          },
          {
            content: 'Close',
            onAction: closeModal,
          },
        ]}
        showCategory={true}
        showRating={true}
        size={modalSize}
      />
    </Page>
  );
}