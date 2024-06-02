const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register-device-token', authMiddleware, notificationController.registerDeviceToken);
router.post('/', authMiddleware, notificationController.sendNotification);

module.exports = router;