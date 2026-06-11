const wishlistService = require('./wishlist.service');
const asyncHandler = require('../../lib/asyncHandler');

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user.id);
  res.json({ status: 'success', data: { items: wishlist } });
});

const addWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ status: 'error', message: 'ProductId is required.' });
  }
  const wishlist = await wishlistService.addItem(req.user.id, productId);
  res.json({ status: 'success', data: { items: wishlist } });
});

const removeWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const wishlist = await wishlistService.removeItem(req.user.id, productId);
  res.json({ status: 'success', data: { items: wishlist } });
});

const syncWishlist = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds)) {
    return res.status(400).json({ status: 'error', message: 'productIds must be an array.' });
  }
  const wishlist = await wishlistService.syncWishlist(req.user.id, productIds);
  res.json({ status: 'success', data: { items: wishlist } });
});

module.exports = {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  syncWishlist
};
