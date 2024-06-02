const Message = require('../models/message');
const mqttService = require('../services/mqttService');

module.exports = {
  sendMessage: async (req, res) => {
    try {
      const { receiver, content } = req.body;
      const message = new Message({
        sender: req.user._id,
        receiver,
        content,
      });
      await message.save();

      mqttService.publish(`user_${receiver}`, JSON.stringify(message));

      res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  getMessages: async (req, res) => {
    try {
      const messages = await Message.find({
        $or: [
          { sender: req.user._id, receiver: req.params.userId },
          { sender: req.params.userId, receiver: req.user._id },
        ],
      }).sort({ timestamp: 1 });

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};