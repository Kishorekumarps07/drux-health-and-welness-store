const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const { jwt: jwtConfig } = require('../../config/env');

class AuthService {
  /**
   * Register a new user (customer or vendor).
   */
  async register({ name, email, password, phone, role }) {
    // Check duplicate
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError('An account with this email already exists.', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, roles: Array.isArray(role) ? role : [role || 'CUSTOMER'] },
      select: { id: true, name: true, email: true, roles: true, createdAt: true },
    });

    const { accessToken, refreshToken } = await this._issueTokens(user);

    return { user, accessToken, refreshToken };
  }

  /**
   * Login with email and password.
   */
  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid email or password.', 401);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new AppError('Invalid email or password.', 401);

    const { accessToken, refreshToken } = await this._issueTokens(user);

    const safeUser = {
      id: user.id, name: user.name, email: user.email,
      roles: user.roles, avatarUrl: user.avatarUrl,
    };

    return { user: safeUser, accessToken, refreshToken };
  }

  /**
   * Refresh access token using a valid refresh token.
   */
  async refresh(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.refreshSecret);
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Refresh token is invalid or expired. Please log in again.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, roles: true, email: true },
    });
    if (!user) throw new AppError('User not found.', 401);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token } });
    return this._issueTokens(user);
  }

  /**
   * Revoke a refresh token (logout).
   */
  async logout(token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  /**
   * Get the current authenticated user's profile.
   */
  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true,
        roles: true, avatarUrl: true, isVerified: true, createdAt: true,
        vendor: { select: { id: true, storeName: true, storeSlug: true, approvalStatus: true } },
      },
    });
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  async _issueTokens(user) {
    const { v4: uuidv4 } = require('uuid');
    const payload = { id: user.id, roles: user.roles, jti: uuidv4() };

    const accessToken = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expire });
    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpire });

    // Persist refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();
