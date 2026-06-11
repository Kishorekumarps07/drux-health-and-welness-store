const express = require('express');
const { getWishlist, addWishlistItem, removeWishlistItem, syncWishlist } = require('./wishlist.controller');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/',                    getWishlist);
router.post('/items',              addWishlistItem);
router.delete('/items/:productId', removeWishlistItem);
router.post('/sync',               syncWishlist);

module.exports = router;
