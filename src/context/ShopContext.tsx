import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  CartItem,
  Order,
  ToastNotification,
  ShippingAddress,
  Inquiry,
  CategoryItem,
  PaymentStatus,
  OrderStatus,
  Review,
  UserProfile,
  ZelleSettings,
} from '../types';
import { PRODUCTS, INITIAL_ORDERS } from '../data/mockData';
import { isAuthorizedAdmin } from '../lib/adminAuth';
import { parseColorsInput } from '../lib/colorUtils';
import {
  authApi,
  productsApi,
  categoriesApi,
  ordersApi,
  cartApi,
  wishlistApi,
  addressesApi,
  reviewsApi,
  inquiriesApi,
  settingsApi,
} from '../lib/api';

export type { UserProfile };

// Compatibility alias for transition
interface ShopContextType {
  products: Product[];
  cartItems: CartItem[];
  wishlist: Product[];
  orders: Order[];
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  registeredUsers: UserProfile[];
  isAuthLoading: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  signOutUser: () => Promise<void>;
  saveUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  discountApplied: boolean;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  buyNow: (product: Product, size?: string, color?: string, quantity?: number, onNavigate?: () => void) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  removeCartItem: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  wishlistCount: number;
  placeOrder: (order: Order) => Promise<string>;
  isAdmin: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, carrier?: string) => Promise<void>;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => Promise<void>;
  syncOrdersFromFirestore: () => Promise<void>;
  categories: CategoryItem[];
  addCategory: (category: CategoryItem) => Promise<void>;
  updateCategory: (category: CategoryItem) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  inquiries: Inquiry[];
  createInquiry: (inquiryData: Omit<Inquiry, 'id' | 'createdAt'>) => Promise<string>;
  updateInquiryStatus: (id: string, status: 'New' | 'In Review' | 'Resolved') => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  reviews: Review[];
  addReview: (reviewData: Omit<Review, 'id'>) => Promise<string>;
  updateReviewStatus: (reviewId: string, status: 'approved' | 'pending' | 'rejected') => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  addresses: ShippingAddress[];
  addAddress: (address: Omit<ShippingAddress, 'id'>) => Promise<string>;
  updateAddress: (address: ShippingAddress) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  zelleSettings: ZelleSettings | null;
  updateZelleSettings: (settings: ZelleSettings) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    categoryId: 'cat-1',
    slug: 'abaya',
    nameEn: 'Abayas & Kaftans',
    nameBn: 'আবায়া ও কাফতান',
    description: 'Handcrafted luxury modest silhouettes and ceremonial abayas.',
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80',
    itemCount: 8,
    isActive: true,
    status: 'active',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    categoryId: 'cat-2',
    slug: 'hijab-scarf',
    nameEn: 'Hijabs & Modest Scarves',
    nameBn: 'হিজাব ও স্কার্ফ',
    description: 'Pure modal, chiffon, and Medina silk scarves.',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    itemCount: 12,
    isActive: true,
    status: 'active',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    categoryId: 'cat-3',
    slug: 'women',
    nameEn: "Women's Collection",
    nameBn: 'মহিলাদের কালেকশন',
    description: 'Modest luxury co-ords, maxi dresses and evening capes.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    itemCount: 15,
    isActive: true,
    status: 'active',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    categoryId: 'cat-4',
    slug: 'men',
    nameEn: "Men's Kurtas & Thobes",
    nameBn: 'পুরুষদের পাঞ্জাবি ও থোব',
    description: 'Tailored premium cotton kurtas and ceremonial thobes.',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    itemCount: 6,
    isActive: true,
    status: 'active',
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-5',
    categoryId: 'cat-5',
    slug: 'kids',
    nameEn: 'Kids Modest Apparel',
    nameBn: 'বাচ্চাদের পোশাক',
    description: 'Comfortable modest festive wear for boys and girls.',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
    itemCount: 4,
    isActive: true,
    status: 'active',
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-6',
    categoryId: 'cat-6',
    slug: 'accessories',
    nameEn: 'Pins, Caps & Accessories',
    nameBn: 'আনুষাঙ্গিক ও এক্সেসরিজ',
    description: 'Undercaps, magnetic pins, and modest styling essentials.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    itemCount: 10,
    isActive: true,
    status: 'active',
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-101',
    inquiryId: 'inq-101',
    name: 'Sumayya Begum',
    customerName: 'Sumayya Begum',
    email: 'sumayya.begum@example.com',
    subject: 'Custom / Bridal Modest Order',
    type: 'Bespoke Consultation',
    message: 'Hello! I am inquiring about a custom champagne silk velvet abaya for an upcoming Nikah in November. Are custom sleeve adjustments available?',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'New',
  },
  {
    id: 'inq-102',
    inquiryId: 'inq-102',
    name: 'Nadia Rahman',
    customerName: 'Nadia Rahman',
    email: 'nadia.rahman@example.com',
    subject: 'Order & Sizing Help',
    type: 'Sizing Inquiry',
    message: 'Can you confirm if size 56 corresponds to 5ft 5in with 2-inch heels? Looking to order the Raw Silk Kaftan.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'In Review',
  },
  {
    id: 'inq-103',
    inquiryId: 'inq-103',
    name: 'Tasnim Ahmed',
    customerName: 'Tasnim Ahmed',
    email: 'tasnim.ahmed@example.com',
    subject: 'Shipping & Delivery',
    type: 'Logistics',
    message: 'Does expedited USA shipping deliver by Friday to New York? Thank you!',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'Resolved',
  },
];

const INITIAL_REVIEWS_SEED: Review[] = [
  {
    id: 'rev-1',
    reviewId: 'rev-1',
    productId: 'mc-01',
    customerId: 'client-1',
    customerName: 'Soraya K. (Chicago, IL)',
    userName: 'Soraya K. (Chicago, IL)',
    rating: 5,
    date: 'August 24, 2026',
    verified: true,
    title: 'Flawless modest drape & pristine fabric',
    comment: 'The Zahra Abaya exceeded every expectation. As someone living in the Midwest who values modest coverage with contemporary styling, Mumtahina’s Closet nailed the length, sleeve width, and luxurious feel.',
    fitFeedback: 'True to size (56 for 5\'6")',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  },
  {
    id: 'rev-2',
    reviewId: 'rev-2',
    productId: 'mc-02',
    customerId: 'client-2',
    customerName: 'Mariam H. (Fairfax, VA)',
    userName: 'Mariam H. (Fairfax, VA)',
    rating: 5,
    date: 'August 18, 2026',
    verified: true,
    title: 'The Modal Cloud Hijabs are holy grail!',
    comment: 'I will never use safety pins again! The fabric stays in place without a single pull or slip. The soft pink shade matches my skin tone beautifully.',
    fitFeedback: 'Generous coverage',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 24 * 16).toISOString(),
  },
  {
    id: 'rev-3',
    reviewId: 'rev-3',
    productId: 'mc-03',
    customerId: 'client-3',
    customerName: 'Layla M. (Houston, TX)',
    userName: 'Layla M. (Houston, TX)',
    rating: 5,
    date: 'August 05, 2026',
    verified: true,
    title: 'Fast 3-day USA shipping and exquisite packaging',
    comment: 'Arrived wrapped in delicate tissue paper with a signature closet pouch. Wore the pleated dress for Eid brunch and received so many compliments!',
    fitFeedback: 'Perfect modest silhouette',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 24 * 28).toISOString(),
  },
];

export const DEFAULT_ZELLE_SETTINGS: ZelleSettings = {
  accountHolderName: 'Dilruba Shabnam',
  phone: '914-303-9181',
  email: 'clientshabnamusa@gmail.com',
  qrCodeUrl: 'https://cdn.phototourl.com/member/2026-09-29-15445970-229c-41bd-9aaf-dc85f6d6e352.jpg',
  paymentUrl: 'https://enroll.zellepay.com/qr-codes?data=eyJhY3Rpb24iOiJwYXltZW50IiwibmFtZSI6IkRpbHJ1YmEgU2hhYm5hbSIsInRva2VuIjoiOTE0MzAzOTE4MSJ9',
  paymentInstructions: 'Please scan the Zelle QR code or send payment to 914-303-9181 (Dilruba Shabnam). Once sent, enter your Zelle confirmation/transaction number below. Our atelier will verify your payment and process your order immediately.',
  updatedAt: '',
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Live Collections synced with Hostinger MySQL
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS_SEED);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [zelleSettings, setZelleSettings] = useState<ZelleSettings>(DEFAULT_ZELLE_SETTINGS);

  // Cart & Wishlist
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mumtahinas_closet_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse guest cart:', e);
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<Product[]>([]);

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('mumtahinas_closet_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.email) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
    return {
      name: '',
      email: '',
      phone: '',
      isLoggedIn: false,
    };
  });

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Quick View & Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Coupons & Toasts
  const [discountApplied, setDiscountApplied] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Determine if active user is an authorized admin
  const isAdmin = useMemo(() => {
    const email = currentUser.isLoggedIn ? currentUser.email : '';
    return isAuthorizedAdmin(email);
  }, [currentUser.email, currentUser.isLoggedIn]);

  const updateCurrentUser = useCallback((newUser: UserProfile | ((prev: UserProfile) => UserProfile)) => {
    setCurrentUser((prev) => {
      const next = typeof newUser === 'function' ? newUser(prev) : newUser;
      try {
        if (next && next.isLoggedIn && next.email) {
          localStorage.setItem('mumtahinas_closet_user', JSON.stringify(next));
        } else {
          localStorage.removeItem('mumtahinas_closet_user');
        }
      } catch (e) {
        console.warn('Failed to persist user session:', e);
      }
      return next;
    });
  }, []);

  // Persist guest cart locally if not logged in
  useEffect(() => {
    if (!currentUser.isLoggedIn) {
      try {
        localStorage.setItem('mumtahinas_closet_cart', JSON.stringify(cartItems));
      } catch (e) {
        console.warn('Failed to save guest cart to localStorage:', e);
      }
    }
  }, [cartItems, currentUser.isLoggedIn]);

  /* =========================================================================
     1. INITIAL SYNC WITH HOSTINGER PHP REST API
     ========================================================================= */
  const refreshBackendData = useCallback(async () => {
    try {
      // 1. Check current session
      const meRes = await authApi.me();
      if (meRes.success && meRes.user && meRes.isLoggedIn) {
        const role = isAuthorizedAdmin(meRes.user.email) ? 'admin' : (meRes.user.role || 'customer');
        updateCurrentUser({
          ...meRes.user,
          role,
          isLoggedIn: true,
        });
      }

      // 2. Load products from MySQL
      const prodRes = await productsApi.getAll();
      if (prodRes.success && Array.isArray(prodRes.products) && prodRes.products.length > 0) {
        setProducts(prodRes.products);
      }

      // 3. Load categories from MySQL
      const catRes = await categoriesApi.getAll();
      if (catRes.success && Array.isArray(catRes.categories) && catRes.categories.length > 0) {
        setCategories(catRes.categories);
      }

      // 4. Load Zelle settings from MySQL
      const zelleRes = await settingsApi.getZelle();
      if (zelleRes.success && zelleRes.settings) {
        setZelleSettings((prev) => ({
          ...prev,
          ...zelleRes.settings,
        }));
      }

      // 5. Load reviews from MySQL
      const revRes = await reviewsApi.getAll();
      if (revRes.success && Array.isArray(revRes.reviews) && revRes.reviews.length > 0) {
        setReviews(revRes.reviews);
      }
    } catch (err) {
      console.warn('Hostinger data sync note:', err);
    } finally {
      setIsAuthLoading(false);
    }
  }, [updateCurrentUser]);

  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  // Sync user-specific data (Cart, Wishlist, Addresses, Orders) when logged in
  useEffect(() => {
    if (!currentUser.isLoggedIn) {
      setAddresses([]);
      setWishlist([]);
      return;
    }

    let isMounted = true;

    // Load user cart
    cartApi.get().then((res) => {
      if (!isMounted) return;
      if (res.success && Array.isArray(res.cart) && res.cart.length > 0) {
        setCartItems(res.cart);
      }
    }).catch(() => {});

    // Load user wishlist
    wishlistApi.get().then((res) => {
      if (!isMounted) return;
      if (res.success && Array.isArray(res.wishlist)) {
        setWishlist(res.wishlist);
      }
    }).catch(() => {});

    // Load user addresses
    addressesApi.getAll().then((res) => {
      if (!isMounted) return;
      if (res.success && Array.isArray(res.addresses)) {
        setAddresses(res.addresses);
      }
    }).catch(() => {});

    // Load user orders (or all orders for admin)
    ordersApi.getAll().then((res) => {
      if (!isMounted) return;
      if (res.success && Array.isArray(res.orders) && res.orders.length > 0) {
        setOrders(res.orders);
      }
    }).catch(() => {});

    // Load inquiries for admin
    if (isAdmin) {
      inquiriesApi.getAll().then((res) => {
        if (!isMounted) return;
        if (res.success && Array.isArray(res.inquiries) && res.inquiries.length > 0) {
          setInquiries(res.inquiries);
        }
      }).catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser.isLoggedIn, isAdmin]);

  /* =========================================================================
     2. AUTHENTICATION ACTIONS (HOSTINGER PHP + MYSQL)
     ========================================================================= */
  const signInWithGoogle = async (): Promise<boolean> => {
    addToast('Please sign in with your email address and password.', 'info');
    return false;
  };

  const signInWithEmail = async (emailOrUsername: string, pass: string): Promise<boolean> => {
    try {
      const phpRes = await authApi.login(emailOrUsername, pass);
      if (phpRes.success && phpRes.user) {
        const isAdmin = phpRes.user.role === 'admin' ||
                        isAuthorizedAdmin(phpRes.user.email) ||
                        isAuthorizedAdmin(emailOrUsername) ||
                        emailOrUsername.toLowerCase().trim() === 'admin';
        const role = isAdmin ? 'admin' : (phpRes.user.role || 'customer');
        const userObj: UserProfile = {
          ...phpRes.user,
          role,
          isLoggedIn: true,
        };
        updateCurrentUser(userObj);
        addToast(`Signed in successfully! Welcome, ${userObj.name || 'Admin'}.`, 'success');
        return true;
      }
      addToast(phpRes.error || 'Authentication failed. Please check your credentials.', 'error');
      return false;
    } catch (err: any) {
      addToast(err?.message || 'Authentication error', 'error');
      return false;
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    phone?: string
  ): Promise<boolean> => {
    try {
      const phpRes = await authApi.register(name, email, pass, phone);
      if (phpRes.success && phpRes.user) {
        const role = isAuthorizedAdmin(phpRes.user.email) ? 'admin' : (phpRes.user.role || 'customer');
        const newProfile: UserProfile = {
          ...phpRes.user,
          role,
          isLoggedIn: true,
        };
        updateCurrentUser(newProfile);
        addToast(`Account created! Welcome, ${name || 'friend'}.`, 'success');
        return true;
      }
      addToast(phpRes.error || 'Registration failed. Please check your details.', 'error');
      return false;
    } catch (err: any) {
      addToast(err?.message || 'Registration error', 'error');
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const phpRes = await authApi.forgotPassword(email);
      if (phpRes.success) {
        addToast('Password reset instructions have been generated.', 'info');
        return true;
      }
      addToast(phpRes.error || 'Password reset request failed.', 'error');
      return false;
    } catch (err: any) {
      addToast(err?.message || 'Password reset error', 'error');
      return false;
    }
  };

  const signOutUser = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Sign-out notice:', err);
    }
    localStorage.removeItem('mumtahinas_closet_user');
    setCurrentUser({
      name: '',
      email: '',
      phone: '',
      isLoggedIn: false,
    });
    setCartItems([]);
    setWishlist([]);
    setAddresses([]);
    addToast('Signed out of your account.', 'info');
  };

  const saveUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    const updated = { ...currentUser, ...profileData };
    updateCurrentUser(updated);

    try {
      const res = await authApi.updateProfile(profileData);
      if (res.success && res.user) {
        updateCurrentUser({ ...res.user, isLoggedIn: true });
        addToast('Profile saved successfully!', 'success');
      } else {
        addToast('Profile updated locally.', 'info');
      }
    } catch {
      addToast('Profile updated locally.', 'info');
    }
  };

  /* =========================================================================
     3. SHOPPING CART ACTIONS
     ========================================================================= */
  const addToCart = async (
    product: Product,
    size: string = product.sizes[0] || 'Standard',
    color: string = product.colors[0]?.name || 'Original',
    quantity: number = 1
  ) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, selectedSize: size, selectedColor: color, quantity }];
      }
    });

    addToast(`Added "${product.name}" (${size}) to your Shopping Bag!`, 'success');

    if (currentUser.isLoggedIn) {
      try {
        await cartApi.setItem(product.id, size, color, quantity);
      } catch (err) {
        console.warn('Cart cloud sync notice:', err);
      }
    }
  };

  const buyNow = (
    product: Product,
    size: string = product.sizes[0] || 'Standard',
    color: string = product.colors[0]?.name || 'Original',
    quantity: number = 1,
    onNavigate?: () => void
  ) => {
    addToCart(product, size, color, quantity);
    if (onNavigate) {
      onNavigate();
    }
  };

  const updateCartQuantity = async (index: number, quantity: number) => {
    const targetItem = cartItems[index];
    if (!targetItem) return;

    if (quantity <= 0) {
      removeCartItem(index);
      return;
    }

    setCartItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = quantity;
      return copy;
    });

    if (currentUser.isLoggedIn) {
      try {
        await cartApi.setItem(targetItem.product.id, targetItem.selectedSize, targetItem.selectedColor, quantity);
      } catch (err) {
        console.warn('Cart quantity sync notice:', err);
      }
    }
  };

  const removeCartItem = async (index: number) => {
    const item = cartItems[index];
    if (!item) return;

    setCartItems((prev) => prev.filter((_, i) => i !== index));
    addToast(`Removed "${item.product.name}" from shopping bag.`, 'info');

    if (currentUser.isLoggedIn) {
      try {
        const itemId = `${item.product.id}_${item.selectedSize}_${item.selectedColor}`;
        await cartApi.removeItem(itemId);
      } catch (err) {
        console.warn('Cart removal notice:', err);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (currentUser.isLoggedIn) {
      try {
        await cartApi.clear();
      } catch (err) {
        console.warn('Clear cart notice:', err);
      }
    }
  };

  /* =========================================================================
     4. WISHLIST ACTIONS
     ========================================================================= */
  const toggleWishlist = async (product: Product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      addToast(`Removed "${product.name}" from your Wishlist.`, 'info');
      if (currentUser.isLoggedIn) {
        try {
          await wishlistApi.remove(product.id);
        } catch {}
      }
    } else {
      setWishlist((prev) => [...prev, product]);
      addToast(`Saved "${product.name}" to your Wishlist!`, 'success');
      if (currentUser.isLoggedIn) {
        try {
          await wishlistApi.toggle(product.id);
        } catch {}
      }
    }
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  /* =========================================================================
     5. SHIPPING ADDRESSES
     ========================================================================= */
  const addAddress = async (addressData: Omit<ShippingAddress, 'id'>): Promise<string> => {
    const addressId = `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAddress: ShippingAddress = {
      ...addressData,
      id: addressId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAddresses((prev) => [newAddress, ...prev]);
    addToast('New delivery address saved!', 'success');

    try {
      const res = await addressesApi.create(addressData);
      if (res.success && res.id) {
        return res.id;
      }
    } catch {}

    return addressId;
  };

  const updateAddress = async (address: ShippingAddress): Promise<void> => {
    const updated = { ...address, updatedAt: new Date().toISOString() };
    setAddresses((prev) => prev.map((a) => (a.id === address.id ? updated : a)));
    addToast('Shipping address updated!', 'success');

    try {
      await addressesApi.update(updated);
    } catch {}
  };

  const deleteAddress = async (addressId: string): Promise<void> => {
    setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    addToast('Address removed.', 'info');

    try {
      await addressesApi.delete(addressId);
    } catch {}
  };

  /* =========================================================================
     6. ORDER CREATION & ZELLE PROCESSING
     ========================================================================= */
  const placeOrder = async (newOrder: Order): Promise<string> => {
    const orderId = newOrder.orderId || newOrder.id || `mc-${Date.now().toString().slice(-6)}`;
    const totalAmount = typeof newOrder.totalAmount === 'number' ? newOrder.totalAmount : (typeof newOrder.total === 'number' ? newOrder.total : 0);
    const orderStatus: OrderStatus = newOrder.orderStatus || newOrder.status || 'pending';
    const paymentStatus: PaymentStatus = newOrder.paymentStatus || 'pending';
    const createdAt = newOrder.createdAt || new Date().toISOString();
    const formattedDate = newOrder.date || new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const customerId = newOrder.customerId || (currentUser.isLoggedIn ? currentUser.id : `guest-${Date.now()}`);
    const customerName = newOrder.customerName || newOrder.shippingAddress?.fullName || currentUser.name || 'Valued Client';
    const customerEmail = newOrder.customerEmail || currentUser.email || 'client@example.com';
    const zelleRef = newOrder.transactionReference || newOrder.zelleReference || newOrder.paymentId || '';

    const formattedOrder: Order = {
      ...newOrder,
      orderId,
      id: orderId,
      customerId,
      customerName,
      customerEmail,
      customerPhone: newOrder.customerPhone || '',
      items: newOrder.items,
      totalAmount,
      total: totalAmount,
      currency: newOrder.currency || 'USD',
      paymentMethod: 'zelle',
      paymentStatus,
      orderStatus,
      status: orderStatus,
      createdAt,
      date: formattedDate,
      paymentId: zelleRef,
      transactionReference: zelleRef,
      zelleReference: zelleRef,
      trackingNumber: newOrder.trackingNumber || '',
      carrier: newOrder.carrier || 'USPS Priority Mail',
      estimatedDelivery: newOrder.estimatedDelivery || '3-4 Business Days',
      subtotal: typeof newOrder.subtotal === 'number' ? newOrder.subtotal : totalAmount,
      shipping: typeof newOrder.shipping === 'number' ? newOrder.shipping : 0,
      discount: typeof newOrder.discount === 'number' ? newOrder.discount : 0,
      tax: typeof newOrder.tax === 'number' ? newOrder.tax : 0,
      shippingAddress: newOrder.shippingAddress,
    };

    setOrders((prev) => [formattedOrder, ...prev.filter((o) => (o.orderId || o.id) !== orderId)]);
    await clearCart();
    addToast(`Order #${orderId} confirmed via Zelle!`, 'success');

    try {
      await ordersApi.create(formattedOrder);
    } catch (err) {
      console.warn('Hostinger ordersApi error notice:', err);
    }

    return orderId;
  };

  /* =========================================================================
     7. ADMIN ACTIONS: Product, Category, Review, Inquiry & Settings Management
     ========================================================================= */
  const addProduct = async (newProduct: Product): Promise<void> => {
    setProducts((prev) => [newProduct, ...prev]);
    addToast(`Product "${newProduct.name}" added to catalog!`, 'success');

    try {
      await productsApi.create(newProduct);
    } catch (err) {
      console.warn('Hostinger productsApi.create notice:', err);
    }
  };

  const updateProduct = async (updatedProduct: Product): Promise<void> => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    addToast(`Product "${updatedProduct.name}" updated!`, 'success');

    try {
      await productsApi.update(updatedProduct);
    } catch (err) {
      console.warn('Hostinger productsApi.update notice:', err);
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    addToast('Product removed from catalog.', 'info');

    try {
      await productsApi.delete(productId);
    } catch (err) {
      console.warn('Hostinger productsApi.delete notice:', err);
    }
  };

  const addCategory = async (category: CategoryItem): Promise<void> => {
    const categoryId = category.categoryId || category.id || `cat-${Date.now()}`;
    const categoryData: CategoryItem = {
      ...category,
      id: categoryId,
      categoryId,
      status: category.status || 'active',
      isActive: category.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, categoryData]);
    addToast(`Category "${category.nameEn}" created!`, 'success');

    try {
      await categoriesApi.create(categoryData);
    } catch (err) {
      console.warn('Hostinger categoriesApi.create notice:', err);
    }
  };

  const updateCategory = async (category: CategoryItem): Promise<void> => {
    const updated = { ...category, updatedAt: new Date().toISOString() };
    setCategories((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
    addToast(`Category "${category.nameEn}" updated!`, 'success');

    try {
      await categoriesApi.update(updated);
    } catch (err) {
      console.warn('Hostinger categoriesApi.update notice:', err);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('Category removed.', 'info');

    try {
      await categoriesApi.delete(id);
    } catch (err) {
      console.warn('Hostinger categoriesApi.delete notice:', err);
    }
  };

  const addReview = async (reviewData: Omit<Review, 'id'>): Promise<string> => {
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullReview: Review = {
      ...reviewData,
      id: reviewId,
      reviewId,
      customerId: reviewData.customerId || (currentUser.isLoggedIn ? currentUser.id : 'guest'),
      customerName: reviewData.customerName || reviewData.userName || 'Client',
      userName: reviewData.customerName || reviewData.userName || 'Client',
      status: reviewData.status || 'approved',
      createdAt: reviewData.createdAt || new Date().toISOString(),
      date: reviewData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      verified: reviewData.verified !== false,
    };

    setReviews((prev) => [fullReview, ...prev]);
    addToast('Review submitted successfully! Thank you.', 'success');

    try {
      await reviewsApi.create(fullReview);
    } catch (err) {
      console.warn('Hostinger reviewsApi.create notice:', err);
    }

    return reviewId;
  };

  const updateReviewStatus = async (
    reviewId: string,
    status: 'approved' | 'pending' | 'rejected'
  ): Promise<void> => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)));
    addToast(`Review marked as ${status}.`, 'success');

    try {
      await reviewsApi.updateStatus(reviewId, status);
    } catch (err) {
      console.warn('Hostinger reviewsApi.updateStatus notice:', err);
    }
  };

  const deleteReview = async (reviewId: string): Promise<void> => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    addToast('Review deleted.', 'info');

    try {
      await reviewsApi.delete(reviewId);
    } catch (err) {
      console.warn('Hostinger reviewsApi.delete notice:', err);
    }
  };

  const createInquiry = async (inquiryData: Omit<Inquiry, 'id' | 'createdAt'>): Promise<string> => {
    const inquiryId = `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullInquiry: Inquiry = {
      ...inquiryData,
      id: inquiryId,
      inquiryId,
      customerName: inquiryData.customerName || inquiryData.name,
      createdAt: new Date().toISOString(),
      status: inquiryData.status || 'New',
    };

    setInquiries((prev) => [fullInquiry, ...prev]);

    try {
      await inquiriesApi.create(fullInquiry);
    } catch (err) {
      console.warn('Hostinger inquiriesApi.create notice:', err);
    }

    return inquiryId;
  };

  const updateInquiryStatus = async (id: string, status: 'New' | 'In Review' | 'Resolved') => {
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));

    try {
      await inquiriesApi.updateStatus(id, status);
    } catch (err) {
      console.warn('Hostinger inquiriesApi.updateStatus notice:', err);
    }
    addToast(`Inquiry status updated to ${status}.`, 'success');
  };

  const deleteInquiry = async (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));

    try {
      await inquiriesApi.delete(id);
    } catch (err) {
      console.warn('Hostinger inquiriesApi.delete notice:', err);
    }
    addToast('Inquiry removed.', 'info');
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    carrier?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if ((o.orderId || o.id) === orderId) {
          return {
            ...o,
            orderStatus: status,
            status,
            trackingNumber: trackingNumber ?? o.trackingNumber,
            carrier: carrier ?? o.carrier,
          };
        }
        return o;
      })
    );
    addToast(`Order ${orderId} marked as ${status}!`, 'success');

    try {
      await ordersApi.updateStatus(orderId, { orderStatus: status, trackingNumber, carrier });
    } catch (err) {
      console.warn('Hostinger ordersApi.updateStatus notice:', err);
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if ((o.orderId || o.id) === orderId) {
          return {
            ...o,
            paymentStatus,
          };
        }
        return o;
      })
    );
    addToast(`Order ${orderId} payment status set to ${paymentStatus}!`, 'success');

    try {
      await ordersApi.updateStatus(orderId, { paymentStatus });
    } catch (err) {
      console.warn('Hostinger ordersApi.updateStatus notice:', err);
    }
  };

  const updateZelleSettings = async (settings: ZelleSettings) => {
    try {
      const payload: ZelleSettings = {
        email: settings.email ? settings.email.trim() : '',
        phone: settings.phone ? settings.phone.trim() : DEFAULT_ZELLE_SETTINGS.phone,
        accountHolderName: settings.accountHolderName.trim() || DEFAULT_ZELLE_SETTINGS.accountHolderName,
        paymentInstructions: settings.paymentInstructions ? settings.paymentInstructions.trim() : '',
        qrCodeUrl: settings.qrCodeUrl ? settings.qrCodeUrl.trim() : DEFAULT_ZELLE_SETTINGS.qrCodeUrl,
        paymentUrl: settings.paymentUrl ? settings.paymentUrl.trim() : DEFAULT_ZELLE_SETTINGS.paymentUrl,
        updatedAt: new Date().toISOString(),
      };

      try {
        await settingsApi.updateZelle(payload);
      } catch (err) {
        console.warn('Hostinger settingsApi.updateZelle notice:', err);
      }

      setZelleSettings(payload);
      addToast('Zelle payment settings saved!', 'success');
    } catch (err) {
      console.error('Failed to update Zelle settings:', err);
      addToast('Failed to save Zelle settings.', 'error');
      throw err;
    }
  };

  const syncOrdersFromFirestore = async () => {
    try {
      const res = await ordersApi.getAll();
      if (res.success && Array.isArray(res.orders) && res.orders.length > 0) {
        setOrders(res.orders);
        addToast('Synced live orders from Hostinger MySQL.', 'success');
      }
    } catch (err) {
      console.warn('Sync orders notice:', err);
    }
  };

  const applyCoupon = (code: string): boolean => {
    const upper = code.trim().toUpperCase();
    if (upper === 'MODEST10' || upper === 'USA2026' || upper === 'WELCOME10') {
      setDiscountApplied(true);
      setCouponCode(upper);
      addToast(`Coupon "${upper}" applied: 10% discount activated!`, 'success');
      return true;
    }
    addToast(`Coupon code "${code}" is invalid or expired.`, 'error');
    return false;
  };

  const removeCoupon = () => {
    setDiscountApplied(false);
    setCouponCode('');
    addToast('Coupon code removed.', 'info');
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const wishlistCount = wishlist.length;

  return (
    <ShopContext.Provider
      value={{
        products,
        cartItems,
        wishlist,
        orders,
        currentUser,
        setCurrentUser: updateCurrentUser,
        user: currentUser,
        setUser: updateCurrentUser,
        registeredUsers,
        isAuthLoading,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        sendPasswordReset,
        signOutUser,
        saveUserProfile,
        quickViewProduct,
        setQuickViewProduct,
        isSearchOpen,
        setIsSearchOpen,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        toasts,
        addToast,
        removeToast,
        discountApplied,
        couponCode,
        applyCoupon,
        removeCoupon,
        addToCart,
        buyNow,
        updateCartQuantity,
        removeCartItem,
        clearCart,
        toggleWishlist,
        isWishlisted,
        cartCount,
        wishlistCount,
        placeOrder,
        isAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        updatePaymentStatus,
        syncOrdersFromFirestore,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        inquiries,
        createInquiry,
        updateInquiryStatus,
        deleteInquiry,
        reviews,
        addReview,
        updateReviewStatus,
        deleteReview,
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        zelleSettings,
        updateZelleSettings,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
