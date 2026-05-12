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
  const data = { ...req.body };
  
  // Parse metadata if it's a string (FormData)
  if (data.metadata && typeof data.metadata === 'string') {
    try {
      data.metadata = JSON.parse(data.metadata);
    } catch (e) {
      console.warn("Metadata parsing failed", e);
    }
  }

  if (req.files && req.files.length > 0) {
    data.images = req.files.map((file, index) => ({
      url: file.path,
      isPrimary: index === 0,
      sortOrder: index
    }));
  }

  const product = await productsService.create(req.user.id, data);
  await clearCacheKeys('*products*');
  res.status(201).json({ status: 'success', data: { product } });
});

const update           = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  
  // Parse metadata if it's a string (FormData)
  if (data.metadata && typeof data.metadata === 'string') {
    try {
      data.metadata = JSON.parse(data.metadata);
    } catch (e) {
      console.warn("Metadata parsing failed", e);
    }
  }

  if (req.files && req.files.length > 0) {
    data.images = req.files.map((file, index) => ({
      url: file.path,
      isPrimary: index === 0,
      sortOrder: index
    }));
  }

  const product = await productsService.update(req.user.id, req.params.id, data);
  await clearCacheKeys('*products*');
  res.json({ status: 'success', data: { product } });
});

const remove           = asyncHandler(async (req, res) => {
  await productsService.delete(req.user.id, req.params.id);
  await clearCacheKeys('*products*');
  res.status(204).send();
});

const getVendorProducts = asyncHandler(async (req, res) => {
  const result = await productsService.getVendorProducts(req.user.id, req.query);
  res.json({ status: 'success', ...result });
});

module.exports = { list, getById, getBySlug, create, update, remove, getVendorProducts };
