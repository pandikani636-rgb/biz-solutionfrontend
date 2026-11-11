import api from './api';

export const ticketBookingService = {
  create: (booking) => api.post('/ticket-bookings', booking),
  getMine: () => api.get('/ticket-bookings/my'),
  cancel: (id, reason) => api.patch(`/ticket-bookings/${id}/cancel`, { reason }),
  createPaymentOrder: (id) => api.post(`/ticket-bookings/${id}/payment/order`),
  verifyPayment: (id, payment) => api.post(`/ticket-bookings/${id}/payment/verify`, payment),
  getAll: (params) => api.get('/ticket-bookings/admin/all', { params }),
  update: (id, values) => api.patch(`/ticket-bookings/admin/${id}`, values),
  refund: (id) => api.post(`/ticket-bookings/admin/${id}/refund`),
};
