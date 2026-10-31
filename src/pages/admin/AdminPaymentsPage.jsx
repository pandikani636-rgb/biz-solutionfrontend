import React, { useState, useEffect } from 'react';
import { CreditCard, Search, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../utils/alerts';

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Refund Modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllPayments({
        search: search.trim() || undefined,
        limit: 50,
      });
      if (res.success) {
        setPayments(res.data || []);
      }
    } catch (err) {
      console.error('[Admin Payments Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleOpenRefund = (payment) => {
    setSelectedPayment(payment);
    setRefundReason('');
    setIsRefundModalOpen(true);
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    setRefundLoading(true);
    try {
      await adminService.processRefund({
        paymentId: selectedPayment._id,
        amount: selectedPayment.amount,
        reason: refundReason || 'Admin approved refund',
      });
      showSuccessAlert('Refund Processed', `₹${selectedPayment.amount} has been refunded.`);
      setIsRefundModalOpen(false);
      fetchPayments();
    } catch (err) {
      showErrorAlert('Refund Failed', err.message);
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span>Gateway Transactions & Settlements</span>
          </h2>
          <p className="text-xs text-secondaryText mt-1">
            Real-time ledger of verified customer transactions and refund operations.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-72">
          <input
            type="text"
            placeholder="Search transaction ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPayments()}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none"
          />
          <Button variant="secondary" size="sm" onClick={fetchPayments}>
            Find
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : payments.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Booking</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-bold text-navy">{p.transactionId}</td>
                  <td className="py-3 px-4 font-semibold text-darkText">{p.customer?.name}</td>
                  <td className="py-3 px-4 font-mono text-primary">#{p.booking?.bookingNumber}</td>
                  <td className="py-3 px-4 text-right font-black text-navy">{formatCurrency(p.amount)}</td>
                  <td className="py-3 px-4 uppercase font-bold text-slate-500">{p.provider}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        p.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : p.status === 'refunded'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-secondaryText">{formatDateTime(p.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    {p.status === 'paid' && (
                      <button
                        onClick={() => handleOpenRefund(p)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-danger hover:bg-rose-50 rounded-lg transition-smooth"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-xs text-secondaryText">No payments recorded.</div>
        )}
      </div>

      {/* Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Authorize Customer Refund"
      >
        <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
            <p className="font-bold">Transaction: {selectedPayment?.transactionId}</p>
            <p>Refund Amount: <strong>{formatCurrency(selectedPayment?.amount)}</strong></p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-darkText">Reason for Refund *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Service cancellation requested prior to dispatch"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={refundLoading}>
              Confirm Refund
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
