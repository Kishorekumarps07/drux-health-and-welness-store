const { Router } = require('express');
const { getProfile, updateProfile, getAddresses, createAddress, updateAddress, deleteAddress } = require('./users.controller');
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

module.exports = router;
