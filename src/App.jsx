// src/App.js
import React, { useEffect } from 'react';
import "./App.css"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/mainLayout/MainLayout';

import LoginPage from './pages/loginPage/LoginPage';
import MainPage from './pages/mainPage/MainPage';
import SignupPage from './pages/signupPage/SignupPage';
import AnalyticsPage from './pages/analyticsPage/AnalyticsPage';
import InventoryPage from './pages/inventoryPage/InventoryPage';
import SalesPage from './pages/salesPage/SalesPage';
import CustomersPage from './pages/customersPage/CustomersPage';
import ManagePage from './pages/managePage/ManagePage';
import ItemDetailsPage from './pages/itemDetailsPage/ItemDetailsPage';
import OldGoldPage from './pages/oldGoldPage/OldGoldPage';
import StaffDetailsPage from './pages/staffDetailsPage/StaffDetailsPage';
import CustomerDetailsPage from './pages/customerDetailPage/CustomerDetailPage';
import { useTranslation } from 'react-i18next';
import InvoicesPage from './pages/invoicesPage/InvoicesPage';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set direction
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'; // Ensure body gets it too

    // Set font class
    document.body.classList.remove('font-arabic', 'font-english');
    document.body.classList.add(i18n.language === 'ar' ? 'font-arabic' : 'font-english');
  }, [i18n.language]);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<AnalyticsPage />} />
              <Route path="/home" element={<MainPage/>} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/item/:id" element={<ItemDetailsPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerDetailsPage />} />
              <Route path="/old-gold" element={<OldGoldPage />} />
              <Route path="/manage" element={<ManagePage />} />
              <Route path="/manage/staff/:id" element={<StaffDetailsPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;