import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './pages/App.jsx';
import SuccessPage from './pages/SuccessPage.jsx';
import CancelPage from './pages/CancelPage.jsx';
import LoginPage from './pages/admin/LoginPage.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import OrdersPage from './pages/admin/OrdersPage.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import InventoryPage from './pages/admin/InventoryPage.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={<App />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />

          {/* Admin login — no layout */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Admin routes — all wrapped in layout + protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="inventory" element={<InventoryPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);