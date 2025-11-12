// Types matching server models

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  roles: ('admin' | 'cashier')[];
}

export interface Product {
  _id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  unit: string;
  currentStock: number;
  reorderThreshold: number;
  vendor?: {
    name: string;
    contact?: string;
  };
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  sellPrice: number;
  costPrice: number;
}

export interface Customer {
  name?: string;
  phone?: string;
}

export interface Sale {
  _id: string;
  invoiceNumber: string;
  customer: Customer;
  items: SaleItem[];
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
  date: string;
  createdBy: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// For API request
export interface CreateSaleRequest {
  items: {
    productId: string;
    qty: number;
    sellPrice?: number;
  }[];
  customer?: {
    name?: string;
    phone?: string;
  };
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
  discount?: number;
}

export interface PurchaseItem {
  productId: string;
  qty: number;
  costPrice: number;
}

// For display when populated
export interface PopulatedPurchaseItem {
  productId: {
    _id: string;
    name: string;
    sku: string;
  };
  qty: number;
  costPrice: number;
}

export interface Purchase {
  _id: string;
  supplier: string;
  items: PurchaseItem[] | PopulatedPurchaseItem[];
  totalAmount: number;
  invoiceRef?: string;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  category: string;
  amount: number;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  roles?: ('admin' | 'cashier')[];
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
