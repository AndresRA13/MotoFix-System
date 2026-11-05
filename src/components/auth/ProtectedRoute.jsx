import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MotoFixLoader from '../common/MotoFixLoader';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <MotoFixLoader
        message="Iniciando MotoFix Pro..."
        subMessage="Validando credenciales y preparando el taller"
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

