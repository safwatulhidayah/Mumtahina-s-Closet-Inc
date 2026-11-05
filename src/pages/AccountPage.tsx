import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  MapPin,
  Lock,
  LogOut,
  Mail,
  Phone,
  CheckCircle2,
  Edit2,
  Plus,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BrandLogo } from '../components/BrandLogo';

export const AccountPage: React.FC = () => {
  const {
    user,
    setUser,
    wishlist,
    orders,
    addToast,
    saveUserProfile,
    signOutUser,
    isAuthLoading,
    isAdmin,
    addresses,
    addAddress,
    deleteAddress,
  } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  const accessDenied = (location.state as { accessDenied?: boolean })?.accessDenied;

  useEffect(() => {
    if (accessDenied) {
      addToast('Access Denied: Administrator credentials required for /admin.', 'error');
    }
  }, [accessDenied, addToast]);

  // Customer state: real authenticated information from Hostinger PHP session
  const [fullName, setFullName] = useState(user?.name || (user?.email ? user.email.split('@')[0] : ''));
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user && user.isLoggedIn) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone !== undefined) setPhone(user.phone);
    }
  }, [user]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('TX');
  const [newAddrZip, setNewAddrZip] = useState('');

  // Protect route if accessed directly without auth
  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#FAF0F2] border-t-[#2D6A4F] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
          Verifying Client Session...
        </p>
      </div>
    );
  }

  const isAuthed = !!(user && user.isLoggedIn);
  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveUserProfile({
      name: fullName,
      email,
      phone,
      isLoggedIn: true,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrCity) return;
    await addAddress({
      fullName: fullName || 'Valued Client',
      phone: phone || '',
      title: newAddrTitle || 'Delivery Address',
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState,
      zip: newAddrZip,
      isDefault: addresses.length === 0,
    });
    setIsAddingAddress(false);
    setNewAddrTitle('');
    setNewAddrStreet('');
    setNewAddrCity('');
    setNewAddrZip('');
  };

  const handleLogout = async () => {
    await signOutUser();
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Account Header */}
      <div className="border-b border-[#F0E4E6] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BrandLogo size="lg" variant="monogram" />
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
              Client Portal
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#0F1E36]">
              My Modest Account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your personal profile, addresses, and track boutique orders.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Access Denied Warning if unauthorized navigation occurred */}
      {accessDenied && !isAdmin && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Administrator Access Required</strong>
            <span>The `/admin` portal is restricted to authorized administrators. If you manage Mumtahina’s Closet Inc, please log in with your authorized admin email address (e.g., <code>denaislam09@gmail.com</code>).</span>
          </div>
        </div>
      )}

      {/* Authorized Administrator Quick Launch Banner */}
      {isAdmin && (
        <div className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-[#0F1E36] to-[#1E3A5F] rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#2D6A4F]/40">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#2D6A4F] text-white rounded-full">
                  Admin Authorized
                </span>
                <span className="text-xs text-slate-300">Mumtahina’s Closet Inc</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white mt-1">
                Store Administration & Management
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage live products, customer orders, categories, inquiries, and analytics.
              </p>
            </div>
          </div>
          <Link
            to="/admin"
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#0F1E36] hover:bg-[#FAF0F2] text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 group cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-[#2D6A4F]" />
            <span>Open Admin Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link
          to="/account/orders"
          className="p-5 rounded-2xl bg-white border border-[#F0E4E6] hover:border-[#2D6A4F] hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0F2] text-[#2D6A4F] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#0F1E36]">Order History</h4>
              <p className="text-xs text-slate-400">{orders.length} orders tracked</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2D6A4F] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/wishlist"
          className="p-5 rounded-2xl bg-white border border-[#F0E4E6] hover:border-[#2D6A4F] hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0F2] text-[#E58C9D] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#0F1E36]">My Wishlist</h4>
              <p className="text-xs text-slate-400">{wishlist.length} saved styles</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2D6A4F] group-hover:translate-x-1 transition-all" />
        </Link>

        <div className="p-5 rounded-2xl bg-[#FAF0F2]/50 border border-[#F4D3D7] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-[#2D6A4F] flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-[#0F1E36]">VIP Modest Member</h4>
              <p className="text-xs text-slate-500">Tier: Sapphire • 10% Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Account Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Details Form */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EBED]">
            <h3 className="font-serif text-base font-bold text-[#0F1E36] flex items-center gap-2">
              <User className="w-4 h-4 text-[#2D6A4F]" />
              <span>Personal Details</span>
            </h3>
            {savedSuccess && (
              <span className="text-xs text-[#2D6A4F] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
            >
              Update Information
            </button>
          </form>
        </div>

        {/* Address Book Column */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EBED]">
            <h3 className="font-serif text-base font-bold text-[#0F1E36] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2D6A4F]" />
              <span>Shipping Addresses ({addresses.length})</span>
            </h3>
            {!isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                className="text-xs font-bold text-[#2D6A4F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            )}
          </div>

          {/* Add Address Form */}
          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="p-4 bg-[#FAF7F6] rounded-xl border border-[#EADBDE] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F1E36]">
                New USA Delivery Address
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Address Nickname (e.g. Home, Office)
                </label>
                <input
                  type="text"
                  value={newAddrTitle}
                  onChange={(e) => setNewAddrTitle(e.target.value)}
                  placeholder="Home Residence"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EADBDE] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Street Address & Unit
                </label>
                <input
                  type="text"
                  value={newAddrStreet}
                  onChange={(e) => setNewAddrStreet(e.target.value)}
                  placeholder="123 Modest Way, Suite 200"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EADBDE] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EADBDE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    value={newAddrState}
                    onChange={(e) => setNewAddrState(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EADBDE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={newAddrZip}
                    onChange={(e) => setNewAddrZip(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EADBDE] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="py-2 px-4 rounded-lg border border-[#EADBDE] text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Addresses list */}
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[#EADBDE] bg-[#FAF7F6] text-center">
                <p className="text-xs text-slate-500">No shipping addresses saved yet.</p>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(true)}
                  className="mt-2 text-xs font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                >
                  + Add your first address
                </button>
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-xl border border-[#F0E4E6] bg-[#FAF7F6] flex items-start justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#0F1E36]">{addr.title || 'Address'}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5F0] text-[#2D6A4F]">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                  </div>
                  {addr.id && (
                    <button
                      onClick={() => deleteAddress(addr.id!)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title="Delete address"
                      aria-label="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
