const { Router } = require('express');
const { 
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
  sendNewsletterBlast,
} = require('./admin.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { statusSchema } = require('../vendors/vendors.validation');

const router = Router();
router.use(protect, restrictTo('ADMIN'));

router.get('/analytics/overview',      getDashboardStats);
router.get('/analytics/revenue',       getRevenueAnalytics);
router.get('/analytics/performance',   getPlatformPerformance);
router.get('/analytics/activity',      getRecentActivity);

router.get('/vendors',               listVendors);
router.put('/vendors/:id/status',    validate(statusSchema), updateVendorStatus);

router.get('/users',                 listUsers);

router.get('/orders',                listAllOrders);
router.put('/orders/:id/status',     updateOrderStatus);

router.get('/inventory',             listInventory);

// Newsletter subscriber management
router.get('/newsletter/subscribers',        listNewsletterSubscribers);
router.get('/newsletter/subscribers/export', exportNewsletterCSV);
router.delete('/newsletter/subscribers/:email', deleteNewsletterSubscriber);
router.post('/newsletter/send',              sendNewsletterBlast);

module.exports = router;
