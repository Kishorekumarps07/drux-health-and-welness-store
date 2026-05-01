'use strict';

const express = require('express');
const { createOrderIntent, verifyAndFinalizeOrder, handleWebhook } = require('./payments.controller');
const { protect } = require('../../middleware/auth');
const { paymentLimiter } = require('../../middleware/rateLimit');

const router = express.Router();

/**
 * @route   POST /api/v1/payments/webhook
 * @desc    Razorpay Webhook listener (Requires Raw Body, no JWT)
 */
router.post('/webhook', handleWebhook);

// All client-facing payment routes are protected & rate-limited
router.use(protect);
router.use(paymentLimiter);

/**
 * @route   POST /api/v1/payments/create-intent
 * @desc    Create Razorpay Order based on Cart
 */
router.post('/create-intent', createOrderIntent);

/**
 * @route   POST /api/v1/payments/verify-and-create
 * @desc    Verify Razorpay payment and create order atomically
 */
router.post('/verify-and-create', verifyAndFinalizeOrder);

module.exports = router;
