import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './formatters';

export const generatePurchaseInvoicePdf = (invoice, download = true) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Primary Theme Colors
  const navyColor = [15, 23, 42]; // #0f172a
  const blueColor = [30, 58, 138]; // #1e3a8a
  const goldColor = [217, 119, 6]; // #d97706
  const grayColor = [100, 116, 139]; // #64748b
  const lightBg = [248, 250, 252]; // #f8fafc

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...blueColor);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('INDUSTRIAL POWER TRANSMISSION & BEARINGS SOLUTIONS', pageWidth / 2, 10, { align: 'center' });

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...navyColor);
  doc.text('BALUMUNI AND ASSOCIATES', 14, 18);

  // Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...blueColor);
  doc.text('INDUSTRIAL POWER TRANSMISSION & BEARINGS', 14, 23);

  // Address & Contacts
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Proprietor: K. Karthick Kumar  |  GSTIN: 33HONPK5547G2Z', 14, 28);
  doc.text('45B/16 Noorullah Mall, Oothumalai Paradesimadam St, Srivilliputtur - 626125', 14, 32);
  doc.text('Phone: +91 74184 23238  |  Email: balumuniandassociates@gmail.com', 14, 36);

  // Right Side - Invoice Type Badge & Numbers
  doc.setFillColor(...lightBg);
  doc.roundedRect(pageWidth - 75, 14, 61, 24, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageWidth - 75, 14, 61, 24, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...blueColor);
  doc.text('PURCHASE INWARD VOUCHER', pageWidth - 70, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...navyColor);
  doc.text(`Voucher #: ${invoice.invoiceNumber || 'PUR-XXXX'}`, pageWidth - 70, 25);
  doc.text(`Vendor Bill #: ${invoice.vendorInvoiceNumber || 'N/A'}`, pageWidth - 70, 30);
  doc.text(`Date: ${formatDate(invoice.purchaseDate)}`, pageWidth - 70, 35);

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 41, pageWidth - 14, 41);

  // 2. Supplier / Vendor Details Box
  const supplier = invoice.supplier || {};
  const supAddress = supplier.address || {};
  const fullAddress = [
    supAddress.street,
    supAddress.city,
    supAddress.state,
    supAddress.pincode ? `- ${supAddress.pincode}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  doc.setFillColor(...lightBg);
  doc.roundedRect(14, 45, pageWidth - 28, 25, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 45, pageWidth - 28, 25, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...blueColor);
  doc.text('SUPPLIER / VENDOR DETAILS:', 18, 51);
  doc.text('STATUS & DISPATCH:', pageWidth / 2 + 10, 51);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...navyColor);
  doc.text(invoice.supplierName || supplier.name || 'Vendor', 18, 57);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  const contactText = [supplier.contactPerson && `Attn: ${supplier.contactPerson}`, supplier.phone && `Tel: ${supplier.phone}`]
    .filter(Boolean)
    .join(' | ');
  doc.text(contactText || 'Industrial Vendor', 18, 61);
  doc.text(fullAddress || 'Address on record', 18, 65);
  if (supplier.gstin) {
    doc.text(`GSTIN: ${supplier.gstin}`, 18, 68);
  }

  // Right Side Info in Vendor box
  doc.text(`Inward Status: ${invoice.status || 'Received'}`, pageWidth / 2 + 10, 57);
  doc.text(`Payment Status: ${invoice.paymentStatus || 'Unpaid'}`, pageWidth / 2 + 10, 61);
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, pageWidth / 2 + 10, 65);
  if (invoice.warehouseLocation) {
    doc.text(`Storage: ${invoice.warehouseLocation}`, pageWidth / 2 + 10, 68);
  }

  // 3. Line Items Table
  const tableRows = (invoice.items || []).map((item, idx) => [
    idx + 1,
    `${item.itemName || 'Material'}${item.partNumber ? `\nPart: ${item.partNumber}` : ''}`,
    item.category || 'General',
    item.hsnCode || '8482',
    `${item.quantity} ${item.unit || 'PCS'}`,
    `Rs. ${Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `${item.taxRate || 18}%`,
    `Rs. ${Number(item.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    `Rs. ${Number(item.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: 74,
    head: [['#', 'Material Description', 'Category', 'HSN', 'Qty', 'Unit Rate', 'GST %', 'GST Amt', 'Line Total']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: blueColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 50 },
      2: { cellWidth: 26 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 18 },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'right', cellWidth: 20 },
      8: { halign: 'right', cellWidth: 24 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable.finalY + 6;

  // 4. Totals & Financial Summary Card
  const summaryBoxWidth = 85;
  const summaryBoxX = pageWidth - 14 - summaryBoxWidth;
  const summaryBoxY = finalY;

  // Payments / Notes Left Box
  const notesWidth = pageWidth - 28 - summaryBoxWidth - 6;
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, summaryBoxY, notesWidth, 44, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, summaryBoxY, notesWidth, 44, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...blueColor);
  doc.text('PAYMENT HISTORY & RECORD:', 18, summaryBoxY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...navyColor);

  if (invoice.payments && invoice.payments.length > 0) {
    invoice.payments.slice(0, 3).forEach((p, pIdx) => {
      doc.text(
        `• ${formatDate(p.paymentDate)}: Rs. ${Number(p.amount).toLocaleString('en-IN')} via ${p.paymentMethod || 'Bank'} (${p.referenceNumber || 'N/A'})`,
        18,
        summaryBoxY + 12 + pIdx * 5
      );
    });
  } else {
    doc.text('No payment transactions recorded yet.', 18, summaryBoxY + 14);
  }

  if (invoice.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...grayColor);
    doc.text(`Notes: ${invoice.notes.substring(0, 90)}`, 18, summaryBoxY + 34);
  }

  // Summary Totals Right Card
  doc.setFillColor(...lightBg);
  doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, 44, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, 44, 2, 2, 'D');

  const rows = [
    { label: 'Subtotal:', value: `Rs. ${Number(invoice.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Total GST (CGST + SGST):', value: `Rs. ${Number(invoice.taxTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Freight / Shipping:', value: `Rs. ${Number(invoice.shippingCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Discount:', value: `- Rs. ${Number(invoice.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Grand Total:', value: `Rs. ${Number(invoice.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, bold: true, highlight: true },
    { label: 'Paid Amount:', value: `Rs. ${Number(invoice.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'Balance Due:', value: `Rs. ${Number(invoice.balanceDue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, bold: true, color: goldColor },
  ];

  let currentY = summaryBoxY + 5;
  rows.forEach((r) => {
    doc.setFont('helvetica', r.bold ? 'bold' : 'normal');
    doc.setFontSize(r.highlight ? 9 : 8);
    doc.setTextColor(...(r.color || (r.highlight ? blueColor : navyColor)));
    doc.text(r.label, summaryBoxX + 4, currentY);
    doc.text(r.value, summaryBoxX + summaryBoxWidth - 4, currentY, { align: 'right' });
    currentY += 5.5;
  });

  // 5. Signatures Footer
  const signY = pageHeight - 32;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, signY, 70, signY);
  doc.line(pageWidth - 70, signY, pageWidth - 14, signY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Received & Verified By (Store Incharge)', 14, signY + 5);
  doc.text('For Balumuni and Associates', pageWidth - 14, signY + 5, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.text('Authorised Signatory', pageWidth - 14, signY + 10, { align: 'right' });

  // Bottom Notice
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text('This is an official computer-generated Material Purchase & Inward Document of Balumuni and Associates.', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save or return
  if (download) {
    const filename = `${invoice.invoiceNumber || 'PUR-INVOICE'}_${invoice.supplierName || 'Vendor'}.pdf`.replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(filename);
  }

  return doc;
};
