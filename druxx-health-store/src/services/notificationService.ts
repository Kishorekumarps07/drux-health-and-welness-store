import api from "@/lib/api";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export const notificationService = {
  /**
   * Fetch all notifications for the current authenticated user
   */
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get('/users/notifications');
    return response.data.data?.notifications || [];
  },

  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead(): Promise<void> {
    await api.put('/users/notifications/read-all');
  },

  /**
   * Mark a specific notification as read by ID
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put(`/users/notifications/${id}/read`);
    return response.data.data?.notification;
  }
};
