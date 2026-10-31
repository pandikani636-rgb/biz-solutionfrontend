export const formatCurrency = (amount, currencySymbol = '₹') => {
  if (amount === undefined || amount === null || isNaN(amount)) return `${currencySymbol}0`;
  return `${currencySymbol}${Number(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed':
    case 'paid':
    case 'resolved':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'confirmed':
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending':
    case 'new':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'cancelled':
    case 'failed':
    case 'rejected':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'refunded':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};
