const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  createNotification
} = require('../controllers/notificationController');

router.get('/:userId', getNotifications);
router.put('/:notificationId/read', markAsRead);
router.post('/', createNotification);

module.exports = router;