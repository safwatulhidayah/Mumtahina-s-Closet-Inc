import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { firebaseUser, isAuthLoading } = useShop();
  const location = useLocation();

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

  // Only allow verified Firebase authenticated users
  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
