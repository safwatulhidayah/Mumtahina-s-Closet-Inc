export interface Product {
  id: string;
  productId?: string;
  name: string;
  subtitle?: string;
  category: 'women' | 'men' | 'kids' | 'abaya' | 'hijab' | 'accessories';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isSale?: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  description: string;
  features: string[];
  fabric: string;
  careInstructions: string;
  stock: number;
  material?: string;
  dimensions?: string;
  isActive?: boolean;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export interface Review {
  id: string;
  reviewId?: string;
  productId?: string;
  customerId?: string;
  customerName?: string;
  userName?: string;
  rating: number;
  date?: string;
  verified?: boolean;
  title?: string;
  comment: string;
  fitFeedback?: string;
  status?: 'approved' | 'pending' | 'rejected';
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export type PaymentStatus =
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Refunded'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface ZelleSettings {
  email?: string;
  phone?: string;
  accountHolderName: string;
  paymentInstructions?: string;
  qrCodeUrl?: string;
  paymentUrl?: string;
  updatedAt?: string;
}

export interface Order {
  // Required core order fields for Zelle payment processing
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  paymentId?: string; // Transaction reference or payment ID
  transactionReference?: string; // Zelle transaction confirmation / reference number
  zelleReference?: string; // Alias for Zelle confirmation code

  // Backward-compatibility properties
  id: string; // Alias of orderId
  date: string; // Formatted date string
  status: OrderStatus; // Alias of orderStatus
  total: number; // Alias of totalAmount
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  tax?: number;
  shippingAddress?: {
    fullName: string;
    street: string;
    apt?: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export type PageView =
  | 'home'
  | 'shop'
  | 'category'
  | 'product-details'
  | 'search'
  | 'wishlist'
  | 'cart'
  | 'checkout'
  | 'account'
  | 'orders'
  | 'about'
  | 'contact'
  | 'faq'
  | 'shipping'
  | 'returns'
  | 'privacy'
  | 'terms';

export interface ToastNotification {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

export interface ShippingAddress {
  id: string;
  title: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Inquiry {
  id: string;
  inquiryId?: string;
  customerName?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  type?: string;
  message: string;
  status?: 'New' | 'In Review' | 'Resolved';
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  categoryId?: string;
  slug: string;
  nameEn: string;
  nameBn?: string;
  description?: string;
  image: string;
  itemCount: number;
  isActive: boolean;
  status?: 'active' | 'hidden' | string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id?: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role?: 'admin' | 'customer';
  createdAt?: string;
  updatedAt?: string;
  isLoggedIn: boolean;
}


