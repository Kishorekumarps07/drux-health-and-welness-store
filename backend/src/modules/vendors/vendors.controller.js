const vendorsService = require('./vendors.service');
const asyncHandler = require('../../lib/asyncHandler');

const apply         = asyncHandler(async (req, res) => {
  const vendor = await vendorsService.apply(req.user.id, req.body);
  res.status(201).json({ status: 'success', data: { vendor } });
});

const getMyStore    = asyncHandler(async (req, res) => {
  const vendor = await vendorsService.getMyStore(req.user.id);
  res.json({ status: 'success', data: { vendor } });
});

const updateMyStore = asyncHandler(async (req, res) => {
  const vendor = await vendorsService.updateMyStore(req.user.id, req.body);
  res.json({ status: 'success', data: { vendor } });
});

const getMyAnalytics = asyncHandler(async (req, res) => {
  const analytics = await vendorsService.getMyAnalytics(req.user.id);
  res.json({ status: 'success', data: { analytics } });
});

const getPublicStore = asyncHandler(async (req, res) => {
  const vendor = await vendorsService.getPublicStore(req.params.slug);
  res.json({ status: 'success', data: { vendor } });
});

const listVendors   = asyncHandler(async (req, res) => {
  const result = await vendorsService.listVendors(req.query);
  res.json({ status: 'success', ...result });
});

module.exports = { apply, getMyStore, updateMyStore, getPublicStore, listVendors, getMyAnalytics };
