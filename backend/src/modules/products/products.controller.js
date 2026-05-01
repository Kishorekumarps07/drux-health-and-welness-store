const productsService = require('./products.service');
const asyncHandler = require('../../lib/asyncHandler');
const { clearCacheKeys } = require('../../middleware/cache');

const list             = asyncHandler(async (req, res) => {
  const result = await productsService.list(req.query);
  res.json({ status: 'success', ...result });
});

const getById          = asyncHandler(async (req, res) => {
  const product = await productsService.getById(req.params.id);
  res.json({ status: 'success', data: { product } });
});

const getBySlug        = asyncHandler(async (req, res) => {
  const product = await productsService.getBySlug(req.params.slug);
  res.json({ status: 'success', data: { product } });
});

const create           = asyncHandler(async (req, res) => {
  const product = await productsService.create(req.user.id, req.body);
  await clearCacheKeys('/products*');
  res.status(201).json({ status: 'success', data: { product } });
});

const update           = asyncHandler(async (req, res) => {
  const product = await productsService.update(req.user.id, req.params.id, req.body);
  await clearCacheKeys('/products*');
  res.json({ status: 'success', data: { product } });
});

const remove           = asyncHandler(async (req, res) => {
  await productsService.delete(req.user.id, req.params.id);
  await clearCacheKeys('/products*');
  res.status(204).send();
});

const getVendorProducts = asyncHandler(async (req, res) => {
  const result = await productsService.getVendorProducts(req.user.id, req.query);
  res.json({ status: 'success', ...result });
});

module.exports = { list, getById, getBySlug, create, update, remove, getVendorProducts };
