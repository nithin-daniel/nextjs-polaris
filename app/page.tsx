'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Page,
  Layout,
  Banner,
  Button,
  ButtonGroup,
  Text,
  TextField,
  InlineStack,
  Box,
  Popover,
  ActionList,
  Checkbox,
  Tag,
  Sheet,
} from '@shopify/polaris';
import { useRouter } from 'next/navigation';
import { Product, ProductStatus } from '@/types/product';
import { useProducts } from '@/hooks';
import { ProductTable, ProductModal } from '@/components';
import { filterProducts } from '@/utils/productFilters';

export default function HomePage() {
  const router = useRouter();
  const { products, loading, error } = useProducts();
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Status filter state
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseAvailability, setPurchaseAvailability] = useState<string[]>([]);
  const [productTypeFilter, setProductTypeFilter] = useState<string[]>([]);
  const [vendorFilter, setVendorFilter] = useState<string[]>([]);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [purchaseDropdownOpen, setPurchaseDropdownOpen] = useState(false);
  const [productTypeDropdownOpen, setProductTypeDropdownOpen] = useState(false);
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [purchasePopoverActive, setPurchasePopoverActive] = useState(false);
  const [productTypePopoverActive, setProductTypePopoverActive] = useState(false);
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter products by status, search, and additional filters
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let result = products;
    
    // Status filter
    const statusFilters: (ProductStatus | 'all')[] = ['all', 'active', 'draft', 'archived'];
    const currentStatusFilter = statusFilters[selectedTab];
    
    if (currentStatusFilter !== 'all') {
      result = filterProducts(result, { status: [currentStatusFilter] });
    }
    
    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Purchase availability filter (mapped to availability)
    if (purchaseAvailability.length > 0) {
      const availabilityMapping: Record<string, string> = {
        'online_store': 'in_stock',
        'point_of_sale': 'low_stock', 
        'buy_button': 'out_of_stock'
      };
      const mappedAvailabilities = purchaseAvailability.map(pa => availabilityMapping[pa]).filter(Boolean);
      if (mappedAvailabilities.length > 0) {
        result = result.filter(product => mappedAvailabilities.includes(product.availability));
      }
    }
    
    // Product type filter
    if (productTypeFilter.length > 0) {
      result = result.filter(product => productTypeFilter.includes(product.productType));
    }
    
    // Vendor filter
    if (vendorFilter.length > 0) {
      result = result.filter(product => vendorFilter.includes(product.vendor));
    }
    
    return result;
  }, [products, selectedTab, searchQuery, purchaseAvailability, productTypeFilter, vendorFilter]);
  
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
  const handleCloseModal = useCallback(() => {
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
      title="Products"
      subtitle={`${filteredProducts.length} products in table format`}
      secondaryActions={[
        {
          content: 'Add Product',
          onAction: () => console.log('Add product'),
        },
      ]}
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

        {/* Search and Filters Section */}
        <Layout.Section>
          <Box paddingBlockEnd="400">
            <InlineStack gap="400" align="space-between">
              {/* Search - takes half width */}
              <div style={{ flex: '1', maxWidth: '50%' }}>
                <TextField
                  label=""
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search products..."
                  autoComplete="off"
                  clearButton
                  onClearButtonClick={() => setSearchQuery('')}
                />
              </div>
              
              {/* Filters - right section */}
              <InlineStack gap="200" align="end">
                {/* Purchase Availability Filter */}
                <Popover
                  active={purchasePopoverActive}
                  activator={
                    <Button
                      onClick={() => setPurchasePopoverActive(!purchasePopoverActive)}
                      disclosure
                    >
                      {purchaseAvailability.length > 0 ? `Purchase Availability (${purchaseAvailability.length})` : 'Select Purchase Availability'}
                    </Button>
                  }
                  onClose={() => setPurchasePopoverActive(false)}
                >
                  <div style={{ padding: '16px', minWidth: '200px' }}>
                    <Text variant="headingMd" as="h3">Purchase Availability</Text>
                    <div style={{ marginTop: '12px' }}>
                      {[
                        { label: 'Online Store', value: 'online_store' },
                        { label: 'Point of Sale', value: 'point_of_sale' },
                        { label: 'Buy Button', value: 'buy_button' },
                      ].map((option) => (
                        <div key={option.value} style={{ marginBottom: '8px' }}>
                          <Checkbox
                            label={option.label}
                            checked={purchaseAvailability.includes(option.value)}
                            onChange={(checked) => {
                              if (checked) {
                                setPurchaseAvailability([...purchaseAvailability, option.value]);
                              } else {
                                setPurchaseAvailability(purchaseAvailability.filter(pa => pa !== option.value));
                              }
                            }}
                          />
                        </div>
                      ))}
                      {purchaseAvailability.length > 0 && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e1e3e5' }}>
                          <Button
                            onClick={() => setPurchaseAvailability([])}
                            variant="plain"
                            size="slim"
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Popover>
                
                {/* Product Type Filter */}
                <Popover
                  active={productTypePopoverActive}
                  activator={
                    <Button
                      onClick={() => setProductTypePopoverActive(!productTypePopoverActive)}
                      disclosure
                    >
                      {productTypeFilter.length > 0 ? `Product Type (${productTypeFilter.length})` : 'Select Product Type'}
                    </Button>
                  }
                  onClose={() => setProductTypePopoverActive(false)}
                >
                  <div style={{ padding: '16px', minWidth: '200px' }}>
                    <Text variant="headingMd" as="h3">Product Type</Text>
                    <div style={{ marginTop: '12px' }}>
                      {[
                        { label: 'T-Shirt', value: 'T-Shirt' },
                        { label: 'Accessory', value: 'Accessory' },
                        { label: 'Gift Card', value: 'Gift Card' },
                      ].map((option) => (
                        <div key={option.value} style={{ marginBottom: '8px' }}>
                          <Checkbox
                            label={option.label}
                            checked={productTypeFilter.includes(option.value)}
                            onChange={(checked) => {
                              if (checked) {
                                setProductTypeFilter([...productTypeFilter, option.value]);
                              } else {
                                setProductTypeFilter(productTypeFilter.filter(pt => pt !== option.value));
                              }
                            }}
                          />
                        </div>
                      ))}
                      {productTypeFilter.length > 0 && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e1e3e5' }}>
                          <Button
                            onClick={() => setProductTypeFilter([])}
                            variant="plain"
                            size="slim"
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Popover>
                
                {/* More Filters Button */}
                <Button
                  onClick={() => setMoreFiltersOpen(true)}
                  variant="secondary"
                >
                  More Filters
                </Button>
              </InlineStack>
            </InlineStack>
          </Box>
        </Layout.Section>

        {/* Selected Filters */}
        {(purchaseAvailability.length > 0 || productTypeFilter.length > 0 || vendorFilter.length > 0) && (
          <Layout.Section>
            <InlineStack gap="200" wrap>
              {purchaseAvailability.map((item) => (
                <Tag
                  key={`purchase-${item}`}
                  onRemove={() => {
                    setPurchaseAvailability(prev => prev.filter(p => p !== item));
                  }}
                >
                  Purchase: {item === 'online_store' ? 'Online Store' : item === 'point_of_sale' ? 'Point of Sale' : 'Buy Button'}
                </Tag>
              ))}
              {productTypeFilter.map((item) => (
                <Tag
                  key={`type-${item}`}
                  onRemove={() => {
                    setProductTypeFilter(prev => prev.filter(p => p !== item));
                  }}
                >
                  Type: {item}
                </Tag>
              ))}
              {vendorFilter.map((item) => (
                <Tag
                  key={`vendor-${item}`}
                  onRemove={() => {
                    setVendorFilter(prev => prev.filter(p => p !== item));
                  }}
                >
                  Vendor: {item}
                </Tag>
              ))}
            </InlineStack>
          </Layout.Section>
        )}

        {/* Status Navigation */}
        <Layout.Section>
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab, index) => (
                <button
                  key={`${tab.id}-${index}`}
                  onClick={() => setSelectedTab(index)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    selectedTab === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.content}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    selectedTab === index
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {tab.badge}
                  </span>
                </button>
              ))}
            </nav>
          </div>
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
            showActions={false}
            onAction={handleAction}
            emptyStateMessage="No products available. Try refreshing or adding new products."
          />
        </Layout.Section>

        {/* Product Detail Modal */}
        <ProductModal
          product={selectedProduct}
          open={isModalOpen}
          onClose={handleCloseModal}
          showCategory={true}
          showRating={true}
          size="large"
        />
      </Layout>

      {/* More Filters Sidebar */}
      <Sheet
        open={moreFiltersOpen}
        onClose={() => setMoreFiltersOpen(false)}
        accessibilityLabel="More filters"
      >
        <div style={{ 
          padding: '24px', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}>
          <div style={{ flex: 1 }}>
            <Text variant="headingLg" as="h2">More Filters</Text>
            
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Purchase Availability Collapsible */}
                <div>
                  <Button
                    onClick={() => setPurchaseDropdownOpen(!purchaseDropdownOpen)}
                    variant="plain"
                    textAlign="left"
                    size="large"
                    disclosure={purchaseDropdownOpen ? 'up' : 'down'}
                  >
                    Purchase Availability
                  </Button>
                  {purchaseDropdownOpen && (
                    <div style={{ marginTop: '12px', paddingLeft: '16px' }}>
                      {[
                        { label: 'Online Store', value: 'online_store' },
                        { label: 'Point of Sale', value: 'point_of_sale' },
                        { label: 'Buy Button', value: 'buy_button' },
                      ].map((option) => (
                        <div key={option.value} style={{ marginBottom: '8px' }}>
                          <Checkbox
                            label={option.label}
                            checked={purchaseAvailability.includes(option.value)}
                            onChange={(checked) => {
                              if (checked) {
                                setPurchaseAvailability([...purchaseAvailability, option.value]);
                              } else {
                                setPurchaseAvailability(purchaseAvailability.filter(pa => pa !== option.value));
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Type Collapsible */}
                <div>
                  <Button
                    onClick={() => setProductTypeDropdownOpen(!productTypeDropdownOpen)}
                    variant="plain"
                    textAlign="left"
                    size="large"
                    disclosure={productTypeDropdownOpen ? 'up' : 'down'}
                  >
                    Product Type
                  </Button>
                  {productTypeDropdownOpen && (
                    <div style={{ marginTop: '12px', paddingLeft: '16px' }}>
                      {[
                        { label: 'T-Shirt', value: 'T-Shirt' },
                        { label: 'Accessory', value: 'Accessory' },
                        { label: 'Gift Card', value: 'Gift Card' },
                      ].map((option) => (
                        <div key={option.value} style={{ marginBottom: '8px' }}>
                          <Checkbox
                            label={option.label}
                            checked={productTypeFilter.includes(option.value)}
                            onChange={(checked) => {
                              if (checked) {
                                setProductTypeFilter([...productTypeFilter, option.value]);
                              } else {
                                setProductTypeFilter(productTypeFilter.filter(pt => pt !== option.value));
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vendor Collapsible */}
                <div>
                  <Button
                    onClick={() => setVendorDropdownOpen(!vendorDropdownOpen)}
                    variant="plain"
                    textAlign="left"
                    size="large"
                    disclosure={vendorDropdownOpen ? 'up' : 'down'}
                  >
                    Vendor
                  </Button>
                  {vendorDropdownOpen && (
                    <div style={{ marginTop: '12px', paddingLeft: '16px' }}>
                      {[
                        { label: 'Apple', value: 'Apple' },
                        { label: 'Nike', value: 'Nike' },
                        { label: 'Zara', value: 'Zara' },
                        { label: 'Tiffany & Co', value: 'Tiffany & Co' },
                        { label: 'Samsung', value: 'Samsung' },
                        { label: 'Adidas', value: 'Adidas' },
                      ].map((option) => (
                        <div key={option.value} style={{ marginBottom: '8px' }}>
                          <Checkbox
                            label={option.label}
                            checked={vendorFilter.includes(option.value)}
                            onChange={(checked) => {
                              if (checked) {
                                setVendorFilter([...vendorFilter, option.value]);
                              } else {
                                setVendorFilter(vendorFilter.filter(v => v !== option.value));
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{ 
            borderTop: '1px solid #e1e3e5', 
            paddingTop: '16px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <Button
              variant="plain"
              onClick={() => {
                setPurchaseAvailability([]);
                setProductTypeFilter([]);
                setVendorFilter([]);
              }}
            >
              Clear all filters
            </Button>
            <Button
              variant="primary"
              tone="success"
              onClick={() => setMoreFiltersOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Sheet>
    </Page>
  );
}
