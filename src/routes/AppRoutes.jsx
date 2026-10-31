import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { ServicesPage } from '../pages/public/ServicesPage';
import { ServiceDetailPage } from '../pages/public/ServiceDetailPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';
import { RfqPage } from '../pages/public/RfqPage';
import { PriceListPage } from '../pages/public/PriceListPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Customer Pages
import { UserDashboardPage } from '../pages/customer/UserDashboardPage';
import { MyBookingsPage } from '../pages/customer/MyBookingsPage';
import { BookingDetailPage } from '../pages/customer/BookingDetailPage';
import { CustomerPaymentsPage } from '../pages/customer/CustomerPaymentsPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';

// Admin Pages
import { AdminDashboardOverview } from '../pages/admin/AdminDashboardOverview';
import { AdminServicesPage } from '../pages/admin/AdminServicesPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminPackagesPage } from '../pages/admin/AdminPackagesPage';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminBannersPage } from '../pages/admin/AdminBannersPage';
import { AdminCouponsPage } from '../pages/admin/AdminCouponsPage';
import { AdminEnquiriesPage } from '../pages/admin/AdminEnquiriesPage';
import { AdminQuotationsPage } from '../pages/admin/AdminQuotationsPage';
import { AdminUserUploadsPage } from '../pages/admin/AdminUserUploadsPage';
import { AdminPdfCatalogPage } from '../pages/admin/AdminPdfCatalogPage';
import { AdminContentPage } from '../pages/admin/AdminContentPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:identifier" element={<ServiceDetailPage />} />
        <Route path="/rfq" element={<RfqPage />} />
        <Route path="/mrp-pricing" element={<PriceListPage />} />
        <Route path="/price-list" element={<PriceListPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Customer Portal (Protected) */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<UserDashboardPage />} />
        <Route path="dashboard" element={<UserDashboardPage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="payments" element={<CustomerPaymentsPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* Admin Portal (Protected, Admin Only) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardOverview />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="packages" element={<AdminPackagesPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="quotations" element={<AdminQuotationsPage />} />
        <Route path="user-uploads" element={<AdminUserUploadsPage />} />
        <Route path="pdf-catalog" element={<AdminPdfCatalogPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="enquiries" element={<AdminEnquiriesPage />} />
        <Route path="content" element={<AdminContentPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
