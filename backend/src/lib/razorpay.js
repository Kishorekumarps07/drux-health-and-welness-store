'use strict';

const Razorpay = require('razorpay');
const { razorpay } = require('../config/env');

if (!razorpay.keyId || !razorpay.keySecret) {
  console.warn('[Razorpay] Key ID or Secret missing. Payments will fail.');
}

const razorpayInstance = new Razorpay({
  key_id: razorpay.keyId,
  key_secret: razorpay.keySecret,
});

module.exports = razorpayInstance;
