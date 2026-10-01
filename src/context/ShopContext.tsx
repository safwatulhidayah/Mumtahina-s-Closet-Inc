import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseErrors';
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

export type { UserProfile };

interface ShopContextType {
  products: Product[];
  cartItems: CartItem[];
  wishlist: Product[];
  orders: Order[];
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  firebaseUser: FirebaseUser | null;
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
  email: '',
  qrCodeUrl: 'https://cdn.phototourl.com/member/2026-09-29-15445970-229c-41bd-9aaf-dc85f6d6e352.jpg',
  paymentUrl: 'https://enroll.zellepay.com/qr-codes?data=eyJhY3Rpb24iOiJwYXltZW50IiwibmFtZSI6IkRpbHJ1YmEgU2hhYm5hbSIsInRva2VuIjoiOTE0MzAzOTE4MSJ9',
  paymentInstructions: 'Send payment via Zelle using the QR code, Pay with Zelle button, or phone number above. Please include your full name or order reference in the payment memo.',
  updatedAt: '',
};

// Helper to sanitize doc ID strings
function sanitizeDocId(str: string): string {
  return str.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 60);
}

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Live Collections synced with Firestore
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS_SEED);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [zelleSettings, setZelleSettings] = useState<ZelleSettings>(DEFAULT_ZELLE_SETTINGS);

  // Cart & Wishlist (No fake pre-populated items)
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

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
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
    const email = firebaseUser?.email || (currentUser.isLoggedIn ? currentUser.email : '');
    return isAuthorizedAdmin(email);
  }, [firebaseUser?.email, currentUser.email, currentUser.isLoggedIn]);

  const updateCurrentUser = (newUser: UserProfile | ((prev: UserProfile) => UserProfile)) => {
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
  };

  // Persist guest cart locally if not logged in
  useEffect(() => {
    if (!firebaseUser) {
      try {
        localStorage.setItem('mumtahinas_closet_cart', JSON.stringify(cartItems));
      } catch (e) {
        console.warn('Failed to save guest cart to localStorage:', e);
      }
    }
  }, [cartItems, firebaseUser]);

  /* =========================================================================
     1. PRODUCTS: Realtime Firestore Sync & Catalog Seeding
     ========================================================================= */
  useEffect(() => {
    try {
      const productsColRef = collection(db, 'products');
      const unsubscribe = onSnapshot(
        productsColRef,
        async (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                name: data.name || 'Modest Garment',
                subtitle: data.subtitle || '',
                category: data.category || 'Women',
                categoryLabel: data.categoryLabel || data.category || 'Women',
                price: typeof data.price === 'number' ? data.price : 0,
                originalPrice: data.originalPrice,
                isNew: !!data.isNew,
                isBestSeller: !!data.isBestSeller,
                isSale: !!data.isSale,
                rating: typeof data.rating === 'number' ? data.rating : 5,
                reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
                images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.image || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80'],
                colors: Array.isArray(data.colors) ? data.colors : [{ name: 'Original', hex: '#0F1E36' }],
                sizes: Array.isArray(data.sizes) ? data.sizes : ['Standard'],
                description: data.description || '',
                features: Array.isArray(data.features) ? data.features : [],
                fabric: data.fabric || data.material || 'Premium Modest Fabric',
                material: data.material || data.fabric,
                dimensions: data.dimensions,
                careInstructions: data.careInstructions || 'Dry Clean Recommended',
                stock: typeof data.stock === 'number' ? data.stock : 15,
                isActive: data.isActive !== undefined ? data.isActive : true,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
              };
            });
            setProducts(list);
          } else {
            // Seed initial products to Firestore
            try {
              for (const p of PRODUCTS) {
                await setDoc(doc(db, 'products', p.id), {
                  ...p,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
            } catch (seedErr) {
              console.warn('Products initial seed notice:', seedErr);
            }
          }
        },
        (err) => {
          console.warn('Products listener notice:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up products listener:', e);
    }
  }, []);

  /* =========================================================================
     2. CATEGORIES: Realtime Firestore Sync & Seeding
     ========================================================================= */
  useEffect(() => {
    try {
      const categoriesColRef = collection(db, 'categories');
      const unsubscribe = onSnapshot(
        categoriesColRef,
        async (snapshot) => {
          if (!snapshot.empty) {
            const list: CategoryItem[] = snapshot.docs.map((d) => {
              const data = d.data();
              const categoryId = data.categoryId || d.id;
              return {
                id: categoryId,
                categoryId,
                slug: data.slug || categoryId,
                nameEn: data.nameEn || 'Category',
                nameBn: data.nameBn || '',
                description: data.description || '',
                image: data.image || '',
                itemCount: typeof data.itemCount === 'number' ? data.itemCount : 0,
                isActive: data.status ? data.status === 'active' : (data.isActive !== false),
                status: data.status || (data.isActive !== false ? 'active' : 'hidden'),
                featured: !!data.featured,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
              };
            });
            setCategories(list);
          } else {
            // Seed initial categories to Firestore
            try {
              for (const cat of INITIAL_CATEGORIES) {
                await setDoc(doc(db, 'categories', cat.id), {
                  categoryId: cat.id,
                  id: cat.id,
                  nameEn: cat.nameEn,
                  nameBn: cat.nameBn || '',
                  image: cat.image,
                  slug: cat.slug,
                  status: cat.status || 'active',
                  description: cat.description || '',
                  itemCount: cat.itemCount || 0,
                  isActive: cat.isActive !== false,
                  featured: !!cat.featured,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
            } catch (seedErr) {
              console.warn('Categories initial seed notice:', seedErr);
            }
          }
        },
        (err) => {
          console.warn('Categories listener notice:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up categories listener:', e);
    }
  }, []);

  /* =========================================================================
     2B. ZELLE SETTINGS: Realtime Firestore Sync
     ========================================================================= */
  useEffect(() => {
    try {
      const zelleDocRef = doc(db, 'settings', 'zelle');
      const unsubscribe = onSnapshot(
        zelleDocRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setZelleSettings({
              email: data.email ?? DEFAULT_ZELLE_SETTINGS.email,
              phone: data.phone || DEFAULT_ZELLE_SETTINGS.phone,
              accountHolderName: data.accountHolderName || DEFAULT_ZELLE_SETTINGS.accountHolderName,
              qrCodeUrl: data.qrCodeUrl || DEFAULT_ZELLE_SETTINGS.qrCodeUrl,
              paymentUrl: data.paymentUrl || DEFAULT_ZELLE_SETTINGS.paymentUrl,
              paymentInstructions: data.paymentInstructions ?? DEFAULT_ZELLE_SETTINGS.paymentInstructions,
              updatedAt: data.updatedAt || '',
            });
          } else {
            setZelleSettings(DEFAULT_ZELLE_SETTINGS);
          }
        },
        (err) => {
          console.warn('Zelle settings listener notice:', err);
          setZelleSettings(DEFAULT_ZELLE_SETTINGS);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up Zelle settings listener:', e);
    }
  }, []);

  /* =========================================================================
     3. REVIEWS: Realtime Firestore Sync & Seeding
     ========================================================================= */
  useEffect(() => {
    try {
      const reviewsColRef = collection(db, 'reviews');
      const unsubscribe = onSnapshot(
        reviewsColRef,
        async (snapshot) => {
          if (!snapshot.empty) {
            const list: Review[] = snapshot.docs.map((d) => {
              const data = d.data();
              const reviewId = data.reviewId || d.id;
              return {
                id: reviewId,
                reviewId,
                productId: data.productId || '',
                customerId: data.customerId || '',
                customerName: data.customerName || data.userName || 'Client',
                userName: data.customerName || data.userName || 'Client',
                rating: typeof data.rating === 'number' ? data.rating : 5,
                comment: data.comment || '',
                title: data.title || '',
                date: data.date || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent'),
                verified: data.verified !== false,
                fitFeedback: data.fitFeedback || '',
                status: data.status || 'approved',
                createdAt: data.createdAt || new Date().toISOString(),
              };
            });
            list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            setReviews(list);
          } else {
            // Seed initial reviews to Firestore
            try {
              for (const rev of INITIAL_REVIEWS_SEED) {
                await setDoc(doc(db, 'reviews', rev.id), {
                  ...rev,
                  reviewId: rev.id,
                });
              }
            } catch (seedErr) {
              console.warn('Reviews initial seed notice:', seedErr);
            }
          }
        },
        (err) => {
          console.warn('Reviews listener notice:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up reviews listener:', e);
    }
  }, []);

  /* =========================================================================
     4. AUTHENTICATION & USER DATA SYNC
     ========================================================================= */
  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeWishlist: (() => void) | null = null;
    let unsubscribeCart: (() => void) | null = null;
    let unsubscribeAddresses: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        try {
          const userSnap = await getDoc(userDocRef);
          const email = fbUser.email || '';
          const userRole = isAuthorizedAdmin(email) ? 'admin' : 'customer';

          if (userSnap.exists()) {
            const data = userSnap.data();
            updateCurrentUser({
              id: fbUser.uid,
              uid: fbUser.uid,
              name: data.name || fbUser.displayName || email.split('@')[0] || 'Valued Client',
              email: data.email || email,
              phone: data.phone || '',
              photoURL: data.photoURL || fbUser.photoURL || '',
              role: data.role || userRole,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isLoggedIn: true,
            });
          } else {
            const initialProfile: UserProfile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              name: fbUser.displayName || email.split('@')[0] || 'Valued Client',
              email: email,
              phone: '',
              photoURL: fbUser.photoURL || '',
              role: userRole,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isLoggedIn: true,
            };
            await setDoc(userDocRef, initialProfile);
            updateCurrentUser(initialProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
        }

        // Realtime Customer Orders from /users/{uid}/orders
        const ordersColRef = collection(db, 'users', fbUser.uid, 'orders');
        unsubscribeOrders = onSnapshot(
          ordersColRef,
          (snapshot) => {
            const userOrders: Order[] = snapshot.docs.map((d) => {
              const data = d.data();
              const orderId = data.orderId || data.id || d.id;
              const totalAmount = typeof data.totalAmount === 'number' ? data.totalAmount : (data.total || 0);
              return {
                id: orderId,
                orderId,
                customerId: fbUser.uid,
                customerName: data.customerName || fbUser.displayName || 'Valued Client',
                customerEmail: data.customerEmail || fbUser.email || '',
                customerPhone: data.customerPhone || '',
                items: Array.isArray(data.items) ? data.items : [],
                totalAmount,
                total: totalAmount,
                currency: data.currency || 'USD',
                paymentMethod: data.paymentMethod || 'zelle',
                paymentStatus: data.paymentStatus || 'pending',
                orderStatus: data.orderStatus || data.status || 'pending',
                status: data.orderStatus || data.status || 'pending',
                createdAt: data.createdAt || new Date().toISOString(),
                date: data.date || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent'),
                paymentId: data.paymentId || data.transactionReference || '',
                transactionReference: data.transactionReference || data.zelleReference || data.paymentId || '',
                zelleReference: data.zelleReference || data.transactionReference || data.paymentId || '',
                trackingNumber: data.trackingNumber || '',
                carrier: data.carrier || 'USPS Priority Mail',
                estimatedDelivery: data.estimatedDelivery || '',
                subtotal: data.subtotal || totalAmount,
                shipping: data.shipping || 0,
                discount: data.discount || 0,
                tax: data.tax || 0,
                shippingAddress: data.shippingAddress,
              };
            });
            userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            // Only update customer orders if not admin viewing the store-wide orders
            if (!isAuthorizedAdmin(fbUser.email)) {
              setOrders(userOrders);
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}/orders`);
          }
        );

        // Realtime Wishlist from /users/{uid}/wishlist
        const wishlistColRef = collection(db, 'users', fbUser.uid, 'wishlist');
        unsubscribeWishlist = onSnapshot(
          wishlistColRef,
          (snapshot) => {
            if (!snapshot.empty) {
              const productIds = snapshot.docs.map((d) => d.data().productId || d.id);
              // Map against current products state
              setWishlist((currentProducts) => {
                return products.filter((p) => productIds.includes(p.id));
              });
            } else {
              setWishlist([]);
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}/wishlist`);
          }
        );

        // Realtime Shipping Addresses from /users/{uid}/addresses (Starts at 0 addresses)
        const addressesColRef = collection(db, 'users', fbUser.uid, 'addresses');
        unsubscribeAddresses = onSnapshot(
          addressesColRef,
          (snapshot) => {
            if (!snapshot.empty) {
              const list: ShippingAddress[] = snapshot.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  title: data.title || 'Address',
                  street: data.street || '',
                  city: data.city || '',
                  state: data.state || 'TX',
                  zip: data.zip || '',
                  isDefault: !!data.isDefault,
                  createdAt: data.createdAt,
                  updatedAt: data.updatedAt,
                };
              });
              setAddresses(list);
            } else {
              // New customers must start with zero addresses
              setAddresses([]);
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}/addresses`);
          }
        );

        // Realtime Persistent Cart from /users/{uid}/cart
        const cartColRef = collection(db, 'users', fbUser.uid, 'cart');
        unsubscribeCart = onSnapshot(
          cartColRef,
          async (snapshot) => {
            if (!snapshot.empty) {
              const liveCartItems: CartItem[] = [];
              for (const d of snapshot.docs) {
                const data = d.data();
                const matchedProduct = products.find((p) => p.id === data.productId) || PRODUCTS.find((p) => p.id === data.productId);
                if (matchedProduct) {
                  liveCartItems.push({
                    product: matchedProduct,
                    selectedSize: data.selectedSize || matchedProduct.sizes[0] || 'Standard',
                    selectedColor: data.selectedColor || matchedProduct.colors[0]?.name || 'Original',
                    quantity: typeof data.quantity === 'number' && data.quantity > 0 ? data.quantity : 1,
                  });
                }
              }
              setCartItems(liveCartItems);
            } else {
              // If user has local guest items, sync them up to Firestore cart without duplicate records
              const savedGuestCart = localStorage.getItem('mumtahinas_closet_cart');
              if (savedGuestCart) {
                try {
                  const parsed = JSON.parse(savedGuestCart);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    for (const item of parsed) {
                      const itemId = `${item.product.id}_${sanitizeDocId(item.selectedSize)}_${sanitizeDocId(item.selectedColor)}`;
                      await setDoc(doc(db, 'users', fbUser.uid, 'cart', itemId), {
                        id: itemId,
                        productId: item.product.id,
                        selectedSize: item.selectedSize,
                        selectedColor: item.selectedColor,
                        quantity: item.quantity,
                        updatedAt: new Date().toISOString(),
                      });
                    }
                    localStorage.removeItem('mumtahinas_closet_cart');
                  }
                } catch (e) {
                  console.warn('Failed to migrate guest cart:', e);
                }
              } else {
                setCartItems([]);
              }
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}/cart`);
          }
        );
      } else {
        // Logged out
        if (unsubscribeOrders) unsubscribeOrders();
        if (unsubscribeWishlist) unsubscribeWishlist();
        if (unsubscribeCart) unsubscribeCart();
        if (unsubscribeAddresses) unsubscribeAddresses();

        setWishlist([]);
        setAddresses([]);
        setOrders([]);
        localStorage.removeItem('mumtahinas_closet_user');

        // Restore guest cart from localStorage
        try {
          const guestSaved = localStorage.getItem('mumtahinas_closet_cart');
          if (guestSaved) {
            const parsed = JSON.parse(guestSaved);
            if (Array.isArray(parsed)) {
              setCartItems(parsed);
            }
          } else {
            setCartItems([]);
          }
        } catch (e) {
          setCartItems([]);
        }

        setCurrentUser({
          name: '',
          email: '',
          phone: '',
          isLoggedIn: false,
        });
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeWishlist) unsubscribeWishlist();
      if (unsubscribeCart) unsubscribeCart();
      if (unsubscribeAddresses) unsubscribeAddresses();
    };
  }, [products]);

  /* =========================================================================
     5. ADMIN ONLY LISTENERS: All Orders, Users, & Inquiries
     ========================================================================= */
  useEffect(() => {
    if (!isAdmin) return;

    // A. All Orders across store
    let unsubscribeAdminOrders: (() => void) | null = null;
    try {
      const ordersColRef = collection(db, 'orders');
      unsubscribeAdminOrders = onSnapshot(
        ordersColRef,
        async (snapshot) => {
          if (!snapshot.empty) {
            const list: Order[] = snapshot.docs.map((d) => {
              const data = d.data();
              const orderId = data.orderId || data.id || d.id;
              const totalAmount = typeof data.totalAmount === 'number' ? data.totalAmount : (typeof data.total === 'number' ? data.total : 0);
              const paymentStatus = (data.paymentStatus || 'Pending') as PaymentStatus;
              const orderStatus = (data.orderStatus || data.status || 'Pending') as OrderStatus;
              return {
                orderId,
                customerId: data.customerId || data.userId || 'guest',
                customerName: data.customerName || data.shippingAddress?.fullName || 'Valued Client',
                customerEmail: data.customerEmail || 'client@example.com',
                customerPhone: data.customerPhone || '',
                items: Array.isArray(data.items) ? data.items : [],
                totalAmount,
                currency: data.currency || 'USD',
                paymentMethod: data.paymentMethod || 'zelle',
                paymentStatus,
                orderStatus,
                createdAt: data.createdAt || (data.date ? new Date(data.date).toISOString() : new Date().toISOString()),
                paymentId: data.paymentId || data.transactionReference || '',
                transactionReference: data.transactionReference || data.zelleReference || data.paymentId || '',
                zelleReference: data.zelleReference || data.transactionReference || data.paymentId || '',
                id: orderId,
                date: data.date || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent'),
                status: orderStatus,
                total: totalAmount,
                trackingNumber: data.trackingNumber || '',
                carrier: data.carrier || 'USPS Priority Mail',
                estimatedDelivery: data.estimatedDelivery || '',
                subtotal: typeof data.subtotal === 'number' ? data.subtotal : totalAmount,
                shipping: typeof data.shipping === 'number' ? data.shipping : 0,
                discount: typeof data.discount === 'number' ? data.discount : 0,
                tax: typeof data.tax === 'number' ? data.tax : 0,
                shippingAddress: data.shippingAddress || undefined,
              };
            });
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(list);
          } else {
            // Seed initial orders to Firestore /orders if empty
            try {
              for (const initialOrd of INITIAL_ORDERS) {
                const docRef = doc(db, 'orders', initialOrd.orderId);
                await setDoc(docRef, {
                  orderId: initialOrd.orderId,
                  customerId: initialOrd.customerId,
                  customerName: initialOrd.customerName,
                  customerEmail: initialOrd.customerEmail,
                  customerPhone: initialOrd.customerPhone || '',
                  items: initialOrd.items,
                  totalAmount: initialOrd.totalAmount,
                  currency: initialOrd.currency,
                  paymentMethod: initialOrd.paymentMethod,
                  paymentStatus: initialOrd.paymentStatus,
                  orderStatus: initialOrd.orderStatus,
                  createdAt: initialOrd.createdAt,
                  paymentId: initialOrd.paymentId || '',
                  id: initialOrd.orderId,
                  date: initialOrd.date,
                  status: initialOrd.orderStatus,
                  total: initialOrd.totalAmount,
                  trackingNumber: initialOrd.trackingNumber || '',
                  carrier: initialOrd.carrier || 'USPS Priority Mail',
                  estimatedDelivery: initialOrd.estimatedDelivery || '',
                  subtotal: initialOrd.subtotal || initialOrd.totalAmount,
                  shipping: initialOrd.shipping || 0,
                  discount: initialOrd.discount || 0,
                  tax: initialOrd.tax || 0,
                  shippingAddress: initialOrd.shippingAddress || null,
                });
              }
            } catch (seedErr) {
              console.warn('Orders initial seed notice:', seedErr);
            }
          }
        },
        (err) => {
          console.warn('Admin orders snapshot notice:', err);
        }
      );
    } catch (err) {
      console.warn('Admin orders listener setup notice:', err);
    }

    // B. Realtime Inquiries
    let unsubscribeInquiries: (() => void) | null = null;
    try {
      const inqColRef = collection(db, 'inquiries');
      unsubscribeInquiries = onSnapshot(
        inqColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Inquiry[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                inquiryId: data.inquiryId || d.id,
                name: data.name || data.customerName || 'Client',
                customerName: data.customerName || data.name || 'Client',
                email: data.email || '',
                phone: data.phone || '',
                subject: data.subject || 'Inquiry',
                type: data.type || 'General Consultation',
                message: data.message || '',
                createdAt: data.createdAt || new Date().toISOString(),
                status: data.status || 'New',
              };
            });
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setInquiries(list);
          }
        },
        (err) => {
          console.warn('Inquiries snapshot notice:', err);
        }
      );
    } catch (err) {
      console.warn('Inquiries setup notice:', err);
    }

    // C. Realtime Registered Users from Firestore /users
    let unsubscribeUsers: (() => void) | null = null;
    try {
      const usersColRef = collection(db, 'users');
      unsubscribeUsers = onSnapshot(
        usersColRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: UserProfile[] = snapshot.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                uid: data.uid || d.id,
                name: data.name || 'Client',
                email: data.email || '',
                phone: data.phone || '',
                photoURL: data.photoURL || '',
                role: data.role || 'customer',
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt,
                isLoggedIn: true,
              };
            });
            setRegisteredUsers(list);
          }
        },
        (err) => {
          console.warn('Users snapshot notice:', err);
        }
      );
    } catch (err) {
      console.warn('Users setup notice:', err);
    }

    return () => {
      if (unsubscribeAdminOrders) unsubscribeAdminOrders();
      if (unsubscribeInquiries) unsubscribeInquiries();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, [isAdmin]);

  /* =========================================================================
     6. AUTHENTICATION ACTIONS
     ========================================================================= */
  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        addToast(`Welcome to Mumtahina’s Closet, ${result.user.displayName || 'Friend'}!`, 'success');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      addToast(message, 'error');
      return false;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        addToast('Signed in successfully! Welcome back.', 'success');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      addToast(message, 'error');
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      if (name) {
        await updateProfile(user, { displayName: name });
      }

      const role = isAuthorizedAdmin(email) ? 'admin' : 'customer';
      const newProfile: UserProfile = {
        id: user.uid,
        uid: user.uid,
        name: name || email.split('@')[0],
        email: email,
        phone: phone || '',
        photoURL: '',
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLoggedIn: true,
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      updateCurrentUser(newProfile);
      addToast(`Account created! Welcome, ${name || 'friend'}.`, 'success');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      addToast(message, 'error');
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      addToast('Password reset link sent to your email.', 'info');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      addToast(message, 'error');
      return false;
    }
  };

  const signOutUser = async (): Promise<void> => {
    try {
      await signOut(auth);
      addToast('Signed out of your account.', 'info');
    } catch (err) {
      console.error('Sign-out error:', err);
    }
    localStorage.removeItem('mumtahinas_closet_user');
    setCurrentUser({
      name: '',
      email: '',
      phone: '',
      isLoggedIn: false,
    });
    setFirebaseUser(null);
    setCartItems([]);
    setWishlist([]);
    setAddresses([]);
    setOrders([]);
  };

  const saveUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
    const updated = { ...currentUser, ...profileData };
    updateCurrentUser(updated);

    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      try {
        await setDoc(
          userDocRef,
          {
            id: auth.currentUser.uid,
            uid: auth.currentUser.uid,
            name: updated.name,
            email: updated.email,
            phone: updated.phone || '',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        addToast('Profile saved to cloud!', 'success');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  /* =========================================================================
     7. SHOPPING CART ACTIONS: Realtime Sync & Cloud Persistence
     ========================================================================= */
  const addToCart = async (
    product: Product,
    size: string = product.sizes[0] || 'Standard',
    color: string = product.colors[0]?.name || 'Original',
    quantity: number = 1
  ) => {
    const itemId = `${product.id}_${sanitizeDocId(size)}_${sanitizeDocId(color)}`;

    // Update local state
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

    // If customer is logged in, persist to /users/{uid}/cart/{itemId}
    if (auth.currentUser) {
      const existingItem = cartItems.find(
        (i) => i.product.id === product.id && i.selectedSize === size && i.selectedColor === color
      );
      const newQty = existingItem ? existingItem.quantity + quantity : quantity;

      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'cart', itemId), {
          id: itemId,
          productId: product.id,
          selectedSize: size,
          selectedColor: color,
          quantity: newQty,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${auth.currentUser.uid}/cart/${itemId}`);
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

    if (auth.currentUser) {
      const itemId = `${targetItem.product.id}_${sanitizeDocId(targetItem.selectedSize)}_${sanitizeDocId(targetItem.selectedColor)}`;
      try {
        await setDoc(
          doc(db, 'users', auth.currentUser.uid, 'cart', itemId),
          { quantity, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        console.warn('Cart quantity update notice:', err);
      }
    }
  };

  const removeCartItem = async (index: number) => {
    const item = cartItems[index];
    if (!item) return;

    setCartItems((prev) => prev.filter((_, i) => i !== index));
    addToast(`Removed "${item.product.name}" from shopping bag.`, 'info');

    if (auth.currentUser) {
      const itemId = `${item.product.id}_${sanitizeDocId(item.selectedSize)}_${sanitizeDocId(item.selectedColor)}`;
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'cart', itemId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${auth.currentUser.uid}/cart/${itemId}`);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (auth.currentUser) {
      try {
        const snap = await getDocs(collection(db, 'users', auth.currentUser.uid, 'cart'));
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
      } catch (err) {
        console.warn('Failed to clear cloud cart:', err);
      }
    }
  };

  /* =========================================================================
     8. WISHLIST ACTIONS: Realtime Sync & Firestore Storage
     ========================================================================= */
  const toggleWishlist = async (product: Product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      addToast(`Removed "${product.name}" from your Wishlist.`, 'info');
      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'wishlist', product.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${auth.currentUser.uid}/wishlist/${product.id}`);
        }
      }
    } else {
      setWishlist((prev) => [...prev, product]);
      addToast(`Saved "${product.name}" to your Wishlist!`, 'success');
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'users', auth.currentUser.uid, 'wishlist', product.id), {
            id: product.id,
            productId: product.id,
            addedAt: new Date().toISOString(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${auth.currentUser.uid}/wishlist/${product.id}`);
        }
      }
    }
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  /* =========================================================================
     9. SHIPPING ADDRESSES: Realtime Firestore Sync (Starts with 0 addresses)
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

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'addresses', addressId), newAddress);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${auth.currentUser.uid}/addresses/${addressId}`);
      }
    }
    return addressId;
  };

  const updateAddress = async (address: ShippingAddress): Promise<void> => {
    const updated = { ...address, updatedAt: new Date().toISOString() };
    setAddresses((prev) => prev.map((a) => (a.id === address.id ? updated : a)));
    addToast('Shipping address updated!', 'success');

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'addresses', address.id), updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}/addresses/${address.id}`);
      }
    }
  };

  const deleteAddress = async (addressId: string): Promise<void> => {
    setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    addToast('Address removed.', 'info');

    if (auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'addresses', addressId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${auth.currentUser.uid}/addresses/${addressId}`);
      }
    }
  };

  /* =========================================================================
     10. ORDER CREATION & FULFILLMENT: Connects to /orders & /users/{uid}/orders
     ========================================================================= */
  const placeOrder = async (newOrder: Order): Promise<string> => {
    const orderId = newOrder.orderId || newOrder.id || `mc-${Date.now().toString().slice(-6)}`;
    const totalAmount = typeof newOrder.totalAmount === 'number' ? newOrder.totalAmount : (typeof newOrder.total === 'number' ? newOrder.total : 0);
    const orderStatus: OrderStatus = newOrder.orderStatus || newOrder.status || 'pending';
    const paymentStatus: PaymentStatus = newOrder.paymentStatus || 'pending';
    const createdAt = newOrder.createdAt || new Date().toISOString();
    const formattedDate = newOrder.date || new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const customerId = newOrder.customerId || (auth.currentUser ? auth.currentUser.uid : `guest-${Date.now()}`);
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

    // 1. Write to top-level /orders collection for Admin and Fulfillment
    try {
      await setDoc(doc(db, 'orders', orderId), {
        orderId: formattedOrder.orderId,
        id: formattedOrder.orderId,
        customerId: formattedOrder.customerId,
        userId: formattedOrder.customerId,
        customerName: formattedOrder.customerName,
        customerEmail: formattedOrder.customerEmail,
        customerPhone: formattedOrder.customerPhone || '',
        items: formattedOrder.items,
        totalAmount: formattedOrder.totalAmount,
        total: formattedOrder.totalAmount,
        currency: formattedOrder.currency,
        paymentMethod: 'zelle',
        paymentStatus: formattedOrder.paymentStatus,
        orderStatus: formattedOrder.orderStatus,
        status: formattedOrder.orderStatus,
        createdAt: formattedOrder.createdAt,
        date: formattedOrder.date,
        paymentId: formattedOrder.paymentId || '',
        transactionReference: formattedOrder.transactionReference || '',
        zelleReference: formattedOrder.zelleReference || '',
        trackingNumber: formattedOrder.trackingNumber || '',
        carrier: formattedOrder.carrier || 'USPS Priority Mail',
        estimatedDelivery: formattedOrder.estimatedDelivery || '3-4 Business Days',
        subtotal: formattedOrder.subtotal,
        shipping: formattedOrder.shipping,
        discount: formattedOrder.discount,
        tax: formattedOrder.tax,
        shippingAddress: formattedOrder.shippingAddress || null,
      });
    } catch (err) {
      console.warn('Firestore root /orders write notice:', err);
    }

    // 2. Write to customer's personal /users/{uid}/orders subcollection if logged in
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'orders', orderId), {
          id: orderId,
          orderId,
          userId: auth.currentUser.uid,
          customerId: auth.currentUser.uid,
          customerName: formattedOrder.customerName,
          customerEmail: formattedOrder.customerEmail,
          items: formattedOrder.items,
          totalAmount: formattedOrder.totalAmount,
          currency: formattedOrder.currency,
          paymentMethod: 'zelle',
          paymentStatus: formattedOrder.paymentStatus,
          orderStatus: formattedOrder.orderStatus,
          createdAt: formattedOrder.createdAt,
          date: formattedOrder.date,
          status: formattedOrder.orderStatus,
          total: formattedOrder.totalAmount,
          paymentId: formattedOrder.paymentId || '',
          transactionReference: formattedOrder.transactionReference || '',
          zelleReference: formattedOrder.zelleReference || '',
          trackingNumber: formattedOrder.trackingNumber || '',
          carrier: formattedOrder.carrier || 'USPS Priority Mail',
          estimatedDelivery: formattedOrder.estimatedDelivery || '3-4 Business Days',
          subtotal: formattedOrder.subtotal,
          shipping: formattedOrder.shipping,
          discount: formattedOrder.discount,
          tax: formattedOrder.tax,
          shippingAddress: formattedOrder.shippingAddress || null,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${auth.currentUser.uid}/orders/${orderId}`);
      }
    }

    return orderId;
  };

  /* =========================================================================
     11. ADMIN ACTIONS: Product, Category, Review, Inquiry & Order Management
     ========================================================================= */
  const addProduct = async (newProduct: Product): Promise<void> => {
    setProducts((prev) => [newProduct, ...prev]);
    addToast(`Product "${newProduct.name}" added to catalog!`, 'success');

    try {
      await setDoc(doc(db, 'products', newProduct.id), {
        ...newProduct,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${newProduct.id}`);
    }
  };

  const updateProduct = async (updatedProduct: Product): Promise<void> => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    addToast(`Product "${updatedProduct.name}" updated!`, 'success');

    try {
      await setDoc(
        doc(db, 'products', updatedProduct.id),
        {
          ...updatedProduct,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${updatedProduct.id}`);
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    addToast('Product removed from catalog.', 'info');

    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
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
      await setDoc(doc(db, 'categories', categoryId), categoryData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${categoryId}`);
    }
  };

  const updateCategory = async (category: CategoryItem): Promise<void> => {
    const updated = { ...category, updatedAt: new Date().toISOString() };
    setCategories((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
    addToast(`Category "${category.nameEn}" updated!`, 'success');

    try {
      await setDoc(doc(db, 'categories', category.id), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${category.id}`);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('Category removed.', 'info');

    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  // Review Operations
  const addReview = async (reviewData: Omit<Review, 'id'>): Promise<string> => {
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullReview: Review = {
      ...reviewData,
      id: reviewId,
      reviewId,
      customerId: reviewData.customerId || (auth.currentUser ? auth.currentUser.uid : 'guest'),
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
      await setDoc(doc(db, 'reviews', reviewId), fullReview);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reviews/${reviewId}`);
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
      await setDoc(doc(db, 'reviews', reviewId), { status }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${reviewId}`);
    }
  };

  const deleteReview = async (reviewId: string): Promise<void> => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    addToast('Review deleted.', 'info');

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reviews/${reviewId}`);
    }
  };

  // Inquiry Operations
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
      await setDoc(doc(db, 'inquiries', inquiryId), fullInquiry);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inquiries/${inquiryId}`);
    }
    return inquiryId;
  };

  const updateInquiryStatus = async (id: string, status: 'New' | 'In Review' | 'Resolved') => {
    setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
    try {
      await setDoc(doc(db, 'inquiries', id), { status }, { merge: true });
    } catch (e) {
      console.warn('Could not update inquiry status in Firestore:', e);
    }
    addToast(`Inquiry status updated to ${status}.`, 'success');
  };

  const deleteInquiry = async (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (e) {
      console.warn('Could not delete inquiry from Firestore:', e);
    }
    addToast('Inquiry removed.', 'info');
  };

  // Order Status Updates
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
      const updateData: Record<string, any> = {
        orderStatus: status,
        status,
      };
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (carrier !== undefined) updateData.carrier = carrier;
      await setDoc(doc(db, 'orders', orderId), updateData, { merge: true });
    } catch (err) {
      console.warn('Failed to sync order status to Firestore:', err);
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
      await setDoc(doc(db, 'orders', orderId), { paymentStatus }, { merge: true });
    } catch (err) {
      console.warn('Failed to sync payment status to Firestore:', err);
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
      await setDoc(doc(db, 'settings', 'zelle'), payload, { merge: true });
      setZelleSettings(payload);
      addToast('Zelle payment settings saved to Firestore!', 'success');
    } catch (err) {
      console.error('Failed to update Zelle settings:', err);
      addToast('Failed to save Zelle settings to Firestore.', 'error');
      throw err;
    }
  };

  const syncOrdersFromFirestore = async () => {
    try {
      const ordersColRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersColRef);
      if (!snapshot.empty) {
        const list: Order[] = snapshot.docs.map((d) => {
          const data = d.data();
          const orderId = data.orderId || data.id || d.id;
          const totalAmount = typeof data.totalAmount === 'number' ? data.totalAmount : (typeof data.total === 'number' ? data.total : 0);
          return {
            orderId,
            customerId: data.customerId || data.userId || 'guest',
            customerName: data.customerName || data.shippingAddress?.fullName || 'Valued Client',
            customerEmail: data.customerEmail || 'client@example.com',
            customerPhone: data.customerPhone || '',
            items: Array.isArray(data.items) ? data.items : [],
            totalAmount,
            currency: data.currency || 'USD',
            paymentMethod: data.paymentMethod || 'Credit Card',
            paymentStatus: (data.paymentStatus || 'Pending') as PaymentStatus,
            orderStatus: (data.orderStatus || data.status || 'Pending') as OrderStatus,
            createdAt: data.createdAt || (data.date ? new Date(data.date).toISOString() : new Date().toISOString()),
            paymentId: data.paymentId || '',
            id: orderId,
            date: data.date || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent'),
            status: (data.orderStatus || data.status || 'Pending') as OrderStatus,
            total: totalAmount,
            trackingNumber: data.trackingNumber || '',
            carrier: data.carrier || 'USPS Priority Mail',
            estimatedDelivery: data.estimatedDelivery || '',
            subtotal: typeof data.subtotal === 'number' ? data.subtotal : totalAmount,
            shipping: typeof data.shipping === 'number' ? data.shipping : 0,
            discount: typeof data.discount === 'number' ? data.discount : 0,
            tax: typeof data.tax === 'number' ? data.tax : 0,
            shippingAddress: data.shippingAddress || undefined,
          };
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(list);
        addToast('Synced live orders from Firestore database.', 'success');
      }
    } catch (err) {
      console.warn('Manual sync orders notice:', err);
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
        firebaseUser,
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
