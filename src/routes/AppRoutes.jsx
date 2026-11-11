import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from '../components/common/Spinner';

// Layouts (Loaded eagerly for instant structure)
import { PublicLayout } from '../layouts/PublicLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages (Lazy loaded for fast initial page load)
const HomePage = lazy(() => import('../pages/public/HomePage').then((m) => ({ default: m.HomePage })));
const ServicesPage = lazy(() => import('../pages/public/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() => import('../pages/public/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })));
const AboutPage = lazy(() => import('../pages/public/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('../pages/public/ContactPage').then((m) => ({ default: m.ContactPage })));
const RfqPage = lazy(() => import('../pages/public/RfqPage').then((m) => ({ default: m.RfqPage })));
const PriceListPage = lazy(() => import('../pages/public/PriceListPage').then((m) => ({ default: m.PriceListPage })));
const TicketBookingPage = lazy(() => import('../pages/public/TicketBookingPage').then((m) => ({ default: m.TicketBookingPage })));
const TransportBookingPage = lazy(() => import('../pages/public/TransportBookingPage').then((m) => ({ default: m.TransportBookingPage })));

// Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));

// Customer Pages
const UserDashboardPage = lazy(() => import('../pages/customer/UserDashboardPage').then((m) => ({ default: m.UserDashboardPage })));
const MyBookingsPage = lazy(() => import('../pages/customer/MyBookingsPage').then((m) => ({ default: m.MyBookingsPage })));
const BookingDetailPage = lazy(() => import('../pages/customer/BookingDetailPage').then((m) => ({ default: m.BookingDetailPage })));
const CustomerPaymentsPage = lazy(() => import('../pages/customer/CustomerPaymentsPage').then((m) => ({ default: m.CustomerPaymentsPage })));
const CustomerProfilePage = lazy(() => import('../pages/customer/CustomerProfilePage').then((m) => ({ default: m.CustomerProfilePage })));
const MyTicketBookingsPage = lazy(() => import('../pages/customer/MyTicketBookingsPage').then((m) => ({ default: m.MyTicketBookingsPage })));

// Admin Pages
const AdminDashboardOverview = lazy(() => import('../pages/admin/AdminDashboardOverview').then((m) => ({ default: m.AdminDashboardOverview })));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage })));
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminPackagesPage = lazy(() => import('../pages/admin/AdminPackagesPage').then((m) => ({ default: m.AdminPackagesPage })));
const AdminBookingsPage = lazy(() => import('../pages/admin/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage })));
const AdminCustomersPage = lazy(() => import('../pages/admin/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })));
const AdminPaymentsPage = lazy(() => import('../pages/admin/AdminPaymentsPage').then((m) => ({ default: m.AdminPaymentsPage })));
const AdminBannersPage = lazy(() => import('../pages/admin/AdminBannersPage').then((m) => ({ default: m.AdminBannersPage })));
const AdminCouponsPage = lazy(() => import('../pages/admin/AdminCouponsPage').then((m) => ({ default: m.AdminCouponsPage })));
const AdminEnquiriesPage = lazy(() => import('../pages/admin/AdminEnquiriesPage').then((m) => ({ default: m.AdminEnquiriesPage })));
const AdminQuotationsPage = lazy(() => import('../pages/admin/AdminQuotationsPage').then((m) => ({ default: m.AdminQuotationsPage })));
const AdminUserUploadsPage = lazy(() => import('../pages/admin/AdminUserUploadsPage').then((m) => ({ default: m.AdminUserUploadsPage })));
const AdminPdfCatalogPage = lazy(() => import('../pages/admin/AdminPdfCatalogPage').then((m) => ({ default: m.AdminPdfCatalogPage })));
const AdminContentPage = lazy(() => import('../pages/admin/AdminContentPage').then((m) => ({ default: m.AdminContentPage })));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
const AdminReportsPage = lazy(() => import('../pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })));
const AdminPurchasesPage = lazy(() => import('../pages/admin/AdminPurchasesPage').then((m) => ({ default: m.AdminPurchasesPage })));
const AdminTicketBookingsPage = lazy(() => import('../pages/admin/AdminTicketBookingsPage').then((m) => ({ default: m.AdminTicketBookingsPage })));

const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <Spinner size="lg" text="Loading..." />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:identifier" element={<ServiceDetailPage />} />
          <Route path="/rfq" element={<RfqPage />} />
          <Route path="/mrp-pricing" element={<PriceListPage />} />
          <Route path="/price-list" element={<PriceListPage />} />
          <Route path="/ticket-booking" element={<TicketBookingPage />} />
          <Route path="/ticket-booking/:type" element={<TransportBookingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Customer Portal (Protected) */}
        <Route element={<CustomerLayout />}>
          <Route path="/customer" element={<UserDashboardPage />} />
          <Route path="/customer/dashboard" element={<UserDashboardPage />} />
          <Route path="/customer/bookings" element={<MyBookingsPage />} />
          <Route path="/customer/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/customer/ticket-bookings" element={<MyTicketBookingsPage />} />
          <Route path="/customer/payments" element={<CustomerPaymentsPage />} />
          <Route path="/customer/profile" element={<CustomerProfilePage />} />
        </Route>

        {/* Admin Portal (Protected, Admin Only) */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardOverview />} />
          <Route path="/admin/purchases" element={<AdminPurchasesPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/packages" element={<AdminPackagesPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/ticket-bookings" element={<AdminTicketBookingsPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/quotations" element={<AdminQuotationsPage />} />
          <Route path="/admin/user-uploads" element={<AdminUserUploadsPage />} />
          <Route path="/admin/pdf-catalog" element={<AdminPdfCatalogPage />} />
          <Route path="/admin/banners" element={<AdminBannersPage />} />
          <Route path="/admin/coupons" element={<AdminCouponsPage />} />
          <Route path="/admin/enquiries" element={<AdminEnquiriesPage />} />
          <Route path="/admin/content" element={<AdminContentPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
