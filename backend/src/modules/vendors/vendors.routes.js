const { Router } = require('express');
const { apply, getMyStore, updateMyStore, getPublicStore, listVendors, getMyAnalytics } = require('./vendors.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { applySchema, updateStoreSchema } = require('./vendors.validation');

const router = Router();

router.get('/',         listVendors);
router.get('/:slug',    getPublicStore);

router.use(protect);
router.post('/apply',   validate(applySchema), apply);
router.get('/me',       getMyStore);
router.put('/me',       validate(updateStoreSchema), updateMyStore);
router.get('/me/analytics', restrictTo('VENDOR'), getMyAnalytics);

module.exports = router;
