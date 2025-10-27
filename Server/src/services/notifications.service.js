import socketService from "./Socket/index.socket.service.js";

class NotificationService {
  async createNotification(userId, type, data) {
    try {
      const notification = await Notification.create({ userId, type, data });

      socketService.emitNotification(userId, notification);
      return notification;
    } catch (error) {
      console.error("Notification creation failed:", error);
      throw error;
    }
  }
}
export const notificationService = new NotificationService();
