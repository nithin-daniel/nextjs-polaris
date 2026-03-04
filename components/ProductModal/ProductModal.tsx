'use client';

import React from 'react';
import {
  Modal,
  Layout,
  Text,
  Badge,
  BlockStack,
  InlineStack,
  Box,
  Divider,
} from '@shopify/polaris';
import { ProductModalProps } from './types';
import { 
  formatPrice, 
  formatRating, 
  formatCategory, 
  getCategoryTone, 
  isValidImageUrl 
} from './utils';

/**
 * ProductModal - A controlled modal component for displaying product details
 * 
 * Features:
 * - Fully controlled open/close state
 * - Responsive design that adapts to different screen sizes
 * - Displays product image, title, description, category, and price
 * - Configurable actions and content sections
 * - TypeScript support with proper prop validation
 * - Accessible modal with proper focus management
 */
export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  open,
  onClose,
  title,
  primaryAction,
  secondaryActions = [],
  showCategory = true,
  showRating = true,
  footerContent,
  size = 'small',
}) => {
  // Don't render if no product is provided
  if (!product) {
    return null;
  }

  // Default modal title
  const modalTitle = title || product.title;

  // Default actions if none provided
  const defaultSecondaryActions = secondaryActions.length > 0 
    ? secondaryActions 
    : [
        {
          content: 'Close',
          onAction: onClose,
        },
      ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      primaryAction={primaryAction}
      secondaryActions={defaultSecondaryActions}
      size={size}
    >
      <Modal.Section>
        <Layout>
          {/* Product Image Section */}
          <Layout.Section variant="oneThird">
            <Box padding="400">
              <div 
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  margin: '0 auto',
                  aspectRatio: '1',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  border: '1px solid var(--p-color-border-subdued)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--p-color-surface-subdued)',
                }}
              >
                {isValidImageUrl(product.image) ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    loading="lazy"
                  />
                ) : (
                  <Text variant="bodyMd" tone="subdued" as="span">
                    No image available
                  </Text>
                )}
              </div>
            </Box>
          </Layout.Section>

          {/* Product Details Section */}
          <Layout.Section>
            <BlockStack gap="400">
              {/* Title and Category */}
              <BlockStack gap="200">
                <Text variant="headingMd" as="h3">
                  {product.title}
                </Text>
                
                {showCategory && (
                  <InlineStack gap="200" align="start">
                    <Badge tone={getCategoryTone(product.category)}>
                      {formatCategory(product.category)}
                    </Badge>
                  </InlineStack>
                )}
              </BlockStack>

              {/* Price and Rating */}
              <InlineStack gap="400" align="space-between" blockAlign="center">
                <Text variant="headingLg" as="span" fontWeight="bold">
                  {formatPrice(product.price)}
                </Text>
                
                {showRating && (
                  <Text variant="bodyMd" tone="subdued" as="span">
                    {formatRating(product.rating.rate, product.rating.count)}
                  </Text>
                )}
              </InlineStack>

              <Divider />

              {/* Description */}
              <BlockStack gap="200">
                <Text variant="headingSm" as="h4">
                  Description
                </Text>
                <Text variant="bodyMd" as="p">
                  {product.description}
                </Text>
              </BlockStack>

              {/* Product Details */}
              <BlockStack gap="200">
                <Text variant="headingSm" as="h4">
                  Product Details
                </Text>
                <BlockStack gap="100">
                  <InlineStack gap="200">
                    <Text variant="bodyMd" fontWeight="medium" as="span">
                      Product ID:
                    </Text>
                    <Text variant="bodyMd" as="span">
                      #{product.id}
                    </Text>
                  </InlineStack>
                  
                  <InlineStack gap="200">
                    <Text variant="bodyMd" fontWeight="medium" as="span">
                      Category:
                    </Text>
                    <Text variant="bodyMd" as="span">
                      {formatCategory(product.category)}
                    </Text>
                  </InlineStack>
                  
                  <InlineStack gap="200">
                    <Text variant="bodyMd" fontWeight="medium" as="span">
                      Rating:
                    </Text>
                    <Text variant="bodyMd" as="span">
                      {product.rating.rate}/5.0 ({product.rating.count} reviews)
                    </Text>
                  </InlineStack>
                </BlockStack>
              </BlockStack>

              {/* Custom Footer Content */}
              {footerContent && (
                <>
                  <Divider />
                  <Box>
                    {footerContent}
                  </Box>
                </>
              )}
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Modal.Section>
    </Modal>
  );
};