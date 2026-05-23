const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const { v4: uuidv4 } = require('uuid');

class NotificationsService {
  /**
   * Create a new notification for a user
   */
  async createNotification(userId, title, description, link = null, type = 'order') {
    return prisma.notification.create({
      data: {
        id: uuidv4(),
        userId,
        title,
        description,
        type,
        link,
        read: false
      }
    });
  }

  /**
   * Fetch notifications for a user (most recent first)
   */
  async list(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
  }

  /**
   * Mark a single notification as read
   */
  async markRead(userId, id) {
    const notif = await prisma.notification.findFirst({
      where: { id, userId }
    });
    if (!notif) throw new AppError('Notification not found.', 404);

    return prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  }
}

module.exports = new NotificationsService();
