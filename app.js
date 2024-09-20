const express = require('express');
const mongoose = require('mongoose');
const profileController = require('./controllers/profileController');
const channelController = require('./controllers/channelController');
const { swaggerUi, specs } = require('./swagger');
const cors = require('cors')
require('dotenv').config()

// Connect to DB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

const app = express();
const PORT = 3001;

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Profile routes
app.get('/api/profile', profileController.getAllProfiles);
app.get('/api/profile/:username', profileController.getProfileByUsername);
app.post('/api/createprofile', profileController.createProfile);
app.post('/api/loginprofile', profileController.loginprofile)
app.put('/api/profile/:username', profileController.updateProfileByUsername);
app.delete('/api/profile/:username', profileController.deleteProfileByUsername);

// Channel routes
app.get('/api/channels', channelController.getAllChannels);
app.post('/api/channels', channelController.createChannel);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
