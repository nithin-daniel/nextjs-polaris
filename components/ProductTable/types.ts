import { Product } from '@/types/product';

/**
 * Props for ProductTable component
 */
export interface ProductTableProps {
  /** Array of products to display */
  products: Product[];
  /** Loading state indicator */
  loading?: boolean;
  /** Handler for row click events */
  onRowClick?: (product: Product) => void;
  /** Handler for selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Currently selected product IDs */
  selectedIds?: string[];
  /** Whether to show selection checkboxes */
  selectable?: boolean;
  /** Custom empty state message */
  emptyStateMessage?: string;
  /** Whether to show actions column */
  showActions?: boolean;
  /** Custom action handler */
  onAction?: (action: string, product: Product) => void;
}

/**
 * Table row data structure for IndexTable
 */
export interface ProductTableRow {
  id: string;
  product: Product;
  image: string;
  title: string;
  category: string;
  price: string;
  rating: string;
  stock: string;
  [key: string]: unknown;
}

/**
 * Available actions for products
 */
export type ProductAction = 'view' | 'edit' | 'delete' | 'duplicate';

/**
 * Action button configuration
 */
export interface ActionConfig {
  action: ProductAction;
  label: string;
  icon?: React.ComponentType;
  destructive?: boolean;
}