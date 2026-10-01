import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MobileBottomNav: React.FC = () => {
  const { cartCount, wishlistCount } = useShop();
  const location = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'shop', label: 'Shop', icon: Compass, path: '/shop' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/wishlist', badge: wishlistCount },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, path: '/cart', badge: cartCount },
    { id: 'account', label: 'Account', icon: User, path: '/account' },
  ];

  const isItemActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/shop') {
      return (
        location.pathname === '/shop' ||
        location.pathname.startsWith('/category') ||
        location.pathname === '/new-arrivals' ||
        location.pathname === '/best-sellers'
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      id="mobile-bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F0E4E6] lg:hidden safe-area-pb"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.path);

          return (
            <Link
              key={item.id}
              id={`mobile-bottom-nav-${item.id}`}
              to={item.path}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-[#2D6A4F]' : 'text-slate-500 hover:text-[#0F1E36]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25]' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    id={`mobile-badge-${item.id}`}
                    className={`absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-white rounded-full ${
                      item.id === 'wishlist' ? 'bg-[#E58C9D]' : 'bg-[#2D6A4F]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight ${
                  isActive ? 'font-semibold text-[#2D6A4F]' : 'font-normal'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#2D6A4F] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
