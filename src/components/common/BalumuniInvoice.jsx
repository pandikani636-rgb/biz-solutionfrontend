import React from 'react';
import { Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const BalumuniInvoice = ({ invoice, onPrint, onClose }) => {
  if (!invoice) return null;

  const items = invoice.items || [
    {
      description: 'Industrial Bearings / Power Transmission Belts',
      quantity: 1,
      unitPrice: invoice.totalAmount ? Math.round(invoice.totalAmount / 1.18) : 1000,
      amount: invoice.totalAmount ? Math.round(invoice.totalAmount / 1.18) : 1000,
      hsn: '8482 / 4010',
      uom: 'NOS',
      discountPct: 46,
    },
  ];

  const subtotal = invoice.subtotal || invoice.totalAmount || 0;
  const taxRate = invoice.taxRate || 18;
  const taxAmount = invoice.taxAmount || Math.round(((subtotal * taxRate) / 100) * 100) / 100;
  const grandTotal = invoice.totalAmount || subtotal + taxAmount;

  // Convert amount to words
  const numberToWords = (num) => {
    const a = [
      '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
      'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ',
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      let str = '';
      if (n > 9999999) {
        str += inWords(Math.floor(n / 10000000)) + 'Crore ';
        n %= 10000000;
      }
      if (n > 99999) {
        str += inWords(Math.floor(n / 100000)) + 'Lakh ';
        n %= 100000;
      }
      if (n > 999) {
        str += inWords(Math.floor(n / 1000)) + 'Thousand ';
        n %= 1000;
      }
      if (n > 99) {
        str += inWords(Math.floor(n / 100)) + 'Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
      } else if (n > 0) {
        str += a[n];
      }
      return str;
    };

    const wholePart = Math.floor(num);
    const words = inWords(wholePart);
    return words ? `Rupees ${words.trim()} Only` : 'Rupees Zero Only';
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar (Hidden in Print) */}
      <div className="flex justify-between items-center bg-slate-100 p-3 rounded-2xl border print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-navy">
            Official Balumuni & Associates Invoice Format
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-accent font-bold text-xs hover:bg-primary hover:text-white transition-smooth shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-smooth"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Actual Printable Invoice Body matching Image 3 Reference */}
      <div className="bg-white border-2 border-slate-900 text-slate-950 font-sans p-4 sm:p-6 rounded-none shadow-lg max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
        
        {/* Top Header Grid */}
        <div className="grid grid-cols-12 border-2 border-slate-900">
          {/* BM Logo Box */}
          <div className="col-span-4 p-3 flex flex-col justify-center items-center border-r-2 border-slate-900 bg-white">
            <div className="relative flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black text-[#0F3D68] tracking-tighter font-serif">
                BM
              </span>
              {/* Golden Swoop Curve */}
              <div className="w-24 h-2.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-full mt-[-6px] shadow-sm transform -rotate-1" />
            </div>
          </div>

          {/* Company Details Right Header */}
          <div className="col-span-8 flex flex-col justify-between">
            {/* Top Maroon Mobile Bar */}
            <div className="bg-[#7D0038] text-white py-1.5 px-4 text-center font-bold text-xs sm:text-sm tracking-wide">
              Mobile : 7418423238 / 9842670320
            </div>

            {/* Balumuni and Associates Title & Address */}
            <div className="p-2 sm:p-3 text-center space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#0F3D68] tracking-wider uppercase font-sans">
                BALUMUNI AND ASSOCIATES
              </h1>
              <p className="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight max-w-lg mx-auto">
                45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu – 626125
              </p>
            </div>

            {/* GSTIN and Mail Bar */}
            <div className="border-t-2 border-slate-900 grid grid-cols-2 text-[11px] sm:text-xs font-bold bg-white">
              <div className="p-1.5 pl-3 border-r-2 border-slate-900">
                GSTIN: <span className="font-mono">33HONPK5547G2Z</span>
              </div>
              <div className="p-1.5 pl-3 text-blue-900 truncate">
                Mail : <span className="underline">balumuniandassociates@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* INVOICE Title Maroon Bar with Inset White Box */}
        <div className="bg-[#7D0038] py-1 border-x-2 border-b-2 border-slate-900 flex justify-center items-center">
          <div className="bg-white px-8 py-0.5 border border-slate-900 shadow-sm">
            <h2 className="text-base sm:text-lg font-black text-[#0F3D68] tracking-widest uppercase">
              INVOICE
            </h2>
          </div>
        </div>

        {/* Customer & Invoice Meta 2-Column Section */}
        <div className="grid grid-cols-12 border-x-2 border-b-2 border-slate-900 text-xs">
          {/* Bill To Left Column */}
          <div className="col-span-6 p-3 border-r-2 border-slate-900 space-y-1">
            <p className="font-black text-sm text-[#0F3D68]">To:</p>
            <p className="font-extrabold text-sm text-slate-900">
              {invoice.customer?.name || 'Authorized Industrial Client'}
            </p>
            {invoice.customer?.address?.street && (
              <p className="text-slate-700">{invoice.customer.address.street}</p>
            )}
            <p className="text-slate-700">
              {invoice.customer?.address?.city || 'Tamil Nadu'}, {invoice.customer?.address?.postalCode || '626125'}
            </p>
            <p className="text-slate-700">
              Phone: {invoice.customer?.phone || '+91 98765 43210'}
            </p>
            <p className="text-slate-700">
              Email: {invoice.customer?.email || 'client@example.com'}
            </p>
          </div>

          {/* Invoice Meta Right Column */}
          <div className="col-span-6 divide-y border-slate-900 text-[11px] sm:text-xs">
            <div className="grid grid-cols-2 divide-x border-slate-900">
              <div className="p-1.5">
                <span className="font-bold">Invoice No.:</span> <span className="font-mono font-bold text-navy">{invoice.invoiceNumber || 'INV-2026-001'}</span>
              </div>
              <div className="p-1.5">
                <span className="font-bold">Date:</span> <span>{formatDate(invoice.issuedDate || invoice.createdAt || new Date())}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x border-slate-900">
              <div className="p-1.5">
                <span className="font-bold">Enq No.:</span> <span>ENQ-{new Date().getFullYear()}-042</span>
              </div>
              <div className="p-1.5">
                <span className="font-bold">Enq Dt:</span> <span>{formatDate(invoice.issuedDate || new Date())}</span>
              </div>
            </div>

            <div className="p-1.5">
              <span className="font-bold">Delivery:</span> <span>Doorstep Delhivery (Freight Included)</span>
            </div>

            <div className="p-1.5">
              <span className="font-bold">Payment Term:</span> <span>{invoice.paymentMethod || 'Immediate / Online Gateway'}</span>
            </div>

            <div className="p-1.5">
              <span className="font-bold">Note:</span> <span>100% Genuine MTC Certified Components</span>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border-x-2 border-b-2 border-slate-900 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#7D0038] text-white font-black text-center border-b-2 border-slate-900">
                <th className="py-2 px-2 border-r border-white/40 w-12">SI No</th>
                <th className="py-2 px-3 border-r border-white/40 text-left">Description</th>
                <th className="py-2 px-2 border-r border-white/40 w-16">HSN</th>
                <th className="py-2 px-2 border-r border-white/40 w-14">QTY</th>
                <th className="py-2 px-2 border-r border-white/40 w-14">UOM</th>
                <th className="py-2 px-3 border-r border-white/40 text-right w-24">RATE</th>
                <th className="py-2 px-2 border-r border-white/40 w-16">DISC%</th>
                <th className="py-2 px-3 text-right w-28">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y border-slate-900 font-medium text-slate-900">
              {items.map((item, idx) => {
                const discPct = item.discountPct ?? 46;
                const lineRate = item.unitPrice || item.amount || 0;
                const lineAmount = item.amount || item.unitPrice * (item.quantity || 1);
                return (
                  <tr key={idx} className="border-b border-slate-900">
                    <td className="py-2 px-2 text-center border-r border-slate-900 font-bold">{idx + 1}</td>
                    <td className="py-2 px-3 border-r border-slate-900 font-bold text-darkText">
                      {item.description}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-900 font-mono text-[11px]">{item.hsn || '8482'}</td>
                    <td className="py-2 px-2 text-center border-r border-slate-900 font-bold">{item.quantity || 1}</td>
                    <td className="py-2 px-2 text-center border-r border-slate-900 text-[11px]">{item.uom || 'NOS'}</td>
                    <td className="py-2 px-3 text-right border-r border-slate-900 font-mono">
                      {formatCurrency(lineRate)}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-900 font-bold text-amber-700">
                      {discPct}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-black text-slate-950">
                      {formatCurrency(lineAmount)}
                    </td>
                  </tr>
                );
              })}

              {/* Blank Filler Rows to maintain exact ledger height matching image */}
              {[...Array(Math.max(1, 4 - items.length))].map((_, i) => (
                <tr key={`filler-${i}`} className="border-b border-slate-900 h-8">
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="grid grid-cols-12 border-x-2 border-b-2 border-slate-900 text-xs">
          {/* Left space */}
          <div className="col-span-7 border-r-2 border-slate-900 p-2 flex flex-col justify-end">
            <div className="grid grid-cols-3 border-t border-slate-900 pt-1 text-[11px]">
              <div className="font-bold">TAXABLE VALUE</div>
              <div className="font-bold text-center">IGST RATE</div>
              <div className="font-bold text-right">IGST AMOUNT</div>
            </div>
            <div className="grid grid-cols-3 text-xs font-mono font-bold pt-1">
              <div>{formatCurrency(subtotal)}</div>
              <div className="text-center">{taxRate}%</div>
              <div className="text-right">{formatCurrency(taxAmount)}</div>
            </div>
          </div>

          {/* Right Subtotal and Large Maroon Grand Total Box */}
          <div className="col-span-5 flex flex-col justify-between">
            <div className="p-2 flex justify-between items-center font-bold border-b border-slate-900">
              <span className="uppercase tracking-wider">TOTAL</span>
              <span className="font-mono text-sm">{formatCurrency(subtotal)}</span>
            </div>

            {/* Grand Total Box (Deep Maroon Background, White Text) */}
            <div className="bg-[#7D0038] text-white p-3 flex flex-col items-center justify-center">
              <span className="text-xs font-black tracking-widest uppercase">GRAND TOTAL</span>
              <span className="text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* AMOUNT IN WORDS */}
        <div className="grid grid-cols-12 border-x-2 border-b-2 border-slate-900 text-xs">
          <div className="col-span-3 sm:col-span-2 bg-[#7D0038] text-white p-2 font-black text-center flex items-center justify-center border-r-2 border-slate-900 text-[11px]">
            AMOUNT IN WORDS
          </div>
          <div className="col-span-9 sm:col-span-10 p-2 font-bold text-slate-900 flex items-center bg-slate-50 text-xs uppercase">
            {numberToWords(grandTotal)}
          </div>
        </div>

        {/* Declaration, Delhivery Fleet & Bank Details Section */}
        <div className="grid grid-cols-12 border-x-2 border-b-2 border-slate-900 text-xs">
          {/* Left Declaration & Logistics Graphics */}
          <div className="col-span-6 p-3 border-r-2 border-slate-900 flex flex-col justify-between space-y-3">
            <div>
              <p className="font-bold text-slate-950 underline text-[11px]">Declaration:</p>
              <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Goods once sold are covered under manufacturer warranty.
              </p>
            </div>

            {/* Payment & Transport Fleet Banner Graphic matching reference image */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              {/* Payment Brand Icons */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Payment:</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 text-[9px] font-black">VISA</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-black">Mastercard</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[9px] font-black">UPI</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 text-[9px] font-black">NetBanking</span>
                </div>
              </div>

              {/* Delhivery Express Graphic */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-lg p-2 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚚</span>
                  <div>
                    <span className="font-black text-amber-400 tracking-wider text-xs block">DELHIVERY</span>
                    <span className="text-[9px] text-slate-300 block">Express Pan-India Logistics</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-80">
                  <span>✈️</span>
                  <span>🚆</span>
                  <span>🚛</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Signatory & Bank Details */}
          <div className="col-span-6 flex flex-col justify-between">
            {/* For Balumuni & Associates Signatory Box */}
            <div className="p-3 text-center border-b-2 border-slate-900 space-y-6">
              <p className="font-black text-xs text-navy uppercase">
                For Balumuni & Associates
              </p>
              <div className="h-6" />
              <p className="font-bold text-[11px] text-slate-700">
                (Authorised Signatory)
              </p>
            </div>

            {/* Bank Account Details Table matching Image 3 */}
            <div className="divide-y border-slate-900 text-[11px] bg-slate-50">
              <div className="p-1.5 font-bold text-navy bg-slate-200">
                Bank Account Details
              </div>
              <div className="grid grid-cols-12 p-1 pl-2">
                <span className="col-span-5 font-bold text-slate-700">Bank Name:</span>
                <span className="col-span-7 font-extrabold text-slate-950">Federal bank</span>
              </div>
              <div className="grid grid-cols-12 p-1 pl-2">
                <span className="col-span-5 font-bold text-slate-700">Name:</span>
                <span className="col-span-7 font-extrabold text-slate-950">Balumuni And</span>
              </div>
              <div className="grid grid-cols-12 p-1 pl-2">
                <span className="col-span-5 font-bold text-slate-700">A/C No.:</span>
                <span className="col-span-7 font-mono font-black text-slate-950">25570200001934</span>
              </div>
              <div className="grid grid-cols-12 p-1 pl-2">
                <span className="col-span-5 font-bold text-slate-700">IFS Code:</span>
                <span className="col-span-7 font-mono font-bold text-slate-950">FDRL0002557</span>
              </div>
              <div className="grid grid-cols-12 p-1 pl-2">
                <span className="col-span-5 font-bold text-slate-700">Branch:</span>
                <span className="col-span-7 font-extrabold text-slate-950">Srivilliputhur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Computer Generated Notice */}
        <div className="py-1 text-center text-[10px] text-slate-600 font-semibold border-x-2 border-slate-900 bg-white">
          *This is Computer Generated Invoice
        </div>

        {/* Mandatory Tamil Tagline at the Bottom */}
        <div className="border-2 border-slate-900 bg-gradient-to-r from-amber-50 via-white to-amber-50 py-3 px-4 text-center">
          <p className="text-base sm:text-lg font-black text-[#7D0038] tracking-wide font-sans">
            உங்கள் நம்பிக்கையில் எங்கள் பயணம்!
          </p>
        </div>

      </div>
    </div>
  );
};
