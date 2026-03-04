/**
 * Utility functions for ProductModal component
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
 * Formats rating display with stars
 */
export const formatRating = (rate: number, count: number): string => {
  const stars = '⭐'.repeat(Math.floor(rate));
  return `${stars} ${rate.toFixed(1)} (${count.toLocaleString()} reviews)`;
};

/**
 * Capitalizes category text
 */
export const formatCategory = (category: string): string => {
  return category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Gets category badge color based on category
 */
export const getCategoryTone = (category: string): 'info' | 'success' | 'attention' | 'critical' | undefined => {
  const tones: Record<string, 'info' | 'success' | 'attention' | 'critical'> = {
    electronics: 'info',
    jewelery: 'success',
    "men's clothing": 'attention',
    "women's clothing": 'critical',
  };
  return tones[category.toLowerCase()];
};

/**
 * Truncates text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Validates if image URL is accessible
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};