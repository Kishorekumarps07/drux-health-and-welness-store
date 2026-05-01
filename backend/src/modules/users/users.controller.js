const usersService = require('./users.service');
const asyncHandler = require('../../lib/asyncHandler');

const getProfile    = asyncHandler(async (req, res) => {
  const user = await usersService.getProfile(req.user.id);
  res.json({ status: 'success', data: { user } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await usersService.updateProfile(req.user.id, req.body);
  res.json({ status: 'success', data: { user } });
});

const getAddresses  = asyncHandler(async (req, res) => {
  const addresses = await usersService.getAddresses(req.user.id);
  res.json({ status: 'success', results: addresses.length, data: { addresses } });
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await usersService.createAddress(req.user.id, req.body);
  res.status(201).json({ status: 'success', data: { address } });
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await usersService.updateAddress(req.user.id, req.params.id, req.body);
  res.json({ status: 'success', data: { address } });
});

const deleteAddress = asyncHandler(async (req, res) => {
  await usersService.deleteAddress(req.user.id, req.params.id);
  res.status(204).send();
});

module.exports = { getProfile, updateProfile, getAddresses, createAddress, updateAddress, deleteAddress };
