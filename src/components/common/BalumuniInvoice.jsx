import React from 'react';
import { Printer, Download, FileText, Send, CheckCircle2, ShieldCheck, Mail, Phone, Image as ImageIcon } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Number to Indian Words converter
 */
const numberToWords = (num) => {
  if (!num || isNaN(num)) return 'Zero Rupees Only';
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
  return words ? `${words.trim().toUpperCase()} ONLY` : 'ZERO RUPEES ONLY';
};

/**
 * Pixel-Perfect Balumuni & Associates Quotation & Invoice Component
 * Matches user's exact Excel and Image Reference (media_1795703293848_0a3134c3.png)
 */
export const BalumuniInvoice = ({
  data,
  invoice,
  mode = 'quotation', // 'quotation' | 'invoice'
  onPrint,
  onClose,
  onGenerateInvoice,
  onSendEmail,
  isCustomerView = false,
}) => {
  const doc = data || invoice;
  if (!doc) return null;

  const isInvoiceMode = mode === 'invoice' || Boolean(doc.invoiceGenerated && mode !== 'quotation_only');
  const titleText = isInvoiceMode ? 'INVOICE' : 'QUOTATION';

  // Format Sequential Quotation Number: QT-[Sequential Number]-[Month]-[Year]
  const rawQuotationNumber = doc.quotationNumber || (doc.monthlySequence ? `${doc.monthlySequence}/${new Date().getMonth() + 1}/${String(new Date().getFullYear()).slice(-2)}` : '1/11/26');
  const cleanNum = rawQuotationNumber.replace(/^ENQ\s*No:?\s*/i, '').replace(/^QT:?\s*/i, '').replace(/\//g, '-');
  const formattedEnqNo = `QT-${cleanNum}`;
  const invoiceNumber = doc.invoiceNumber || (isInvoiceMode ? `INV-${cleanNum}` : '');

  // Extract Customer / Party Info
  const customerName = doc.companyName || doc.name || doc.customer?.name || 'SADHURAGIRI COIL';
  const customerAddress = doc.deliveryLocation || (doc.customer?.address ? `${doc.customer.address.street || ''} ${doc.customer.address.city || ''}`.trim() : '') || 'SRIVILLIPUTHUR';
  const customerPhone = doc.phone || doc.customer?.phone || '';
  const customerEmail = doc.email || doc.customer?.email || '';
  const customerGstin = doc.gstin || '';

  // Company Details (From)
  const companyDetails = {
    name: 'BALUMUNI AND ASSOCIATES',
    address: '45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu - 626125',
    phone: '+91 74184 23238',
    email: 'balumuniandassociates@gmail.com',
    gstin: '33HONPK5547G2ZK',
  };

  // Standardize Items Table
  let items = [];
  if (Array.isArray(doc.items) && doc.items.length > 0) {
    items = doc.items.map((it) => {
      const qty = Number(it.quantity) || 1;
      const mrp = Number(it.mrp) || Number(it.unitPrice) || 0;
      const disc = it.discountPercentage !== undefined ? Number(it.discountPercentage) : 48;
      const rate = it.rate !== undefined ? Number(it.rate) : Math.round(mrp * (1 - disc / 100));
      const amount = it.amount !== undefined ? Number(it.amount) : Math.round(rate * qty);
      return {
        description: it.description || `${it.category ? it.category + ' ' : ''}${it.name || it.partNumber || 'Industrial Part'}`,
        hsn: it.hsn || '8482',
        mrp,
        discountPercentage: disc,
        rate,
        quantity: qty,
        amount,
      };
    });
  } else {
    const qty = Number(doc.quantity) || 1;
    const target = Number(doc.approvedPrice || doc.targetPrice) || 3900;
    const mrp = Math.round(target * 2);
    items = [
      {
        description: doc.partNumber ? `${doc.brand ? doc.brand + ' - ' : ''}${doc.partNumber}` : '22213 EAKD -MAKE -NTN',
        hsn: '8482',
        mrp: mrp > 0 ? mrp : 7800,
        discountPercentage: 50,
        rate: target > 0 ? target : 3900,
        quantity: qty,
        amount: (target > 0 ? target : 3900) * qty,
      },
    ];
  }

  const deliveryCharge = Number(doc.deliveryCharge) || 0;
  const subtotal = doc.subtotal || items.reduce((acc, it) => acc + (it.amount || 0), 0);
  const itemsAndDeliveryTotal = subtotal + deliveryCharge;
  const taxRate = Number(doc.taxRate) || 18;
  const taxAmount = doc.taxAmount || Math.round((itemsAndDeliveryTotal * (taxRate / 100)) * 100) / 100;
  const grandTotal = doc.totalAmount || Math.round((itemsAndDeliveryTotal + taxAmount) * 100) / 100;

  const paymentTerms = doc.paymentTerms || '7 DAYS CREDIT';
  const deliveryTerms = doc.deliveryTerms || 'SELF TO SRIVIL';
  const dateFormatted = formatDate(doc.invoiceDate || doc.createdAt || new Date()).replace(/\//g, '.');
  const enqDateFormatted = formatDate(doc.createdAt || new Date()).replace(/\//g, '.');

  // Customer images if attached
  const customerImages = Array.isArray(doc.customerImages) ? doc.customerImages : [];

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  /**
   * High-Resolution jsPDF Download strictly matching Reference Image
   */
  const handleDownloadPdf = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const maroonColor = [125, 0, 56]; // #7D0038
    const navyBlue = [15, 61, 104]; // #0F3D68

    // 1. Outer Border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.rect(10, 10, pageWidth - 20, 277);

    // 2. Header Top Left: BM Logo
    pdf.setFont('times', 'bold');
    pdf.setFontSize(36);
    pdf.setTextColor(...navyBlue);
    pdf.text('BM', 25, 24);
    pdf.setDrawColor(217, 119, 6); // Gold curve
    pdf.setLineWidth(1.2);
    pdf.line(16, 27, 44, 27);

    // Vertical line separating logo & company header
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.line(50, 10, 50, 38);

    // Company Header Top Right
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(...navyBlue);
    pdf.text('BALUMUNI AND ASSOCIATES', 130, 17, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(30, 41, 59);
    pdf.text(
      '45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu - 626125',
      130,
      22,
      { align: 'center', maxWidth: 140 }
    );

    // Sub-bar under address: GSTIN | Mail
    pdf.setLineWidth(0.3);
    pdf.line(10, 31, pageWidth - 10, 31);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('GSTIN: 33HONPK5547G2ZK', 14, 35.5);
    pdf.text('Mail : balumuniandassociates@gmail.com', 120, 35.5);

    // 3. Maroon Title Bar: QUOTATION or INVOICE
    pdf.line(10, 38, pageWidth - 10, 38);
    pdf.setFillColor(...maroonColor);
    pdf.rect(10, 38, pageWidth - 20, 8, 'F');

    // Centered White Box with Title
    pdf.setFillColor(255, 255, 255);
    pdf.rect(pageWidth / 2 - 25, 39, 50, 6, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...navyBlue);
    pdf.text(titleText, pageWidth / 2, 43.5, { align: 'center' });

    // 4. Details Section (From / To / Meta)
    pdf.setLineWidth(0.4);
    pdf.line(10, 46, pageWidth - 10, 46);

    let startY = 46;
    if (isInvoiceMode) {
      // INVOICE: Two Separate Columns - FROM & TO side by side (Req 10)
      pdf.setLineWidth(0.3);
      pdf.line(pageWidth / 2, startY, pageWidth / 2, startY + 28);
      pdf.line(10, startY + 28, pageWidth - 10, startY + 28);

      // Left Column: FROM (Company Details)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...navyBlue);
      pdf.text('From:', 14, startY + 5);
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(companyDetails.name, 14, startY + 10);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.text(companyDetails.address, 14, startY + 14, { maxWidth: 85 });
      pdf.text(`Phone: ${companyDetails.phone}`, 14, startY + 22);
      pdf.text(`GSTIN: ${companyDetails.gstin}`, 14, startY + 26);

      // Right Column: TO (Customer Details) + Invoice Meta
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(...navyBlue);
      pdf.text('To:', pageWidth / 2 + 4, startY + 5);
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(customerName, pageWidth / 2 + 4, startY + 10);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.text(customerAddress, pageWidth / 2 + 4, startY + 14, { maxWidth: 85 });
      pdf.text(`Phone: ${customerPhone || 'N/A'}  |  GSTIN: ${customerGstin || 'Unregistered'}`, pageWidth / 2 + 4, startY + 22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Invoice No.: ${invoiceNumber || 'INV-001'}  |  Date: ${dateFormatted}`, pageWidth / 2 + 4, startY + 26);

      startY += 28;
    } else {
      // QUOTATION: Left: TO | Right: Invoice No, Enq No, Delivery, Payment Term
      pdf.setLineWidth(0.3);
      pdf.line(pageWidth / 2 + 5, startY, pageWidth / 2 + 5, startY + 26);
      pdf.line(10, startY + 26, pageWidth - 10, startY + 26);

      // Left Column: TO
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(0, 0, 0);
      pdf.text('To', 14, startY + 5);
      pdf.text(customerName.toUpperCase(), 14, startY + 10);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.text(customerAddress.toUpperCase(), 14, startY + 14, { maxWidth: 80 });
      if (customerPhone) pdf.text(`Phone: ${customerPhone}`, 14, startY + 20);
      if (customerGstin) pdf.text(`GSTIN: ${customerGstin}`, 14, startY + 24);

      // Right Column: Meta details
      const rightX = pageWidth / 2 + 8;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.text('Invoice No.:', rightX, startY + 5);
      pdf.text(`Date: ${dateFormatted}`, rightX + 45, startY + 5);

      pdf.text(formattedEnqNo, rightX, startY + 10);
      pdf.text(`Enq Dt: ${enqDateFormatted}`, rightX + 45, startY + 10);

      pdf.text(`Delivery: ${deliveryTerms}`, rightX, startY + 15);
      pdf.text(`Payment Term: ${paymentTerms}`, rightX, startY + 20);
      pdf.text('Note: 100% Genuine Certified Industrial Parts', rightX, startY + 25);

      startY += 26;
    }

    // 5. Itemized Table using autoTable
    const tableHeaders = [['SI No', 'Description', 'HSN', 'MRP', 'DISC%', 'RATE', 'QTY', 'AMOUNT']];
    const tableRows = items.map((it, idx) => [
      String(idx + 1),
      it.description,
      it.hsn || '8482',
      String(it.mrp || ''),
      `${it.discountPercentage || 48}%`,
      String(it.rate || ''),
      String(it.quantity || 1),
      String(it.amount || ''),
    ]);

    if (deliveryCharge > 0) {
      tableRows.push(['', 'DELEVERY CHARGE', '', '', '', '', '1', String(deliveryCharge)]);
    }

    // Add empty filler rows to match ledger aesthetic
    while (tableRows.length < 5) {
      tableRows.push(['', '', '', '', '', '', '', '']);
    }

    autoTable(pdf, {
      startY: startY,
      head: tableHeaders,
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: maroonColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'left', cellWidth: 70 },
        2: { halign: 'center', cellWidth: 16 },
        3: { halign: 'right', cellWidth: 18 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'right', cellWidth: 18 },
        6: { halign: 'center', cellWidth: 12 },
        7: { halign: 'right', cellWidth: 29 },
      },
      margin: { left: 10, right: 10 },
    });

    const finalY = pdf.lastAutoTable.finalY || 160;

    // 6. Totals Box
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    pdf.rect(10, finalY, pageWidth - 20, 16);

    // Taxable info left side
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text('TAXABLE VALUE', 14, finalY + 5);
    pdf.text('IGST RATE', 48, finalY + 5);
    pdf.text('IGST AMOUNT', 78, finalY + 5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(String(itemsAndDeliveryTotal), 14, finalY + 11);
    pdf.text(`${taxRate}%`, 52, finalY + 11);
    pdf.text(String(taxAmount), 82, finalY + 11);

    // Total & Grand Total right side
    pdf.line(115, finalY, 115, finalY + 16);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('TOTAL', 125, finalY + 6);
    pdf.text(String(itemsAndDeliveryTotal), pageWidth - 14, finalY + 6, { align: 'right' });

    pdf.line(115, finalY + 8, pageWidth - 10, finalY + 8);
    pdf.setFillColor(...maroonColor);
    pdf.rect(115, finalY + 8, 45, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.text('GRAND TOTAL', 120, finalY + 13.5);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(String(grandTotal), pageWidth - 14, finalY + 13.5, { align: 'right' });

    // 7. Amount in Words Row
    const wordsY = finalY + 16;
    pdf.setFillColor(...maroonColor);
    pdf.rect(10, wordsY, 35, 7, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text('AMOUNT IN WORDS', 12, wordsY + 4.5);

    pdf.setDrawColor(0, 0, 0);
    pdf.rect(45, wordsY, pageWidth - 55, 7);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(7.5);
    pdf.text(numberToWords(grandTotal), 48, wordsY + 4.5);

    // 8. Declaration & Bank Details Section
    const bottomY = wordsY + 7;
    pdf.rect(10, bottomY, pageWidth - 20, 48);
    pdf.line(pageWidth / 2, bottomY, pageWidth / 2, bottomY + 48);

    // Left: Declaration & Transport Fleet
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text('Declaration:', 14, bottomY + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.text(
      'We declare that this quotation/invoice shows the actual price of the goods described and that all particulars are true and correct.',
      14,
      bottomY + 10,
      { maxWidth: 85 }
    );
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text('DELHIVERY Express Pan-India Transport & Logistics', 14, bottomY + 24);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.text('Official GST E-Way Bill Generated for Direct Industrial Dispatch', 14, bottomY + 28);

    // Right: Signatory & Bank Details
    const sigX = pageWidth / 2 + 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('For Balumuni & Associates', sigX + 15, bottomY + 6);
    pdf.setFontSize(7);
    pdf.text('(Authorised Signatory)', sigX + 18, bottomY + 15);

    pdf.line(pageWidth / 2, bottomY + 18, pageWidth - 10, bottomY + 18);
    pdf.text('Bank Account Details', sigX + 2, bottomY + 23);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text('Bank Name: Federal bank', sigX + 2, bottomY + 28);
    pdf.text('Name: Balumuni And', sigX + 2, bottomY + 33);
    pdf.text('A/C No.: 25570200001934', sigX + 2, bottomY + 38);
    pdf.text('IFS Code: FDRL0002557', sigX + 2, bottomY + 43);
    pdf.text('Branch: Srivilliputhur', sigX + 50, bottomY + 43);

    // 9. Footer Computer Generated Notice
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`*This is Computer Generated ${titleText}`, pageWidth / 2, 282, { align: 'center' });

    pdf.save(`${titleText}_${rawQuotationNumber.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="flex flex-wrap justify-between items-center bg-slate-100 p-3 rounded-2xl border border-slate-300 print:hidden gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black text-navy uppercase tracking-wider">
            Official Balumuni &amp; Associates {titleText} Format
          </span>
          <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-primary">
            {formattedEnqNo}
          </span>
          {isInvoiceMode && invoiceNumber && (
            <span className="text-[11px] font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
              #{invoiceNumber}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Admin Invoice Generation Trigger (Req 10) */}
          {!isCustomerView && !isInvoiceMode && onGenerateInvoice && (
            <button
              type="button"
              onClick={onGenerateInvoice}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 text-white font-black text-xs hover:bg-emerald-800 transition-smooth shadow-xs cursor-pointer"
              title="Generate Official Invoice from this Quotation"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Generate Invoice</span>
            </button>
          )}

          {/* Admin Email Trigger (Req 11) */}
          {!isCustomerView && onSendEmail && (
            <button
              type="button"
              onClick={onSendEmail}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition-smooth shadow-xs cursor-pointer"
              title="Send to Customer via Email"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>
          )}

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy text-accent font-bold text-xs hover:bg-primary hover:text-white transition-smooth shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print {titleText}</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-smooth shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-smooth cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Document Layout matching Image 3 (media_1795703293848_0a3134c3.png) */}
      <div className="bg-white border-2 border-slate-900 text-slate-950 font-sans p-4 sm:p-6 rounded-none shadow-xl max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none select-text">
        
        {/* Top Header Grid */}
        <div className="grid grid-cols-12 border-2 border-slate-900">
          {/* BM Logo Box */}
          <div className="col-span-3 sm:col-span-4 p-3 flex flex-col justify-center items-center border-r-2 border-slate-900 bg-white">
            <div className="relative flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black text-[#0F3D68] tracking-tighter font-serif">
                BM
              </span>
              <div className="w-20 sm:w-24 h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-full mt-[-4px] shadow-xs" />
            </div>
          </div>

          {/* Company Details Right Header */}
          <div className="col-span-9 sm:col-span-8 flex flex-col justify-between">
            <div className="p-2 sm:p-3 text-center space-y-1">
              <h1 className="text-lg sm:text-2xl font-black text-[#0F3D68] tracking-wider uppercase font-sans">
                BALUMUNI AND ASSOCIATES
              </h1>
              <p className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight max-w-lg mx-auto">
                45B/16 Noorullah Mall, Oothumalai Paradesimadam Street, Srivilliputtur, Virudhunagar Dist, Tamilnadu – 626125
              </p>
            </div>

            {/* GSTIN and Mail Bar */}
            <div className="border-t-2 border-slate-900 grid grid-cols-2 text-[10px] sm:text-xs font-bold bg-white">
              <div className="p-1.5 pl-3 border-r-2 border-slate-900 whitespace-nowrap">
                GSTIN: <span className="font-mono font-bold">33HONPK5547G2ZK</span>
              </div>
              <div className="p-1.5 pl-3 text-blue-900 truncate">
                Mail : <span className="underline">balumuniandassociates@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Maroon Title Bar with Inset White Box (QUOTATION / INVOICE) */}
        <div className="bg-[#7D0038] py-1 border-x-2 border-b-2 border-slate-900 flex justify-center items-center">
          <div className="bg-white px-8 py-0.5 border border-slate-900 shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-[#0F3D68] tracking-widest uppercase">
              {titleText}
            </h2>
          </div>
        </div>

        {/* Details Section: Two Column Layout */}
        <div className="grid grid-cols-12 border-x-2 border-b-2 border-slate-900 text-xs">
          {isInvoiceMode ? (
            /* INVOICE MODE: FROM (Company) and TO (Customer) SIDE BY SIDE (Req 10) */
            <>
              {/* FROM Column */}
              <div className="col-span-6 p-3 border-r-2 border-slate-900 space-y-1">
                <p className="font-black text-xs text-[#0F3D68] uppercase tracking-wider">From:</p>
                <p className="font-extrabold text-xs text-slate-950 uppercase">{companyDetails.name}</p>
                <p className="text-[11px] text-slate-700 leading-snug">{companyDetails.address}</p>
                <p className="text-[11px] text-slate-800">Phone: <strong>{companyDetails.phone}</strong></p>
                <p className="text-[11px] text-slate-800">GSTIN: <strong className="font-mono">{companyDetails.gstin}</strong></p>
              </div>

              {/* TO Column + Meta Details */}
              <div className="col-span-6 p-3 space-y-1">
                <p className="font-black text-xs text-[#0F3D68] uppercase tracking-wider">To:</p>
                <p className="font-extrabold text-sm text-slate-950 uppercase">{customerName}</p>
                <p className="text-[11px] text-slate-700 leading-snug">{customerAddress}</p>
                {customerPhone && <p className="text-[11px] text-slate-800">Phone: {customerPhone}</p>}
                {customerGstin && <p className="text-[11px] text-slate-800">GSTIN: <strong className="font-mono">{customerGstin}</strong></p>}
                <div className="pt-2 mt-2 border-t border-slate-300 grid grid-cols-2 text-[11px]">
                  <div><span className="font-bold">Invoice No.:</span> <span className="font-mono font-bold text-navy">{invoiceNumber || 'INV-001'}</span></div>
                  <div><span className="font-bold">Date:</span> {dateFormatted}</div>
                  <div><span className="font-bold">Enq No.:</span> {rawQuotationNumber}</div>
                  <div><span className="font-bold">Delivery:</span> {deliveryTerms}</div>
                </div>
              </div>
            </>
          ) : (
            /* QUOTATION MODE: Left: TO | Right: Meta Table strictly matching Image 3 */
            <>
              {/* Left Column: TO */}
              <div className="col-span-6 p-3 border-r-2 border-slate-900 space-y-1">
                <p className="font-black text-xs text-[#0F3D68] uppercase tracking-wider">To</p>
                <p className="font-black text-sm text-slate-950 uppercase">{customerName}</p>
                <p className="font-extrabold text-xs text-slate-800 uppercase">{customerAddress}</p>
                {customerPhone && <p className="text-[11px] text-slate-600">Phone: {customerPhone}</p>}
                {customerEmail && <p className="text-[11px] text-slate-600">Email: {customerEmail}</p>}
                {customerGstin && <p className="text-[11px] text-slate-700">GSTIN: <span className="font-mono font-bold">{customerGstin}</span></p>}
              </div>

              {/* Right Column: Meta details strictly matching Image 3 */}
              <div className="col-span-6 divide-y border-slate-900 text-[11px]">
                <div className="grid grid-cols-2 divide-x border-slate-900">
                  <div className="p-1.5"><span className="font-bold">Invoice No.:</span> <span>—</span></div>
                  <div className="p-1.5"><span className="font-bold">Date:</span> <span>{dateFormatted}</span></div>
                </div>

                <div className="grid grid-cols-2 divide-x border-slate-900">
                  <div className="p-1.5 font-bold text-[#7D0038]">
                    <span>{formattedEnqNo}</span>
                  </div>
                  <div className="p-1.5"><span className="font-bold">Enq Dt:</span> <span>{enqDateFormatted}</span></div>
                </div>

                <div className="p-1.5"><span className="font-bold">Delivery:</span> <span className="uppercase">{deliveryTerms}</span></div>
                <div className="p-1.5"><span className="font-bold">Payment Term:</span> <span className="uppercase">{paymentTerms}</span></div>
                <div className="p-1.5"><span className="font-bold">Note:</span> <span>100% Genuine Certified Industrial Parts</span></div>
              </div>
            </>
          )}
        </div>

        {/* Itemized Table matching Reference Image 3: SI No, Description, HSN, MRP, DISC%, RATE, QTY, AMOUNT */}
        <div className="border-x-2 border-b-2 border-slate-900 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#7D0038] text-white font-black text-center border-b-2 border-slate-900">
                <th className="py-2 px-2 border-r border-white/40 w-12">SI No</th>
                <th className="py-2 px-3 border-r border-white/40 text-left">Description</th>
                <th className="py-2 px-2 border-r border-white/40 w-16">HSN</th>
                <th className="py-2 px-3 border-r border-white/40 text-right w-20">MRP</th>
                <th className="py-2 px-2 border-r border-white/40 w-16">DISC%</th>
                <th className="py-2 px-3 border-r border-white/40 text-right w-20">RATE</th>
                <th className="py-2 px-2 border-r border-white/40 w-12">QTY</th>
                <th className="py-2 px-3 text-right w-24">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y border-slate-900 font-medium text-slate-900">
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-900">
                  <td className="py-2 px-2 text-center border-r border-slate-900 font-bold">{idx + 1}</td>
                  <td className="py-2 px-3 border-r border-slate-900 font-bold text-darkText uppercase">
                    {item.description}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-900 font-mono text-[11px]">{item.hsn || '8482'}</td>
                  <td className="py-2 px-3 text-right border-r border-slate-900 font-mono">
                    {item.mrp ? item.mrp : '—'}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-900 font-bold text-amber-800">
                    {item.discountPercentage}%
                  </td>
                  <td className="py-2 px-3 text-right border-r border-slate-900 font-mono font-bold">
                    {item.rate}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-900 font-bold">{item.quantity}</td>
                  <td className="py-2 px-3 text-right font-mono font-black text-slate-950">
                    {item.amount}
                  </td>
                </tr>
              ))}

              {/* Delivery Charge Row if applicable */}
              {deliveryCharge > 0 && (
                <tr className="border-b border-slate-900">
                  <td className="py-2 px-2 text-center border-r border-slate-900 font-bold">&nbsp;</td>
                  <td className="py-2 px-3 border-r border-slate-900 font-bold uppercase text-slate-800">
                    DELEVERY CHARGE
                  </td>
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td className="border-r border-slate-900">&nbsp;</td>
                  <td className="py-2 px-2 text-center border-r border-slate-900 font-bold">1</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">
                    {deliveryCharge}
                  </td>
                </tr>
              )}

              {/* Filler Rows to maintain exact ledger height matching Image 3 */}
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
          {/* Left Tax Summary */}
          <div className="col-span-7 border-r-2 border-slate-900 p-2 flex flex-col justify-end">
            <div className="grid grid-cols-3 border-t border-slate-900 pt-1 text-[11px] whitespace-nowrap">
              <div className="font-bold">TAXABLE VALUE</div>
              <div className="font-bold text-center">IGST RATE</div>
              <div className="font-bold text-right">IGST AMOUNT</div>
            </div>
            <div className="grid grid-cols-3 text-xs font-mono font-bold pt-1 whitespace-nowrap">
              <div>{itemsAndDeliveryTotal}</div>
              <div className="text-center">{taxRate}%</div>
              <div className="text-right">{taxAmount}</div>
            </div>
          </div>

          {/* Right Subtotal & Maroon Grand Total Box */}
          <div className="col-span-5 flex flex-col justify-between">
            <div className="p-2 flex justify-between items-center font-bold border-b border-slate-900">
              <span className="uppercase tracking-wider">TOTAL</span>
              <span className="font-mono text-sm">{itemsAndDeliveryTotal}</span>
            </div>

            {/* Grand Total Box (Deep Maroon Background, White Text) */}
            <div className="bg-[#7D0038] text-white p-3 flex items-center justify-between">
              <span className="text-xs font-black tracking-widest uppercase">GRAND TOTAL</span>
              <span className="text-2xl font-black font-mono tracking-tight text-white">
                {grandTotal}
              </span>
            </div>
          </div>
        </div>

        {/* AMOUNT IN WORDS */}
        <div className="grid grid-cols-12 border-x-2 border-b-2 border-slate-900 text-xs">
          <div className="col-span-4 sm:col-span-3 bg-[#7D0038] text-white p-2 font-black text-center flex items-center justify-center border-r-2 border-slate-900 text-[11px]">
            AMOUNT IN WORDS
          </div>
          <div className="col-span-8 sm:col-span-9 p-2 font-black text-slate-900 flex items-center bg-slate-50 text-xs uppercase font-mono">
            {numberToWords(grandTotal)}
          </div>
        </div>

        {/* Declaration, Delhivery Fleet & Bank Details */}
        <div className="grid grid-cols-12 border-x-2 border-b-2 border-slate-900 text-xs">
          {/* Left Declaration & Fleet */}
          <div className="col-span-6 p-3 border-r-2 border-slate-900 flex flex-col justify-between space-y-3">
            <div>
              <p className="font-bold text-slate-950 underline text-[11px]">Declaration:</p>
              <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                We declare that this {titleText.toLowerCase()} shows the actual price of the goods described and that all particulars are true and correct.
              </p>
            </div>

            {/* Customer Uploaded Images Gallery if present (Req 5 & 8) */}
            {customerImages.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-navy uppercase block mb-1">
                  Customer Uploaded Part Images:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {customerImages.map((img, i) => (
                    <a
                      key={i}
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-14 h-14 rounded-lg border border-slate-300 overflow-hidden shrink-0 group relative bg-slate-100"
                    >
                      <img src={img.url} alt="Part" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Logistics & Payment Fleet Banner matching Image 3 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Payment:</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 text-[9px] font-black">Bank RTGS / NEFT / UPI</span>
              </div>
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-lg p-2 flex items-center justify-between shadow-2xs">
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
            <div className="p-3 text-center border-b-2 border-slate-900 space-y-4">
              <p className="font-black text-xs text-navy uppercase">
                For Balumuni &amp; Associates
              </p>
              <div className="h-6" />
              <p className="font-bold text-[11px] text-slate-700">
                (Authorised Signatory)
              </p>
            </div>

            {/* Bank Account Details Table matching Image 3 */}
            <div className="divide-y border-slate-900 text-[11px] bg-slate-50">
              <div className="p-1.5 font-bold text-navy bg-slate-200">
                Bank Acccount Details
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
          *This is Computer Generated {titleText}
        </div>

        {/* Tamil Tagline at the Bottom */}
        <div className="border-2 border-slate-900 bg-gradient-to-r from-amber-50 via-white to-amber-50 py-2.5 px-4 text-center">
          <p className="text-base sm:text-lg font-black text-[#7D0038] tracking-wide font-sans">
            உங்கள் நம்பிக்கையில் எங்கள் பயணம்!
          </p>
        </div>

      </div>
    </div>
  );
};
