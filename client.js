const mqtt = require('mqtt');
const readline = require('readline');
const axios = require('axios'); // Add axios for HTTP requests

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SLACK_API_URL = 'https://slack.com/api/users.identity';
const SLACK_ACCESS_TOKEN = 'your slack access-token'; // Replace with your Slack access token

// Function to fetch user information
async function getUserInfo() {
  try {
    const response = await axios.get(SLACK_API_URL, {
      headers: {
        Authorization: `Bearer ${SLACK_ACCESS_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user information:', error.message);
    process.exit(1); // Exit the program if fetching user information fails
  }
}

// Connect to MQTT server after executing getUserInfo function
getUserInfo().then(userInfo => {
  const userId = userInfo.user.id;
  const client = mqtt.connect('mqtt://localhost:1883');

  client.on('connect', () => {
    console.log('Connected to MQTT server');

    // Publish user connection event
    client.publish('user/connect', userId);

    // Subscribe to private messages
    client.subscribe(`message/private/${userId}/+`);

    // Subscribe to group messages, assuming the user joins group with ID 'group1'
    client.subscribe('message/group/group1');

    rl.question('Enter message: ', (message) => {
      // Publish one-to-one message, assuming sending to user 'user2'
      client.publish(`message/private/user2/${userId}`, message);

      // Publish group message
      client.publish('message/group/group1', message);

      rl.close();
    });
  });

  client.on('message', (topic, message) => {
    const topics = topic.split('/');

    if (topics[1] === 'private') {
      console.log(`Private message from ${topics[3]}: ${message.toString()}`);
    } else if (topics[1] === 'group') {
      console.log(`Group message from ${topics[2]}: ${message.toString()}`);
    }
  });

  client.on('disconnect', () => {
    // Publish user disconnection event
    client.publish('user/disconnect', userId);
  });
});
