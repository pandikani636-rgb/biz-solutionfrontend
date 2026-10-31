import api from './api';

export const contentService = {
  // Categories
  getCategories: (params) => api.get('/categories', { params }),
  getCategoryById: (id) => api.get(`/categories/${id}`),

  // Services & Brands
  getServices: (params) => api.get('/services', { params }),
  getBrands: () => api.get('/services/brands'),
  getServiceBySlugOrId: (slugOrId) => api.get(`/services/${slugOrId}`),

  // Packages
  getPackagesByService: (serviceId) => api.get(`/packages/service/${serviceId}`),

  // Banners
  getActiveBanners: () => api.get('/banners/active'),

  // Testimonials & FAQs
  getTestimonials: () => api.get('/testimonials'),
  getFAQs: () => api.get('/faqs'),

  // Site Settings
  getSettings: () => api.get('/settings'),

  // Contact Enquiry
  submitEnquiry: (data) => api.post('/enquiries', data),
};
