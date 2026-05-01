const { Router } = require('express');
const { placeOrder, getMyOrders, getById, cancel } = require('./orders.controller');
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { placeOrderSchema } = require('./orders.validation');

const router = Router();
router.use(protect);

router.post('/',          validate(placeOrderSchema), placeOrder);
router.get('/',           getMyOrders);
router.get('/:id',        getById);
router.put('/:id/cancel', cancel);

module.exports = router;
