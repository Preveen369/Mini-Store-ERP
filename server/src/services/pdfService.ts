import { jsPDF } from 'jspdf';
import { ISale } from '../models';

export class PDFService {
  constructor() {}

  async generateInvoicePDF(sale: ISale): Promise<Buffer> {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header - Invoice Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Invoice Number
      doc.setFontSize(16);
      doc.text(`#${sale.invoiceNumber}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Date and Time
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${sale.date.toLocaleDateString()}`, 20, yPos);
      doc.text(`Time: ${sale.date.toLocaleTimeString()}`, 120, yPos);
      yPos += 10;

      // Customer Info (if available)
      if (sale.customer && sale.customer.name) {
        doc.text(`Customer: ${sale.customer.name}`, 20, yPos);
        if (sale.customer.phone) {
          doc.text(`Phone: ${sale.customer.phone}`, 120, yPos);
        }
        yPos += 10;
      }

      // Payment Method
      doc.text(`Payment Method: ${sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}`, 20, yPos);
      yPos += 15;

      // Table Header
      doc.setFillColor(243, 244, 246);
      doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('Item', 25, yPos);
      doc.text('Qty', pageWidth - 90, yPos, { align: 'right' });
      doc.text('Price', pageWidth - 60, yPos, { align: 'right' });
      doc.text('Total', pageWidth - 25, yPos, { align: 'right' });
      yPos += 8;

      // Table Items
      doc.setFont('helvetica', 'normal');
      sale.items.forEach((item: any) => {
        const itemTotal = (item.qty * item.sellPrice).toFixed(2);
        
        doc.text(item.name, 25, yPos);
        doc.text(item.qty.toString(), pageWidth - 90, yPos, { align: 'right' });
        doc.text(`$${item.sellPrice.toFixed(2)}`, pageWidth - 60, yPos, { align: 'right' });
        doc.text(`$${itemTotal}`, pageWidth - 25, yPos, { align: 'right' });
        yPos += 7;
      });

      yPos += 10;

      // Totals Section
      doc.setDrawColor(229, 231, 235);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      // Subtotal
      doc.text('Subtotal:', pageWidth - 80, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${sale.subtotal.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;

      // Discount (if applicable)
      if (sale.discount > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(220, 38, 38);
        doc.text('Discount:', pageWidth - 80, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(`-$${sale.discount.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        yPos += 7;
      }

      // Tax
      doc.setFont('helvetica', 'normal');
      doc.text('Tax:', pageWidth - 80, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${sale.taxes.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 10;

      // Total
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 8;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Total:', pageWidth - 80, yPos);
      doc.setTextColor(22, 163, 74);
      doc.setFontSize(18);
      doc.text(`$${sale.total.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      yPos += 15;

      // Footer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your business!', pageWidth / 2, yPos + 20, { align: 'center' });

      // Convert to Buffer
      const pdfArrayBuffer = doc.output('arraybuffer');
      return Buffer.from(pdfArrayBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }
}

export const pdfService = new PDFService();
