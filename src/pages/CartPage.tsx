import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Tag,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CartPage: React.FC = () => {
  const {
    cartItems,
    updateCartQuantity,
    removeCartItem,
    discountApplied,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useShop();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 75;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = isFreeShipping || subtotal === 0 ? 0 : 5.99;
  const discountAmount = discountApplied ? subtotal * 0.10 : 0;
  const estimatedTax = (subtotal - discountAmount) * 0.0825; // standard US sales tax ~8.25%
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost + estimatedTax);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const success = applyCoupon(couponInput.trim());
    if (success) {
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try code "USA2026" or "MODEST10" for 10% off.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FAF0F2] text-[#2D6A4F] flex items-center justify-center mx-auto mb-6 shadow-xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#0F1E36] mb-3">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          Explore our modest collection of premium abayas, breathable modal hijabs, and elegant daytime dresses.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <span>Discover Modest Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="border-b border-[#F0E4E6] pb-5 mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#0F1E36]">
          Shopping Bag ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items)
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review your selections before secure checkout</p>
      </div>

      {/* Free Shipping Progress Meter */}
      <div className="mb-8 p-4 bg-white rounded-2xl border border-[#F0E4E6] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold mb-2 gap-1">
          <span className="flex items-center gap-1.5 text-[#0F1E36]">
            <Truck className="w-4 h-4 text-[#2D6A4F] flex-shrink-0" />
            <span>
              {isFreeShipping
                ? 'Congratulations! You unlocked Free USA Standard Shipping.'
                : `Add $${remainingForFreeShipping.toFixed(2)} more to qualify for Free Shipping!`}
            </span>
          </span>
          <span className="text-[#2D6A4F] font-bold flex-shrink-0">
            {isFreeShipping ? 'FREE' : `$${subtotal.toFixed(2)} / $${freeShippingThreshold}`}
          </span>
        </div>
        <div className="w-full bg-[#FAF0F2] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#2D6A4F] h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item Rows */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-[#F0E4E6] overflow-hidden divide-y divide-[#FAF0F2]">
            {cartItems.map((item, index) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="w-16 h-20 min-[360px]:w-20 min-[360px]:h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-[#FAF7F6] border border-[#F0E4E6] flex-shrink-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D6A4F] truncate block">
                      {item.product.categoryLabel}
                    </span>
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-serif text-sm sm:text-base font-bold text-[#0F1E36] hover:text-[#2D6A4F] transition-colors block truncate"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>
                        Size: <strong>{item.selectedSize}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Color: <strong>{item.selectedColor}</strong>
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#0F1E36] sm:hidden pt-1">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#FAF0F2]">
                  {/* Quantity adjustment */}
                  <div className="flex items-center border border-[#EADBDE] rounded-xl bg-white shadow-2xs">
                    <button
                      onClick={() => updateCartQuantity(index, item.quantity - 1)}
                      className="px-2.5 sm:px-3 py-1.5 text-slate-500 hover:text-[#0F1E36] text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-7 sm:w-8 text-center text-xs font-bold text-[#0F1E36]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(index, item.quantity + 1)}
                      className="px-2.5 sm:px-3 py-1.5 text-slate-500 hover:text-[#0F1E36] text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Desktop Item Total */}
                  <div className="text-right hidden sm:block min-w-[80px]">
                    <div className="text-base font-bold text-[#0F1E36]">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ${item.product.price.toFixed(2)} each
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeCartItem(index)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/shop"
              className="text-xs font-semibold text-[#2D6A4F] hover:underline flex items-center gap-1.5"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#F0E4E6] shadow-2xs space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#0F1E36] pb-3 border-b border-[#F5EBED]">
              Order Summary
            </h3>

            {/* Coupon Application Box */}
            <div>
              {discountApplied ? (
                <div className="p-3 rounded-xl bg-[#EBF5F0] border border-[#52B788] flex items-center justify-between text-xs text-[#2D6A4F]">
                  <div className="flex items-center gap-2 font-semibold min-w-0">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Coupon "{couponCode}" applied (10% off)</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-500 font-bold hover:underline flex-shrink-0 ml-2 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit} className="space-y-2">
                  <div className="flex gap-2 min-w-0">
                    <div className="relative flex-1 min-w-0">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError('');
                        }}
                        placeholder="Promo code (e.g. USA2026)"
                        className="w-full pl-8 pr-3 py-2 text-xs border border-[#EADBDE] rounded-xl uppercase focus:outline-hidden focus:border-[#2D6A4F] min-w-0"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#0F1E36] hover:bg-[#1C2E4C] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex-shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {couponError}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-[#F5EBED]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#0F1E36]">${subtotal.toFixed(2)}</span>
              </div>

              {discountApplied && (
                <div className="flex justify-between text-[#2D6A4F] font-semibold">
                  <span>VIP Discount (10%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated USA Shipping</span>
                <span className="font-semibold text-[#0F1E36]">
                  {isFreeShipping ? <span className="text-[#2D6A4F]">FREE</span> : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax (USA)</span>
                <span className="font-semibold text-[#0F1E36]">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#0F1E36] pt-3 border-t border-[#F5EBED]">
                <span>Estimated Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              id="cart-proceed-checkout-btn"
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 px-6 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                Guaranteed 256-Bit Encrypted USA Checkout
              </p>
              <p>Free returns within 30 days of arrival.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
