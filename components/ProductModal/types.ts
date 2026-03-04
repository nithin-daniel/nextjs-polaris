import { Product } from '@/types/product';

/**
 * Props for ProductModal component
 */
export interface ProductModalProps {
  /** Product data to display */
  product: Product | null;
  /** Whether the modal is open */
  open: boolean;
  /** Handler for closing the modal */
  onClose: () => void;
  /** Optional title override */
  title?: string;
  /** Primary action configuration */
  primaryAction?: {
    content: string;
    onAction: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  /** Secondary actions configuration */
  secondaryActions?: Array<{
    content: string;
    onAction: () => void;
    loading?: boolean;
    disabled?: boolean;
    destructive?: boolean;
  }>;
  /** Whether to show the category badge */
  showCategory?: boolean;
  /** Whether to show the rating */
  showRating?: boolean;
  /** Custom footer content */
  footerContent?: React.ReactNode;
  /** Maximum width for the modal */
  size?: 'small' | 'large';
}