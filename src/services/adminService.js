import api from './api';

export const adminService = {
  // Stats
  getOverview: (params) => api.get('/stats/overview', { params }),
  getCharts: () => api.get('/stats/charts'),
  exportBookingsCSVUrl: () => `${api.defaults.baseURL}/stats/export-bookings`,

  // Services
  createService: (data) => api.post('/services', data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`),

  // Categories
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Packages
  createPackage: (data) => api.post('/packages', data),
  updatePackage: (id, data) => api.put(`/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/packages/${id}`),

  // Bookings
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
  updateBookingStatus: (id, data) => api.patch(`/bookings/admin/${id}/status`, data),

  // Payments & Refunds
  getAllPayments: (params) => api.get('/payments/admin/all', { params }),
  processRefund: (data) => api.post('/payments/admin/refund', data),

  // Customers
  getAllCustomers: (params) => api.get('/users/customers', { params }),
  getCustomerDetails: (id) => api.get(`/users/customers/${id}`),
  toggleCustomerStatus: (id) => api.patch(`/users/customers/${id}/toggle-status`),

  // Banners
  getAllBanners: () => api.get('/banners'),
  createBanner: (data) => api.post('/banners', data),
  updateBanner: (id, data) => api.put(`/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/banners/${id}`),

  // Coupons
  getCoupons: () => api.get('/coupons'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),

  // FAQs
  createFAQ: (data) => api.post('/faqs', data),
  updateFAQ: (id, data) => api.put(`/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/faqs/${id}`),

  // Testimonials
  createTestimonial: (data) => api.post('/testimonials', data),
  updateTestimonial: (id, data) => api.put(`/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/testimonials/${id}`),

  // Enquiries
  getEnquiries: (params) => api.get('/enquiries', { params }),
  updateEnquiryStatus: (id, data) => api.patch(`/enquiries/${id}/status`, data),
  deleteEnquiry: (id) => api.delete(`/enquiries/${id}`),

  // Settings
  updateSettings: (data) => api.put('/settings', data),

  // Scrap Material Prices
  getAllScrapPrices: () => api.get('/scrap-prices/admin/all'),
  createScrapPrice: (data) => api.post('/scrap-prices', data),
  updateScrapPrice: (id, data) => api.put(`/scrap-prices/${id}`, data),
  deleteScrapPrice: (id) => api.delete(`/scrap-prices/${id}`),
  resetDefaultScrapPrices: () => api.post('/scrap-prices/admin/reset-defaults'),

  // Advertisements
  getAllAdvertisements: () => api.get('/advertisements'),
  createAdvertisement: (data) => api.post('/advertisements', data),
  updateAdvertisement: (id, data) => api.put(`/advertisements/${id}`, data),
  deleteAdvertisement: (id) => api.delete(`/advertisements/${id}`),
  toggleAdvertisement: (id) => api.patch(`/advertisements/${id}/toggle`),

  // Labour Insurance
  getLabourInsuranceInquiries: (params) => api.get('/labour-insurance', { params }),
  getLabourInsuranceById: (id) => api.get(`/labour-insurance/${id}`),
  updateLabourInsuranceStatus: (id, data) => api.patch(`/labour-insurance/${id}/status`, data),
  deleteLabourInsuranceInquiry: (id) => api.delete(`/labour-insurance/${id}`),

  // Uploads
  uploadImage: (formData) =>
    api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
