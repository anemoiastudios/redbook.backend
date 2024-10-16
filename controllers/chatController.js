const Chat = require('../models/chat');

// Get chat details by chat ID
exports.getChatById = async (req, res) => {
    const { chatId } = req.params;
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.json(chat);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @swagger
 * /chat/get/{chatId}:
 *   get:
 *     summary: Get chat details by chat ID
 *     parameters:
 *       - name: chatId
 *         in: path
 *         required: true
 *         description: The ID of the chat
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat details
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */

