import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Lock,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { Order } from '../types';
import { useShop } from '../context/ShopContext';
import { ZelleLogo } from '../components/ZelleLogo';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

export const CheckoutPage: React.FC = () => {
  const {
    cartItems,
    discountApplied,
    couponCode,
    clearCart,
    placeOrder,
    currentUser,
    addresses,
    zelleSettings,
  } = useShop();

  const navigate = useNavigate();

  // Step: 'form' | 'confirmation'
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Form states initialized with authenticated user's real information
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const defaultNameParts = (currentUser.name || '').trim().split(' ');
  const initialFirst = defaultNameParts[0] || '';
  const initialLast = defaultNameParts.slice(1).join(' ') || '';

  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || defaultAddr?.phone || '');
  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [address, setAddress] = useState(defaultAddr?.street || '');
  const [apt, setApt] = useState(defaultAddr?.apt || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [state, setState] = useState(defaultAddr?.state || 'TX');
  const [zipCode, setZipCode] = useState(defaultAddr?.zip || '');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');

  // Payment via Zelle Only
  const [zelleReference, setZelleReference] = useState('');
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'email' | 'phone' | 'amount' | null>(null);

  // Exact Zelle payment recipient details
  const zelleAccountHolder = zelleSettings?.accountHolderName || 'Dilruba Shabnam';
  const zellePhone = zelleSettings?.phone || '914-303-9181';
  const zelleQrCode = zelleSettings?.qrCodeUrl || 'https://cdn.phototourl.com/member/2026-09-29-15445970-229c-41bd-9aaf-dc85f6d6e352.jpg';
  const zellePaymentUrl = zelleSettings?.paymentUrl || 'https://enroll.zellepay.com/qr-codes?data=eyJhY3Rpb24iOiJwYXltZW50IiwibmFtZSI6IkRpbHJ1YmEgU2hhYm5hbSIsInRva2VuIjoiOTE0MzAzOTE4MSJ9';
  const zelleEmail = zelleSettings?.email || '';

  const copyToClipboard = (text: string, field: 'email' | 'phone' | 'amount') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  useEffect(() => {
    if (currentUser.isLoggedIn) {
      if (!email && currentUser.email) {
        setEmail(currentUser.email);
      }
      if (!firstName && !lastName) {
        const parts = (currentUser.name || '').trim().split(' ');
        if (parts[0]) setFirstName(parts[0]);
        if (parts.slice(1).join(' ')) setLastName(parts.slice(1).join(' '));
      }
      if (!phone && currentUser.phone) {
        setPhone(currentUser.phone);
      }
    }
  }, [currentUser]);

  // Calculation
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = discountApplied ? subtotal * 0.10 : 0;

  let shippingCost = 0;
  if (shippingMethod === 'standard') {
    shippingCost = subtotal >= 75 ? 0 : 5.99;
  } else if (shippingMethod === 'express') {
    shippingCost = 14.99;
  } else if (shippingMethod === 'overnight') {
    shippingCost = 24.99;
  }

  const tax = (subtotal - discountAmount) * 0.0825;
  const total = Math.max(0, subtotal - discountAmount + shippingCost + tax);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanZelleRef = zelleReference.trim();
    if (!cleanZelleRef) {
      setReferenceError('Transaction Reference Number is mandatory. Please enter your Zelle confirmation or reference number before submitting your order.');
      const refInput = document.getElementById('zelle-reference-input');
      if (refInput) {
        refInput.focus();
        refInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setReferenceError(null);

    const orderId = `MC-USA-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();
    const newOrder: Order = {
      orderId,
      customerId: currentUser?.id || `guest-${Date.now()}`,
      customerName: `${firstName} ${lastName}`.trim() || 'Valued Client',
      customerEmail: email,
      customerPhone: phone || '+1 (214) 555-0198',
      items: cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        image: item.product.images[0],
      })),
      totalAmount: total,
      currency: 'USD',
      paymentMethod: 'zelle',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      createdAt: nowIso,
      paymentId: cleanZelleRef,
      transactionReference: cleanZelleRef,
      zelleReference: cleanZelleRef,
      id: orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'pending',
      trackingNumber: `940011189956${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      carrier: shippingMethod === 'standard' ? 'USPS Priority' : 'FedEx Express',
      estimatedDelivery: '3-4 Business Days',
      subtotal,
      shipping: shippingCost,
      discount: discountAmount,
      tax,
      total,
      shippingAddress: {
        fullName: `${firstName} ${lastName}`,
        street: address,
        apt,
        city,
        state,
        zipCode,
      },
    };

    setConfirmedOrder(newOrder);
    placeOrder(newOrder);
    clearCart();
    setStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (step === 'confirmation' && confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-white rounded-3xl border border-[#F0E4E6] p-6 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#EBF5F0] text-[#2D6A4F] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
              Order Successfully Placed
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#0F1E36] mt-1">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              A confirmation email and tracking receipt have been sent to <strong>{email}</strong>.
            </p>
          </div>

          <div className="p-4 bg-[#FAF7F6] rounded-2xl border border-[#F0E4E6] text-xs text-left grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-400 block">Order Number</span>
              <strong className="font-mono text-[#0F1E36]">{confirmedOrder.id}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Order Date</span>
              <strong className="text-[#0F1E36]">{confirmedOrder.date}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Payment Method</span>
              <strong className="text-[#7414CA] flex items-center gap-1">
                <span>Zelle®</span>
                <span className="text-[10px] text-slate-500 font-normal">(Direct Transfer)</span>
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Order Total</span>
              <strong className="text-[#0F1E36]">${confirmedOrder.total.toFixed(2)} USD</strong>
            </div>
          </div>

          {/* Payment Verification Notice */}
          <div className="p-4 bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl text-left text-xs text-[#0F1E36] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#7414CA] flex items-center gap-1.5">
                <ZelleLogo size="sm" variant="badge" />
                <span>Payment Verification Status:</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Pending Verification
              </span>
            </div>
            {confirmedOrder.transactionReference && (
              <p className="text-slate-700">
                Recorded Zelle Reference: <strong className="font-mono text-[#7414CA]">{confirmedOrder.transactionReference}</strong>
              </p>
            )}
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Your order has been recorded in our store system. Our fulfillment team in Dallas, TX will verify receipt of your Zelle transfer and immediately dispatch your order with tracking details.
            </p>
          </div>

          {/* Itemized list preview */}
          <div className="border-t border-[#F0E4E6] pt-6 text-left">
            <h4 className="font-serif text-sm font-bold text-[#0F1E36] mb-3">
              Items in this Shipment ({confirmedOrder.items.length})
            </h4>
            <div className="space-y-3">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-[#FAF0F2] gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.image} alt={item.name} className="w-12 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0F1E36] truncate">{item.name}</p>
                      <p className="text-slate-400 text-[11px] truncate">Size: {item.size} • Color: {item.color}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#0F1E36] flex-shrink-0 text-right">
                    ${(item.price * item.quantity).toFixed(2)} (Qty {item.quantity})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping destination */}
          <div className="text-left text-xs bg-[#FAF7F6] p-4 rounded-xl">
            <span className="font-bold text-[#0F1E36] block mb-1">Shipping To:</span>
            <p className="text-slate-600">
              {confirmedOrder.shippingAddress.fullName}<br />
              {confirmedOrder.shippingAddress.street} {confirmedOrder.shippingAddress.apt}<br />
              {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} {confirmedOrder.shippingAddress.zipCode}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => navigate('/account/orders')}
              className="flex-1 py-3 px-4 bg-[#2D6A4F] hover:bg-[#1B4332] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              View My Order History
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="flex-1 py-3 px-4 border border-[#EADBDE] hover:border-[#2D6A4F] text-[#0F1E36] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FAF0F2] text-[#2D6A4F] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#0F1E36] mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Add items to your shopping bag before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xl"
        >
          <span>Return to Shop</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/cart" className="hover:text-[#2D6A4F] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
        <span>/</span>
        <span className="text-[#0F1E36] font-semibold">Secure USA Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handlePlaceOrder} className="space-y-8">
            {/* Contact Section */}
            <div className="bg-white p-6 rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F5EBED]">
                <h3 className="font-serif text-base font-bold text-[#0F1E36]">
                  1. Contact Information
                </h3>
                <span className="text-[11px] text-slate-400">Order updates & receipt</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone (for delivery SMS) *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="bg-white p-6 rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F5EBED]">
                <h3 className="font-serif text-base font-bold text-[#0F1E36]">
                  2. USA Shipping Address
                </h3>
                <span className="text-[11px] text-[#2D6A4F] font-semibold">USA Domestic Delivery</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Apt / Suite
                  </label>
                  <input
                    type="text"
                    value={apt}
                    onChange={(e) => setApt(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  >
                    {US_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F6] border border-[#EADBDE] rounded-xl focus:bg-white focus:outline-hidden focus:border-[#2D6A4F]"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Speed Selection */}
            <div className="bg-white p-6 rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-3">
              <h3 className="font-serif text-base font-bold text-[#0F1E36] pb-3 border-b border-[#F5EBED]">
                3. Shipping Method
              </h3>
              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#EADBDE] cursor-pointer hover:border-[#2D6A4F] transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="accent-[#2D6A4F]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#0F1E36]">
                        Standard USA Shipping (3-5 Business Days)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Dispatched via USPS Priority Mail from Dallas Atelier
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0F1E36]">
                    {subtotal >= 75 ? 'FREE' : '$5.99'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#EADBDE] cursor-pointer hover:border-[#2D6A4F] transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="accent-[#2D6A4F]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#0F1E36]">
                        Express 2-Day Air
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Guaranteed 2 business day delivery via FedEx
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0F1E36]">$14.99</span>
                </label>
              </div>
            </div>

            {/* 4. Payment Method — Zelle */}
            <div className="bg-white p-6 rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F5EBED]">
                <h3 className="font-serif text-base font-bold text-[#0F1E36] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#7414CA]" />
                  <span>4. Payment via Zelle</span>
                </h3>
              </div>

              {/* Compact Zelle Container */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#7414CA] bg-[#FAF5FF] space-y-4">
                {/* Zelle payment method name and 0% processing fee */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E9D5FF]/70">
                  <div className="flex items-center gap-2">
                    <ZelleLogo size="sm" />
                    <span className="text-sm font-bold text-[#0F1E36]">
                      Zelle®
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#7414CA] bg-white px-2.5 py-1 rounded-lg border border-[#E9D5FF] shadow-2xs">
                    0% Processing Fee
                  </span>
                </div>

                {/* Order total in USD with Copy Amount button */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E9D5FF] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Order Total (USD)
                    </span>
                    <span className="font-serif text-xl sm:text-2xl font-black text-[#0F1E36]">
                      ${total.toFixed(2)} USD
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(total.toFixed(2), 'amount')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#7414CA] text-xs font-bold border border-[#E9D5FF] transition-colors cursor-pointer"
                  >
                    {copiedField === 'amount' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Amount</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Recipient Details & QR Code */}
                <div className="bg-white rounded-xl border border-[#E9D5FF] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-3 w-full sm:w-auto">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Account Holder
                      </span>
                      <span className="font-bold text-[#0F1E36] text-sm sm:text-base">
                        {zelleAccountHolder}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Phone
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0F1E36] text-sm sm:text-base">
                          {zellePhone}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(zellePhone, 'phone')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#7414CA] text-xs font-semibold border border-[#E9D5FF] transition-colors cursor-pointer"
                        >
                          {copiedField === 'phone' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Phone</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-center">
                    <div className="p-2 bg-white rounded-xl border border-[#E9D5FF] shadow-xs inline-block">
                      <img
                        src={zelleQrCode}
                        alt="Zelle QR Code"
                        className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Pay with Zelle Button */}
                <a
                  href={zellePaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#7414CA] hover:bg-[#5C0FA6] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] text-center"
                >
                  <ZelleLogo size="sm" variant="badge" />
                  <span>Pay with Zelle</span>
                  <ExternalLink className="w-4 h-4 ml-0.5 opacity-90" />
                </a>

                {/* Required Transaction Reference Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="zelle-reference-input" className="block text-xs font-bold text-[#0F1E36]">
                      Transaction Reference Number <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Required</span>
                  </div>
                  <input
                    id="zelle-reference-input"
                    type="text"
                    required
                    value={zelleReference}
                    onChange={(e) => {
                      setZelleReference(e.target.value);
                      if (referenceError) setReferenceError(null);
                    }}
                    placeholder="Enter your Zelle transaction reference number"
                    className={`w-full px-3.5 py-2.5 text-xs bg-white rounded-xl text-[#0F1E36] placeholder-slate-400 focus:outline-hidden focus:ring-1 ${
                      referenceError
                        ? 'border-2 border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20'
                        : 'border border-[#E9D5FF] focus:border-[#7414CA] focus:ring-[#7414CA]'
                    }`}
                  />
                  {referenceError && (
                    <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 mt-1.5" role="alert">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{referenceError}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="checkout-submit-order-btn"
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-[#7414CA] hover:bg-[#5C0FA6] text-white text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Complete Order with Zelle (${total.toFixed(2)} USD)</span>
            </button>
          </form>
        </div>

        {/* Right Column: Order Review */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#0F1E36] pb-3 border-b border-[#F5EBED]">
              Order Summary ({cartItems.length} items)
            </h3>

            <div className="divide-y divide-[#FAF0F2] max-h-80 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-14 rounded-lg object-cover bg-[#FAF7F6] flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0F1E36] truncate">{item.product.name}</p>
                      <p className="text-slate-400 text-[11px] truncate">
                        Qty: {item.quantity} • {item.selectedSize} • {item.selectedColor}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#0F1E36] flex-shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-[#F5EBED] text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#0F1E36]">${subtotal.toFixed(2)}</span>
              </div>
              {discountApplied && (
                <div className="flex justify-between text-[#2D6A4F] font-semibold">
                  <span>Coupon "{couponCode}" (10%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-[#0F1E36]">
                  {shippingCost === 0 ? <span className="text-[#2D6A4F]">FREE</span> : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (8.25%)</span>
                <span className="font-semibold text-[#0F1E36]">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#0F1E36] pt-3 border-t border-[#F5EBED]">
                <span>Total Due</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF0F2] rounded-xl text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-[#0F1E36] flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                Direct USA Atelier Guarantee
              </div>
              <p>Hand-steamed and dispatched with care from our Dallas facility.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
