const { Router } = require('express');
const { list, getById, create, update, remove } = require('./categories.controller');
const { protect, restrictTo } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { categorySchema } = require('./categories.validation');

const router = Router();

router.get('/',     list);
router.get('/:id',  getById);

// Admin only
router.use(protect, restrictTo('ADMIN'));
router.post('/',        validate(categorySchema), create);
router.put('/:id',      validate(categorySchema), update);
router.delete('/:id',   remove);

module.exports = router;
