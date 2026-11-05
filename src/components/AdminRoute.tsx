import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { isAuthorizedAdmin } from '../lib/adminAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { currentUser, isAuthLoading } = useShop();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#FAF0F2] border-t-[#2D6A4F] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
          Verifying Administrator Privileges...
        </p>
      </div>
    );
  }

  const effectiveEmail = currentUser.isLoggedIn ? currentUser.email : null;
  const userIsLoggedIn = !!currentUser.isLoggedIn;
  const isAdmin = isAuthorizedAdmin(effectiveEmail);

  // 1. Unauthenticated users: redirect to login
  if (!userIsLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2. Authenticated as non-admin customer: strictly block and redirect
  if (!isAdmin) {
    return <Navigate to="/account" replace state={{ accessDenied: true }} />;
  }

  // 3. Authorized admin: render Admin Panel
  return <>{children}</>;
};
