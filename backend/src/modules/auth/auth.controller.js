const authService = require('./auth.service');
const asyncHandler = require('../../lib/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ status: 'success', data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ status: 'success', data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refresh(refreshToken);
  res.status(200).json({ status: 'success', data: tokens });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  res.status(204).send();
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.status(200).json({ status: 'success', data: { user } });
});

module.exports = { register, login, refresh, logout, getMe };
