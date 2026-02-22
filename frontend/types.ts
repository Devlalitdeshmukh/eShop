export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  COMPANY = 'COMPANY',
  CUSTOMER = 'CUSTOMER'
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  mobile?: string;
  gender?: string;
  role?: string;
  isAdmin?: boolean;
  token?: string;
  avatar?: string;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  discountPrice?: number;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  isSpicy?: boolean;
  expiryDate?: string;
  isBestSelling?: boolean;
  totalSales?: number;
  season?: 'Summer' | 'Winter' | 'Festival' | 'All';
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariantId?: string;
  selectedVariantName?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string | number;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered';
  date: string;
  paymentMethod: 'UPI' | 'Card' | 'COD';
}

export interface SalesData {
  name: string;
  sales: number;
  orders: number;
}

export interface Aboutus {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Contactus {
  id: number;
  title: string;
  description: string;
  email?: string;
  phone?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  created_at: string;
  updated_at: string;
}
  
