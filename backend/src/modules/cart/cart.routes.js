const { Router } = require('express');
const { getCart, addItem, updateItem, removeItem, clearCart } = require('./cart.controller');
const { protect } = require('../../middleware/auth');

const router = Router();
router.use(protect);

router.get('/',                    getCart);
router.post('/items',              addItem);
router.put('/items/:itemId',       updateItem);
router.delete('/items/:itemId',    removeItem);
router.delete('/',                 clearCart);

module.exports = router;
