const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

class UsersService {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true,
        roles: true, avatarUrl: true, isVerified: true, createdAt: true,
        vendor: {
          select: { approvalStatus: true }
        }
      },
    });
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  async updateProfile(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
    });
  }

  // ── Addresses ─────────────────────────────────────────────────────────────

  async getAddresses(userId) {
    return prisma.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
  }

  async createAddress(userId, data) {
    // If new address is default, unset others
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return prisma.address.create({ data: { ...data, userId } });
  }

  async updateAddress(userId, addressId, data) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new AppError('Address not found.', 404);

    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }

    return prisma.address.update({ where: { id: addressId }, data });
  }

  async deleteAddress(userId, addressId) {
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new AppError('Address not found.', 404);
    await prisma.address.delete({ where: { id: addressId } });
  }
}

module.exports = new UsersService();
