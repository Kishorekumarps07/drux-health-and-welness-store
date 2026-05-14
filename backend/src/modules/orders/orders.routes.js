const { Router } = require('express');
const { placeOrder, getMyOrders, getById, cancel, getVendorOrders, getAllOrders, updateStatus } = require('./orders.controller');
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { placeOrderSchema } = require('./orders.validation');

const { restrictTo } = require('../../middleware/auth');

const router = Router();
router.use(protect);

router.post('/',          validate(placeOrderSchema), placeOrder);
router.get('/',           getMyOrders);
router.get('/vendor',     restrictTo('VENDOR', 'ADMIN'), getVendorOrders);
router.get('/all',        restrictTo('ADMIN'), getAllOrders);
router.get('/:id',        getById);
router.put('/:id/status', restrictTo('VENDOR', 'ADMIN'), updateStatus);
router.put('/:id/cancel', cancel);

module.exports = router;
