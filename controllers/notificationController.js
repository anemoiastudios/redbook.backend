const Notification = require('../models/notification');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - content
 *         - link
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user who received the notification
 *           format: uuid
 *         type:
 *           type: string
 *           description: Type of notification (mention, reaction, reply, follow_request)
 *         content:
 *           type: string
 *           description: Notification content
 *         link:
 *           type: string
 *           description: Link associated with the notification
 *         read:
 *           type: boolean
 *           description: Indicates if the notification has been read
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Time when the notification was created
 *       example:
 *         userId: "63f78d2322b43d0012b47c89"
 *         type: "mention"
 *         content: "@johndoe mentioned you in a post"
 *         link: "/posts/12345"
 *         read: false
 *         createdAt: "2024-10-17T12:30:00.000Z"
 */

/**
 * @swagger
 * /notification/get/{userId}:
 *   get:
 *     summary: Get Notifications for a User
 *     description: Returns a list of notifications for a specific user
 *     tags: [Notifications]
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user for whom to retrieve notifications
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful retrieval of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Server error
 */
exports.getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200);
    res.json(notifications);
  } catch (err) {
    console.log(err.message);
    res.status(500);
    res.json({ message: 'Server error' });
  }
};

/**
 * @swagger
 * /notification/read/{notificationId}:
 *   put:
 *     summary: Mark a Notification as Read
 *     description: Marks a specific notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - name: notificationId
 *         in: path
 *         description: ID of the notification to mark as read
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Notification read successfully
 *       500:
 *         description: Server error 
 */
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await Notification.findByIdAndUpdate(notificationId, { read: true });
    if (notification) {
      res.status(204);
      res.json({ message: 'Notification read successfully' })
    }
    else {
      throw Error;
    }
  } catch (err) {
    res.status(500);
    res.json({ message: 'Server error' });
  }
};

/**
 * @swagger
 * /notification/create:
 *   post:
 *     summary: Create a New Notification
 *     description: Creates a new notification for a user
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to receive the notification
 *                 required: true
 *               type:
 *                 type: string
 *                 description: Type of notification (mention, reaction, reply, follow_request)
 *                 required: true
 *               content:
 *                 type: string
 *                 description: Notification content
 *                 required: true
 *               link:
 *                 type: string
 *                 description: Link associated with the notification
 *                 required: true
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Server error
 */
exports.createNotification = async (req, res) => {
  const { userId, type, content, link } = req.body;
  try {
    const notification = new Notification({ userId, type, content, link });
    await notification.save();

    if (req.io) {
      req.io.to(userId).emit('notification', notification);
    }

    const valid_types = ['mention', 'reaction', 'reply', 'follow_request']
    var valid_type = false;
    for (var x in valid_types) {
      if (x == type) {
        valid_type = true;
        break;
      }
    }

    if (!valid_type) {
      throw Error;
    }

    res.status(201);
    res.json(notification);
  } catch (err) {
    res.status(500);
    res.json({ message: 'Server error' });
  }
};
