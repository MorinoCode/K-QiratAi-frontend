import React, { useEffect } from 'react';
import "./App.css"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/mainLayout/MainLayout';

import LoginPage from './pages/loginPage/LoginPage';
import SignupPage from './pages/signupPage/SignupPage';
import DashboardPage from './pages/dashboardPage/DashboardPage';
import InventoryPage from './pages/inventoryPage/InventoryPage';
import SalesPage from './pages/salesPage/SalesPage';
import CustomersPage from './pages/customersPage/CustomersPage';
import ManagePage from './pages/managePage/ManagePage';
import ItemDetailsPage from './pages/itemDetailsPage/ItemDetailsPage';
import OldGoldPage from './pages/oldGoldPage/OldGoldPage';
import StaffDetailsPage from './pages/staffDetailsPage/StaffDetailsPage';
import CustomerDetailsPage from './pages/customerDetailPage/CustomerDetailPage';
import { useTranslation } from 'react-i18next';


function App() {
  // درون کامپوننت App یا Layout اصلی:
const { i18n } = useTranslation();

useEffect(() => {
  document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  document.body.className = i18n.language === 'ar' ? 'font-arabic' : 'font-english';
}, [i18n.language]);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<MainLayout />}>
               <Route path="/dashboard" element={<DashboardPage />} />
               <Route path="/inventory" element={<InventoryPage />} />
               <Route path="/inventory/item/:id" element={<ItemDetailsPage />}/>
               <Route path="/sales" element={<SalesPage />} />
               <Route path="/customers" element={<CustomersPage />} />
               <Route path="/customers/:id" element={<CustomerDetailsPage />} />
               <Route path="/old-gold" element={<OldGoldPage />} />
               <Route path="/manage" element={<ManagePage />} />
               <Route path="/manage/staff/:id" element={<StaffDetailsPage />} />
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