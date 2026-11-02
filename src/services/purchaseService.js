import api from './api';

export const purchaseService = {
  // Suppliers
  getSuppliers: async (params = {}) => {
    const res = await api.get('/purchases/suppliers', { params });
    return res.data;
  },

  getSupplierById: async (id) => {
    const res = await api.get(`/purchases/suppliers/${id}`);
    return res.data;
  },

  createSupplier: async (data) => {
    const res = await api.post('/purchases/suppliers', data);
    return res.data;
  },

  updateSupplier: async (id, data) => {
    const res = await api.put(`/purchases/suppliers/${id}`, data);
    return res.data;
  },

  deleteSupplier: async (id) => {
    const res = await api.delete(`/purchases/suppliers/${id}`);
    return res.data;
  },

  // Purchase Invoices
  getPurchaseInvoices: async (params = {}) => {
    const res = await api.get('/purchases/invoices', { params });
    return res.data;
  },

  getPurchaseInvoiceById: async (id) => {
    const res = await api.get(`/purchases/invoices/${id}`);
    return res.data;
  },

  createPurchaseInvoice: async (data) => {
    const res = await api.post('/purchases/invoices', data);
    return res.data;
  },

  updatePurchaseInvoice: async (id, data) => {
    const res = await api.put(`/purchases/invoices/${id}`, data);
    return res.data;
  },

  deletePurchaseInvoice: async (id) => {
    const res = await api.delete(`/purchases/invoices/${id}`);
    return res.data;
  },

  // Payments
  recordPayment: async (invoiceId, paymentData) => {
    const res = await api.post(`/purchases/invoices/${invoiceId}/payments`, paymentData);
    return res.data;
  },

  // Reports & Analytics
  getPurchaseReports: async (params = {}) => {
    const res = await api.get('/purchases/reports', { params });
    return res.data;
  },
};

export default purchaseService;
