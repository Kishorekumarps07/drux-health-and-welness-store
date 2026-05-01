'use strict';

const vendorOrdersService = require('./vendorOrders.service');
const vendorStatsService = require('./vendorStats.service');
const vendorProfileService = require('./vendorProfile.service');
const asyncHandler = require('../../lib/asyncHandler');
const AppError = require('../../lib/AppError');

/**
 * @desc    Get paginated order items for the vendor
 * @route   GET /api/v1/vendor/orders
 * @access  Private (Vendor)
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const result = await vendorOrdersService.getMyOrderItems(req.user.id, req.query);
  
  res.status(200).json({
    status: 'success',
    ...result
  });
});

/**
 * @desc    Get single order item details
 * @route   GET /api/v1/vendor/orders/:id
 * @access  Private (Vendor)
 */
const getOrderDetails = asyncHandler(async (req, res) => {
  const item = await vendorOrdersService.getOrderItem(req.user.id, req.params.id);
  
  res.status(200).json({
    status: 'success',
    data: { orderItem: item }
  });
});

/**
 * @desc    Update order item status & sync with parent
 * @route   PATCH /api/v1/vendor/orders/:id/status
 * @access  Private (Vendor)
 */
const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) throw new AppError('New status is required.', 400);

  const updatedItem = await vendorOrdersService.updateItemStatus(req.user.id, req.params.id, status);

  res.status(200).json({
    status: 'success',
    data: { orderItem: updatedItem }
  });
});

/**
 * @desc    Get stats for vendor dashboard
 * @route   GET /api/v1/vendor/stats
 * @access  Private (Vendor)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await vendorStatsService.getDashboardStats(req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

/**
 * @desc    Get detailed analytics for vendor
 * @route   GET /api/v1/vendor/analytics
 * @access  Private (Vendor)
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const { range } = req.query;
  const analytics = await vendorProfileService.getAnalytics(req.user.id, range);
  res.status(200).json({
    status: 'success',
    data: { analytics }
  });
});

/**
 * @desc    Get current vendor's profile info
 * @route   GET /api/v1/vendor/me
 * @access  Private (Vendor)
 */
const getMyVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorProfileService.getVendor(req.user.id);
  res.status(200).json({
    status: 'success',
    data: { vendor }
  });
});

/**
 * @desc    Get payment and payout info
 * @route   GET /api/v1/vendor/payments
 * @access  Private (Vendor)
 */
const getPayments = asyncHandler(async (req, res) => {
  const payments = await vendorProfileService.getPayments(req.user.id);
  res.status(200).json({
    status: 'success',
    data: { payments }
  });
});

/**
 * @desc    Update vendor profile settings
 * @route   PATCH /api/v1/vendor/profile
 * @access  Private (Vendor)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const vendor = await vendorProfileService.updateProfile(req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    data: { vendor }
  });
});

module.exports = {
  getMyOrders,
  getOrderDetails,
  updateOrderItemStatus,
  getDashboardStats,
  getAnalytics,
  getMyVendorProfile,
  getPayments,
  updateProfile
};
