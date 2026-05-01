const { Router } = require('express');
const { create, list } = require('./reviews.controller');
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { reviewSchema } = require('./reviews.validation');

const router = Router({ mergeParams: true });

router.get('/',  list);
router.post('/', protect, validate(reviewSchema), create);

module.exports = router;
