import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransactionsPage from "@/pages/TransactionsPage";
import CustomersPage from "@/pages/CustomersPage";
import PaymentLinksPage from "@/pages/PaymentLinksPage";
import SettingsPage from "@/pages/SettingsPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <SidebarProvider>
            <div className="flex w-full">
              <AppSidebar />
              <main className="flex-1">
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
              </main>
            </div>
          </SidebarProvider>
        } />
      </Routes>
    </Router>
  );
};

export default App;