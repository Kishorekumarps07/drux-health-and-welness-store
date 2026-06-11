'use strict';

const { frontendUrl } = require('../config/env');

// ─────────────────────────────────────────────────────────────
// Shared layout wrapper — wraps any content in an Amazon-style shell
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
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#111111;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:20px 0;">
    <tr>
      <td align="center">
        <!-- Main container (max 640px) -->
        <table width="640" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #dddddd;border-radius:4px;overflow:hidden;max-width:640px;width:100%;">

          <!-- Top thin highlight bar (Amazon signature orange) -->
          <tr>
            <td style="background-color:#ff9900;height:3px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>

          <!-- Header (Logo Left, Title Right) -->
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eeeeee;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <img src="https://drux.in/druxlogo.png" alt="Drux Health Store" style="height:35px;width:auto;display:block;border:0;" />
                  </td>
                  <td align="right" style="vertical-align:middle;color:#666666;font-size:14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                    Order Confirmation
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:24px;background-color:#ffffff;color:#111111;font-size:14px;line-height:1.5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-align:left;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:24px;border-top:1px solid #eeeeee;text-align:left;color:#666666;font-size:11px;line-height:1.6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <p style="margin:0 0 12px;">
                This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.
              </p>
              <p style="margin:0;font-weight:bold;">
                © ${new Date().getFullYear()} Drux Health Store. All rights reserved.
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
      <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#0066c0;font-size:13px;vertical-align:top;">
        <span style="font-weight:500;">${item.title || item.name || 'Product'}</span>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#555555;font-size:13px;text-align:center;vertical-align:top;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #eeeeee;color:#111111;font-size:13px;text-align:right;font-weight:bold;vertical-align:top;">${formatCurrency(parseFloat(item.price || 0) * parseInt(item.quantity || 1))}</td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:8px;">
      <thead>
        <tr style="border-bottom:1px solid #dddddd;">
          <th style="padding:6px 0;text-align:left;font-size:11px;color:#666666;font-weight:bold;text-transform:uppercase;">Item</th>
          <th style="padding:6px 0;text-align:center;font-size:11px;color:#666666;font-weight:bold;text-transform:uppercase;width:60px;">Qty</th>
          <th style="padding:6px 0;text-align:right;font-size:11px;color:#666666;font-weight:bold;text-transform:uppercase;width:100px;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function ctaButton(label, url) {
  if (!url) return '';
  return `
    <div style="margin:24px 0 12px;text-align:left;">
      <a href="${url}" style="display:inline-block;background-color:#ffd814;border:1px solid #fcd200;color:#111111;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:normal;text-align:center;">${label}</a>
    </div>
  `;
}

function infoRow(label, value) {
  return `
    <tr>
      <td style="padding:6px 0;color:#666666;font-size:13px;width:140px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;color:#111111;font-size:13px;font-weight:bold;vertical-align:top;">${value}</td>
    </tr>
  `;
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 1 — Order Placed (Customer)
// ─────────────────────────────────────────────────────────────
function orderPlaced({ customerName, orderId, items = [], total, shippingCharge, discount, paymentMethod }) {
  const body = `
    <h2 style="margin:0 0 12px;color:#111111;font-size:18px;font-weight:bold;">Hello ${customerName || 'Customer'},</h2>
    <p style="margin:0 0 16px;color:#111111;font-size:14px;line-height:1.5;">Thank you for shopping with us. We have received your order and are preparing it. You can view your order status and details in your account.</p>

    <div style="background-color:#f9f9f9;border:1px solid #eeeeee;border-radius:4px;padding:16px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.6;border-collapse:collapse;">
        ${infoRow('Order ID:', `#${shortOrderId(orderId)}`)}
        ${infoRow('Order Date:', formatDate())}
        ${infoRow('Payment Method:', paymentMethod || 'COD')}
      </table>
    </div>

    <h3 style="margin:24px 0 8px;font-size:13px;border-bottom:1px solid #cccccc;padding-bottom:6px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">Order Summary</h3>
    
    ${itemsTable(items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-collapse:collapse;font-size:13px;">
      ${discount > 0 ? `
      <tr>
        <td style="padding:6px 0;color:#555555;vertical-align:top;">Promotion Applied:</td>
        <td style="padding:6px 0;color:#555555;text-align:right;vertical-align:top;">-${formatCurrency(discount)}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:6px 0;color:#555555;vertical-align:top;">Shipping & Handling:</td>
        <td style="padding:6px 0;color:#555555;text-align:right;vertical-align:top;">${shippingCharge > 0 ? formatCurrency(shippingCharge) : 'FREE'}</td>
      </tr>
      <tr style="border-top:1px solid #eeeeee;">
        <td style="padding:12px 0 0;color:#111111;font-size:14px;font-weight:bold;vertical-align:top;">Order Total:</td>
        <td style="padding:12px 0 0;color:#b12704;font-size:16px;font-weight:bold;text-align:right;vertical-align:top;">${formatCurrency(total)}</td>
      </tr>
    </table>

    ${ctaButton('View or Manage Your Order', `${frontendUrl}/dashboard/orders/${orderId}`)}

    <p style="margin:24px 0 0;color:#666666;font-size:12px;">We'll send you an email confirmation when your items are shipped.</p>
  `;
  return layout('Order Placed — Drux Health Store', body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 2 — Order Confirmed (Customer)
// ─────────────────────────────────────────────────────────────
function orderConfirmed({ customerName, orderId, total }) {
  const body = `
    <h2 style="margin:0 0 12px;color:#111111;font-size:18px;font-weight:bold;">Hello ${customerName || 'Customer'},</h2>
    <p style="margin:0 0 16px;color:#111111;font-size:14px;line-height:1.5;">Your payment was successful and your order has been confirmed.</p>

    <div style="background-color:#f9f9f9;border:1px solid #eeeeee;border-radius:4px;padding:16px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.6;border-collapse:collapse;">
        ${infoRow('Order ID:', `#${shortOrderId(orderId)}`)}
        ${infoRow('Total Paid:', formatCurrency(total))}
        ${infoRow('Status:', statusBadge('CONFIRMED'))}
      </table>
    </div>

    ${ctaButton('Track Your Order', `${frontendUrl}/dashboard/orders/${orderId}`)}
  `;
  return layout('Order Confirmed — Drux Health Store', body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 3 — Order Status Update (Customer)
// ─────────────────────────────────────────────────────────────
function orderStatusUpdate({ customerName, orderId, status, awbCode, courierName, trackingNote }) {
  const statusMessages = {
    PROCESSING: 'Your order is currently being processed by the vendor.',
    SHIPPED:    'Your package has been shipped and is on its way.',
    DELIVERED:  'Your package has been successfully delivered.',
    PARTIAL:    'Part of your order has been shipped. The remaining items will be sent separately.',
    REFUNDED:   'Your refund has been completed.',
    CANCELLED:  'Your order has been cancelled.',
  };

  const statusMsg = statusMessages[status] || `Your order status has been updated to ${status}.`;

  const trackingBlock = (status === 'SHIPPED' && awbCode) ? `
    <div style="border:1px solid #dddddd;background-color:#fafafa;padding:16px;border-radius:4px;margin:20px 0;font-size:13px;">
      <p style="margin:0 0 8px;color:#111111;font-weight:bold;text-transform:uppercase;font-size:11px;letter-spacing:0.5px;">Delivery & Tracking</p>
      ${courierName ? `<p style="margin:0 0 4px;color:#111111;"><strong>Carrier:</strong> ${courierName}</p>` : ''}
      <p style="margin:0;color:#111111;"><strong>Tracking ID (AWB):</strong> ${awbCode}</p>
    </div>
  ` : '';

  const body = `
    <h2 style="margin:0 0 12px;color:#111111;font-size:18px;font-weight:bold;">Hello ${customerName || 'Customer'},</h2>
    <p style="margin:0 0 16px;color:#111111;font-size:14px;line-height:1.5;">Here is an update regarding your order.</p>

    <div style="background-color:#f9f9f9;border:1px solid #eeeeee;border-radius:4px;padding:16px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.6;border-collapse:collapse;">
        ${infoRow('Order ID:', `#${shortOrderId(orderId)}`)}
        ${infoRow('New Status:', statusBadge(status))}
      </table>
    </div>

    <p style="color:#111111;font-size:14px;line-height:1.5;margin:16px 0;">${statusMsg}</p>

    ${trackingBlock}
    ${trackingNote ? `<p style="color:#666666;font-size:12px;line-height:1.5;">${trackingNote}</p>` : ''}

    ${ctaButton('View Order Details', `${frontendUrl}/dashboard/orders/${orderId}`)}
  `;
  return layout(`Order Update — Drux Health Store`, body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 4 — Order Cancelled (Customer)
// ─────────────────────────────────────────────────────────────
function orderCancelled({ customerName, orderId, total }) {
  const body = `
    <h2 style="margin:0 0 12px;color:#111111;font-size:18px;font-weight:bold;">Hello ${customerName || 'Customer'},</h2>
    <p style="margin:0 0 16px;color:#111111;font-size:14px;line-height:1.5;">Your order has been cancelled.</p>

    <div style="background-color:#f9f9f9;border:1px solid #eeeeee;border-radius:4px;padding:16px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.6;border-collapse:collapse;">
        ${infoRow('Order ID:', `#${shortOrderId(orderId)}`)}
        ${total ? infoRow('Order Value:', formatCurrency(total)) : ''}
        ${infoRow('Status:', statusBadge('CANCELLED'))}
      </table>
    </div>

    <p style="color:#555555;font-size:13px;line-height:1.5;margin:16px 0;">If you paid online, your refund will be processed to your original payment method within 5–7 business days.</p>

    ${ctaButton('Continue Shopping', `${frontendUrl}/shop`)}
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
    <h2 style="margin:0 0 12px;color:#111111;font-size:18px;font-weight:bold;">Hello ${vendorName || 'Vendor'},</h2>
    <p style="margin:0 0 16px;color:#111111;font-size:14px;line-height:1.5;">You have received a new order on the Drux platform. Please prepare and dispatch the items as soon as possible.</p>

    <div style="background-color:#f9f9f9;border:1px solid #eeeeee;border-radius:4px;padding:16px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.6;border-collapse:collapse;">
        ${infoRow('Order ID:', `#${shortOrderId(orderId)}`)}
        ${infoRow('Customer:', customerName || 'N/A')}
      </table>
    </div>

    <h3 style="margin:24px 0 8px;font-size:13px;border-bottom:1px solid #cccccc;padding-bottom:6px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">Items to Dispatch</h3>
    ${itemsTable(items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid #eeeeee;padding-top:12px;border-collapse:collapse;font-size:13px;">
      <tr>
        <td style="padding:8px 0;color:#111111;font-size:14px;font-weight:bold;width:140px;vertical-align:top;">Subtotal:</td>
        <td style="padding:8px 0;color:#111111;font-size:14px;font-weight:bold;text-align:right;vertical-align:top;">${formatCurrency(total)}</td>
      </tr>
    </table>

    <div style="border:1px solid #dddddd;background-color:#fafafa;padding:16px;border-radius:4px;margin:24px 0;font-size:13px;">
      <p style="margin:0 0 8px;color:#111111;font-weight:bold;text-transform:uppercase;font-size:11px;letter-spacing:0.5px;">Shipping Address</p>
      <p style="margin:0;color:#555555;line-height:1.5;">${addressStr}</p>
    </div>

    ${ctaButton('Go to Vendor Dashboard', `${frontendUrl}/dashboard/vendor/orders`)}
  `;
  return layout('New Order — Drux Vendor Portal', body);
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE 6 — Item Cancelled (Vendor notification)
// ─────────────────────────────────────────────────────────────
function itemCancelledForVendor({ vendorName, orderId, customerName, items = [] }) {
  const body = `
    <h2 style="margin:0 0 12px;color:#111111;font-size:18px;font-weight:bold;">Hello ${vendorName || 'Vendor'},</h2>
    <p style="margin:0 0 16px;color:#111111;font-size:14px;line-height:1.5;">A customer has cancelled items from an order.</p>

    <div style="background-color:#f9f9f9;border:1px solid #eeeeee;border-radius:4px;padding:16px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:1.6;border-collapse:collapse;">
        ${infoRow('Order ID:', `#${shortOrderId(orderId)}`)}
      </table>
    </div>

    <h3 style="margin:24px 0 8px;font-size:13px;border-bottom:1px solid #cccccc;padding-bottom:6px;font-weight:bold;text-transform:uppercase;color:#666666;letter-spacing:0.5px;">Cancelled Items</h3>
    ${itemsTable(items)}

    <div style="border:1px solid #ffcdd2;background-color:#ffebee;padding:16px;border-radius:4px;margin:24px 0;border-left:4px solid #c62828;font-size:13px;">
      <p style="margin:0;color:#c62828;line-height:1.5;font-weight:bold;">Please halt processing or shipping for the above items immediately.</p>
    </div>

    ${ctaButton('Go to Vendor Dashboard', `${frontendUrl}/dashboard/vendor/orders`)}
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
