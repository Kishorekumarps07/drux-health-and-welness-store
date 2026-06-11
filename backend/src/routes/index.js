const { Router } = require('express');

const authRoutes       = require('../modules/auth/auth.routes');
const usersRoutes      = require('../modules/users/users.routes');
const vendorsRoutes    = require('../modules/vendors/vendors.routes');
const vendorRoutes     = require('../modules/vendor/vendor.routes'); // New Vendor Portal logic
const categoriesRoutes = require('../modules/categories/categories.routes');
const productsRoutes   = require('../modules/products/products.routes');
const cartRoutes       = require('../modules/cart/cart.routes');
const ordersRoutes     = require('../modules/orders/orders.routes');
const reviewsRoutes    = require('../modules/reviews/reviews.routes');
const adminRoutes      = require('../modules/admin/admin.routes');
const paymentsRoutes   = require('../modules/payments/payments.routes');
const cmsRoutes        = require('../modules/cms/cms.routes');
const uploadRoutes     = require('../modules/upload/upload.routes');
const couponsRoutes    = require('../modules/coupons/coupons.routes');
const wishlistRoutes   = require('../modules/wishlist/wishlist.routes');

const router = Router();

/**
 * API Root — Health & Metadata
 */
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Druxx Health Store API v1 is active and responsive.',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

const prisma = require('../lib/prisma');

/**
 * Public: Newsletter Subscription
 */
router.post('/newsletter/subscribe', async (req, res, next) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ status: 'error', message: 'Please provide a valid email address.' });
  }
  try {
    const trimmedEmail = email.toLowerCase().trim();
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: trimmedEmail }
    });
    if (existing) {
      return res.status(200).json({ status: 'success', message: 'You are already subscribed!' });
    }
    await prisma.newsletterSubscription.create({
      data: { email: trimmedEmail }
    });
    console.log(`[NEWSLETTER] New signup: ${trimmedEmail}`);
    res.json({ status: 'success', message: 'Subscription successful!' });
  } catch (error) {
    next(error);
  }
});

router.use('/auth',        authRoutes);
router.use('/users',       usersRoutes);
router.use('/vendors',     vendorsRoutes); // Public store listing
router.use('/vendor',      vendorRoutes);  // Secure Vendor Management Portal

// Reviews are nested under products
router.use('/products/:productId/reviews', reviewsRoutes);

router.use('/categories',  categoriesRoutes);
router.use('/products',    productsRoutes);
router.use('/cart',        cartRoutes);
router.use('/wishlist',    wishlistRoutes);
router.use('/orders',      ordersRoutes);
router.use('/payments',    paymentsRoutes);
router.use('/admin',       adminRoutes);
router.use('/cms',         cmsRoutes);
router.use('/upload',      uploadRoutes);
router.use('/coupons',     couponsRoutes);

module.exports = router;
