import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Spinner } from '../../components/common/Spinner';

export const CustomerPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await bookingService.getMyPayments();
        if (res.success) {
          setPayments(res.data || []);
        }
      } catch (err) {
        console.error('[Payments Error]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <span>Payment History & Settlement Records</span>
        </h2>
        <p className="text-xs text-secondaryText mt-1">
          Review all verified gateway transactions, receipts, and payment status updates.
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner />
        </div>
      ) : payments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-navy font-bold">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Booking Number</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-smooth">
                  <td className="py-3 px-4 font-mono font-bold text-navy">{p.transactionId}</td>
                  <td className="py-3 px-4 font-semibold text-primary">
                    #{p.booking?.bookingNumber || 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-black text-darkText">{formatCurrency(p.amount)}</td>
                  <td className="py-3 px-4 uppercase font-bold text-slate-500">{p.provider}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-secondaryText">{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-secondaryText italic">
          No payment transactions found.
        </div>
      )}
    </div>
  );
};
