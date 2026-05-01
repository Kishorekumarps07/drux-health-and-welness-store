const reviewsService = require('./reviews.service');
const asyncHandler = require('../../lib/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const review = await reviewsService.create(req.user.id, req.params.productId, req.body);
  res.status(201).json({ status: 'success', data: { review } });
});

const list = asyncHandler(async (req, res) => {
  const result = await reviewsService.listForProduct(req.params.productId, req.query);
  res.json({ status: 'success', ...result });
});

module.exports = { create, list };
