'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, productService } from '@/services';

interface UseProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface UseProductsReturn extends UseProductsState {
  fetchProducts: () => Promise<void>;
  fetchProductsByCategory: (category: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

/**
 * Custom hook for managing product data
 * Provides loading states, error handling, and data fetching methods
 */
export const useProducts = (): UseProductsReturn => {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    loading: false,
    error: null,
  });

  const updateState = useCallback((updates: Partial<UseProductsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchProducts = useCallback(async () => {
    updateState({ loading: true, error: null });

    try {
      const response = await productService.getProducts();
      
      if (response.success && response.data) {
        updateState({ 
          products: response.data, 
          loading: false 
        });
      } else {
        updateState({ 
          error: response.error || 'Failed to fetch products', 
          loading: false 
        });
      }
    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred', 
        loading: false 
      });
    }
  }, [updateState]);

  const fetchProductsByCategory = useCallback(async (category: string) => {
    updateState({ loading: true, error: null });

    try {
      const response = await productService.getProductsByCategory(category);
      
      if (response.success && response.data) {
        updateState({ 
          products: response.data, 
          loading: false 
        });
      } else {
        updateState({ 
          error: response.error || 'Failed to fetch products by category', 
          loading: false 
        });
      }
    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred', 
        loading: false 
      });
    }
  }, [updateState]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    ...state,
    fetchProducts,
    fetchProductsByCategory,
    refreshProducts,
  };
};

/**
 * Hook for fetching a single product by ID
 */
export const useProduct = (id: number) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await productService.getProductById(id);
      
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.error || 'Failed to fetch product');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
};