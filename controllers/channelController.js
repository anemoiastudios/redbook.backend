const Channel = require('../models/channel');

/**
 * @swagger
 * components:
 *   schemas:
 *     Channel:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *       example:
 *         name: General
 */

/**
 * @swagger
 * tags:
 *   name: Channels
 *   description: Channel management
 */

/**
 * @swagger
 * /channel/get/all:
 *   get:
 *     summary: Get all channels
 *     tags: [Channels]
 *     responses:
 *       200:
 *         description: List of channels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Channel'
 *       500:
 *         description: Server error
 */
exports.getAllChannels = async (req, res) => {
    try {
        const channels = await Channel.find();
        res.json(channels);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @swagger
 * /channel/create:
 *   post:
 *     summary: Create a new channel
 *     tags: [Channels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Channel'
 *     responses:
 *       201:
 *         description: Channel created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Channel'
 *       500:
 *         description: Server error
 */
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
