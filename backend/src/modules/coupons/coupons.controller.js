const couponsService = require('./coupons.service');
const asyncHandler = require('../../lib/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const coupons = await couponsService.list();
  res.json({ status: 'success', results: coupons.length, data: { coupons } });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponsService.validateCoupon(req.params.code);
  res.json({ status: 'success', data: { coupon } });
});

const create = asyncHandler(async (req, res) => {
  const coupon = await couponsService.create(req.body);
  res.status(201).json({ status: 'success', data: { coupon } });
});

const update = asyncHandler(async (req, res) => {
  const coupon = await couponsService.update(req.params.id, req.body);
  res.json({ status: 'success', data: { coupon } });
});

const remove = asyncHandler(async (req, res) => {
  await couponsService.delete(req.params.id);
  res.status(204).send();
});

module.exports = { list, validateCoupon, create, update, remove };
