const Channel = require('../models/channel');

exports.getAllChannels = async (req, res) => {
    try {
        const channels = await Channel.find();
        res.json(channels);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createChannel = async (req, res) => {
    try {
        const { name } = req.body;
        const newChannel = new Channel({ name });
        await newChannel.save();
        res.json({ message: 'Channel created successfully', newChannel });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
