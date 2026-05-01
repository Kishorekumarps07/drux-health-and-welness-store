const cartService = require('./cart.service');
const asyncHandler = require('../../lib/asyncHandler');

const getCart    = asyncHandler(async (req, res) => {
  const cart = await cartService.getOrCreate(req.user.id);
  res.json({ status: 'success', data: cart });
});

const addItem    = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body);
  res.json({ status: 'success', data: cart });
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user.id, req.params.itemId, req.body);
  res.json({ status: 'success', data: cart });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.itemId);
  res.json({ status: 'success', data: cart });
});

const clearCart  = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user.id);
  res.status(204).send();
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
