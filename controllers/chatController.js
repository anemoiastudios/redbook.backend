const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');

exports.getUserChats = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const chats = await Chat.find({ participants: user._id }).populate('participants', 'username');
    res.status(200).json(chats.map(chat => chat._id));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getChatContents = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId).populate({
      path: 'messages',
      populate: { path: 'sender', select: 'username' },
    });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    res.status(200).json(chat.messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.getChatParticipants = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    res.status(200).json(chat.participants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createNewChat = async (req, res) => {
  const { username1, username2 } = req.body;

  try {
    const user1 = await User.findOne({ username: username1 });
    const user2 = await User.findOne({ username: username2 });
    if (!user1 || !user2) {
      return res.status(404).json({ message: 'One or both users not found' });
    }
    const existingChat = await Chat.findOne({
      participants: { $all: [user1._id, user2._id] }
    });

    if (existingChat) {
      return res.status(409).json({ message: 'Chat already exists', chatId: existingChat._id });
    }
    const newChat = new Chat({
      participants: [user1._id, user2._id]
    });

    await newChat.save();

    res.status(201).json({ message: 'Chat created successfully', chat: newChat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { senderId, content } = req.body;
  if (!senderId || !content) {
    return res.status(400).json({ message: 'Sender ID and content are required' });
  }

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Authorization check
    if (!chat.participants.includes(senderId)) {
      return res.status(403).json({ message: 'User not authorized to send messages in this chat' });
    }
    const message = new Message({ sender: senderId, content, timestamp: new Date() });
    await message.save();

    chat.messages.push(message._id);
    chat.lastMessage = message._id;
    await chat.save();

    res.status(201).json({ message: 'Message sent', chat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};