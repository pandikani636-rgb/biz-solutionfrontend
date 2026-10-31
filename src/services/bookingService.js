import api from './api';

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),

  // Payments
  createPaymentOrder: (bookingId, provider) => api.post('/payments/create-order', { bookingId, provider }),
  verifyPayment: (payload) => api.post('/payments/verify', payload),
  getMyPayments: () => api.get('/payments/my'),

  // Coupons
  validateCoupon: (code, amount, serviceId) => api.post('/coupons/validate', { code, amount, serviceId }),

  // Invoices
  getInvoiceByBookingId: (bookingId) => api.get(`/invoices/booking/${bookingId}`),

  // Notifications
  getMyNotifications: () => api.get('/notifications'),
  markNotificationAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.patch('/notifications/read-all'),
};
