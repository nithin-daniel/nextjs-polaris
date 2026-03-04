/**
 * Product interface for e-commerce data structure
 * Based on Fake Store API response format
 */
export interface Product {
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

/**
 * API Response types for better type safety
 */
export type ProductsApiResponse = Product[];

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