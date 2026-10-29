import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/layout/AppLayout';

// Views
import DashboardView from './components/dashboard/DashboardView';
import OrdersView from './components/orders/OrdersView';
import PosView from './components/pos/PosView';
import HistoryView from './components/history/HistoryView';
import MechanicsView from './components/mechanics/MechanicsView';
import InventoryView from './components/inventory/InventoryView';
import ClientsView from './components/clients/ClientsView';
import SettingsView from './components/settings/SettingsView';

export default function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected System Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/orders" element={<OrdersView />} />
          <Route path="/pos" element={<PosView />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/mechanics" element={<MechanicsView />} />
          <Route path="/inventory" element={<InventoryView />} />
          <Route path="/clients" element={<ClientsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
