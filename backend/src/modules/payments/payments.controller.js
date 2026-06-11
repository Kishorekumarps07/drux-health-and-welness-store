'use strict';

const paymentsService = require('./payments.service');
const asyncHandler = require('../../lib/asyncHandler');
const AppError = require('../../lib/AppError');

/**
 * @desc    Create Razorpay Order Intent based on Cart
 * @route   POST /api/v1/payments/create-intent
 * @access  Private
 */
const createOrderIntent = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { couponCode, addressId, notes } = req.body;
  const razorpayOrder = await paymentsService.createPaymentIntent(userId, { couponCode, addressId, notes });
  const { razorpay: razorpayConfig } = require('../../config/env');

  res.status(200).json({
    status: 'success',
    data: { 
      razorpayOrder: {
        ...razorpayOrder,
        key: razorpayConfig.keyId
      },
      currency: 'INR'
    }
  });
});

/**
 * @desc    Verify Payment Signature and Create Platform Order atomically
 * @route   POST /api/v1/payments/verify-and-create
 * @access  Private
 */
const verifyAndFinalizeOrder = asyncHandler(async (req, res) => {
  const { 
    razorpayOrderId, 
    razorpayPaymentId, 
    razorpaySignature,
    addressId,
    notes,
    couponCode
  } = req.body;
  
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !addressId) {
    throw new AppError('Missing payment or delivery details.', 400);
  }

  const finalOrder = await paymentsService.verifyAndFinalizeOrder(req.user.id, {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    addressId,
    notes,
    couponCode
  });

  res.status(201).json({
    status: 'success',
    data: { order: finalOrder }
  });
});

/**
 * @desc    Handle Razorpay Webhooks Events
 * @route   POST /api/v1/payments/webhook
 * @access  Public (Requires HMAC signature matching)
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const crypto = require('crypto');
  const { razorpay } = require('../../config/env');
  
  // 1. Verify Signature
  // For webhooks, Razorpay computes HMAC on the RAW body
  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
     throw new AppError('Missing webhook signature', 400);
  }

  const expectedSignature = crypto
    .createHmac('sha256', razorpay.webhookSecret)
    .update(req.body) // req.body must be the RAW buffer here (thanks to express.raw)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new AppError('Invalid webhook signature', 400);
  }

  // 2. Parse payload safely
  const payload = JSON.parse(req.body.toString());
  const eventId = req.headers['x-razorpay-event-id'];
  const event = payload.event;
  
  // 3. Delegate to service for idempotent processing
  await paymentsService.processWebhook(event, eventId, payload.payload);

  // 4. Always return 200 OK to Razorpay so it stops retrying
  res.status(200).send('OK');
});

module.exports = { createOrderIntent, verifyAndFinalizeOrder, handleWebhook };
