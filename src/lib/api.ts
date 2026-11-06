/**
 * Mumtahina’s Closet Inc - Hostinger PHP REST API Client
 *
 * Provides typed, HTTPS-ready API calls connecting the React frontend to the
 * Hostinger PHP + MySQL backend infrastructure.
 */

import {
  Product,
  CartItem,
  Order,
  ShippingAddress,
  Inquiry,
  CategoryItem,
  Review,
  UserProfile,
  ZelleSettings,
} from '../types';

// The frontend API base URL for Hostinger PHP REST API
const DEFAULT_HOSTINGER_API = 'https://mumtahinasclosetinc.com/api';
const API_BASE_URL = String(
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api'
    : DEFAULT_HOSTINGER_API)
).replace(/\/$/, '');

// Storage key for Bearer session token
const TOKEN_KEY = 'mumtahinas_closet_auth_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Failed to update auth token in storage:', e);
  }
}

/**
 * Universal fetch wrapper for Hostinger PHP endpoints.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; [key: string]: any }> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add JSON content type only if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Session-Token'] = token;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include Hostinger session cookies
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: data?.error || `Server returned status ${res.status}`,
        status: res.status,
      };
    }

    return data || { success: true };
  } catch (err: any) {
    console.warn(`Hostinger API request failed [${url}]:`, err?.message || err);
    return {
      success: false,
      error: err?.message || 'Network error connecting to Hostinger API.',
      isOffline: true,
    };
  }
}

/* =========================================================================
   1. AUTHENTICATION & PROFILE APIS
   ========================================================================= */
export const authApi = {
  async register(name: string, email: string, password: string, phone?: string) {
    const res = await apiFetch<any>('/api/auth/register.php', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
    if (res.success && res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async login(identifier: string, password: string) {
    const res = await apiFetch<any>('/api/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({
        username: identifier,
        email: identifier,
        password,
      }),
    });
    if (res.success && res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async logout() {
    await apiFetch('/api/auth/logout.php', { method: 'POST' });
    setAuthToken(null);
  },

  async me(): Promise<{ success: boolean; user: UserProfile | null; isLoggedIn: boolean }> {
    const res = await apiFetch<any>('/api/auth/me.php', { method: 'GET' });
    return {
      success: res.success,
      user: res.user || null,
      isLoggedIn: !!res.isLoggedIn,
    };
  },

  async updateProfile(profileData: Partial<UserProfile> & { newPassword?: string }) {
    return apiFetch<any>('/api/auth/profile.php', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  async forgotPassword(email: string) {
    return apiFetch<any>('/api/auth/forgot-password.php', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string) {
    return apiFetch<any>('/api/auth/reset-password.php', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

/* =========================================================================
   2. PRODUCTS APIS
   ========================================================================= */
export const productsApi = {
  async getAll(category?: string, search?: string): Promise<{ success: boolean; products: Product[] }> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch<any>(`/api/products/index.php${qs}`, { method: 'GET' });
    return {
      success: res.success,
      products: res.products || [],
    };
  },

  async getById(id: string): Promise<{ success: boolean; product?: Product; error?: string }> {
    const res = await apiFetch<any>(`/api/products/index.php?id=${encodeURIComponent(id)}`, { method: 'GET' });
    return {
      success: res.success,
      product: res.product,
      error: res.error,
    };
  },

  async create(product: Partial<Product>) {
    return apiFetch<any>('/api/products/index.php', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async update(product: Product) {
    return apiFetch<any>('/api/products/index.php', {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/api/products/index.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

/* =========================================================================
   3. CATEGORIES APIS
   ========================================================================= */
export const categoriesApi = {
  async getAll(): Promise<{ success: boolean; categories: CategoryItem[] }> {
    const res = await apiFetch<any>('/api/categories/index.php', { method: 'GET' });
    return {
      success: res.success,
      categories: res.categories || [],
    };
  },

  async create(category: Partial<CategoryItem>) {
    return apiFetch<any>('/api/categories/index.php', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  async update(category: CategoryItem) {
    return apiFetch<any>('/api/categories/index.php', {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/api/categories/index.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

/* =========================================================================
   4. ORDERS & ZELLE PAYMENT APIS
   ========================================================================= */
export const ordersApi = {
  async getAll(): Promise<{ success: boolean; orders: Order[] }> {
    const res = await apiFetch<any>('/api/orders/index.php', { method: 'GET' });
    return {
      success: res.success,
      orders: res.orders || [],
    };
  },

  async getById(id: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    const res = await apiFetch<any>(`/api/orders/index.php?id=${encodeURIComponent(id)}`, { method: 'GET' });
    return {
      success: res.success,
      order: res.order,
      error: res.error,
    };
  },

  async create(orderData: Partial<Order>) {
    return apiFetch<any>('/api/orders/index.php', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async updateStatus(orderId: string, updates: {
    orderStatus?: string;
    paymentStatus?: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  }) {
    return apiFetch<any>('/api/orders/index.php', {
      method: 'PUT',
      body: JSON.stringify({ id: orderId, ...updates }),
    });
  },
};

/* =========================================================================
   5. CART APIS
   ========================================================================= */
export const cartApi = {
  async get(): Promise<{ success: boolean; cart: CartItem[] }> {
    const res = await apiFetch<any>('/api/cart/index.php', { method: 'GET' });
    return {
      success: res.success,
      cart: res.cart || [],
    };
  },

  async setItem(productId: string, selectedSize: string, selectedColor: string, quantity: number) {
    return apiFetch<any>('/api/cart/index.php', {
      method: 'POST',
      body: JSON.stringify({ productId, selectedSize, selectedColor, quantity }),
    });
  },

  async removeItem(itemId: string) {
    return apiFetch<any>(`/api/cart/index.php?id=${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    });
  },

  async clear() {
    return apiFetch<any>('/api/cart/index.php', {
      method: 'DELETE',
    });
  },
};

/* =========================================================================
   6. WISHLIST APIS
   ========================================================================= */
export const wishlistApi = {
  async get(): Promise<{ success: boolean; wishlist: Product[] }> {
    const res = await apiFetch<any>('/api/wishlist/index.php', { method: 'GET' });
    return {
      success: res.success,
      wishlist: res.wishlist || [],
    };
  },

  async toggle(productId: string) {
    return apiFetch<any>('/api/wishlist/index.php', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  async remove(productId: string) {
    return apiFetch<any>(`/api/wishlist/index.php?productId=${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
  },
};

/* =========================================================================
   7. ADDRESSES APIS
   ========================================================================= */
export const addressesApi = {
  async getAll(): Promise<{ success: boolean; addresses: ShippingAddress[] }> {
    const res = await apiFetch<any>('/api/addresses/index.php', { method: 'GET' });
    return {
      success: res.success,
      addresses: res.addresses || [],
    };
  },

  async create(address: Omit<ShippingAddress, 'id'>) {
    return apiFetch<any>('/api/addresses/index.php', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  async update(address: ShippingAddress) {
    return apiFetch<any>('/api/addresses/index.php', {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/api/addresses/index.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

/* =========================================================================
   8. REVIEWS APIS
   ========================================================================= */
export const reviewsApi = {
  async getAll(productId?: string): Promise<{ success: boolean; reviews: Review[] }> {
    const qs = productId ? `?productId=${encodeURIComponent(productId)}` : '';
    const res = await apiFetch<any>(`/api/reviews/index.php${qs}`, { method: 'GET' });
    return {
      success: res.success,
      reviews: res.reviews || [],
    };
  },

  async create(review: Omit<Review, 'id'>) {
    return apiFetch<any>('/api/reviews/index.php', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  async updateStatus(reviewId: string, status: 'approved' | 'pending' | 'rejected') {
    return apiFetch<any>('/api/reviews/index.php', {
      method: 'PUT',
      body: JSON.stringify({ id: reviewId, status }),
    });
  },

  async delete(reviewId: string) {
    return apiFetch<any>(`/api/reviews/index.php?id=${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
    });
  },
};

/* =========================================================================
   9. INQUIRIES & CONTACT APIS
   ========================================================================= */
export const inquiriesApi = {
  async getAll(): Promise<{ success: boolean; inquiries: Inquiry[] }> {
    const res = await apiFetch<any>('/api/inquiries/index.php', { method: 'GET' });
    return {
      success: res.success,
      inquiries: res.inquiries || [],
    };
  },

  async create(inquiry: Omit<Inquiry, 'id' | 'createdAt'>) {
    return apiFetch<any>('/api/inquiries/index.php', {
      method: 'POST',
      body: JSON.stringify(inquiry),
    });
  },

  async updateStatus(id: string, status: 'New' | 'In Review' | 'Resolved') {
    return apiFetch<any>('/api/inquiries/index.php', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    });
  },

  async delete(id: string) {
    return apiFetch<any>(`/api/inquiries/index.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

/* =========================================================================
   10. SETTINGS APIS (ZELLE & WEBSITE)
   ========================================================================= */
export const settingsApi = {
  async getZelle(): Promise<{ success: boolean; settings: ZelleSettings | null }> {
    const res = await apiFetch<any>('/api/settings/zelle.php', { method: 'GET' });
    return {
      success: res.success,
      settings: res.settings || null,
    };
  },

  async updateZelle(settings: ZelleSettings) {
    return apiFetch<any>('/api/settings/zelle.php', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  async getWebsite(): Promise<{ success: boolean; settings: Record<string, any> }> {
    const res = await apiFetch<any>('/api/settings/website.php', { method: 'GET' });
    return {
      success: res.success,
      settings: res.settings || {},
    };
  },

  async updateWebsite(settings: Record<string, any>) {
    return apiFetch<any>('/api/settings/website.php', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },
};

/* =========================================================================
   11. IMAGE UPLOAD APIS (HOSTINGER SERVER STORAGE)
   ========================================================================= */
export const uploadApi = {
  /**
   * Uploads a single image to Hostinger /uploads/ directory.
   */
  async uploadSingle(file: File, type: 'products' | 'categories' | 'general' = 'products'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const res = await apiFetch<any>('/api/upload/index.php', {
      method: 'POST',
      body: formData,
    });

    if (res.success && res.url) {
      return res.url;
    }
    throw new Error(res.error || 'Failed to upload image to Hostinger storage');
  },

  /**
   * Uploads multiple images to Hostinger in parallel or batch.
   */
  async uploadMultiple(
    files: File[],
    type: 'products' | 'categories' | 'general' = 'products',
    onProgress?: (completed: number, total: number) => void
  ): Promise<string[]> {
    const urls: string[] = [];
    let completed = 0;

    for (const file of files) {
      try {
        const url = await this.uploadSingle(file, type);
        if (url) urls.push(url);
      } catch (err) {
        console.error(`Upload error for ${file.name}:`, err);
      }
      completed++;
      if (onProgress) {
        onProgress(completed, files.length);
      }
    }

    return urls;
  },
};

/* =========================================================================
   12. AUTOMATED DATABASE INSTALLER & HEALTH CHECK APIS
   ========================================================================= */
export const systemApi = {
  /**
   * Deployment & system health check
   */
  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    api_service: string;
    version: string;
    api_base_url: string;
    config_loaded: boolean;
    database: {
      connected: boolean;
      database_name?: string;
      table_count?: number;
      total_required?: number;
      tables_found?: string[];
      tables_missing?: string[];
      is_ready?: boolean;
    };
    uploads: {
      directory_exists: boolean;
      is_writable: boolean;
    };
    message?: string;
    error?: string;
  }> {
    const res = await apiFetch<any>('/api/health.php', { method: 'GET' });
    return res as any;
  },

  /**
   * Tests the Hostinger PHP API and MySQL database connection
   */
  async testConnection(): Promise<{
    success: boolean;
    connected?: boolean;
    message?: string;
    database?: string;
    tableCount?: number;
    tables?: string[];
    error?: string;
  }> {
    const res = await apiFetch<any>('/api/test.php', { method: 'GET' });
    return res as any;
  },
};


