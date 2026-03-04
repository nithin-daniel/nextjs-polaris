'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  IndexTable,
  Card,
  Text,
  Thumbnail,
  Badge,
  Button,
  ButtonGroup,
  EmptyState,
  useIndexResourceState,
} from '@shopify/polaris';
import { ProductTableProps, ProductTableRow, ProductAction } from './types';
import { transformProductsToRows, getProductFromRows } from './utils';

/**
 * Reusable ProductTable component using Shopify Polaris IndexTable
 * 
 * Features:
 * - Displays products in a structured table format
 * - Supports row selection and click handlers
 * - Clean separation of concerns
 * - Fully typed with TypeScript
 * - Responsive design with proper loading states
 */
export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading = false,
  onRowClick,
  onSelectionChange,
  selectedIds = [],
  selectable = false,
  emptyStateMessage = "No products found",
  showActions = true,
  onAction,
}) => {
  // Transform products to table rows
  const rows = useMemo(() => transformProductsToRows(products), [products]);

  // Handle selection state
  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
  } = useIndexResourceState(rows, {
    selectedResources: selectedIds,
  });

  // Notify parent of selection changes
  const handleSelectionChangeWithCallback = useCallback(
    (selectionType: any, isSelecting: boolean, selection?: string) => {
      handleSelectionChange(selectionType, isSelecting, selection);
      
      // Get updated selected resources
      let updatedSelection: string[] = [];
      
      if (selectionType === 'all') {
        updatedSelection = isSelecting ? rows.map(row => row.id) : [];
      } else if (selectionType === 'page') {
        updatedSelection = isSelecting ? rows.map(row => row.id) : [];
      } else if (selection) {
        if (isSelecting) {
          updatedSelection = [...selectedResources, selection];
        } else {
          updatedSelection = selectedResources.filter(id => id !== selection);
        }
      }
      
      onSelectionChange?.(updatedSelection);
    },
    [handleSelectionChange, onSelectionChange, rows, selectedResources]
  );

  // Handle row click
  const handleRowClick = useCallback(
    (id: string) => {
      const product = getProductFromRows(rows, id);
      if (product && onRowClick) {
        onRowClick(product);
      }
    },
    [rows, onRowClick]
  );

  // Handle actions
  const handleAction = useCallback(
    (action: ProductAction, productId: string) => {
      const product = getProductFromRows(rows, productId);
      if (product && onAction) {
        onAction(action, product);
      }
    },
    [rows, onAction]
  );

  // Render table rows
  const rowMarkup = rows.map((row, index) => (
    <IndexTable.Row
      id={row.id}
      key={row.id}
      selected={selectedResources.includes(row.id)}
      position={index}
      onClick={() => handleRowClick(row.id)}
    >
      {/* Product column with image and title */}
      <IndexTable.Cell>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Thumbnail
            source={row.image}
            alt={row.title}
            size="small"
          />
          <div>
            <Text variant="bodyMd" fontWeight="medium" as="span">
              {row.title}
            </Text>
          </div>
        </div>
      </IndexTable.Cell>

      {/* Category column */}
      <IndexTable.Cell>
        <Badge tone="info">{row.category}</Badge>
      </IndexTable.Cell>

      {/* Status column */}
      <IndexTable.Cell>
        <Badge 
          tone={
            row.status === 'active' ? 'success' : 
            row.status === 'draft' ? 'attention' : 
            'info'
          }
        >
          {row.status}
        </Badge>
      </IndexTable.Cell>

      {/* Vendor column */}
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {row.vendor}
        </Text>
      </IndexTable.Cell>

      {/* Product Type column */}
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span">
          {row.productType}
        </Text>
      </IndexTable.Cell>

      {/* Availability column */}
      <IndexTable.Cell>
        <Badge 
          tone={
            row.availability === 'in_stock' ? 'success' : 
            row.availability === 'low_stock' ? 'attention' : 
            'critical'
          }
        >
          {row.availability.replace('_', ' ')}
        </Badge>
      </IndexTable.Cell>

      {/* Price column */}
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="medium" as="span">
          {row.price}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <Card>
        <EmptyState
          heading="No products available"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>{emptyStateMessage}</p>
        </EmptyState>
      </Card>
    );
  }

  return (
    <Card padding="0">
      <IndexTable
        resourceName={resourceName}
        itemCount={products.length}
        selectedItemsCount={
          allResourcesSelected ? 'All' : selectedResources.length
        }
        onSelectionChange={selectable ? handleSelectionChangeWithCallback : undefined}
        headings={[
          { title: 'Product' },
          { title: 'Category' },
          { title: 'Status' },
          { title: 'Vendor' },
          { title: 'Type' },
          { title: 'Availability' },
          { title: 'Price' },
        ]}
        loading={loading}
        selectable={selectable}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
};