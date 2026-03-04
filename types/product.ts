/**
 * Product interface for e-commerce data structure
 * Based on Fake Store API response format with UI-only extensions
 */
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
  // UI-only fields for demo purposes
  status: ProductStatus;
  vendor: string;
  productType: string;
  availability: ProductAvailability;
}

/**
 * API Product interface - matches Fake Store API response
 */
export interface ApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
}

export interface ProductRating {
  rate: number;
  count: number;
}

// UI-only enums
export type ProductStatus = 'active' | 'draft' | 'archived';
export type ProductAvailability = 'in_stock' | 'low_stock' | 'out_of_stock';

// Mock vendors based on categories
export const MOCK_VENDORS = {
  electronics: ['Apple', 'Samsung', 'Sony', 'LG', 'Dell'],
  jewelery: ['Tiffany & Co', 'Cartier', 'Pandora', 'Kay Jewelers'],
  "men's clothing": ['Nike', 'Adidas', 'Levi\'s', 'Calvin Klein', 'Tommy Hilfiger'],
  "women's clothing": ['Zara', 'H&M', 'Forever 21', 'Victoria\'s Secret', 'Gap']
} as const;

// Mock product types
export const PRODUCT_TYPES = {
  electronics: ['Smartphone', 'Laptop', 'Headphones', 'TV', 'Camera'],
  jewelery: ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Watch'],
  "men's clothing": ['Shirt', 'Pants', 'Jacket', 'Shoes', 'Accessories'],
  "women's clothing": ['Dress', 'Top', 'Pants', 'Shoes', 'Accessories']
} as const;

/**
 * API Response types for better type safety
 */
export type ProductsApiResponse = ApiProduct[];

/**
 * Service response wrapper for consistent error handling
 */
export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Product service configuration
 */
export interface ProductServiceConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * Product filters for UI components
 */
export interface ProductFilters {
  status?: ProductStatus[];
  vendor?: string[];
  productType?: string[];
  availability?: ProductAvailability[];
  category?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}