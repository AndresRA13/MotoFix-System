import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthOverlay from '../components/auth/AuthOverlay';

export default function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-amber-500 text-lg font-sans gap-3">
        <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
        <span>Cargando MotoFix Pro...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthOverlay />;
}

