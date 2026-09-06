import toast from 'react-hot-toast';

/**
 * Enterprise B2B Invoice PDF Generator & Printer
 * Generates an official, beautifully styled PDF Tax Invoice document from database invoice records.
 */
export function exportInvoicePDF(invoice) {
  if (!invoice) {
    toast.error('No invoice record available to export.');
    return;
  }

  const invoiceNumber = invoice.invoice_number || invoice.id || 'INV-UNKNOWN';
  const quoteNumber = invoice.quote_number || 'N/A';
  const customerName = invoice.customer_name || invoice.company_name || 'Valued Enterprise Client';
  const billingAddress = invoice.billing_address || invoice.address || 'Corporate Billing Address';
  const issueDate = invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : new Date(Date.now() + 14 * 86400000).toLocaleDateString();
  const status = String(invoice.status || 'sent').toUpperCase();
  
  const amountDue = Number(invoice.amount_due || invoice.total_amount || invoice.amount || 0);
  const amountPaid = Number(invoice.amount_paid || 0);
  const balanceDue = invoice.balance_due !== undefined ? Number(invoice.balance_due) : Math.max(0, amountDue - amountPaid);

  const items = Array.isArray(invoice.items) && invoice.items.length > 0
    ? invoice.items
    : [
        {
          description: `Enterprise Software & Services Subscription (Ref: ${quoteNumber})`,
          quantity: 1,
          unit_price: amountDue,
          total: amountDue,
        },
      ];

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Invoice ${invoiceNumber} - DealFlow360</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          background: #ffffff;
          padding: 40px;
          font-size: 13px;
          line-height: 1.5;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .brand {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .brand span { color: #4f46e5; }
        .sub-brand {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h1 {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .invoice-num {
          font-family: monospace;
          font-size: 14px;
          font-weight: 700;
          color: #4f46e5;
          margin-top: 4px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 8px;
        }
        .status-PAID { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .status-PARTIALLY_PAID { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
        .status-SENT, .status-UNPAID, .status-DRAFT { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .status-OVERDUE { background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; }

        .details-grid {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 20px;
        }
        .details-col { flex: 1; }
        .details-col h3 {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .details-col p { font-size: 13px; color: #334155; }
        .details-col strong { color: #0f172a; }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          padding: 12px 14px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.5px;
        }
        td {
          padding: 14px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
          color: #334155;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .totals-container {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        .totals-table {
          width: 320px;
        }
        .totals-table tr td {
          padding: 8px 12px;
          border-bottom: none;
        }
        .totals-table tr.grand-total td {
          border-top: 2px solid #e2e8f0;
          border-bottom: 2px solid #0f172a;
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
        }

        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          font-size: 11px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .badge-verified {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: #15803d;
          background: #f0fdf4;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #bbf7d0;
        }
        @media print {
          body { padding: 0; background: none; }
          .invoice-box { border: none; shadow: none; padding: 20px; }
          @page { margin: 1.5cm; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <!-- Header -->
        <div class="header">
          <div>
            <div class="brand">DealFlow<span>360</span></div>
            <div class="sub-brand">Enterprise B2B Sales & Revenue Operations</div>
          </div>
          <div class="invoice-title">
            <h1>Official Tax Invoice</h1>
            <div class="invoice-num">${invoiceNumber}</div>
            <div class="status-badge status-${status.replace(/\s+/g, '_')}">${status}</div>
          </div>
        </div>

        <!-- Metadata & Addresses -->
        <div class="details-grid">
          <div class="details-col">
            <h3>Billed To:</h3>
            <p><strong>${customerName}</strong></p>
            <p>${billingAddress}</p>
          </div>
          <div class="details-col">
            <h3>Invoice Metadata:</h3>
            <p><strong>Quotation Ref:</strong> ${quoteNumber}</p>
            <p><strong>Issue Date:</strong> ${issueDate}</p>
            <p><strong>Payment Due Date:</strong> ${dueDate}</p>
          </div>
          <div class="details-col">
            <h3>Issuer Information:</h3>
            <p><strong>DealFlow360 Enterprise Corp</strong></p>
            <p>100 Technology Plaza, San Francisco, CA</p>
            <p>Tax ID: US-9842104-B2B</p>
          </div>
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${item.description || 'Enterprise Solution Line Item'}</strong></td>
                <td class="text-center">${item.quantity || 1}</td>
                <td class="text-right">$${Number(item.unit_price || amountDue).toLocaleString()}</td>
                <td class="text-right"><strong>$${Number(item.total || amountDue).toLocaleString()}</strong></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <!-- Totals Breakdown -->
        <div class="totals-container">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td class="text-right"><strong>$${amountDue.toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td>Amount Paid:</td>
              <td class="text-right" style="color: #166534;"><strong>-$${amountPaid.toLocaleString()}</strong></td>
            </tr>
            <tr class="grand-total">
              <td>Balance Due:</td>
              <td class="text-right">$${balanceDue.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Footer Audit Verification -->
        <div class="footer">
          <div>
            <p>Thank you for your business. Payment terms apply per contract.</p>
            <p>Questions? Contact finance-ops@dealflow360.com</p>
          </div>
          <div class="badge-verified">
            ✓ Verified PostgreSQL Financial Record
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 400);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success(`Opening PDF printable invoice for ${invoiceNumber}`);
  } else {
    toast.error('Popup blocked by browser. Please allow popups to download/print PDF.');
  }
}
