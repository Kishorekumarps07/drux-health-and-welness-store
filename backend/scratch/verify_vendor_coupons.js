const prisma = require('../src/lib/prisma');
const vendorCouponsService = require('../src/modules/vendor/vendorCoupons.service');

async function main() {
  console.log('🧪 Starting programmatic validation of Vendor Coupon Manager...');

  // 1. Resolve test vendors
  const vendorAUser = await prisma.user.findUnique({
    where: { email: 'mrcoachofficial@gmail.com' }
  });
  const vendorBUser = await prisma.user.findUnique({
    where: { email: 'test_vendor@druxx.com' }
  });

  if (!vendorAUser || !vendorBUser) {
    console.error('❌ Test users not found in database.');
    process.exit(1);
  }

  const vendorA = await prisma.vendor.findUnique({ where: { userId: vendorAUser.id } });
  const vendorB = await prisma.vendor.findUnique({ where: { userId: vendorBUser.id } });

  // Get a product owned by Vendor B
  const vendorBProduct = await prisma.product.findFirst({
    where: { vendorId: vendorB.id }
  });

  if (!vendorBProduct) {
    console.error('❌ Vendor B product not found in database.');
    process.exit(1);
  }

  let createdCoupon = null;

  try {
    // 2. Test listing coupons for Vendor A
    const initialCoupons = await vendorCouponsService.listCoupons(vendorAUser.id);
    console.log(`✅ List Coupons: Found ${initialCoupons.length} coupons for Vendor A.`);

    // 3. Test creating a valid coupon for Vendor A
    const couponData = {
      code: 'TESTCOACH50',
      discountPercent: 50,
      isActive: true,
      usageLimit: 100
    };
    createdCoupon = await vendorCouponsService.createCoupon(vendorAUser.id, couponData);
    console.log(`✅ Create Coupon: Created coupon "${createdCoupon.code}" for Vendor A.`);

    // 4. Test Product Restriction Violation
    try {
      await vendorCouponsService.createCoupon(vendorAUser.id, {
        code: 'BADCOUPON',
        discountPercent: 10,
        productId: vendorBProduct.id // Belonging to Vendor B
      });
      console.error('❌ Security Violation: Allowed restricting coupon to another vendor\'s product.');
      process.exit(1);
    } catch (err) {
      if (err.statusCode === 403) {
        console.log('✅ Security Enforced: Blocked coupon restriction to another vendor\'s product.');
      } else {
        throw err;
      }
    }

    // 5. Test Global Code Conflict
    try {
      await vendorCouponsService.createCoupon(vendorBUser.id, {
        code: 'TESTCOACH50', // Same code as Vendor A's coupon
        discountPercent: 15
      });
      console.error('❌ Security Violation: Allowed duplicate global coupon code.');
      process.exit(1);
    } catch (err) {
      if (err.statusCode === 409) {
        console.log('✅ Security Enforced: Blocked duplicate global coupon code (409 Conflict).');
      } else {
        throw err;
      }
    }

    // 6. Test Successful Update by Owner
    const updated = await vendorCouponsService.updateCoupon(vendorAUser.id, createdCoupon.id, {
      discountPercent: 60
    });
    console.log(`✅ Update Coupon: Owner successfully updated discountPercent to ${updated.discountPercent}%.`);

    // 7. Test Scoped Update Violation by Non-Owner
    try {
      await vendorCouponsService.updateCoupon(vendorBUser.id, createdCoupon.id, {
        discountPercent: 90
      });
      console.error('❌ Security Violation: Non-owner was allowed to edit Vendor A\'s coupon.');
      process.exit(1);
    } catch (err) {
      if (err.statusCode === 403) {
        console.log('✅ Security Enforced: Blocked non-owner from editing Vendor A\'s coupon.');
      } else {
        throw err;
      }
    }

    // 8. Test Scoped Delete Violation by Non-Owner
    try {
      await vendorCouponsService.deleteCoupon(vendorBUser.id, createdCoupon.id);
      console.error('❌ Security Violation: Non-owner was allowed to delete Vendor A\'s coupon.');
      process.exit(1);
    } catch (err) {
      if (err.statusCode === 403) {
        console.log('✅ Security Enforced: Blocked non-owner from deleting Vendor A\'s coupon.');
      } else {
        throw err;
      }
    }

    // 9. Test Successful Delete by Owner
    await vendorCouponsService.deleteCoupon(vendorAUser.id, createdCoupon.id);
    console.log('✅ Delete Coupon: Owner successfully deleted their own coupon.');
    createdCoupon = null;

    console.log('🎉 ALL VENDOR COUPON SECURITY CHECKS PASSED SUCCESSFULLY!');

  } catch (error) {
    console.error('❌ Testing Failed with unexpected error:', error);
    // Cleanup if coupon was created but not deleted
    if (createdCoupon) {
      await prisma.coupon.delete({ where: { id: createdCoupon.id } }).catch(() => {});
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
