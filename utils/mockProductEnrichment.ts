import { Product, ApiProduct, ProductStatus, ProductAvailability, MOCK_VENDORS, PRODUCT_TYPES } from '@/types/product';

/**
 * Enriches API products with mock UI-only fields for demo purposes.
 * Uses deterministic randomization based on product ID for consistency.
 */

// Seeded random function for consistent results
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Get random item from array using seeded random
function getRandomItem<T>(array: readonly T[], seed: number): T {
  const index = Math.floor(seededRandom(seed) * array.length);
  return array[index];
}

// Generate mock status based on product ID
function generateMockStatus(productId: number): ProductStatus {
  const statuses: ProductStatus[] = ['active', 'draft', 'archived'];
  // 70% active, 20% draft, 10% archived
  const rand = seededRandom(productId * 1.1);
  if (rand < 0.7) return 'active';
  if (rand < 0.9) return 'draft';
  return 'archived';
}

// Generate mock availability based on product rating
function generateMockAvailability(productId: number, rating: number): ProductAvailability {
  const availabilities: ProductAvailability[] = ['in_stock', 'low_stock', 'out_of_stock'];
  // Higher rated products more likely to be in stock
  const rand = seededRandom(productId * 1.3);
  const ratingBonus = rating > 4 ? 0.2 : rating > 3 ? 0.1 : 0;
  
  if (rand + ratingBonus < 0.7) return 'in_stock';
  if (rand + ratingBonus < 0.9) return 'low_stock';
  return 'out_of_stock';
}

// Generate mock vendor based on category
function generateMockVendor(productId: number, category: string): string {
  const categoryKey = category as keyof typeof MOCK_VENDORS;
  const vendors = MOCK_VENDORS[categoryKey] || ['Generic Brand'];
  return getRandomItem(vendors, productId * 1.5);
}

// Generate mock product type based on category and title
function generateMockProductType(productId: number, category: string, title: string): string {
  const categoryKey = category as keyof typeof PRODUCT_TYPES;
  const types = PRODUCT_TYPES[categoryKey] || ['General'];
  
  // Try to match type based on title keywords
  const titleLower = title.toLowerCase();
  
  // Smart matching for common keywords
  if (titleLower.includes('shirt') || titleLower.includes('t-shirt')) return 'Shirt';
  if (titleLower.includes('jacket') || titleLower.includes('coat')) return 'Jacket';
  if (titleLower.includes('ring')) return 'Ring';
  if (titleLower.includes('necklace')) return 'Necklace';
  if (titleLower.includes('dress')) return 'Dress';
  if (titleLower.includes('laptop') || titleLower.includes('computer')) return 'Laptop';
  if (titleLower.includes('phone') || titleLower.includes('mobile')) return 'Smartphone';
  
  // Fallback to seeded random selection
  return getRandomItem(types, productId * 1.7);
}

/**
 * Main enrichment function that adds UI-only fields to API products
 */
export function enrichProductWithMockData(apiProduct: ApiProduct): Product {
  return {
    ...apiProduct,
    status: generateMockStatus(apiProduct.id),
    vendor: generateMockVendor(apiProduct.id, apiProduct.category),
    productType: generateMockProductType(apiProduct.id, apiProduct.category, apiProduct.title),
    availability: generateMockAvailability(apiProduct.id, apiProduct.rating.rate),
  };
}

/**
 * Batch enrichment for multiple products
 */
export function enrichProductsWithMockData(apiProducts: ApiProduct[]): Product[] {
  return apiProducts.map(enrichProductWithMockData);
}