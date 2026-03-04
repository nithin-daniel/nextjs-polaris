import { Product } from '@/types/product';
import { ProductTableRow } from './types';

/**
 * Utility functions for ProductTable component
 */

/**
 * Formats price to currency string
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price);
};

/**
 * Formats rating display
 */
export const formatRating = (rate: number, count: number): string => {
  return `⭐ ${rate.toFixed(1)} (${count})`;
};

/**
 * Capitalizes first letter of each word
 */
export const capitalizeCategory = (category: string): string => {
  return category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncates text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Transforms products to table rows
 */
export const transformProductsToRows = (products: Product[]): ProductTableRow[] => {
  return products.map((product) => ({
    id: product.id.toString(),
    product,
    image: product.image,
    title: truncateText(product.title, 50),
    category: capitalizeCategory(product.category),
    status: product.status,
    vendor: product.vendor,
    productType: product.productType,
    availability: product.availability,
    price: formatPrice(product.price),
  }));
};

/**
 * Gets product by ID from rows
 */
export const getProductFromRows = (
  rows: ProductTableRow[], 
  id: string
): Product | undefined => {
  const row = rows.find(row => row.id === id);
  return row?.product;
};