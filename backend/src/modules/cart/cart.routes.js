const express = require('express');
const { getCart, addItem, updateItem, removeItem, clearCart, syncCart } = require('./cart.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/',                    getCart);
router.post('/items',              addItem);
router.post('/sync',               syncCart);
router.put('/items/:itemId',       updateItem);
router.delete('/items/:itemId',    removeItem);
router.delete('/',                 clearCart);

module.exports = router;
