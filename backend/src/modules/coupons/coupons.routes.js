const { Router } = require('express');
const { list, validateCoupon, create, update, remove } = require('./coupons.controller');
const { protect, restrictTo } = require('../../middleware/auth');

const router = Router();

// Public / User route: validate coupon
router.get('/validate/:code', protect, validateCoupon);

// Admin routes
router.use(protect, restrictTo('ADMIN'));
router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
