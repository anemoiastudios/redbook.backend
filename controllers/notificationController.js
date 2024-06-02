const User = require('../models/user');
const pushNotificationService = require('../services/pushNotificationService');

module.exports = {
  registerDeviceToken: async (req, res) => {
    try {
      const { deviceToken } = req.body;
      await User.findByIdAndUpdate(req.user._id, { deviceToken });
      res.status(200).json({ message: 'Device token registered successfully' });
    } catch (error) {
      console.error('Error registering device token:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  sendNotification: async (req, res) => {
    try {
      const { userId, message } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await pushNotificationService.sendNotification(user.deviceToken, message);
      res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};