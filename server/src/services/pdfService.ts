import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import { ISale } from '../models';

export class PDFService {
  constructor() {}

  async generateInvoicePDF(sale: ISale): Promise<Buffer> {
    try {
      // Load HTML template
      const templateHtml = await this.getInvoiceTemplate();
      const template = handlebars.compile(templateHtml);

      // Prepare data
      const data = {
        invoiceNumber: sale.invoiceNumber,
        date: sale.date.toLocaleDateString(),
        time: sale.date.toLocaleTimeString(),
        customer: sale.customer,
        items: sale.items.map(item => ({
          name: item.name,
          qty: item.qty,
          price: item.sellPrice.toFixed(2),
          total: (item.qty * item.sellPrice).toFixed(2),
        })),
        subtotal: sale.subtotal.toFixed(2),
        taxes: sale.taxes.toFixed(2),
        discount: sale.discount.toFixed(2),
        showDiscount: sale.discount > 0,
        total: sale.total.toFixed(2),
        paymentMethod: sale.paymentMethod,
      };

      const html = template(data);

      // Generate PDF in memory
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html);

      // Generate PDF as buffer (no file system storage)
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      await browser.close();

      // Return buffer directly
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }

  private async getInvoiceTemplate(): Promise<string> {
    // Template matching SalesPage invoice modal format
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      padding: 24px;
      color: #000;
      background: #fff;
    }
    .invoice-container {
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .header h1 {
      font-size: 30px;
      font-weight: bold;
      color: #000;
      margin-bottom: 8px;
      letter-spacing: 0.05em;
    }
    .header .invoice-number {
      font-size: 20px;
      color: #000;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }
    .info-item {
      margin-bottom: 0;
    }
    .info-label {
      font-size: 14px;
      color: #000;
      margin-bottom: 4px;
    }
    .info-value {
      font-weight: 600;
      color: #000;
      font-size: 15px;
    }
    .info-value.capitalize {
      text-transform: capitalize;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    thead {
      background-color: #f3f4f6;
    }
    thead tr th {
      border: none;
    }
    th {
      padding: 10px 16px;
      text-align: left;
      font-weight: 600;
      color: #000;
      border: none;
    }
    th.text-right {
      text-align: right;
    }
    tbody tr {
      border-bottom: 1px solid #e5e7eb;
    }
    tbody tr:last-child {
      border-bottom: none;
    }
    td {
      padding: 10px 16px;
      color: #000;
      border: none;
    }
    td.text-right {
      text-align: right;
    }
    .totals-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      margin-top: 8px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .totals-row .label {
      color: #000;
    }
    .totals-row .value {
      font-weight: 600;
      color: #000;
      text-align: right;
    }
    .totals-row.discount .value {
      color: #dc2626;
    }
    .totals-row.total {
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      margin-top: 12px;
      font-size: 20px;
      font-weight: bold;
    }
    .totals-row.total .value {
      color: #16a34a;
      font-size: 24px;
    }
    .footer {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #000;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>INVOICE</h1>
      <p class="invoice-number">#{{invoiceNumber}}</p>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <p class="info-label">Date:</p>
        <p class="info-value">{{date}}</p>
      </div>
      <div class="info-item">
        <p class="info-label">Time:</p>
        <p class="info-value">{{time}}</p>
      </div>
      {{#if customer.name}}
      <div class="info-item">
        <p class="info-label">Customer:</p>
        <p class="info-value">{{customer.name}}</p>
      </div>
      <div class="info-item">
        <p class="info-label">Phone:</p>
        <p class="info-value">{{#if customer.phone}}{{customer.phone}}{{else}}-{{/if}}</p>
      </div>
      {{/if}}
      <div class="info-item">
        <p class="info-label">Payment Method:</p>
        <p class="info-value capitalize">{{paymentMethod}}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{name}}</td>
          <td class="text-right">{{qty}}</td>
          <td class="text-right">\${{price}}</td>
          <td class="text-right">\${{total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="totals-row">
        <span class="label">Subtotal:</span>
        <span class="value">\${{subtotal}}</span>
      </div>
      {{#if showDiscount}}
      <div class="totals-row discount">
        <span class="label">Discount:</span>
        <span class="value">-\${{discount}}</span>
      </div>
      {{/if}}
      <div class="totals-row">
        <span class="label">Tax:</span>
        <span class="value">\${{taxes}}</span>
      </div>
      <div class="totals-row total">
        <span class="label">Total:</span>
        <span class="value">\${{total}}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

export const pdfService = new PDFService();
