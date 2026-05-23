const { Router } = require('express');
const { 
  getProfile, 
  updateProfile, 
  getAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} = require('./users.controller');
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { updateProfileSchema, addressSchema } = require('./users.validation');

const router = Router();

// All routes require authentication
router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(validate(updateProfileSchema), updateProfile);

router.route('/addresses')
  .get(getAddresses)
  .post(validate(addressSchema), createAddress);

router.route('/addresses/:id')
  .put(validate(addressSchema), updateAddress)
  .delete(deleteAddress);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;
