import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ZelleLogo } from './ZelleLogo';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#0F1E36] text-white pt-16 pb-24 lg:pb-12 border-t border-[#1C2D48]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 mb-12 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#F4D3D7]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Free USA Shipping</h4>
              <p className="text-xs text-slate-400">On all domestic orders over $75</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#52B788]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">30-Day Easy Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free USA prepaid returns</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#F4D3D7]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Secure USA Payments</h4>
              <p className="text-xs text-slate-400">256-bit encrypted checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#52B788]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Dedicated Support</h4>
              <p className="text-xs text-slate-400">Monday–Friday 9AM–6PM CST</p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-block bg-white/95 hover:bg-white px-3 py-1.5 rounded-2xl shadow-xs transition-colors">
              <Link to="/" aria-label="Mumtahina’s Closet Inc Home">
                <BrandLogo size="md" />
              </Link>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Mumtahina’s Closet Inc is a modern USA modest fashion apparel brand dedicated to bringing timeless silhouettes, luxury crepe abayas, breathable modal hijabs, and contemporary everyday wear with dignity, craftsmanship, and elegance.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400 pt-1">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F4D3D7]" />
                HQ Studio: 1400 Preston Rd, Suite 400, Dallas, TX 75093, USA
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#52B788]" />
                Customer Concierge: +1 (800) 555-6868
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F4D3D7]" />
                Email: care@mumtahinascloset.com
              </p>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/shop" className="hover:text-[#F4D3D7] transition-colors">
                  All Modest Wear
                </Link>
              </li>
              <li>
                <Link to="/category/women" className="hover:text-[#F4D3D7] transition-colors">
                  Women's Dresses
                </Link>
              </li>
              <li>
                <Link to="/category/abaya" className="hover:text-[#F4D3D7] transition-colors">
                  Abaya Collection
                </Link>
              </li>
              <li>
                <Link to="/category/hijab-scarf" className="hover:text-[#F4D3D7] transition-colors">
                  Hijabs & Scarves
                </Link>
              </li>
              <li>
                <Link to="/category/men" className="hover:text-[#F4D3D7] transition-colors">
                  Men's Kurtas & Thobes
                </Link>
              </li>
              <li>
                <Link to="/category/kids" className="hover:text-[#F4D3D7] transition-colors">
                  Kids Modest Apparel
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" className="hover:text-[#F4D3D7] transition-colors">
                  Pins & Accessories
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="text-[#52B788] font-medium hover:underline">
                  New Arrivals ✨
                </Link>
              </li>
              <li>
                <Link to="/best-sellers" className="text-[#F4D3D7] font-medium hover:underline">
                  Best Sellers 🔥
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/about" className="hover:text-[#F4D3D7] transition-colors">
                  About Our Brand
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F4D3D7] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#F4D3D7] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-[#F4D3D7] transition-colors">
                  USA Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-[#F4D3D7] transition-colors">
                  30-Day Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-[#F4D3D7] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[#F4D3D7] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#F4D3D7] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              VIP Modest Club
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Subscribe to receive exclusive preview drops, modest styling advice, and 10% off your first USA order.
            </p>

            {subscribed ? (
              <div className="p-3 bg-[#2D6A4F]/40 border border-[#52B788] rounded-xl flex items-center gap-2 text-xs text-[#52B788]">
                <CheckCircle className="w-4 h-4" />
                <span>You're on the VIP list! Welcome.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:border-[#52B788] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Join & Get 10% Off
                </button>
              </form>
            )}

            <div className="pt-2">
              <span className="text-[11px] text-slate-400 block mb-1.5">Official Payment Gateway</span>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl">
                <ZelleLogo size="sm" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  Direct Bank Transfer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} Mumtahina’s Closet Inc. All Rights Reserved. Modest Fashion Apparel in the USA.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/shipping" className="hover:text-white transition-colors">
              USA Logistics
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
