'use strict';

const prisma = require('../../lib/prisma');
const asyncHandler = require('../../lib/asyncHandler');
const AppError = require('../../lib/AppError');

/**
 * @desc    Initialize a vendor profile for an existing VENDOR user
 * @route   POST /api/v1/vendor/onboard
 * @access  Private (Auth required)
 */
const onboardVendor = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { storeName, storeDescription, category, gstNumber } = req.body;

  if (!storeName) {
    throw new AppError('Store name is required.', 400);
  }

  // 1. Ensure user has the VENDOR role
  if (!req.user.roles.includes('VENDOR')) {
    await prisma.user.update({
      where: { id: userId },
      data: { roles: { set: [...req.user.roles, 'VENDOR'].filter((r, i, a) => a.indexOf(r) === i) } }
    });
  }

  // 2. Check if profile already exists
  const existingVendor = await prisma.vendor.findUnique({ where: { userId } });
  if (existingVendor) {
    return res.status(200).json({
      status: 'success',
      message: 'Vendor profile already exists.',
      data: { vendor: existingVendor }
    });
  }

  // 3. Create the profile
  const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
  
  const vendor = await prisma.vendor.create({
    data: {
      userId,
      storeName,
      storeSlug: slug,
      storeDescription,
      gstNumber,
      approvalStatus: 'PENDING'
    }
  });

  res.status(201).json({
    status: 'success',
    message: 'Vendor profile initialized successfully.',
    data: { vendor }
  });
});

module.exports = { onboardVendor };
