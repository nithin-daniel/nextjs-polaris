export { ProductTable } from './ProductTable';
export type { 
  ProductTableProps, 
  ProductTableRow, 
  ProductAction, 
  ActionConfig 
} from './types';
export { 
  formatPrice, 
  formatRating, 
  capitalizeCategory, 
  truncateText, 
  transformProductsToRows, 
  getProductFromRows 
} from './utils';