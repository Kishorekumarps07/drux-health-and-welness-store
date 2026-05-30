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
const { onboardVendor } = require('./vendorOnboarding.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  generateCouponCode
} = require('./vendorCoupons.controller');

const router = express.Router();

// Require Authentication
router.use(protect);

/**
 * @route   POST /api/v1/vendor/onboard
 * @desc    Initialize a vendor profile
 */
router.post('/onboard', onboardVendor);

/**
 * @route   GET /api/v1/vendor/me
 * @desc    Get current vendor's profile info
 */
router.get('/me', getMyVendorProfile);

// Require Vendor Role for all subsequent routes
router.use(restrictTo('VENDOR', 'ADMIN'));

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

/**
 * @route   GET /api/v1/vendor/coupons
 * @desc    List all coupons belonging to this vendor
 */
router.get('/coupons', listCoupons);

/**
 * @route   GET /api/v1/vendor/coupons/generate
 * @desc    Automatically generate a unique, store-prefixed coupon code for this vendor
 */
router.get('/coupons/generate', generateCouponCode);

/**
 * @route   POST /api/v1/vendor/coupons
 * @desc    Create a new coupon scoped strictly to this vendor
 */
router.post('/coupons', createCoupon);

/**
 * @route   PUT /api/v1/vendor/coupons/:id
 * @desc    Update a coupon owned by this vendor
 */
router.put('/coupons/:id', updateCoupon);

/**
 * @route   DELETE /api/v1/vendor/coupons/:id
 * @desc    Delete a coupon owned by this vendor
 */
router.delete('/coupons/:id', deleteCoupon);

module.exports = router;
