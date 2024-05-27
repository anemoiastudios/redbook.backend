const express = require('express');
const mongoose = require('mongoose');
const profileController = require('./controllers/profileController');
const channelController = require('./controllers/channelController');

const app = express();
const PORT = 3000;

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/anemoia')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

// Profile routes
app.get('/api/profile', profileController.getAllProfiles);
app.get('/api/profile/:username', profileController.getProfileByUsername);
app.post('/api/profile', profileController.createProfile);
app.put('/api/profile/:username', profileController.updateProfileByUsername);
app.delete('/api/profile/:username', profileController.deleteProfileByUsername);

// Channel routes
app.get('/api/channels', channelController.getAllChannels);
app.post('/api/channels', channelController.createChannel);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});