'use client';

import { useState, useEffect } from 'react';
import { 
  Page, 
  Card, 
  Layout, 
  Text, 
  BlockStack, 
  InlineStack, 
  Badge,
  Button,
  Spinner,
  Banner
} from '@shopify/polaris';
import { useRouter } from 'next/navigation';
import { Product, productService } from '@/services';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const response = await productService.getProducts();
    
    if (response.success && response.data) {
      setProducts(response.data);
    } else {
      setError(response.error || 'Failed to fetch products');
    }
    
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getCategoryColor = (category: string): 'info' | 'success' | 'attention' | 'critical' | undefined => {
    const colors: Record<string, 'info' | 'success' | 'attention' | 'critical'> = {
      electronics: 'info',
      jewelery: 'success',
      "men's clothing": 'attention',
      "women's clothing": 'critical',
    };
    return colors[category];
  };

  if (loading) {
    return (
      <Page title="Products">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400" align="center">
                <Spinner accessibilityLabel="Loading products" size="large" />
                <Text variant="bodyMd" as="p" alignment="center">
                  Loading products...
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
      title="Products"
      subtitle={`${products.length} products available`}
      primaryAction={{
        content: 'Refresh',
        onAction: fetchProducts,
      }}
      secondaryActions={[
        {
          content: 'Table View',
          onAction: () => router.push('/products/table'),
        },
      ]}
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner
              title="Error loading products"
              tone="critical"
              onDismiss={() => setError(null)}
            >
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <BlockStack gap="400">
            {products.map((product) => (
              <Card key={product.id}>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="start">
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h3">
                        {product.title}
                      </Text>
                      <InlineStack gap="200" align="start">
                        <Badge tone={getCategoryColor(product.category)}>
                          {product.category}
                        </Badge>
                        <Text variant="bodyMd" tone="subdued" as="span">
                          ⭐ {product.rating.rate} ({product.rating.count} reviews)
                        </Text>
                      </InlineStack>
                    </BlockStack>
                    <Text variant="headingLg" as="span">
                      {formatPrice(product.price)}
                    </Text>
                  </InlineStack>

                  <Text variant="bodyMd" tone="subdued" as="p">
                    {product.description.length > 150
                      ? `${product.description.substring(0, 150)}...`
                      : product.description}
                  </Text>

                  <InlineStack align="end">
                    <Button variant="primary" size="slim">
                      View Details
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            ))}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}