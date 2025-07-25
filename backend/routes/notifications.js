import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getUserNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import Notification from "../models/notifications.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user's notifications
router.get("/:userId", getUserNotifications);

// Mark notification as read
router.put("/:id/read", markAsRead);

// Mark all user's notifications as read
router.put("/:userId/read-all", markAllAsRead);

// DELETE a notification
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error });
  }
});

export default router;