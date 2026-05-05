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

router.use('/auth',        authRoutes);
router.use('/users',       usersRoutes);
router.use('/vendors',     vendorsRoutes); // Public store listing
router.use('/vendor',      vendorRoutes);  // Secure Vendor Management Portal

// Reviews are nested under products
router.use('/products/:productId/reviews', reviewsRoutes);

router.use('/categories',  categoriesRoutes);
router.use('/products',    productsRoutes);
router.use('/cart',        cartRoutes);
router.use('/orders',      ordersRoutes);
router.use('/payments',    paymentsRoutes);
router.use('/admin',       adminRoutes);
router.use('/cms',         cmsRoutes);

module.exports = router;
