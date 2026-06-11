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
const {
  listShipments,
  getShipmentDetails,
  bookShipment,
  getShipmentLabel,
  trackShipment,
  handoverShipment,
  cancelShipment,
  generateAwb,
  manualShipment
} = require('./vendorShipments.controller');

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
 * @route   GET /api/v1/vendor/shipments
 * @desc    Get vendor's shipments
 */
router.get('/shipments', listShipments);

/**
 * @route   GET /api/v1/vendor/shipments/:id
 * @desc    Get details of a single vendor shipment
 */
router.get('/shipments/:id', getShipmentDetails);

/**
 * @route   POST /api/v1/vendor/shipments/:id/book
 * @desc    Book a shipment on Shiprocket and assign AWB/courier info
 */
router.post('/shipments/:id/book', bookShipment);

/**
 * @route   GET /api/v1/vendor/shipments/:id/label
 * @desc    Generate printable PDF shipping label
 */
router.get('/shipments/:id/label', getShipmentLabel);

/**
 * @route   GET /api/v1/vendor/shipments/:id/track
 * @desc    Get live tracking events for a shipment
 */
router.get('/shipments/:id/track', trackShipment);

/**
 * @route   POST /api/v1/vendor/shipments/:id/handover
 * @desc    Mark a shipment as handed over / dispatched to courier
 */
router.post('/shipments/:id/handover', handoverShipment);

/**
 * @route   POST /api/v1/vendor/shipments/:id/cancel
 * @desc    Cancel a shipment and its booked courier order
 */
router.post('/shipments/:id/cancel', cancelShipment);

/**
 * @route   POST /api/v1/vendor/shipments/:id/awb
 * @desc    Generate/Assign AWB for a booked shipment
 */
router.post('/shipments/:id/awb', generateAwb);

/**
 * @route   POST /api/v1/vendor/shipments/:id/manual-ship
 * @desc    Mark a shipment as shipped manually (with custom AWB and courier name)
 */
router.post('/shipments/:id/manual-ship', manualShipment);

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
