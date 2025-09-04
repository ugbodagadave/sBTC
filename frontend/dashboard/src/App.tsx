
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AppSidebar from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransactionsPage from "@/pages/TransactionsPage";
import CustomersPage from "@/pages/CustomersPage";
import PaymentLinksPage from "@/pages/PaymentLinksPage";
import SettingsPage from "@/pages/SettingsPage";

const App = () => {
  const location = useLocation();
  const showSidebar = location.pathname !== '/login';
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      {showSidebar && <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />}
      <main className={`flex-1 ${showSidebar && collapsed ? 'ml-16' : showSidebar ? 'ml-72' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              } />
              <Route path="/payment-links" element={
                <ProtectedRoute>
                  <PaymentLinksPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              {/* Add more routes here as we implement other pages */}
            </Routes>
          } />
        </Routes>
      </main>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
