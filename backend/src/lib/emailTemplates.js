'use strict';

// ─────────────────────────────────────────────────────────────
// Shared layout wrapper — wraps any content in a branded shell
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
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a7a4a 0%,#2ecc71 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">🌿 Drux Health Store</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Your wellness, our priority</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8faf9;padding:20px 40px;border-top:1px solid #e8ede9;text-align:center;">
              <p style="margin:0;color:#9aab9e;font-size:12px;">
                © ${new Date().getFullYear()} Drux Health Store. All rights reserved.<br/>
                If you have any questions, reply to this email or contact our support team.
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
  return `₹${parseFloat(amount).toFixed(2)}`;
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
    PENDING:    { bg: '#fff3cd', text: '#856404' },
    CONFIRMED:  { bg: '#d1ecf1', text: '#0c5460' },
    PROCESSING: { bg: '#cce5ff', text: '#004085' },
    SHIPPED:    { bg: '#d4edda', text: '#155724' },
    DELIVERED:  { bg: '#1a7a4a', text: '#ffffff' },
    CANCELLED:  { bg: '#f8d7da', text: '#721c24' },
    PARTIAL:    { bg: '#fde8c8', text: '#7d4600' },
  };
  const c = colors[status] || { bg: '#e2e3e5', text: '#383d41' };
  return `<span style="display:inline-block;background:${c.bg};color:${c.text};padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;">${status}</span>`;
}

function itemsTable(items) {
  if (!items || items.length === 0) return '';
  const rows = items.map(item => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#333;font-size:14px;">${item.title || item.name || 'Product'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#555;font-size:14px;text-align:center;">x${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#1a7a4a;font-size:14px;text-align:right;font-weight:600;">${formatCurrency(parseFloat(item.price || 0) * parseInt(item.quantity || 1))}</td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8ede9;border-radius:8px;overflow:hidden;margin:16px 0;">
      <thead>
        <tr style="background:#f8faf9;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6c757d;font-weight:600;text-transform:uppercase;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6c757d;font-weight:600;text-transform:uppercase;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6c757d;font-weight:600;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function ctaButton(label, url) {
  if (!url) return '';
  return `
    <div style="text-align:center;margin:28px 0 8px;">
      <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#1a7a4a,#2ecc71);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">${label}</a>
    </div>
  `;
}

function infoRow(label, value) {
  return `
    <tr>
      <td style="padding:6px 0;color:#6c757d;font-size:14px;width:140px;">${label}</td>
      <td style="padding:6px 0;color:#333;font-size:14px;font-weight:500;">${value}</td>
    </tr>
  `;
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 1 — Order Placed (Customer)
// ─────────────────────────────────────────────────────────────
function orderPlaced({ customerName, orderId, items = [], total, shippingCharge, discount, paymentMethod }) {
  const body = `
    <h2 style="margin:0 0 6px;color:#1a7a4a;font-size:22px;">Order Placed Successfully! 🎉</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;">Hi ${customerName || 'there'}, thank you for your order. We've received it and it's being processed.</p>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${infoRow('Date', formatDate())}
      ${infoRow('Payment', paymentMethod || 'COD')}
    </table>

    ${itemsTable(items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      ${discount > 0 ? infoRow('Discount', `-${formatCurrency(discount)}`) : ''}
      ${infoRow('Shipping', shippingCharge > 0 ? formatCurrency(shippingCharge) : 'FREE')}
      <tr>
        <td style="padding:10px 0 0;color:#1a7a4a;font-size:16px;font-weight:700;width:140px;">Total Paid</td>
        <td style="padding:10px 0 0;color:#1a7a4a;font-size:16px;font-weight:700;">${formatCurrency(total)}</td>
      </tr>
    </table>

    ${ctaButton('View My Order', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/orders/${orderId}`)}

    <p style="margin:24px 0 0;color:#888;font-size:13px;">You'll receive another email once your order ships. 🚚</p>
  `;
  return layout('Order Placed — Drux Health Store', body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 2 — Order Confirmed (Customer)
// ─────────────────────────────────────────────────────────────
function orderConfirmed({ customerName, orderId, total }) {
  const body = `
    <h2 style="margin:0 0 6px;color:#1a7a4a;font-size:22px;">Payment Confirmed ✅</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;">Hi ${customerName || 'there'}, your payment was successful and your order is now confirmed!</p>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${infoRow('Total Paid', formatCurrency(total))}
      ${infoRow('Status', 'Confirmed')}
    </table>

    <div style="background:#d4edda;border-left:4px solid #1a7a4a;padding:14px 18px;border-radius:6px;margin-bottom:24px;">
      <p style="margin:0;color:#155724;font-size:14px;">🎉 Your order is confirmed and will be dispatched soon.</p>
    </div>

    ${ctaButton('Track My Order', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/orders/${orderId}`)}
  `;
  return layout('Order Confirmed — Drux Health Store', body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 3 — Order Status Update (Customer)
// ─────────────────────────────────────────────────────────────
function orderStatusUpdate({ customerName, orderId, status, awbCode, courierName, trackingNote }) {
  const statusMessages = {
    PROCESSING: { icon: '⚙️', msg: 'Your order is being processed and will be shipped soon.' },
    SHIPPED:    { icon: '🚚', msg: 'Great news! Your order is on its way.' },
    DELIVERED:  { icon: '📦', msg: 'Your order has been delivered. We hope you love it!' },
    PARTIAL:    { icon: '📬', msg: 'Part of your order has been fulfilled. More items are on the way.' },
    REFUNDED:   { icon: '💸', msg: 'Your refund has been processed successfully.' },
    CANCELLED:  { icon: '❌', msg: 'Your order has been cancelled.' },
  };

  const info = statusMessages[status] || { icon: '📋', msg: `Your order status has been updated to ${status}.` };

  const trackingBlock = (status === 'SHIPPED' && awbCode) ? `
    <div style="background:#e8f5e9;border:1px solid #c3e6cb;padding:16px 18px;border-radius:8px;margin:16px 0;">
      <p style="margin:0 0 8px;color:#155724;font-weight:600;font-size:14px;">📍 Tracking Information</p>
      ${courierName ? `<p style="margin:0 0 4px;color:#555;font-size:14px;"><strong>Courier:</strong> ${courierName}</p>` : ''}
      <p style="margin:0;color:#555;font-size:14px;"><strong>AWB Number:</strong> ${awbCode}</p>
    </div>
  ` : '';

  const body = `
    <h2 style="margin:0 0 6px;color:#1a7a4a;font-size:22px;">${info.icon} Order Update</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;">Hi ${customerName || 'there'}, here's an update on your order.</p>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${infoRow('New Status', statusBadge(status))}
    </table>

    <div style="background:#f0f7f2;border-left:4px solid #1a7a4a;padding:14px 18px;border-radius:6px;margin-bottom:16px;">
      <p style="margin:0;color:#1a5e36;font-size:14px;">${info.msg}</p>
    </div>

    ${trackingBlock}
    ${trackingNote ? `<p style="color:#666;font-size:13px;">${trackingNote}</p>` : ''}

    ${ctaButton('View Order Details', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/orders/${orderId}`)}
  `;
  return layout(`Order ${status} — Drux Health Store`, body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 4 — Order Cancelled (Customer)
// ─────────────────────────────────────────────────────────────
function orderCancelled({ customerName, orderId, total }) {
  const body = `
    <h2 style="margin:0 0 6px;color:#c0392b;font-size:22px;">Order Cancelled ❌</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;">Hi ${customerName || 'there'}, your order has been cancelled as requested.</p>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${total ? infoRow('Order Value', formatCurrency(total)) : ''}
      ${infoRow('Status', statusBadge('CANCELLED'))}
    </table>

    <div style="background:#fdf3f3;border-left:4px solid #e74c3c;padding:14px 18px;border-radius:6px;margin-bottom:24px;">
      <p style="margin:0;color:#721c24;font-size:14px;">If you paid online, your refund will be processed within 5–7 business days.</p>
    </div>

    ${ctaButton('Browse Products', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shop`)}

    <p style="margin:24px 0 0;color:#888;font-size:13px;">Changed your mind? You can always place a new order. 💚</p>
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
    <h2 style="margin:0 0 6px;color:#1a7a4a;font-size:22px;">🛒 New Order Received!</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;">Hi ${vendorName || 'there'}, you have a new order. Please process it as soon as possible.</p>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${infoRow('Customer', customerName || 'N/A')}
      ${infoRow('Date', formatDate())}
    </table>

    <p style="font-weight:600;color:#333;font-size:14px;margin:16px 0 4px;">Items Ordered:</p>
    ${itemsTable(items)}

    <table cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr>
        <td style="padding:8px 0;color:#1a7a4a;font-size:15px;font-weight:700;width:140px;">Items Total</td>
        <td style="padding:8px 0;color:#1a7a4a;font-size:15px;font-weight:700;">${formatCurrency(total)}</td>
      </tr>
    </table>

    <div style="background:#f0f7f2;border:1px solid #c3e6cb;padding:14px 18px;border-radius:8px;margin:20px 0;">
      <p style="margin:0 0 4px;font-weight:600;color:#1a5e36;font-size:14px;">📍 Delivery Address</p>
      <p style="margin:0;color:#555;font-size:14px;">${addressStr}</p>
    </div>

    ${ctaButton('Go to Vendor Dashboard', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/vendor/orders`)}

    <p style="margin:24px 0 0;color:#888;font-size:13px;">Please update the order status once you process and ship the item.</p>
  `;
  return layout('New Order — Drux Vendor Portal', body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 6 — Item Cancelled (Vendor notification)
// ─────────────────────────────────────────────────────────────
function itemCancelledForVendor({ vendorName, orderId, customerName, items = [] }) {
  const body = `
    <h2 style="margin:0 0 6px;color:#c0392b;font-size:22px;">Order Item Cancelled</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;">Hi ${vendorName || 'there'}, a customer has cancelled item(s) from an order.</p>

    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      ${infoRow('Order ID', `#${shortOrderId(orderId)}`)}
      ${infoRow('Customer', customerName || 'N/A')}
      ${infoRow('Date', formatDate())}
    </table>

    <p style="font-weight:600;color:#333;font-size:14px;margin:16px 0 4px;">Cancelled Items:</p>
    ${itemsTable(items)}

    <div style="background:#fdf3f3;border-left:4px solid #e74c3c;padding:14px 18px;border-radius:6px;margin:16px 0;">
      <p style="margin:0;color:#721c24;font-size:14px;">Please halt processing/shipping for the above items immediately.</p>
    </div>

    ${ctaButton('View Order in Dashboard', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/vendor/orders`)}
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
