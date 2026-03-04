import { 
  Product, 
  ApiProduct,
  ProductsApiResponse, 
  ServiceResponse, 
  ProductServiceConfig 
} from '@/types/product';
import { enrichProductsWithMockData, enrichProductWithMockData } from '@/utils/mockProductEnrichment';

/**
 * Production-ready Product Service
 * Handles API communication with proper error handling and TypeScript support
 */
export class ProductService {
  private config: ProductServiceConfig;

  constructor(config?: Partial<ProductServiceConfig>) {
    this.config = {
      baseUrl: 'https://fakestoreapi.com',
      timeout: 10000,
      retryAttempts: 3,
      ...config,
    };
  }

  /**
   * Fetches all products from the API
   * @returns Promise<ServiceResponse<Product[]>>
   */
  async getProducts(): Promise<ServiceResponse<Product[]>> {
    try {
      const response = await this.fetchWithRetry('/products');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductsApiResponse = await response.json();
      
      // Validate response data
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array');
      }

      // Type validation for each product
      const validatedProducts = data.map(this.validateProduct);
      
      // Enrich with mock UI-only fields
      const enrichedProducts = enrichProductsWithMockData(validatedProducts);

      return {
        data: enrichedProducts,
        success: true,
      };
    } catch (error) {
      console.error('ProductService.getProducts error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Fetches a single product by ID
   * @param id - Product ID
   * @returns Promise<ServiceResponse<Product>>
   */
  async getProductById(id: number): Promise<ServiceResponse<Product>> {
    try {
      const response = await this.fetchWithRetry(`/products/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiProduct = await response.json();
      const validatedProduct = this.validateProduct(data);
      
      // Enrich with mock UI-only fields
      const enrichedProduct = enrichProductWithMockData(validatedProduct);

      return {
        data: enrichedProduct,
        success: true,
      };
    } catch (error) {
      console.error('ProductService.getProductById error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Fetches products by category
   * @param category - Product category
   * @returns Promise<ServiceResponse<Product[]>>
   */
  async getProductsByCategory(category: string): Promise<ServiceResponse<Product[]>> {
    try {
      const response = await this.fetchWithRetry(`/products/category/${encodeURIComponent(category)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProductsApiResponse = await response.json();
      const validatedProducts = data.map(this.validateProduct);
      
      // Enrich with mock UI-only fields
      const enrichedProducts = enrichProductsWithMockData(validatedProducts);

      return {
        data: enrichedProducts,
        success: true,
      };
    } catch (error) {
      console.error('ProductService.getProductsByCategory error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Fetches all available categories
   * @returns Promise<ServiceResponse<string[]>>
   */
  async getCategories(): Promise<ServiceResponse<string[]>> {
    try {
      const response = await this.fetchWithRetry('/products/categories');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: string[] = await response.json();

      return {
        data: data,
        success: true,
      };
    } catch (error) {
      console.error('ProductService.getCategories error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  /**
   * Fetch with retry mechanism and timeout
   * @private
   */
  private async fetchWithRetry(
    endpoint: string, 
    attempt: number = 1
  ): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (attempt < (this.config.retryAttempts || 3)) {
        console.warn(`Request failed, retrying (${attempt}/${this.config.retryAttempts})...`);
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        return this.fetchWithRetry(endpoint, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Validates product data structure
   * @private
   */
  private validateProduct(product: any): ApiProduct {
    if (!product || typeof product !== 'object') {
      throw new Error('Invalid product data');
    }

    const requiredFields = ['id', 'title', 'price', 'description', 'category', 'image', 'rating'];
    const missingFields = requiredFields.filter(field => !(field in product));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Type coercion and validation
    return {
      id: Number(product.id),
      title: String(product.title),
      price: Number(product.price),
      description: String(product.description),
      category: String(product.category),
      image: String(product.image),
      rating: {
        rate: Number(product.rating?.rate || 0),
        count: Number(product.rating?.count || 0),
      },
    };
  }

  /**
   * Utility delay function
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Default instance for easy imports
export const productService = new ProductService();