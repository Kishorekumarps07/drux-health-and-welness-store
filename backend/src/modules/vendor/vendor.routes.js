'use strict';

const express = require('express');
const { 
  getMyOrders, 
  getOrderDetails, 
  updateOrderItemStatus, 
  getDashboardStats,
  getAnalytics,
  getMyVendorProfile,
  getPayments,
  updateProfile
} = require('./vendorOrders.controller');
const { protect, restrictTo } = require('../../middleware/auth');

const router = express.Router();

// Require Authentication and Vendor Role for all routes
router.use(protect);
router.use(restrictTo('VENDOR'));

/**
 * @route   GET /api/v1/vendor/stats
 * @desc    Get stats for vendor dashboard
 */
router.get('/stats', getDashboardStats);

/**
 * @route   GET /api/v1/vendor/orders
 * @desc    Get paginated order items for the vendor
 */
router.get('/orders', getMyOrders);

/**
 * @route   GET /api/v1/vendor/orders/:id
 * @desc    Get single order item details
 */
router.get('/orders/:id', getOrderDetails);

/**
 * @route   PATCH /api/v1/vendor/orders/:id/status
 * @desc    Update order item status & sync with parent
 */
router.patch('/orders/:id/status', updateOrderItemStatus);

/**
 * @route   GET /api/v1/vendor/analytics
 * @desc    Get detailed analytics for vendor
 */
router.get('/analytics', getAnalytics);

/**
 * @route   GET /api/v1/vendor/me
 * @desc    Get current vendor's profile info
 */
router.get('/me', getMyVendorProfile);

/**
 * @route   GET /api/v1/vendor/payments
 * @desc    Get payout and financial summary
 */
router.get('/payments', getPayments);

const { vendorUpload } = require('../../middleware/upload');

/**
 * @route   PATCH /api/v1/vendor/profile
 * @desc    Update vendor profile settings
 */
router.patch('/profile', vendorUpload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), updateProfile);

module.exports = router;
