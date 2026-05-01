const { Router } = require('express');
const { list, getById, getBySlug, create, update, remove, getVendorProducts } = require('./products.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { cacheResponse } = require('../../middleware/cache');
const { productSchema, updateProductSchema } = require('./products.validation');

const router = Router();

// Public (Cached for 5 minutes)
router.get('/',           cacheResponse(300), list);
router.get('/slug/:slug', cacheResponse(300), getBySlug);
router.get('/:id',        cacheResponse(300), getById);

// Vendor-protected
router.use(protect, restrictTo('VENDOR', 'ADMIN'));
router.get('/vendor/my',      getVendorProducts);
router.post('/',              validate(productSchema), create);
router.put('/:id',            validate(updateProductSchema), update);
router.delete('/:id',         remove);

module.exports = router;
