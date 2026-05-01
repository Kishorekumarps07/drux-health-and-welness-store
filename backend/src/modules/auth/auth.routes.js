const { Router } = require('express');
const { register, login, refresh, logout, getMe } = require('./auth.controller');
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.validation');

const { authLimiter } = require('../../middleware/rateLimit');

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login',    authLimiter, validate(loginSchema),    login);
router.post('/refresh',  validate(refreshSchema),  refresh);
router.post('/logout',   logout);
router.get('/me',        protect, getMe);

module.exports = router;
