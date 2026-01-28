import jsPDF from 'jspdf';

export interface InvoiceItem {
  type: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  dueDate: string;
  invoiceDate: string;
  items: InvoiceItem[];
  notes?: string;
  company?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
}

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Company Header
  pdf.setFontSize(24);
  pdf.setFont('Helvetica', 'bold');
  pdf.text('INVOICE', pageWidth - 20, yPosition, { align: 'right' });

  yPosition += 15;
  pdf.setFontSize(10);
  pdf.setFont('Helvetica', 'normal');

  // Company Details (Left side)
  pdf.text(data.company?.name || 'Your Company', 20, yPosition);
  yPosition += 5;
  pdf.setFontSize(8);
  pdf.text(data.company?.address || 'Company Address', 20, yPosition);
  yPosition += 4;
  pdf.text(`Phone: ${data.company?.phone || '(555) 000-0000'}`, 20, yPosition);
  yPosition += 4;
  pdf.text(`Email: ${data.company?.email || 'info@company.com'}`, 20, yPosition);

  // Invoice Number and Dates (Right side)
  yPosition = 35;
  pdf.setFontSize(10);
  pdf.text(`Invoice #: ${data.invoiceNumber}`, pageWidth - 20, yPosition, { align: 'right' });
  yPosition += 5;
  pdf.text(`Invoice Date: ${data.invoiceDate}`, pageWidth - 20, yPosition, { align: 'right' });
  yPosition += 5;
  pdf.text(`Due Date: ${data.dueDate}`, pageWidth - 20, yPosition, { align: 'right' });

  // Bill To Section
  yPosition = 65;
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('BILL TO:', 20, yPosition);

  yPosition += 7;
  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(data.customerName, 20, yPosition);
  yPosition += 5;
  pdf.text(data.customerEmail, 20, yPosition);

  // Line separator
  yPosition += 10;
  pdf.setDrawColor(100, 100, 100);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);

  // Table Headers
  yPosition += 8;
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setFillColor(240, 240, 240);

  const col1 = 20, col2 = 90, col3 = 130, col4 = 160, col5 = pageWidth - 20;
  pdf.rect(col1, yPosition - 3, pageWidth - 40, 5, 'F');
  pdf.text('Item', col1, yPosition);
  pdf.text('Description', col2, yPosition);
  pdf.text('Qty', col3, yPosition, { align: 'center' });
  pdf.text('Unit Price', col4, yPosition, { align: 'right' });
  pdf.text('Total', col5, yPosition, { align: 'right' });

  // Table Data
  yPosition += 7;
  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(8);

  let subtotal = 0;
  const lineHeight = 6;
  const maxLinesPerRow = 2;

  data.items.forEach((item, index) => {
    const itemTotal = item.quantity * item.unitPrice;
    subtotal += itemTotal;

    const itemName = item.name.substring(0, 30);
    const description = (item.description || '').substring(0, 35);

    pdf.text(itemName, col1, yPosition);
    pdf.text(description, col2, yPosition);
    pdf.text(item.quantity.toString(), col3, yPosition, { align: 'center' });
    pdf.text(`$${item.unitPrice.toFixed(2)}`, col4, yPosition, { align: 'right' });
    pdf.text(`$${itemTotal.toFixed(2)}`, col5, yPosition, { align: 'right' });

    yPosition += lineHeight;

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }
  });

  // Subtotal, Tax, Total Section
  yPosition += 5;
  const lineColor = 200;
  pdf.setDrawColor(lineColor, lineColor, lineColor);
  pdf.line(col3, yPosition, col5, yPosition);

  yPosition += 6;
  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(9);

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  pdf.text('Subtotal:', col4, yPosition, { align: 'right' });
  pdf.text(`$${subtotal.toFixed(2)}`, col5, yPosition, { align: 'right' });

  yPosition += 5;
  pdf.text('Tax (10%):', col4, yPosition, { align: 'right' });
  pdf.text(`$${tax.toFixed(2)}`, col5, yPosition, { align: 'right' });

  yPosition += 5;
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setFillColor(240, 240, 240);
  pdf.rect(col4 - 25, yPosition - 3, 25 + (col5 - col4 + 5), 6, 'F');
  pdf.text('TOTAL:', col4, yPosition, { align: 'right' });
  pdf.text(`$${total.toFixed(2)}`, col5, yPosition, { align: 'right' });

  // Notes Section
  if (data.notes) {
    yPosition += 15;
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('NOTES:', 20, yPosition);

    yPosition += 5;
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(8);
    const splitNotes = pdf.splitTextToSize(data.notes, 170);
    pdf.text(splitNotes, 20, yPosition);
  }

  // Footer
  yPosition = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition + 5, { align: 'center' });

  return pdf;
}

export function downloadInvoicePDF(pdf: jsPDF, invoiceNumber: string) {
  pdf.save(`Invoice_${invoiceNumber}_${Date.now()}.pdf`);
}
