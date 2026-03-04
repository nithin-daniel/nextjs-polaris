import { Product, ProductFilters } from '@/types/product';

/**
 * Client-side product filtering utilities for demo purposes.
 * Filters products based on UI-only fields and existing API fields.
 */

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter(product => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(product.status)) {
        return false;
      }
    }

    // Vendor filter
    if (filters.vendor && filters.vendor.length > 0) {
      if (!filters.vendor.includes(product.vendor)) {
        return false;
      }
    }

    // Product type filter
    if (filters.productType && filters.productType.length > 0) {
      if (!filters.productType.includes(product.productType)) {
        return false;
      }
    }

    // Availability filter
    if (filters.availability && filters.availability.length > 0) {
      if (!filters.availability.includes(product.availability)) {
        return false;
      }
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(product.category)) {
        return false;
      }
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (product.price < min || product.price > max) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get unique values for filter options from product array
 */
export function getFilterOptions(products: Product[]) {
  const statuses = [...new Set(products.map(p => p.status))];
  const vendors = [...new Set(products.map(p => p.vendor))].sort();
  const productTypes = [...new Set(products.map(p => p.productType))].sort();
  const availabilities = [...new Set(products.map(p => p.availability))];
  const categories = [...new Set(products.map(p => p.category))].sort();

  // Price range
  const prices = products.map(p => p.price);
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };

  return {
    statuses,
    vendors,
    productTypes,
    availabilities,
    categories,
    priceRange
  };
}

/**
 * Create empty filters object
 */
export function createEmptyFilters(): ProductFilters {
  return {
    status: [],
    vendor: [],
    productType: [],
    availability: [],
    category: [],
    priceRange: undefined
  };
}