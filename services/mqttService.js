const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt');

const client = mqtt.connect(mqttConfig.url, mqttConfig.options);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

client.on('error', (error) => {
  console.error('MQTT error:', error);
});

module.exports = {
  publish: (topic, message) => {
    client.publish(topic, message);
  },
  subscribe: (topic, callback) => {
    client.subscribe(topic);
    client.on('message', (topic, message) => {
      callback(topic, message.toString());
    });
  },
};