const usersService = require('./users.service');
const notificationsService = require('./notifications.service');
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

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationsService.list(req.user.id);
  res.json({ status: 'success', results: notifications.length, data: { notifications } });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await notificationsService.markAllRead(req.user.id);
  res.json({ status: 'success', message: 'All notifications marked as read' });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationsService.markRead(req.user.id, req.params.id);
  res.json({ status: 'success', data: { notification } });
});

module.exports = { 
  getProfile, 
  updateProfile, 
  getAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
};
