const adminService = require('./admin.service');
const asyncHandler = require('../../lib/asyncHandler');

const listVendors        = asyncHandler(async (req, res) => {
  const result = await adminService.listVendors(req.query);
  res.json({ status: 'success', ...result });
});

const updateVendorStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const vendor = await adminService.updateVendorStatus(id, status, reason);
  res.json({ status: 'success', data: { vendor } });
});

const getDashboardStats  = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.json({ status: 'success', data: { stats } });
});

const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { range } = req.query;
  const data = await adminService.getRevenueAnalytics(range);
  res.json({ status: 'success', data });
});

const getPlatformPerformance = asyncHandler(async (req, res) => {
  const data = await adminService.getTopPerformance();
  res.json({ status: 'success', data });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const data = await adminService.getActivityFeed();
  res.json({ status: 'success', data });
});

const listAllOrders      = asyncHandler(async (req, res) => {
  const result = await adminService.listAllOrders(req.query);
  res.json({ status: 'success', ...result });
});

const updateOrderStatus  = asyncHandler(async (req, res) => {
  const order = await adminService.updateOrderStatus(req.params.id, req.body.status);
  res.json({ status: 'success', data: { order } });
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.query);
  res.json({ status: 'success', ...result });
});

const listInventory = asyncHandler(async (req, res) => {
  const result = await adminService.listInventory(req.query);
  res.json({ status: 'success', ...result });
});

const listNewsletterSubscribers = asyncHandler(async (req, res) => {
  const result = await adminService.listNewsletterSubscribers(req.query);
  res.json({ status: 'success', ...result });
});

const exportNewsletterCSV = asyncHandler(async (req, res) => {
  // Fetch all subscribers without pagination for export
  const result = await adminService.listNewsletterSubscribers({ page: 1, limit: 100000, search: req.query.search });
  const rows = result.subscribers.map(s => `${s.email},${new Date(s.createdAt).toISOString()}`);
  const csv = ['email,subscribed_at', ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscribers.csv"');
  res.send(csv);
});

const deleteNewsletterSubscriber = asyncHandler(async (req, res) => {
  const { email } = req.params;
  await adminService.deleteNewsletterSubscriber(decodeURIComponent(email));
  res.json({ status: 'success', message: 'Subscriber removed.' });
});

module.exports = { 
  listVendors, 
  updateVendorStatus, 
  getDashboardStats, 
  getRevenueAnalytics,
  getPlatformPerformance,
  getRecentActivity,
  listAllOrders, 
  updateOrderStatus,
  listUsers,
  listInventory,
  listNewsletterSubscribers,
  exportNewsletterCSV,
  deleteNewsletterSubscriber,
};
