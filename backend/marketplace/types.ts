export interface Product {
    id: number;
    name: string;
    description?: string;
    shortDescription?: string;
    sku: string;
    price: number;
    salePrice?: number;
    currency: string;
    categoryId?: number;
    brand?: string;
    weight?: number;
    dimensions?: any;
    images?: string[];
    tags?: string[];
    stockQuantity: number;
    stockStatus: 'in_stock' | 'out_of_stock' | 'on_backorder';
    manageStock: boolean;
    featured: boolean;
    status: 'draft' | 'published' | 'private';
    visibility: 'visible' | 'catalog' | 'search' | 'hidden';
    rating: number;
    reviewCount: number;
    totalSales: number;
    createdBy: number;
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parentId?: number;
    imageUrl?: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Order {
    id: number;
    orderNumber: string;
    customerId: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    currency: string;
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod?: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    billingAddress?: any;
    shippingAddress?: any;
    notes?: string;
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    total: number;
    createdAt: Date;
  }
  
  export interface Review {
    id: number;
    productId: number;
    customerId: number;
    rating: number;
    title?: string;
    content?: string;
    verifiedPurchase: boolean;
    helpfulCount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
  }
  