const apn = require('apn');
const gcm = require('node-gcm');
const pushNotificationConfig = require('../config/pushNotification');

const apnProvider = new apn.Provider(pushNotificationConfig.apn);
const gcmSender = new gcm.Sender(pushNotificationConfig.gcm.apiKey);

module.exports = {
  sendNotification: async (deviceToken, payload) => {
    try {
      if (deviceToken.startsWith('ios')) {
        await apnProvider.send(new apn.Notification(payload), deviceToken);
      } else if (deviceToken.startsWith('android')) {
        await gcmSender.send(new gcm.Message(payload), { registrationTokens: [deviceToken] });
      }
    } catch (error) {
      console.error('Push notification error:', error);
    }
  },
};