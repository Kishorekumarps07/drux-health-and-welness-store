const { Router } = require('express');
const { list, getById, getBySlug, create, update, remove, getVendorProducts, getBestSellers } = require('./products.controller');
const { productUpload } = require('../../middleware/upload');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { cacheResponse } = require('../../middleware/cache');
const { productSchema, updateProductSchema } = require('./products.validation');

const router = Router();

// Public (Cache disabled temporarily for real-time testing)
router.get('/',                list);
router.get('/best-sellers',    cacheResponse(60), getBestSellers);   // Real sales-ranked best sellers
router.get('/slug/:slug',      cacheResponse(300), getBySlug);
router.get('/:id',             cacheResponse(300), getById);

// Vendor-protected
router.use(protect, restrictTo('VENDOR', 'ADMIN'));
router.get('/vendor/my',       getVendorProducts);
router.post('/',               productUpload.array('images', 3), validate(productSchema), create);
router.put('/:id',             productUpload.array('images', 3), validate(updateProductSchema), update);
router.delete('/:id',          remove);

module.exports = router;
