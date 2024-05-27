const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

// Maintain a map of users and their connections
const users = new Map();

client.on('connect', () => {
  console.log('Connected to MQTT server');

  // Subscribe to user connection and disconnection topics
  client.subscribe('user/connect');
  client.subscribe('user/disconnect');

  // Subscribe to private message topics
  client.subscribe('message/private/+/+');

  // Subscribe to group message topics
  client.subscribe('message/group/+');
});

client.on('message', (topic, message) => {
  const topics = topic.split('/');

  switch (topics[0]) {
    case 'user':
      handleUserEvent(topics[1], message.toString());
      break;
    case 'message':
      if (topics[1] === 'private') {
        handlePrivateMessage(topics[2], topics[3], message.toString());
      } else if (topics[1] === 'group') {
        handleGroupMessage(topics[2], message.toString());
      }
      break;
    default:
      break;
  }
});

// Handle user connection and disconnection events
function handleUserEvent(event, userId) {
  switch (event) {
    case 'connect':
      users.set(userId, client);
      break;
    case 'disconnect':
      users.delete(userId);
      break;
    default:
      break;
  }
}

// Handle private messages
function handlePrivateMessage(fromUserId, toUserId, message) {
  const toUserClient = users.get(toUserId);
  if (toUserClient) {
    toUserClient.publish(`message/private/${toUserId}/${fromUserId}`, message);
  }
}

// Handle group messages
function handleGroupMessage(groupId, message) {
  client.publish(`message/group/${groupId}`, message);
}

console.log('MQTT server is running');