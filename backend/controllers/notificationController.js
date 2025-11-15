const notificationService = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
  const recipientId = req.user.user_id;

  try {
    const notifications =
      await notificationService.getNotificationsByRecipientId(recipientId);
    res.status(200).json({
      message: "Notifications fetched successfully!",
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error fetching notifications." });
  }
};

exports.markAsRead = async (req, res) => {
  const recipientId = req.user.user_id;

  try {
    await notificationService.markNotificationsAsRead(recipientId);
    res.status(200).json({
      message: "All unread notifications marked as read.",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res
      .status(500)
      .json({ message: "Server error marking notifications as read." });
  }
};
