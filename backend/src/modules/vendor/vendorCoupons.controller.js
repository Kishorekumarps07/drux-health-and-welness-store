'use strict';

const asyncHandler = require('../../lib/asyncHandler');
const vendorCouponsService = require('./vendorCoupons.service');

/**
 * List all coupons for the logged-in vendor
 */
const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await vendorCouponsService.listCoupons(req.user.id);
  res.json({
    status: 'success',
    results: coupons.length,
    data: { coupons }
  });
});

/**
 * Create a new coupon for the logged-in vendor
 */
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await vendorCouponsService.createCoupon(req.user.id, req.body);
  res.status(201).json({
    status: 'success',
    data: { coupon }
  });
});

/**
 * Update a coupon belonging to the logged-in vendor
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await vendorCouponsService.updateCoupon(req.user.id, req.params.id, req.body);
  res.json({
    status: 'success',
    data: { coupon }
  });
});

/**
 * Delete a coupon belonging to the logged-in vendor
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  await vendorCouponsService.deleteCoupon(req.user.id, req.params.id);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

module.exports = {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
