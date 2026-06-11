'use strict';

// ─────────────────────────────────────────────────────────────
// Shared layout wrapper — wraps any content in a minimalist shell
// ─────────────────────────────────────────────────────────────
function layout(title, bodyContent) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header (Logo) -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;border-bottom:1px solid #eeeeee;">
              <img src="https://drux.in/druxlogo.png" alt="Drux Health Store" style="height:45px;width:auto;display:inline-block;border:0;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px;background-color:#ffffff;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:24px 40px;border-top:1px solid #eeeeee;text-align:center;">
              <p style="margin:0;color:#888888;font-size:12px;line-height:1.6;font-weight:400;">
                © ${new Date().getFullYear()} Drux Health Store. All rights reserved.<br/>
                If you have any questions, reply to this email or contact support.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function formatCurrency(amount) {
  return `₹${parseFloat(amount || 0).toFixed(2)}`;
}

function formatDate(date) {
  return new Date(date || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function shortOrderId(orderId) {
  return (orderId || '').slice(0, 8).toUpperCase();
}

function statusBadge(status) {
  const colors = {
    PENDING:    { border: '#dcdcdc', text: '#555555' },
    CONFIRMED:  { border: '#b2dfdb', text: '#00695c' },
    PROCESSING: { border: '#bbdefb', text: '#1565c0' },
    SHIPPED:    { border: '#c8e6c9', text: '#2e7d32' },
    DELIVERED:  { border: '#2e7d32', text: '#2e7d32' },
    CANCELLED:  { border: '#ffcdd2', text: '#c62828' },
    PARTIAL:    { border: '#ffe0b2', text: '#ef6c00' },
  };
  const c = colors[status] || { border: '#dcdcdc', text: '#555555' };
  return `<span style="display:inline-block;border:1px solid ${c.border};color:${c.text};padding:2px 10px;border-radius:4px;font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">${status}</span>`;
}

function itemsTable(items) {
  if (!items || items.length === 0) return '';
  const rows = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#222222;font-size:14px;vertical-align:top;">
        <span style="font-weight:500;">${item.title || item.name || 'Product'}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#666666;font-size:14px;text-align:center;vertical-align:top;">x${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#222222;font-size:14px;text-align:right;font-weight:600;vertical-align:top;">${formatCurrency(parseFloat(item.price || 0) * parseInt(item.quantity || 1))}</td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 12px;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:8px 0;text-align:left;font-size:11px;color:#888888;font-weight:600;text-transform:uppercase;border-bottom:2px solid #222222;letter-spacing:0.5px;">Item</th>
          <th style="padding:8px 0;text-align:center;font-size:11px;color:#888888;font-weight:600;text-transform:uppercase;border-bottom:2px solid #222222;letter-spacing:0.5px;width:60px;">Qty</th>
          <th style="padding:8px 0;text-align:right;font-size:11px;color:#888888;font-weight:600;text-transform:uppercase;border-bottom:2px solid #222222;letter-spacing:0.5px;width:100px;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function ctaButton(label, url) {
  if (!url) return '';
  return `
    <div style="text-align:center;margin:32px 0 8px;">
      <a href="${url}" style="display:inline-block;background-color:#111111;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:6px;font-weight:600;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;box-shadow:0 2px 4px rgba(0,0,0,0.1);">${label}</a>
    </div>
  `;
}

function infoRow(label, value) {
  return `
    <tr>
      <td style="padding:6px 0;color:#666666;font-size:14px;width:140px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;color:#222222;font-size:14px;font-weight:500;vertical-align:top;">${value}</td>
    </tr>
  `;
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 1 — Order Placed (Customer)
// ─────────────────────────────────────────────────────────────
function orderPlaced({ customerName, orderId, items = [], total, shippingCharge, discount, paymentMethod }) {
  const body = `
    <h2 style="margin:0 0 8px;color:#222222;font-size:20px;font-weight:700;">Order Placed</h2>
    <p style="margin:0 0 24px;color:#666666;font-size:15px;line-height:1.5;">Hi ${customerName || 'there'}, thank you for shopping with us. We have received your order and are processing it.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${infoRow('Date', formatDate())}
      ${infoRow('Payment', paymentMethod || 'COD')}
    </table>

    ${itemsTable(items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid #eeeeee;padding-top:12px;border-collapse:collapse;">
      ${discount > 0 ? infoRow('Discount', `-${formatCurrency(discount)}`) : ''}
      ${infoRow('Shipping', shippingCharge > 0 ? formatCurrency(shippingCharge) : 'FREE')}
      <tr>
        <td style="padding:12px 0 0;color:#222222;font-size:15px;font-weight:700;width:140px;vertical-align:top;">Total</td>
        <td style="padding:12px 0 0;color:#222222;font-size:15px;font-weight:700;text-align:right;vertical-align:top;">${formatCurrency(total)}</td>
      </tr>
    </table>

    ${ctaButton('View My Order', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/orders/${orderId}`)}

    <p style="margin:32px 0 0;color:#888888;font-size:13px;text-align:center;">We will send another notification once your order ships.</p>
  `;
  return layout('Order Placed — Drux Health Store', body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 2 — Order Confirmed (Customer)
// ─────────────────────────────────────────────────────────────
function orderConfirmed({ customerName, orderId, total }) {
  const body = `
    <h2 style="margin:0 0 8px;color:#222222;font-size:20px;font-weight:700;">Order Confirmed</h2>
    <p style="margin:0 0 24px;color:#666666;font-size:15px;line-height:1.5;">Hi ${customerName || 'there'}, your payment was successful and your order is now confirmed.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${infoRow('Total Paid', formatCurrency(total))}
      ${infoRow('Status', statusBadge('CONFIRMED'))}
    </table>

    ${ctaButton('Track My Order', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/orders/${orderId}`)}
  `;
  return layout('Order Confirmed — Drux Health Store', body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 3 — Order Status Update (Customer)
// ─────────────────────────────────────────────────────────────
function orderStatusUpdate({ customerName, orderId, status, awbCode, courierName, trackingNote }) {
  const statusMessages = {
    PROCESSING: 'Your order is currently being processed and will be shipped soon.',
    SHIPPED:    'Your order has been shipped and is on its way.',
    DELIVERED:  'Your order has been successfully delivered.',
    PARTIAL:    'Part of your order has been fulfilled. The remaining items are being processed.',
    REFUNDED:   'Your refund has been processed.',
    CANCELLED:  'Your order has been cancelled.',
  };

  const statusMsg = statusMessages[status] || `Your order status has been updated to ${status}.`;

  const trackingBlock = (status === 'SHIPPED' && awbCode) ? `
    <div style="border:1px solid #eeeeee;background-color:#fafafa;padding:16px;border-radius:6px;margin:24px 0;">
      <p style="margin:0 0 8px;color:#222222;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Tracking Information</p>
      ${courierName ? `<p style="margin:0 0 4px;color:#555555;font-size:14px;"><strong>Courier:</strong> ${courierName}</p>` : ''}
      <p style="margin:0;color:#555555;font-size:14px;"><strong>AWB Number:</strong> ${awbCode}</p>
    </div>
  ` : '';

  const body = `
    <h2 style="margin:0 0 8px;color:#222222;font-size:20px;font-weight:700;">Order Update</h2>
    <p style="margin:0 0 24px;color:#666666;font-size:15px;line-height:1.5;">Hi ${customerName || 'there'}, we wanted to share an update regarding your order.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${infoRow('Status', statusBadge(status))}
    </table>

    <p style="color:#555555;font-size:14px;line-height:1.5;margin:16px 0;">${statusMsg}</p>

    ${trackingBlock}
    ${trackingNote ? `<p style="color:#666666;font-size:13px;line-height:1.5;">${trackingNote}</p>` : ''}

    ${ctaButton('View Order Details', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/orders/${orderId}`)}
  `;
  return layout(`Order Update — Drux Health Store`, body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 4 — Order Cancelled (Customer)
// ─────────────────────────────────────────────────────────────
function orderCancelled({ customerName, orderId, total }) {
  const body = `
    <h2 style="margin:0 0 8px;color:#222222;font-size:20px;font-weight:700;">Order Cancelled</h2>
    <p style="margin:0 0 24px;color:#666666;font-size:15px;line-height:1.5;">Hi ${customerName || 'there'}, your order has been successfully cancelled.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${total ? infoRow('Order Value', formatCurrency(total)) : ''}
      ${infoRow('Status', statusBadge('CANCELLED'))}
    </table>

    <p style="color:#555555;font-size:14px;line-height:1.5;margin:16px 0;">If you paid online, your refund will be automatically processed within 5–7 business days.</p>

    ${ctaButton('Browse Shop', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop`)}
  `;
  return layout('Order Cancelled — Drux Health Store', body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 5 — New Order for Vendor
// ─────────────────────────────────────────────────────────────
function newOrderForVendor({ vendorName, orderId, customerName, items = [], total, address }) {
  const addressStr = address
    ? `${address.fullName || customerName}, ${address.street}, ${address.city}, ${address.state} — ${address.pincode}`
    : 'Not provided';

  const body = `
    <h2 style="margin:0 0 8px;color:#222222;font-size:20px;font-weight:700;">New Order Received</h2>
    <p style="margin:0 0 24px;color:#666666;font-size:15px;line-height:1.5;">Hi ${vendorName || 'there'}, you have received a new order. Please prepare and dispatch the items as soon as possible.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${infoRow('Customer', customerName || 'N/A')}
      ${infoRow('Date', formatDate())}
    </table>

    <p style="font-weight:600;color:#222222;font-size:13px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Items Ordered</p>
    ${itemsTable(items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid #eeeeee;padding-top:12px;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;color:#222222;font-size:15px;font-weight:700;width:140px;vertical-align:top;">Items Subtotal</td>
        <td style="padding:8px 0;color:#222222;font-size:15px;font-weight:700;text-align:right;vertical-align:top;">${formatCurrency(total)}</td>
      </tr>
    </table>

    <div style="border:1px solid #eeeeee;background-color:#fafafa;padding:16px;border-radius:6px;margin:24px 0;">
      <p style="margin:0 0 8px;color:#222222;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Delivery Address</p>
      <p style="margin:0;color:#555555;font-size:14px;line-height:1.5;">${addressStr}</p>
    </div>

    ${ctaButton('Vendor Dashboard', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/vendor/orders`)}
  `;
  return layout('New Order — Drux Vendor Portal', body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 6 — Item Cancelled (Vendor notification)
// ─────────────────────────────────────────────────────────────
function itemCancelledForVendor({ vendorName, orderId, customerName, items = [] }) {
  const body = `
    <h2 style="margin:0 0 8px;color:#222222;font-size:20px;font-weight:700;">Order Item Cancelled</h2>
    <p style="margin:0 0 24px;color:#666666;font-size:15px;line-height:1.5;">Hi ${vendorName || 'there'}, a customer has cancelled items from an order.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${infoRow('Customer', customerName || 'N/A')}
      ${infoRow('Date', formatDate())}
    </table>

    <p style="font-weight:600;color:#222222;font-size:13px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:0.5px;">Cancelled Items</p>
    ${itemsTable(items)}

    <div style="border:1px solid #ffcdd2;background-color:#ffebee;padding:16px;border-radius:6px;margin:24px 0;border-left:4px solid #c62828;">
      <p style="margin:0;color:#c62828;font-size:14px;line-height:1.5;font-weight:500;">Please halt processing or shipping for the above items immediately.</p>
    </div>

    ${ctaButton('Vendor Dashboard', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/vendor/orders`)}
  `;
  return layout('Order Cancellation — Drux Vendor Portal', body);
}

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────
module.exports = {
  orderPlaced,
  orderConfirmed,
  orderStatusUpdate,
  orderCancelled,
  newOrderForVendor,
  itemCancelledForVendor,
};
