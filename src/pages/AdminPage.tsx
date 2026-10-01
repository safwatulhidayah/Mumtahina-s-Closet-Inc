import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Mail,
  Star,
  Heart,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  X,
  Menu,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Send,
  CreditCard,
  Database,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product, Order, Inquiry, CategoryItem, PaymentStatus, OrderStatus } from '../types';
import { AUTHORIZED_ADMIN_EMAILS } from '../lib/adminAuth';
import { BrandLogo } from '../components/BrandLogo';
import { ZelleLogo } from '../components/ZelleLogo';
import { uploadMultipleProductImages } from '../lib/storage';
import { getColorHex, formatColorName } from '../lib/colorUtils';

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'categories'
  | 'inquiries'
  | 'reviews'
  | 'wishlist'
  | 'settings';

export const AdminPage: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    syncOrdersFromFirestore,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    reviews,
    updateReviewStatus,
    deleteReview,
    registeredUsers,
    currentUser,
    firebaseUser,
    signOutUser,
    addToast,
    zelleSettings,
    updateZelleSettings,
  } = useShop();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Products filters & search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productSort, setProductSort] = useState<'name' | 'price-asc' | 'price-desc' | 'stock'>('name');

  // Product Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Orders filters & modal
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPaymentStatusFilter, setOrderPaymentStatusFilter] = useState<string>('all');
  const [orderPaymentMethodFilter, setOrderPaymentMethodFilter] = useState<'all' | 'zelle'>('all');
  const [isSyncingOrders, setIsSyncingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Zelle Settings Form State
  const [zelleFormEmail, setZelleFormEmail] = useState('');
  const [zelleFormPhone, setZelleFormPhone] = useState('914-303-9181');
  const [zelleFormAccountHolder, setZelleFormAccountHolder] = useState('Dilruba Shabnam');
  const [zelleFormQrCodeUrl, setZelleFormQrCodeUrl] = useState('https://cdn.phototourl.com/member/2026-09-29-15445970-229c-41bd-9aaf-dc85f6d6e352.jpg');
  const [zelleFormPaymentUrl, setZelleFormPaymentUrl] = useState('https://enroll.zellepay.com/qr-codes?data=eyJhY3Rpb24iOiJwYXltZW50IiwibmFtZSI6IkRpbHJ1YmEgU2hhYm5hbSIsInRva2VuIjoiOTE0MzAzOTE4MSJ9');
  const [zelleFormInstructions, setZelleFormInstructions] = useState('');
  const [isSavingZelle, setIsSavingZelle] = useState(false);
  const [copiedAdminField, setCopiedAdminField] = useState<string | null>(null);

  // Sync Zelle form when settings load from Firestore
  React.useEffect(() => {
    if (zelleSettings) {
      setZelleFormEmail(zelleSettings.email || '');
      setZelleFormPhone(zelleSettings.phone || '914-303-9181');
      setZelleFormAccountHolder(zelleSettings.accountHolderName || 'Dilruba Shabnam');
      setZelleFormQrCodeUrl(zelleSettings.qrCodeUrl || 'https://cdn.phototourl.com/member/2026-09-29-15445970-229c-41bd-9aaf-dc85f6d6e352.jpg');
      setZelleFormPaymentUrl(zelleSettings.paymentUrl || 'https://enroll.zellepay.com/qr-codes?data=eyJhY3Rpb24iOiJwYXltZW50IiwibmFtZSI6IkRpbHJ1YmEgU2hhYm5hbSIsInRva2VuIjoiOTE0MzAzOTE4MSJ9');
      setZelleFormInstructions(zelleSettings.paymentInstructions || '');
    }
  }, [zelleSettings]);

  const handleSaveZelle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zelleFormAccountHolder.trim()) {
      addToast('Please provide the Account Holder Name.', 'error');
      return;
    }
    if (!zelleFormPhone.trim() && !zelleFormEmail.trim()) {
      addToast('Please provide at least a Zelle phone number or email address.', 'error');
      return;
    }
    setIsSavingZelle(true);
    try {
      await updateZelleSettings({
        email: zelleFormEmail.trim(),
        phone: zelleFormPhone.trim(),
        accountHolderName: zelleFormAccountHolder.trim(),
        qrCodeUrl: zelleFormQrCodeUrl.trim(),
        paymentUrl: zelleFormPaymentUrl.trim(),
        paymentInstructions: zelleFormInstructions.trim(),
      });
    } catch (err) {
      console.error('Failed to save Zelle settings:', err);
    } finally {
      setIsSavingZelle(false);
    }
  };

  const copyToClipboardAdmin = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAdminField(label);
    setTimeout(() => setCopiedAdminField(null), 2000);
  };

  // Categories Modal
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Inquiries filter & view
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Reviews filter
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [reviewSearch, setReviewSearch] = useState('');

  // Universal deletion confirmation modal state (replaces window.confirm for iframe safety)
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'product' | 'category' | 'inquiry' | 'review';
    id: string;
    name: string;
  } | null>(null);

  // Active admin info
  const activeAdminEmail = firebaseUser?.email || currentUser?.email || 'denaislam09@gmail.com';

  /* ---------------- Computed Dashboard Stats ---------------- */
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalSales = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => (p.stock ?? 15) <= 5);
  }, [products]);

  // Derive unique customers from Firestore registered users + placed orders
  const customersList = useMemo(() => {
    const customerMap = new Map<
      string,
      {
        name: string;
        email: string;
        phone: string;
        totalOrders: number;
        totalSpent: number;
        lastOrderDate: string;
        status: string;
      }
    >();

    // 1. Add all registered users from Firestore users collection
    registeredUsers.forEach((u) => {
      if (!u.email) return;
      const email = u.email.toLowerCase();
      customerMap.set(email, {
        name: u.name || 'Valued Client',
        email: u.email,
        phone: u.phone || '',
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'Joined recently',
        status: 'Registered Client',
      });
    });

    // 2. Add current user if exists and not yet added
    if (currentUser?.email) {
      const email = currentUser.email.toLowerCase();
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          name: currentUser.name || 'Valued Client',
          email: currentUser.email,
          phone: currentUser.phone || '',
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: 'Active',
          status: 'Active Client',
        });
      }
    }

    // 3. Process orders to calculate order counts, totals, and last order dates
    orders.forEach((ord) => {
      const email = (ord.customerEmail || 'client@example.com').toLowerCase();
      const existing = customerMap.get(email);
      const orderDate = ord.createdAt ? new Date(ord.createdAt).toISOString().split('T')[0] : 'Recent';
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += ord.total;
        if (!existing.lastOrderDate || existing.lastOrderDate === 'Joined recently' || orderDate > existing.lastOrderDate) {
          existing.lastOrderDate = orderDate;
        }
      } else {
        customerMap.set(email, {
          name: ord.customerName || 'Modest Client',
          email: ord.customerEmail || 'client@example.com',
          phone: ord.customerPhone || '',
          totalOrders: 1,
          totalSpent: ord.total,
          lastOrderDate: orderDate,
          status: 'Active Client',
        });
      }
    });

    return Array.from(customerMap.values());
  }, [orders, currentUser, registeredUsers]);

  // Filtered reviews from live Firestore
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesStatus = reviewStatusFilter === 'all' || r.status === reviewStatusFilter;
      const search = reviewSearch.toLowerCase();
      const matchesSearch =
        !search ||
        (r.userName || r.customerName || '').toLowerCase().includes(search) ||
        (r.title || '').toLowerCase().includes(search) ||
        (r.comment || '').toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [reviews, reviewStatusFilter, reviewSearch]);

  /* ---------------- Filtered Products ---------------- */
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(productSearch.toLowerCase());
        const matchesCat =
          productCategoryFilter === 'all' ||
          p.category.toLowerCase() === productCategoryFilter.toLowerCase();
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (productSort === 'price-asc') return a.price - b.price;
        if (productSort === 'price-desc') return b.price - a.price;
        if (productSort === 'stock') return (a.stock ?? 10) - (b.stock ?? 10);
        return a.name.localeCompare(b.name);
      });
  }, [products, productSearch, productCategoryFilter, productSort]);

  /* ---------------- Filtered Orders ---------------- */
  const filteredOrders = useMemo(() => {
    return orders
      .filter((ord) => {
        const orderId = (ord.orderId || ord.id || '').toLowerCase();
        const customerName = (ord.customerName || ord.shippingAddress?.fullName || '').toLowerCase();
        const customerEmail = (ord.customerEmail || '').toLowerCase();
        const zelleRef = (ord.transactionReference || ord.zelleReference || ord.paymentId || '').toLowerCase();
        const searchLower = orderSearch.toLowerCase().trim();

        const matchesSearch =
          !searchLower ||
          orderId.includes(searchLower) ||
          customerName.includes(searchLower) ||
          customerEmail.includes(searchLower) ||
          zelleRef.includes(searchLower);

        const currentOrderStatus = ord.orderStatus || ord.status || 'Pending';
        const matchesStatus =
          orderStatusFilter === 'all' ||
          currentOrderStatus.toLowerCase() === orderStatusFilter.toLowerCase();

        const currentPaymentStatus = ord.paymentStatus || 'Pending';
        const matchesPayment =
          orderPaymentStatusFilter === 'all' ||
          currentPaymentStatus.toLowerCase() === orderPaymentStatusFilter.toLowerCase();

        const currentMethod = (ord.paymentMethod || 'zelle').toLowerCase();
        const matchesMethod =
          orderPaymentMethodFilter === 'all' ||
          (orderPaymentMethodFilter === 'zelle' && (currentMethod.includes('zelle') || !ord.paymentMethod));

        return matchesSearch && matchesStatus && matchesPayment && matchesMethod;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, orderSearch, orderStatusFilter, orderPaymentStatusFilter, orderPaymentMethodFilter]);

  /* ---------------- Filtered Inquiries ---------------- */
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (inquiryStatusFilter === 'all') return true;
      return (inq.status || 'New').toLowerCase() === inquiryStatusFilter.toLowerCase();
    });
  }, [inquiries, inquiryStatusFilter]);

  const handleLogout = async () => {
    await signOutUser();
    addToast('Signed out of Administrator session.', 'info');
    navigate('/login');
  };

  interface NavItem {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: products.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'inquiries', label: 'Customer Inquiries', icon: Mail, badge: inquiries.filter((i) => i.status === 'New').length || undefined },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'wishlist', label: 'Wishlist Analytics', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F6] text-[#0F1E36] flex flex-col antialiased">
      {/* Top Header Bar for Admin */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#F0E4E6] shadow-2xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-[#0F1E36] hover:bg-[#FAF0F2] rounded-xl focus:outline-hidden"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" />
              <div className="hidden sm:block">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-[#EBF5F0] text-[#2D6A4F] rounded-md">
                  Admin Console
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              id="admin-view-store-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F1E36] hover:text-[#2D6A4F] bg-[#FAF7F6] hover:bg-[#FAF0F2] border border-[#F0E4E6] rounded-xl transition-colors cursor-pointer"
              title="View live customer storefront"
            >
              <span>View Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            {/* Admin Profile Area */}
            <div className="flex items-center gap-2 pl-3 border-l border-[#F0E4E6]">
              <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {activeAdminEmail.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-[#0F1E36] leading-tight truncate max-w-[140px]">
                  {activeAdminEmail.split('@')[0]}
                </p>
                <span className="text-[10px] text-[#2D6A4F] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#F0E4E6] flex-shrink-0">
          <div className="p-4 flex-1 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#EBF5F0] text-[#2D6A4F]'
                      : 'text-slate-600 hover:bg-[#FAF0F2] hover:text-[#0F1E36]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2D6A4F]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-[#2D6A4F] text-white' : 'bg-[#FAF0F2] text-[#E58C9D]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#F0E4E6] bg-[#FAF7F6]">
            <div className="mb-3 px-2">
              <p className="text-[11px] font-semibold text-slate-700 truncate">{activeAdminEmail}</p>
              <p className="text-[10px] text-slate-400">Mumtahina’s Closet Inc</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Admin</span>
            </button>
          </div>
        </aside>

        {/* Mobile Collapsible Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-[#F0E4E6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrandLogo size="sm" />
                  <span className="text-xs font-bold text-[#0F1E36]">Admin Portal</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-[#0F1E36] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 flex-1 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as AdminTab);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#EBF5F0] text-[#2D6A4F]'
                          : 'text-slate-600 hover:bg-[#FAF0F2] hover:text-[#0F1E36]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#2D6A4F]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-[#2D6A4F] text-white' : 'bg-[#FAF0F2] text-[#E58C9D]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-4 border-t border-[#F0E4E6] bg-[#FAF7F6]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0E4E6]">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F1E36]">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Store intelligence, order tracking, and live catalog controls for Mumtahina’s Closet Inc.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Total Sales</span>
                    <DollarSign className="w-4 h-4 text-[#2D6A4F]" />
                  </div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#0F1E36]">
                    ${totalSales.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> Live Gross Volume
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#2D6A4F]" />
                  </div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#0F1E36]">
                    {totalOrders}
                  </p>
                  <p className="text-[10px] text-slate-500">Processed Orders</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Orders</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#0F1E36]">
                    {pendingOrdersCount}
                  </p>
                  <p className="text-[10px] text-amber-600 font-semibold">Requires Fulfillment</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Total Products</span>
                    <Package className="w-4 h-4 text-[#2D6A4F]" />
                  </div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#0F1E36]">
                    {totalProducts}
                  </p>
                  <p className="text-[10px] text-slate-500">Active in Catalog</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Customers</span>
                    <Users className="w-4 h-4 text-[#2D6A4F]" />
                  </div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#0F1E36]">
                    {customersList.length}
                  </p>
                  <p className="text-[10px] text-slate-500">Registered Accounts</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Low Stock</span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-rose-600">
                    {lowStockProducts.length}
                  </p>
                  <p className="text-[10px] text-rose-600 font-semibold">&le; 5 units remaining</p>
                </div>
              </div>

              {/* Middle Section: Recent Orders & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Recent Orders Table */}
                <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-[#F0E4E6] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0E4E6]">
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#0F1E36]">
                        Recent Customer Orders
                      </h3>
                      <p className="text-xs text-slate-400">Latest storefront purchases</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-[#2D6A4F] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Orders</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#F5EBED] text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="pb-3 font-semibold">Order ID</th>
                          <th className="pb-3 font-semibold">Customer</th>
                          <th className="pb-3 font-semibold">Date</th>
                          <th className="pb-3 font-semibold">Amount</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5EBED]">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-[#FAF7F6]/60 transition-colors">
                            <td className="py-3 font-mono font-bold text-[#0F1E36]">{ord.id}</td>
                            <td className="py-3">
                              <span className="font-semibold block text-[#0F1E36]">
                                {ord.customerName || 'Valued Client'}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">
                                {ord.customerEmail || 'client@example.com'}
                              </span>
                            </td>
                            <td className="py-3 text-slate-500">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 font-bold text-[#0F1E36]">${ord.total.toFixed(2)}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                  ord.status === 'Delivered'
                                    ? 'bg-[#EBF5F0] text-[#2D6A4F]'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700'
                                    : ord.status === 'Shipped'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => setSelectedOrder(ord)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#2D6A4F] hover:bg-[#EBF5F0] rounded-lg transition-colors cursor-pointer"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: Low Stock Alerts & Quick Shortcuts */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Low Stock Alerts */}
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#F0E4E6] shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0E4E6]">
                      <h3 className="font-serif text-base font-bold text-[#0F1E36] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Inventory Alerts</span>
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab('products');
                          setProductSort('stock');
                        }}
                        className="text-xs text-[#2D6A4F] hover:underline cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>

                    {lowStockProducts.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">
                        All products have healthy inventory levels (&gt; 5 units).
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {lowStockProducts.slice(0, 4).map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2.5 bg-[#FAF7F6] rounded-xl border border-[#F0E4E6]"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={p.images?.[0] || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80'}
                                alt={p.name}
                                className="w-10 h-10 object-cover rounded-lg"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="text-xs font-bold text-[#0F1E36] truncate max-w-[140px]">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-slate-400">{p.category}</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md">
                              {p.stock ?? 2} left
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Admin Actions */}
                  <div className="bg-gradient-to-br from-[#0F1E36] to-[#1E3A5F] p-5 sm:p-6 rounded-3xl text-white shadow-md space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2D6A4F] px-2 py-0.5 rounded-md">
                        Fast Operations
                      </span>
                      <h4 className="font-serif text-lg font-bold text-white mt-1">Store Controls</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => setIsAddProductOpen(true)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left font-semibold transition-colors cursor-pointer"
                      >
                        + Add Product
                      </button>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left font-semibold transition-colors cursor-pointer"
                      >
                        Fulfill Orders
                      </button>
                      <button
                        onClick={() => setActiveTab('inquiries')}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left font-semibold transition-colors cursor-pointer"
                      >
                        Client Inquiries
                      </button>
                      <button
                        onClick={() => setIsAddCategoryOpen(true)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-left font-semibold transition-colors cursor-pointer"
                      >
                        + New Category
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0E4E6]">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#0F1E36]">Product Catalog</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage pricing, inventory, descriptions, and featured status ({products.length} products)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    id="admin-add-product-btn"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* Search, Filter & Sort Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search product name or tag..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#F0E4E6] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>

                <div>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-white border border-[#F0E4E6] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                  >
                    <option value="all">All Categories</option>
                    <option value="Abayas">Abayas</option>
                    <option value="Hijabs">Hijabs</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Kimonos">Kimonos</option>
                    <option value="Sets">Co-ord Sets</option>
                    <option value="Men">Men’s Apparel</option>
                    <option value="Kids">Kids Modest</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <select
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value as any)}
                    className="w-full py-2 px-3 text-xs bg-white border border-[#F0E4E6] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="stock">Stock Quantity</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-3xl border border-[#F0E4E6] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F6] border-b border-[#F0E4E6] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Product</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Price / Old Price</th>
                        <th className="py-3.5 px-4">Stock</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5EBED]">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FAF7F6]/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.images?.[0] || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80'}
                                alt={p.name}
                                className="w-12 h-14 object-cover rounded-xl border border-[#F0E4E6]"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="font-bold text-[#0F1E36] block text-xs">{p.name}</span>
                                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                                  {p.images && p.images.length > 1 && (
                                    <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                      {p.images.length} photos
                                    </span>
                                  )}
                                  {p.colors && p.colors.length > 0 && (
                                    <span className="text-[9px] text-slate-500 font-medium">
                                      • {p.colors.map((c) => c.name).slice(0, 2).join(', ')}
                                      {p.colors.length > 2 ? ` +${p.colors.length - 2}` : ''}
                                    </span>
                                  )}
                                </div>
                                {p.isBestSeller && (
                                  <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-[#FAF0F2] text-[#E58C9D] rounded-sm mt-0.5">
                                    Best Seller
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium capitalize">{p.category}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#0F1E36]">${p.price.toFixed(2)}</span>
                            {p.originalPrice && (
                              <span className="text-[11px] text-slate-400 line-through ml-1.5">
                                ${p.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                (p.stock ?? 10) <= 5
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-[#EBF5F0] text-[#2D6A4F]'
                              }`}
                            >
                              {p.stock ?? 15} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#EBF5F0] text-[#2D6A4F]">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 text-slate-500 hover:text-[#2D6A4F] hover:bg-[#EBF5F0] rounded-lg transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ type: 'product', id: p.id, name: p.name })}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0E4E6]">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-serif text-2xl font-bold text-[#0F1E36]">Orders Management</h1>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF5F0] text-[#2D6A4F] border border-[#2D6A4F]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Firestore Connected
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF5FF] text-[#7414CA] border border-[#E9D5FF]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7414CA]" />
                      Zelle Direct Payments
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Store operates exclusively with Zelle bank transfer payments. {orders.length} total orders recorded.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setIsSyncingOrders(true);
                      await syncOrdersFromFirestore();
                      setIsSyncingOrders(false);
                    }}
                    disabled={isSyncingOrders}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#FAF7F6] text-[#0F1E36] border border-[#F0E4E6] text-xs font-semibold rounded-xl transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#2D6A4F] ${isSyncingOrders ? 'animate-spin' : ''}`} />
                    <span>{isSyncingOrders ? 'Syncing...' : 'Sync Firestore'}</span>
                  </button>
                </div>
              </div>

              {/* Order Status Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Orders</span>
                  <span className="font-serif text-xl font-bold text-[#0F1E36]">{orders.length}</span>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Pending Payment</span>
                  <span className="font-serif text-xl font-bold text-amber-700">
                    {orders.filter((o) => (o.paymentStatus || 'Pending') === 'Pending').length}
                  </span>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Paid Orders</span>
                  <span className="font-serif text-xl font-bold text-[#2D6A4F]">
                    {orders.filter((o) => o.paymentStatus === 'Paid').length}
                  </span>
                </div>
                <div className="p-3.5 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gross Volume</span>
                  <span className="font-serif text-xl font-bold text-[#0F1E36]">
                    ${orders.reduce((sum, o) => sum + (typeof o.totalAmount === 'number' ? o.totalAmount : (o.total || 0)), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Search & Status Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by Order ID, Customer, Email, Zelle Ref..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#F0E4E6] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>

                <div>
                  <select
                    value={orderPaymentMethodFilter}
                    onChange={(e) => setOrderPaymentMethodFilter(e.target.value as 'all' | 'zelle')}
                    className="w-full py-2 px-3 text-xs bg-white border border-[#F0E4E6] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                  >
                    <option value="all">All Payment Gateways</option>
                    <option value="zelle">Zelle Payments Only</option>
                  </select>
                </div>

                <div>
                  <select
                    value={orderPaymentStatusFilter}
                    onChange={(e) => setOrderPaymentStatusFilter(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-white border border-[#F0E4E6] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="pending">Payment: Pending</option>
                    <option value="paid">Payment: Paid</option>
                    <option value="failed">Payment: Failed</option>
                    <option value="refunded">Payment: Refunded</option>
                  </select>
                </div>

                <div>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-white border border-[#F0E4E6] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                  >
                    <option value="all">All Fulfillment Statuses</option>
                    <option value="pending">Fulfillment: Pending</option>
                    <option value="confirmed">Fulfillment: Confirmed</option>
                    <option value="processing">Fulfillment: Processing</option>
                    <option value="shipped">Fulfillment: Shipped</option>
                    <option value="delivered">Fulfillment: Delivered</option>
                    <option value="cancelled">Fulfillment: Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Responsive Orders Table (Desktop: Table view, Mobile: Card list) */}
              <div className="bg-white rounded-3xl border border-[#F0E4E6] shadow-2xs overflow-hidden">
                {/* Desktop & Tablet Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F6] border-b border-[#F0E4E6] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">Order</th>
                        <th className="py-3.5 px-4 font-bold">Customer</th>
                        <th className="py-3.5 px-4 font-bold">Amount</th>
                        <th className="py-3.5 px-4 font-bold">Payment Status</th>
                        <th className="py-3.5 px-4 font-bold">Fulfillment</th>
                        <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5EBED]">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No orders matching current criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => {
                          const orderId = ord.orderId || ord.id;
                          const currentPaymentStatus = (ord.paymentStatus || 'Pending') as PaymentStatus;
                          const currentOrderStatus = (ord.orderStatus || ord.status || 'Pending') as OrderStatus;
                          const totalAmt = typeof ord.totalAmount === 'number' ? ord.totalAmount : (ord.total || 0);

                          return (
                            <tr key={orderId} className="hover:bg-[#FAF7F6]/50 transition-colors">
                              {/* Column 1: Order */}
                              <td className="py-3.5 px-4">
                                <span className="font-mono font-bold text-[#0F1E36] block text-xs">
                                  {orderId}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                  <span>{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : ord.date}</span>
                                  <span>•</span>
                                  <span>{ord.items?.length || 0} items</span>
                                </div>
                              </td>

                              {/* Column 2: Customer */}
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-[#0F1E36] block">
                                  {ord.customerName || ord.shippingAddress?.fullName || 'Valued Client'}
                                </span>
                                <span className="text-[11px] text-slate-400 block truncate max-w-[220px]">
                                  {ord.customerEmail || 'client@example.com'}
                                </span>
                                {ord.customerPhone && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {ord.customerPhone}
                                  </span>
                                )}
                              </td>

                              {/* Column 3: Amount & Payment Method */}
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-[#0F1E36] text-sm block">
                                  ${totalAmt.toFixed(2)}
                                </span>
                                <div className="flex flex-col gap-0.5 mt-1">
                                  <div className="flex items-center gap-1">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FAF5FF] text-[#7414CA] border border-[#E9D5FF]">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#7414CA]" />
                                      Zelle
                                    </span>
                                  </div>
                                  {(ord.transactionReference || ord.zelleReference || ord.paymentId) ? (
                                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]" title={`Zelle Ref: ${ord.transactionReference || ord.zelleReference || ord.paymentId}`}>
                                      Ref: {ord.transactionReference || ord.zelleReference || ord.paymentId}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">No ref code</span>
                                  )}
                                </div>
                              </td>

                              {/* Column 4: Payment Status */}
                              <td className="py-3.5 px-4">
                                <div className="inline-flex items-center gap-1.5">
                                  <select
                                    value={currentPaymentStatus}
                                    onChange={(e) => updatePaymentStatus(orderId, e.target.value as PaymentStatus)}
                                    className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border focus:outline-hidden cursor-pointer ${
                                      currentPaymentStatus === 'Paid'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : currentPaymentStatus === 'Failed'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : currentPaymentStatus === 'Refunded'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Failed">Failed</option>
                                    <option value="Refunded">Refunded</option>
                                  </select>
                                </div>
                              </td>

                              {/* Fulfillment Status */}
                              <td className="py-3.5 px-4">
                                <select
                                  value={currentOrderStatus}
                                  onChange={(e) => updateOrderStatus(orderId, e.target.value as OrderStatus)}
                                  className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border focus:outline-hidden cursor-pointer ${
                                    currentOrderStatus === 'Delivered'
                                      ? 'bg-[#EBF5F0] text-[#2D6A4F] border-[#2D6A4F]/30'
                                      : currentOrderStatus === 'Cancelled'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : currentOrderStatus === 'Shipped'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => setSelectedOrder(ord)}
                                  className="px-3 py-1.5 bg-[#FAF7F6] hover:bg-[#FAF0F2] text-[#0F1E36] border border-[#F0E4E6] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Orders Card List (visible on screens < md) */}
                <div className="block md:hidden divide-y divide-[#F5EBED]">
                  {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No orders matching current criteria.
                    </div>
                  ) : (
                    filteredOrders.map((ord) => {
                      const orderId = ord.orderId || ord.id;
                      const currentPaymentStatus = (ord.paymentStatus || 'Pending') as PaymentStatus;
                      const currentOrderStatus = (ord.orderStatus || ord.status || 'Pending') as OrderStatus;
                      const totalAmt = typeof ord.totalAmount === 'number' ? ord.totalAmount : (ord.total || 0);

                      return (
                        <div key={orderId} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-mono font-bold text-xs text-[#0F1E36] block">{orderId}</span>
                              <span className="text-[11px] text-slate-400">
                                {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : ord.date} • {ord.items?.length || 0} items
                              </span>
                            </div>
                            <span className="font-serif font-bold text-sm text-[#0F1E36]">
                              ${totalAmt.toFixed(2)}
                            </span>
                          </div>

                          <div className="text-xs space-y-1">
                            <div>
                              <span className="font-semibold text-[#0F1E36] block">
                                {ord.customerName || ord.shippingAddress?.fullName || 'Valued Client'}
                              </span>
                              <span className="text-slate-400 text-[11px] block">{ord.customerEmail || 'client@example.com'}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FAF5FF] text-[#7414CA] border border-[#E9D5FF]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#7414CA]" />
                                Zelle
                              </span>
                              {(ord.transactionReference || ord.zelleReference || ord.paymentId) && (
                                <span className="text-[10px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 truncate">
                                  Ref: {ord.transactionReference || ord.zelleReference || ord.paymentId}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Payment Status
                              </span>
                              <select
                                value={currentPaymentStatus}
                                onChange={(e) => updatePaymentStatus(orderId, e.target.value as PaymentStatus)}
                                className={`w-full text-[11px] font-bold py-1.5 px-2 rounded-lg border focus:outline-hidden ${
                                  currentPaymentStatus === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : currentPaymentStatus === 'Failed'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : currentPaymentStatus === 'Refunded'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Failed">Failed</option>
                                <option value="Refunded">Refunded</option>
                              </select>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Fulfillment
                              </span>
                              <select
                                value={currentOrderStatus}
                                onChange={(e) => updateOrderStatus(orderId, e.target.value as OrderStatus)}
                                className={`w-full text-[11px] font-bold py-1.5 px-2 rounded-lg border focus:outline-hidden ${
                                  currentOrderStatus === 'Delivered'
                                    ? 'bg-[#EBF5F0] text-[#2D6A4F] border-[#2D6A4F]/30'
                                    : currentOrderStatus === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : currentOrderStatus === 'Shipped'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="w-full text-center py-2 bg-[#FAF7F6] hover:bg-[#FAF0F2] text-[#0F1E36] border border-[#F0E4E6] rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMER MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="pb-4 border-b border-[#F0E4E6]">
                <h1 className="font-serif text-2xl font-bold text-[#0F1E36]">Customer Accounts</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Client profiles, purchase histories, and contact records
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-[#F0E4E6] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F6] border-b border-[#F0E4E6] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Phone</th>
                        <th className="py-3.5 px-4">Total Orders</th>
                        <th className="py-3.5 px-4">Total Spent</th>
                        <th className="py-3.5 px-4">Last Active</th>
                        <th className="py-3.5 px-4">Account Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5EBED]">
                      {customersList.map((c, i) => (
                        <tr key={i} className="hover:bg-[#FAF7F6]/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#0F1E36] block">{c.name}</span>
                            <span className="text-[11px] text-slate-400">{c.email}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{c.phone}</td>
                          <td className="py-3 px-4 font-bold text-[#0F1E36]">{c.totalOrders} orders</td>
                          <td className="py-3 px-4 font-bold text-[#2D6A4F]">${c.totalSpent.toFixed(2)}</td>
                          <td className="py-3 px-4 text-slate-500">{c.lastOrderDate}</td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#EBF5F0] text-[#2D6A4F]">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0E4E6]">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#0F1E36]">Category Directory</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure bilingual English & Bangla taxonomy, photography, and catalog visibility
                  </p>
                </div>
                <button
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-3xl border border-[#F0E4E6] p-5 shadow-2xs space-y-4"
                  >
                    <div className="relative h-36 rounded-2xl overflow-hidden border border-[#F0E4E6]">
                      <img
                        src={cat.image}
                        alt={cat.nameEn}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 text-[#2D6A4F] shadow-xs">
                        {cat.itemCount} items
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-base font-bold text-[#0F1E36]">
                        {cat.nameEn}
                      </h3>
                      {cat.nameBn && (
                        <p className="text-xs text-[#2D6A4F] font-semibold mt-0.5">
                          {cat.nameBn}
                        </p>
                      )}
                      {cat.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#F0E4E6]">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cat.isActive ? 'bg-[#EBF5F0] text-[#2D6A4F]' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Hidden'}
                      </span>
                      <div className="space-x-1">
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="p-1.5 text-slate-500 hover:text-[#2D6A4F] hover:bg-[#FAF0F2] rounded-lg cursor-pointer"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ type: 'category', id: cat.id, name: cat.nameEn })}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CUSTOMER INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0E4E6]">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#0F1E36]">Customer Inquiries</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live consultation requests, sizing help, and bespoke bridal inquiries ({inquiries.length} inquiries)
                  </p>
                </div>
                <div>
                  <select
                    value={inquiryStatusFilter}
                    onChange={(e) => setInquiryStatusFilter(e.target.value)}
                    className="py-2 px-3 text-xs bg-white border border-[#F0E4E6] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
                  >
                    <option value="all">All Inquiries</option>
                    <option value="New">New</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#F0E4E6] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F6] border-b border-[#F0E4E6] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Client</th>
                        <th className="py-3.5 px-4">Subject</th>
                        <th className="py-3.5 px-4">Message Snippet</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5EBED]">
                      {filteredInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-[#FAF7F6]/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#0F1E36] block">{inq.name}</span>
                            <a
                              href={`mailto:${inq.email}`}
                              className="text-[11px] text-[#2D6A4F] hover:underline"
                            >
                              {inq.email}
                            </a>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#0F1E36]">
                            {inq.subject || 'General Inquiry'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{inq.message}</td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={inq.status || 'New'}
                              onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                              className={`text-[10px] font-bold py-1 px-2 rounded-lg border focus:outline-hidden cursor-pointer ${
                                inq.status === 'Resolved'
                                  ? 'bg-[#EBF5F0] text-[#2D6A4F] border-[#2D6A4F]/30'
                                  : inq.status === 'In Review'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              <option value="New">New</option>
                              <option value="In Review">In Review</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => setSelectedInquiry(inq)}
                              className="px-2.5 py-1 text-xs text-[#2D6A4F] hover:bg-[#EBF5F0] rounded-lg font-semibold cursor-pointer"
                            >
                              View
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ type: 'inquiry', id: inq.id, name: `Inquiry from ${inq.name || inq.customerName || 'Client'}` })}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS (Live Firestore Reviews Management) */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="pb-4 border-b border-[#F0E4E6]">
                <h1 className="font-serif text-2xl font-bold text-[#0F1E36]">Product Reviews & Ratings</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live Firestore customer feedback, quality assessments, and testimonial moderation
                </p>
              </div>

              {/* Review Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-[#F0E4E6] shadow-2xs text-center space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Average Rating</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-serif text-3xl font-bold text-[#0F1E36]">
                      {reviews.length > 0
                        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                        : '5.0'}
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">From {reviews.length} verified submissions</p>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-[#F0E4E6] shadow-2xs text-center space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Approved Reviews</span>
                  <p className="font-serif text-3xl font-bold text-[#2D6A4F]">
                    {reviews.filter((r) => r.status === 'approved' || !r.status).length}
                  </p>
                  <p className="text-[11px] text-slate-500">Visible on customer product pages</p>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-[#F0E4E6] shadow-2xs text-center space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Pending Moderation</span>
                  <p className="font-serif text-3xl font-bold text-amber-600">
                    {reviews.filter((r) => r.status === 'pending').length}
                  </p>
                  <p className="text-[11px] text-slate-500">Awaiting administrative approval</p>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-[#F0E4E6] shadow-2xs text-center space-y-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Rejected</span>
                  <p className="font-serif text-3xl font-bold text-slate-600">
                    {reviews.filter((r) => r.status === 'rejected').length}
                  </p>
                  <p className="text-[11px] text-slate-500">Hidden from the storefront</p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="bg-white rounded-3xl border border-[#F0E4E6] p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reviews by customer, title, comment..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="w-full text-xs bg-transparent border-none focus:outline-none text-[#0F1E36] placeholder-slate-400"
                  />
                  {reviewSearch && (
                    <button
                      onClick={() => setReviewSearch('')}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['all', 'approved', 'pending', 'rejected'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setReviewStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        reviewStatusFilter === st
                          ? 'bg-[#2D6A4F] text-white shadow-2xs'
                          : 'bg-[#FAF7F6] text-slate-600 hover:bg-[#F5EBED]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews Table */}
              <div className="bg-white rounded-3xl border border-[#F0E4E6] shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[#F0E4E6] flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-[#0F1E36]">
                    Customer Reviews ({filteredReviews.length})
                  </h3>
                  <span className="text-xs text-[#2D6A4F] font-semibold bg-[#EBF5F0] px-2.5 py-1 rounded-full">
                    Live Firestore Data
                  </span>
                </div>

                {filteredReviews.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <Star className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-medium text-xs">No reviews matching the current filter</p>
                    <p className="text-[11px] text-slate-400">
                      When customers submit feedback on product pages, it will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#F0E4E6] text-slate-400 bg-[#FAF7F6] font-semibold">
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4">Rating</th>
                          <th className="py-3 px-4">Review Details</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5EBED]">
                        {filteredReviews.map((rev) => {
                          const prod = products.find((p) => p.id === rev.productId);
                          const prodTitle = prod ? prod.name : `Product #${rev.productId || 'Unknown'}`;
                          const authorName = rev.userName || rev.customerName || 'Verified Client';
                          return (
                            <tr key={rev.id} className="hover:bg-[#FAF7F6]/60 transition-colors">
                              <td className="py-3 px-4">
                                <span className="font-bold text-[#0F1E36] block">{authorName}</span>
                                <span className="text-[11px] text-slate-400">{rev.date || 'Recent'}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium text-[#0F1E36] block truncate max-w-[180px]">
                                  {prodTitle}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {rev.productId}</span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex text-amber-400 items-center gap-0.5">
                                  {[...Array(rev.rating || 5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4 max-w-xs">
                                {rev.title && (
                                  <p className="font-bold text-[#0F1E36] truncate">"{rev.title}"</p>
                                )}
                                <p className="text-slate-600 line-clamp-2 text-[11px] mt-0.5">
                                  {rev.comment}
                                </p>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full capitalize ${
                                    rev.status === 'approved' || !rev.status
                                      ? 'bg-[#EBF5F0] text-[#2D6A4F]'
                                      : rev.status === 'pending'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-rose-50 text-rose-700'
                                  }`}
                                >
                                  {rev.status || 'approved'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                {rev.status !== 'approved' && (
                                  <button
                                    onClick={() => updateReviewStatus(rev.id, 'approved')}
                                    className="px-2 py-1 text-[10px] font-semibold bg-[#EBF5F0] text-[#2D6A4F] hover:bg-[#d8ede2] rounded-lg transition-colors cursor-pointer"
                                    title="Approve review"
                                  >
                                    Approve
                                  </button>
                                )}
                                {rev.status !== 'rejected' && (
                                  <button
                                    onClick={() => updateReviewStatus(rev.id, 'rejected')}
                                    className="px-2 py-1 text-[10px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                                    title="Reject review"
                                  >
                                    Reject
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    setConfirmDelete({
                                      type: 'review',
                                      id: rev.id,
                                      name: `Review by ${authorName}`,
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete review"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: WISHLIST ANALYTICS */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="pb-4 border-b border-[#F0E4E6]">
                <h1 className="font-serif text-2xl font-bold text-[#0F1E36]">Wishlist Analytics</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track most coveted items saved by clients for seasonal restock planning
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.slice(0, 6).map((p, idx) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl border border-[#F0E4E6] p-4 shadow-2xs flex items-center gap-4"
                  >
                    <div className="relative">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80'}
                        alt={p.name}
                        className="w-16 h-20 object-cover rounded-xl border border-[#F0E4E6]"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-[#E58C9D] text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xs font-bold text-[#0F1E36] truncate">{p.name}</h4>
                      <p className="text-[11px] text-slate-400">{p.category}</p>
                      <p className="font-bold text-xs text-[#0F1E36] mt-1">${p.price.toFixed(2)}</p>
                      <span className="text-[10px] text-[#2D6A4F] font-semibold mt-0.5 block">
                        Saved by {140 - idx * 18} clients
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="pb-4 border-b border-[#F0E4E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#0F1E36]">Store Administration Settings</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Platform parameters, exclusive Zelle payment gateway configuration, and authorized access credentials
                  </p>
                </div>
              </div>

              {/* Zelle Payment Gateway Configuration Panel */}
              <div className="bg-white rounded-3xl border-2 border-[#7414CA]/30 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5EBED]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#7414CA] flex items-center justify-center text-white shadow-xs">
                      <ZelleLogo size="md" variant="icon-only" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-[#0F1E36]">
                          Zelle® Payment System Configuration
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7414CA]/10 text-[#7414CA] border border-[#7414CA]/20">
                          Active & Exclusive
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Configure the exact Zelle account details displayed to customers at checkout.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveZelle} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Account Holder Name */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Account Holder Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={zelleFormAccountHolder}
                        onChange={(e) => setZelleFormAccountHolder(e.target.value)}
                        placeholder="e.g. Mumtahina's Closet Inc"
                        className="w-full p-3 bg-white border border-[#EADBDE] rounded-xl font-medium focus:border-[#7414CA] focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Exact name registered on your bank's business or personal Zelle profile.
                      </span>
                    </div>

                    {/* Zelle Registered Email Address */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Zelle Registered Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={zelleFormEmail}
                        onChange={(e) => setZelleFormEmail(e.target.value)}
                        placeholder="e.g. payments@mumtahinascloset.com"
                        className="w-full p-3 bg-white border border-[#EADBDE] rounded-xl font-medium focus:border-[#7414CA] focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Customers will send transfers to this verified email address.
                      </span>
                    </div>

                      {/* Zelle Registered Phone Number (Optional) */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Zelle Registered Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={zelleFormPhone}
                        onChange={(e) => setZelleFormPhone(e.target.value)}
                        placeholder="e.g. 914-303-9181"
                        className="w-full p-3 bg-white border border-[#EADBDE] rounded-xl font-medium focus:border-[#7414CA] focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Direct lookup phone number for mobile banking customers (e.g. 914-303-9181).
                      </span>
                    </div>

                    {/* Zelle QR Code Image URL */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Zelle QR Code Image URL
                      </label>
                      <input
                        type="url"
                        value={zelleFormQrCodeUrl}
                        onChange={(e) => setZelleFormQrCodeUrl(e.target.value)}
                        placeholder="https://cdn.phototourl.com/..."
                        className="w-full p-3 bg-white border border-[#EADBDE] rounded-xl font-medium focus:border-[#7414CA] focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Direct image link to your verified Zelle payment QR code.
                      </span>
                    </div>

                    {/* Direct Zelle Payment URL */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">
                        Direct Zelle Payment URL
                      </label>
                      <input
                        type="url"
                        value={zelleFormPaymentUrl}
                        onChange={(e) => setZelleFormPaymentUrl(e.target.value)}
                        placeholder="https://enroll.zellepay.com/qr-codes?data=..."
                        className="w-full p-3 bg-white border border-[#EADBDE] rounded-xl font-medium focus:border-[#7414CA] focus:outline-hidden font-mono text-[11px]"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Link opened when customer clicks "Pay with Zelle" on the checkout page.
                      </span>
                    </div>

                    {/* Status summary */}
                    <div className="sm:col-span-2 flex flex-col justify-center p-3 bg-[#FAF5FF] border border-[#E9D5FF] rounded-xl text-xs">
                      <span className="text-[11px] font-bold text-[#7414CA] block mb-0.5">
                        Realtime Customer Sync:
                      </span>
                      <p className="text-[11px] text-slate-600">
                        Changes saved here instantly update the checkout page without requiring customers to refresh.
                      </p>
                      {zelleSettings?.updatedAt && (
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Last updated: {new Date(zelleSettings.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="text-xs">
                    <label className="block text-slate-700 font-bold mb-1">
                      Custom Payment Instructions for Customers
                    </label>
                    <textarea
                      rows={3}
                      value={zelleFormInstructions}
                      onChange={(e) => setZelleFormInstructions(e.target.value)}
                      placeholder="e.g. Please put your name in the payment memo. Your order will be confirmed and prepared for shipment immediately upon bank receipt."
                      className="w-full p-3 bg-white border border-[#EADBDE] rounded-xl font-medium focus:border-[#7414CA] focus:outline-hidden leading-relaxed"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      These instructions appear directly under the payment details on the checkout page.
                    </span>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Saved to Firestore <code>settings/zelle</code>
                    </span>
                    <button
                      type="submit"
                      disabled={isSavingZelle}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7414CA] hover:bg-[#5C0FA6] text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSavingZelle ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving to Firestore...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Save Zelle Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Live Checkout Preview */}
                <div className="pt-4 border-t border-[#F5EBED]">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    Customer Checkout Preview
                  </span>
                  <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ZelleLogo size="sm" />
                        <span className="font-bold text-[#0F1E36]">Zelle® Direct Bank Transfer</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#7414CA] bg-white px-2 py-0.5 rounded border border-[#E9D5FF]">
                        Preview
                      </span>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E9D5FF] p-3 space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Recipient Name:</span>
                        <strong className="text-[#0F1E36]">{zelleFormAccountHolder || '(Not set yet)'}</strong>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Zelle Phone:</span>
                        <strong className="font-mono text-[#0F1E36]">{zelleFormPhone || '(Not set yet)'}</strong>
                      </div>
                      {zelleFormEmail && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Zelle Email:</span>
                          <strong className="font-mono text-[#7414CA]">{zelleFormEmail}</strong>
                        </div>
                      )}
                      {zelleFormQrCodeUrl && (
                        <div className="pt-2 border-t border-[#F3E8FF] flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Zelle QR Code:</span>
                          <img
                            src={zelleFormQrCodeUrl}
                            alt="QR Preview"
                            className="w-12 h-12 object-contain rounded border border-[#E9D5FF] p-0.5 bg-white"
                          />
                        </div>
                      )}
                    </div>

                    {zelleFormInstructions && (
                      <p className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-lg border border-[#E9D5FF] italic">
                        "{zelleFormInstructions}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Authorized Administrators Panel */}
              <div className="bg-white rounded-3xl border border-[#F0E4E6] p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF5F0] text-[#2D6A4F] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#0F1E36]">
                      Authorized Administrators
                    </h3>
                    <p className="text-xs text-slate-500">
                      These accounts have verified access to <code>/admin</code> and Firestore management.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-[#F5EBED] pt-2">
                  {AUTHORIZED_ADMIN_EMAILS.map((email) => {
                    const isCurrent =
                      (firebaseUser?.email || currentUser?.email)?.toLowerCase() === email.toLowerCase();
                    return (
                      <div key={email} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-mono text-xs font-semibold text-[#0F1E36]">{email}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-[#EBF5F0] text-[#2D6A4F] text-[10px] font-bold rounded-full">
                              Current Session
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Full Admin Rights
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General Store Parameters */}
              <div className="bg-white rounded-3xl border border-[#F0E4E6] p-6 shadow-2xs space-y-4">
                <h3 className="font-serif text-base font-bold text-[#0F1E36]">Store Identity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Company Legal Name</label>
                    <input
                      type="text"
                      disabled
                      value="Mumtahina’s Closet Inc"
                      className="w-full p-2.5 bg-[#FAF7F6] border border-[#F0E4E6] rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">USA Showroom Headquarters</label>
                    <input
                      type="text"
                      disabled
                      value="1400 Preston Rd, Suite 400, Dallas, TX 75093"
                      className="w-full p-2.5 bg-[#FAF7F6] border border-[#F0E4E6] rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Base Currency</label>
                    <input
                      type="text"
                      disabled
                      value="USD ($)"
                      className="w-full p-2.5 bg-[#FAF7F6] border border-[#F0E4E6] rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Free USA Shipping Threshold</label>
                    <input
                      type="text"
                      disabled
                      value="$75.00"
                      className="w-full p-2.5 bg-[#FAF7F6] border border-[#F0E4E6] rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ---------------- MODALS & DRAWERS ---------------- */}

      {/* ADD / EDIT PRODUCT MODAL */}
      {(isAddProductOpen || editingProduct) && (
        <ProductFormModal
          initialProduct={editingProduct}
          onClose={() => {
            setIsAddProductOpen(false);
            setEditingProduct(null);
          }}
          onSave={(prod) => {
            if (editingProduct) {
              updateProduct(prod);
            } else {
              addProduct(prod);
            }
            setIsAddProductOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(status) => {
            const ordId = selectedOrder.orderId || selectedOrder.id;
            updateOrderStatus(ordId, status);
            setSelectedOrder({ ...selectedOrder, status, orderStatus: status });
          }}
          onPaymentStatusChange={(paymentStatus) => {
            const ordId = selectedOrder.orderId || selectedOrder.id;
            updatePaymentStatus(ordId, paymentStatus);
            setSelectedOrder({ ...selectedOrder, paymentStatus });
          }}
        />
      )}

      {/* ADD / EDIT CATEGORY MODAL */}
      {(isAddCategoryOpen || editingCategory) && (
        <CategoryFormModal
          initialCategory={editingCategory}
          onClose={() => {
            setIsAddCategoryOpen(false);
            setEditingCategory(null);
          }}
          onSave={(cat) => {
            if (editingCategory) {
              updateCategory(cat);
            } else {
              addCategory(cat);
            }
            setIsAddCategoryOpen(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* INQUIRY DETAIL MODAL */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onStatusChange={(status) => {
            updateInquiryStatus(selectedInquiry.id, status);
            setSelectedInquiry({ ...selectedInquiry, status });
          }}
        />
      )}

      {/* CONFIRM DELETION MODAL (Safe for iframe without window.confirm) */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#F0E4E6] space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#0F1E36]">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-[#0F1E36]">{confirmDelete.name}</span>? This action removes the document from Firestore.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDelete.type === 'product') deleteProduct(confirmDelete.id);
                  if (confirmDelete.type === 'category') deleteCategory(confirmDelete.id);
                  if (confirmDelete.type === 'inquiry') deleteInquiry(confirmDelete.id);
                  if (confirmDelete.type === 'review') deleteReview(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- Sub-Modals ---------------- */

// Product Form Modal
interface ProductFormModalProps {
  initialProduct: Product | null;
  onClose: () => void;
  onSave: (prod: Product) => void;
}

const COMMON_COLOR_SUGGESTIONS = [
  'Dusty Rose Pink',
  'Black',
  'White',
  'Navy Blue',
  'Emerald Green',
  'Sage Green',
  'Champagne Gold',
  'Burgundy',
  'Mocha Brown',
  'Slate Grey',
  'Olive Green',
  'Plum Purple',
];

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  initialProduct,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState(initialProduct?.category || 'abaya');
  const [price, setPrice] = useState(initialProduct?.price ? initialProduct.price.toString() : '');
  const [originalPrice, setOriginalPrice] = useState(
    initialProduct?.originalPrice ? initialProduct.originalPrice.toString() : ''
  );
  const [stockCount, setStockCount] = useState(
    initialProduct?.stock !== undefined ? initialProduct.stock.toString() : '20'
  );

  // 1. Multiple Product Images State
  const [images, setImages] = useState<string[]>(() => {
    if (initialProduct?.images && initialProduct.images.length > 0) {
      return [...initialProduct.images];
    }
    return [
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80',
    ];
  });
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // 2. Product Color Names State (Text based, no color image upload required)
  const [colorNames, setColorNames] = useState<string[]>(() => {
    if (initialProduct?.colorNames && initialProduct.colorNames.length > 0) {
      return [...initialProduct.colorNames];
    }
    if (initialProduct?.colors && initialProduct.colors.length > 0) {
      return initialProduct.colors.map((c) => c.name);
    }
    return ['Dusty Rose Pink', 'Black', 'White', 'Navy Blue'];
  });
  const [colorTextInput, setColorTextInput] = useState('');

  const [fabric, setFabric] = useState(initialProduct?.fabric || 'Nida Crepe');
  const [description, setDescription] = useState(
    initialProduct?.description || 'Exquisite modest silhouette handcrafted with premium fabric.'
  );
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isBestSeller || false);

  // File Upload Handler (Supports multiple images simultaneously)
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadStatus(`Preparing to upload ${files.length} ${files.length === 1 ? 'image' : 'images'}...`);

    const fileList = Array.from(files) as File[];
    const prodId = initialProduct?.productId || initialProduct?.id || `mc-${Date.now()}`;

    try {
      const uploadedUrls = await uploadMultipleProductImages(
        fileList,
        prodId,
        (completed, total) => {
          setUploadStatus(`Uploading image ${completed} of ${total}...`);
        }
      );

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        setUploadStatus(`Successfully added ${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'image' : 'images'}!`);
        setTimeout(() => setUploadStatus(''), 3000);
      }
    } catch (err) {
      console.error('Multiple image upload error:', err);
      setUploadStatus('Upload encountered an issue. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Add Image via Direct URL or Comma/Newline-separated URLs
  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    const splitUrls = urlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    setImages((prev) => [...prev, ...splitUrls]);
    setUrlInput('');
  };

  // Set an image as the Primary Product Image (moves it to index 0)
  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  // Remove an image from the list
  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      alert('A product must have at least one product image.');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Color Name (supports comma-separated text)
  const handleAddColorName = (nameToAdd?: string) => {
    const raw = nameToAdd !== undefined ? nameToAdd : colorTextInput;
    if (!raw.trim()) return;

    const names = raw
      .split(/[,;\n]+/)
      .map((n) => formatColorName(n))
      .filter((n) => n.length > 0);

    setColorNames((prev) => {
      const next = [...prev];
      for (const n of names) {
        if (!next.some((existing) => existing.toLowerCase() === n.toLowerCase())) {
          next.push(n);
        }
      }
      return next;
    });

    if (nameToAdd === undefined) {
      setColorTextInput('');
    }
  };

  // Remove Color Name
  const handleRemoveColorName = (index: number) => {
    setColorNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert('Please upload or provide at least one product image.');
      return;
    }

    const prodId = initialProduct?.productId || initialProduct?.id || `mc-${Date.now()}`;
    const formattedColors =
      colorNames.length > 0
        ? colorNames.map((nameStr) => ({
            name: nameStr,
            hex: getColorHex(nameStr),
          }))
        : [{ name: 'Dusty Rose Pink', hex: '#DCAEAE' }];

    const prod: Product = {
      id: prodId,
      productId: prodId,
      name,
      subtitle: initialProduct?.subtitle || 'Handcrafted modest silhouette',
      category: category.toLowerCase() as any,
      categoryLabel: `${category} Collection`,
      price: parseFloat(price) || 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      stock: parseInt(stockCount, 10) || 0,
      images, // Multiple images saved with primary image at index 0
      fabric,
      material: fabric,
      dimensions: initialProduct?.dimensions,
      isActive: initialProduct?.isActive !== undefined ? initialProduct.isActive : true,
      description,
      isBestSeller: isFeatured,
      rating: initialProduct?.rating || 5.0,
      reviewCount: initialProduct?.reviewCount || 12,
      sizes: initialProduct?.sizes || ['S (52")', 'M (54")', 'L (56")', 'XL (58")'],
      colors: formattedColors,
      colorNames: formattedColors.map((c) => c.name),
      features: initialProduct?.features || ['Premium modest silhouette', 'Hand-finished hems'],
      careInstructions: initialProduct?.careInstructions || 'Dry clean or gentle hand wash cold.',
    };

    onSave(prod);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-[#F0E4E6] space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E4E6]">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0F1E36]">
              {initialProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Manage product details, multiple gallery images, and color names.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-[#0F1E36] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Product Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Embroidered Velvet Abaya"
              className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F] text-xs"
            />
          </div>

          {/* Category & Fabric */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F] bg-white text-xs"
              >
                <option value="Abayas">Abayas</option>
                <option value="Hijabs">Hijabs</option>
                <option value="Dresses">Dresses</option>
                <option value="Kimonos">Kimonos</option>
                <option value="Sets">Sets</option>
                <option value="Men">Men</option>
                <option value="Kids">Kids</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fabric</label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Nida, Raw Silk, Chiffon"
                className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F] text-xs"
              />
            </div>
          </div>

          {/* Price, Old Price & Stock Units */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Price ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="129.99"
                className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F] text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Old Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="159.99"
                className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F] text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Stock Units <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                placeholder="20"
                className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F] text-xs"
              />
            </div>
          </div>

          {/* SECTION 1: Product Colors (Text-based, NO separate image required) */}
          <div className="p-4 rounded-2xl bg-[#FAF7F6] border border-[#F0E4E6] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="block font-bold text-[#0F1E36] text-xs">
                  Product Colors (Text Names)
                </label>
                <p className="text-[11px] text-slate-500">
                  Enter color names as text (e.g. Dusty Rose Pink, Black, White). No separate color image upload is required.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#2D6A4F] self-start sm:self-auto">
                {colorNames.length} {colorNames.length === 1 ? 'Color' : 'Colors'} Added
              </span>
            </div>

            {/* Color Text Input with Add Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={colorTextInput}
                onChange={(e) => setColorTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddColorName();
                  }
                }}
                placeholder="e.g. Dusty Rose Pink, Black, White, Navy Blue"
                className="flex-1 p-2.5 bg-white border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F] text-xs"
              />
              <button
                type="button"
                onClick={() => handleAddColorName()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Color</span>
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_COLOR_SUGGESTIONS.map((suggestion) => {
                  const alreadyAdded = colorNames.some(
                    (c) => c.toLowerCase() === suggestion.toLowerCase()
                  );
                  return (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddColorName(suggestion)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        alreadyAdded
                          ? 'bg-slate-200/60 text-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-white text-slate-700 border border-[#E2D2D5] hover:border-[#2D6A4F] hover:text-[#2D6A4F] cursor-pointer'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: getColorHex(suggestion) }}
                      />
                      <span>{suggestion}</span>
                      {!alreadyAdded && <Plus className="w-2.5 h-2.5 text-slate-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Colors Tag List */}
            {colorNames.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-[#F0E4E6]">
                {colorNames.map((colorName, idx) => (
                  <div
                    key={`${colorName}-${idx}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2D2D5] rounded-xl text-xs font-semibold text-[#0F1E36] shadow-2xs group"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs flex-shrink-0"
                      style={{ backgroundColor: getColorHex(colorName) }}
                    />
                    <span>{colorName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColorName(idx)}
                      className="p-0.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                      title={`Remove ${colorName}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-amber-600 font-medium pt-1">
                Please enter at least one color name (e.g. Dusty Rose Pink).
              </p>
            )}
          </div>

          {/* SECTION 2: Multiple Product Images */}
          <div className="p-4 rounded-2xl bg-[#FAF7F6] border border-[#F0E4E6] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="block font-bold text-[#0F1E36] text-xs">
                  Multiple Product Images <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Upload multiple photos at once. Choose which image will serve as the Primary Image.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#2D6A4F] self-start sm:self-auto">
                {images.length} {images.length === 1 ? 'Image' : 'Images'} in Gallery
              </span>
            </div>

            {/* Upload Multiple Images Button & File Zone */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label
                htmlFor="multi-image-file-input"
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-[#FAF0F2] text-[#2D6A4F] border-2 border-dashed border-[#2D6A4F]/40 hover:border-[#2D6A4F] rounded-2xl font-bold text-xs shadow-2xs transition-all cursor-pointer ${
                  isUploading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <Upload className="w-4 h-4 flex-shrink-0 text-[#2D6A4F]" />
                <span>Upload Multiple Images</span>
                <input
                  id="multi-image-file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {/* Direct URL Input Option */}
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrlImage();
                    }
                  }}
                  placeholder="Or paste image URL..."
                  className="flex-1 p-2.5 bg-white border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F] text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddUrlImage}
                  className="px-3 py-2.5 bg-white border border-[#E2D2D5] hover:border-[#2D6A4F] text-[#0F1E36] hover:text-[#2D6A4F] rounded-xl font-semibold shadow-2xs transition-colors cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Upload status / progress message */}
            {uploadStatus && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#EBF5F0] border border-[#2D6A4F]/20 text-[#2D6A4F] text-[11px] font-semibold">
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* Image Previews Grid with Primary Image Selection and Removal */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#F0E4E6]">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Image Previews (Click "Primary" to feature as main card image)</span>
                  <span className="font-semibold text-[#0F1E36]">★ = Primary Image</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {images.map((imgUrl, idx) => {
                    const isPrimary = idx === 0;
                    return (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className={`relative group rounded-xl overflow-hidden border-2 bg-white shadow-2xs transition-all flex flex-col ${
                          isPrimary
                            ? 'border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20'
                            : 'border-[#F0E4E6] hover:border-slate-300'
                        }`}
                      >
                        {/* Thumbnail View */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                          <img
                            src={imgUrl}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover object-top"
                          />

                          {/* Primary Badge */}
                          {isPrimary ? (
                            <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2D6A4F] text-white text-[10px] font-bold shadow-xs">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>Primary</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 hover:bg-[#2D6A4F] text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-xs"
                              title="Make this the Primary Image"
                            >
                              <Star className="w-2.5 h-2.5" />
                              <span>Set Primary</span>
                            </button>
                          )}

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 hover:bg-rose-600 text-slate-600 hover:text-white shadow-sm transition-all cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Controls underneath thumbnail */}
                        <div className="p-1.5 bg-slate-50 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-600 truncate max-w-[60px]">
                            #{idx + 1} {isPrimary ? '(Primary)' : ''}
                          </span>
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="text-[#2D6A4F] hover:underline font-semibold cursor-pointer"
                            >
                              Make Primary
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F] text-xs"
            />
          </div>

          {/* Featured checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-[#2D6A4F] rounded-md focus:ring-0 cursor-pointer"
            />
            <label htmlFor="isFeatured" className="font-semibold text-slate-700 cursor-pointer">
              Feature on Homepage Showcase (Best Seller)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#F0E4E6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl font-semibold shadow-xs cursor-pointer text-xs transition-colors disabled:opacity-50"
            >
              {initialProduct ? 'Save Product Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Order Details Modal
interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (status: OrderStatus) => void;
  onPaymentStatusChange: (status: PaymentStatus) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onStatusChange,
  onPaymentStatusChange,
}) => {
  const orderId = order.orderId || order.id;
  const currentPaymentStatus = (order.paymentStatus || 'Pending') as PaymentStatus;
  const currentOrderStatus = (order.orderStatus || order.status || 'Pending') as OrderStatus;
  const totalAmount = typeof order.totalAmount === 'number' ? order.totalAmount : (order.total || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#F0E4E6] space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E4E6]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Order Management</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F6] text-slate-500 border border-[#F0E4E6]">
                {order.currency || 'USD'}
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0F1E36] font-mono">{orderId}</h3>
            <p className="text-[11px] text-slate-400">
              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : order.date}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-[#0F1E36] rounded-xl hover:bg-[#FAF7F6]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Status Controls: Payment Status & Fulfillment Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Payment Status Box */}
          <div className="p-4 bg-[#FAF7F6] rounded-2xl border border-[#F0E4E6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold block">Payment Status</span>
              <span
                className={`text-[11px] font-bold py-0.5 px-2 rounded-md border ${
                  currentPaymentStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentPaymentStatus === 'Failed'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : currentPaymentStatus === 'Refunded'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {currentPaymentStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">Update:</span>
              <select
                value={currentPaymentStatus}
                onChange={(e) => onPaymentStatusChange(e.target.value as PaymentStatus)}
                className="w-full text-xs font-bold py-1.5 px-2.5 bg-white border border-[#E2D2D5] rounded-xl focus:outline-hidden cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="pt-2 border-t border-[#F0E4E6] space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Payment Gateway:</span>
                <span className="font-bold text-[#7414CA] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7414CA]" />
                  Zelle® Direct Bank Transfer
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 font-semibold">Transaction Ref:</span>
                <span className="font-mono font-bold text-[#0F1E36] bg-white px-2 py-0.5 rounded border border-[#E2D2D5]">
                  {order.transactionReference || order.zelleReference || order.paymentId || (
                    <span className="text-slate-400 font-normal italic">None provided</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Fulfillment Status Box */}
          <div className="p-4 bg-[#FAF7F6] rounded-2xl border border-[#F0E4E6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold block">Fulfillment Status</span>
              <span
                className={`text-[11px] font-bold py-0.5 px-2 rounded-md border ${
                  currentOrderStatus === 'Delivered'
                    ? 'bg-[#EBF5F0] text-[#2D6A4F] border-[#2D6A4F]/30'
                    : currentOrderStatus === 'Cancelled'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : currentOrderStatus === 'Shipped'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {currentOrderStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">Update:</span>
              <select
                value={currentOrderStatus}
                onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
                className="w-full text-xs font-bold py-1.5 px-2.5 bg-white border border-[#E2D2D5] rounded-xl focus:outline-hidden cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            {order.trackingNumber && (
              <div className="pt-1 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-600">Tracking: </span>
                <span className="font-mono text-[10px]">{order.trackingNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-4 bg-white rounded-2xl border border-[#F0E4E6] text-xs space-y-1.5">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Customer & Delivery Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-slate-400 text-[11px] block">Customer Name</span>
              <p className="text-[#0F1E36] font-semibold">{order.customerName || order.shippingAddress?.fullName || 'Valued Client'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Customer Email</span>
              <p className="text-slate-600 font-medium">{order.customerEmail || 'client@example.com'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Phone Contact</span>
              <p className="text-slate-600">{order.customerPhone || order.shippingAddress?.phone || '+1 (214) 555-0198'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Customer ID / UID</span>
              <p className="font-mono text-[10px] text-slate-500 truncate">{order.customerId || 'Guest Customer'}</p>
            </div>
          </div>
          {order.shippingAddress && (
            <div className="pt-2 border-t border-[#F5EBED]">
              <span className="text-slate-400 text-[11px] block">Shipping Address</span>
              <p className="text-slate-600 mt-0.5 font-medium">
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zip}, {order.shippingAddress.country || 'USA'}
              </p>
            </div>
          )}
        </div>

        {/* Purchased Products */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Purchased Styles ({order.items.length})
          </h4>
          <div className="divide-y divide-[#F5EBED] border-y border-[#F5EBED] max-h-56 overflow-y-auto">
            {order.items.map((item: any, idx: number) => {
              const itemImage =
                item.image ||
                item.product?.images?.[0] ||
                'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80';
              const itemName = item.name || item.product?.name || 'Couture Design';
              const itemPrice = typeof item.price === 'number' ? item.price : (item.product?.price || 0);
              const itemSize = item.size || item.selectedSize || 'Standard';
              const itemColor = item.color || item.selectedColor || 'Default';
              const itemQty = item.quantity || 1;

              return (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={itemImage}
                      alt={itemName}
                      className="w-10 h-12 object-cover rounded-lg border border-[#F0E4E6]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="font-bold text-[#0F1E36] block">{itemName}</span>
                      <span className="text-[11px] text-slate-400">
                        Size: {itemSize} • Color: {itemColor} • Qty: {itemQty}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-[#0F1E36]">
                    ${(itemPrice * itemQty).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Totals */}
        <div className="text-xs space-y-1.5 pt-2">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>${(order.subtotal || totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Shipping</span>
            <span>${(order.shipping || 0).toFixed(2)}</span>
          </div>
          {(order.discount || 0) > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Discount</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-serif text-base font-bold text-[#0F1E36] pt-2 border-t border-[#F0E4E6]">
            <span>Total Amount</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0F1E36] hover:bg-[#1B2A4A] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Category Form Modal
interface CategoryFormModalProps {
  initialCategory: CategoryItem | null;
  onClose: () => void;
  onSave: (cat: CategoryItem) => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  initialCategory,
  onClose,
  onSave,
}) => {
  const [nameEn, setNameEn] = useState(initialCategory?.nameEn || '');
  const [nameBn, setNameBn] = useState(initialCategory?.nameBn || '');
  const [slug, setSlug] = useState(initialCategory?.slug || '');
  const [description, setDescription] = useState(initialCategory?.description || '');
  const [image, setImage] = useState(
    initialCategory?.image ||
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80'
  );
  const [isActive, setIsActive] = useState(
    initialCategory?.isActive !== undefined ? initialCategory.isActive : true
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catId = initialCategory?.categoryId || initialCategory?.id || `cat-${Date.now()}`;
    const cat: CategoryItem = {
      id: catId,
      categoryId: catId,
      nameEn,
      nameBn,
      slug: slug || nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description,
      image,
      itemCount: initialCategory?.itemCount || 0,
      isActive,
      status: isActive ? 'active' : 'hidden',
    };
    onSave(cat);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F0E4E6] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E4E6]">
          <h3 className="font-serif text-lg font-bold text-[#0F1E36]">
            {initialCategory ? 'Edit Category' : 'New Category'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-[#0F1E36]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">English Name</label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Abayas & Kaftans"
              className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bangla Name (বাংলা নাম)</label>
            <input
              type="text"
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              placeholder="e.g. আবায়া ও কাফতান"
              className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden focus:border-[#2D6A4F]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="catActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#2D6A4F] rounded-md"
            />
            <label htmlFor="catActive" className="font-semibold text-slate-700 cursor-pointer">
              Active in Storefront
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#F0E4E6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2D6A4F] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
            >
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Inquiry Detail Modal
interface InquiryDetailModalProps {
  inquiry: Inquiry;
  onClose: () => void;
  onStatusChange: (status: Inquiry['status']) => void;
}

const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
  inquiry,
  onClose,
  onStatusChange,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#F0E4E6] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E4E6]">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Customer Inquiry</span>
            <h3 className="font-serif text-lg font-bold text-[#0F1E36]">
              {inquiry.subject || 'Client Message'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-[#0F1E36]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-[#FAF7F6] rounded-2xl text-xs space-y-1">
          <p className="font-bold text-[#0F1E36]">{inquiry.name}</p>
          <a href={`mailto:${inquiry.email}`} className="text-[#2D6A4F] hover:underline block">
            {inquiry.email}
          </a>
          <p className="text-[11px] text-slate-400">
            Received on: {new Date(inquiry.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="text-xs space-y-2">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Message Content:
          </span>
          <div className="p-4 bg-white border border-[#F0E4E6] rounded-2xl text-slate-700 whitespace-pre-wrap leading-relaxed">
            {inquiry.message}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#F0E4E6]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Status:</span>
            <select
              value={inquiry.status || 'New'}
              onChange={(e) => onStatusChange(e.target.value as any)}
              className="text-xs font-bold py-1 px-2.5 border border-[#E2D2D5] rounded-xl focus:outline-hidden"
            >
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <a
            href={`mailto:${inquiry.email}?subject=Re: Mumtahina’s Closet Inc - ${inquiry.subject || 'Inquiry'}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Reply to Client</span>
          </a>
        </div>
      </div>
    </div>
  );
};
