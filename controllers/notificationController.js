const Notification = require('../models/notification')

const getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  try {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const createNotification = async (req, res) => {
  const { userId, type, content, link } = req.body;
  try {
    const notification = new Notification({ userId, type, content, link });
    await notification.save();

    if (req.io) {
      req.io.to(userId).emit('notification', notification);
    }

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification
};
