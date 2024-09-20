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
const PORT = 3000;

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Swagger UI setup
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Profile routes
app.get('/user/get/all', profileController.getAllProfiles);
app.get('/user/get/:username', profileController.getProfileByUsername);
app.post('/user/create', profileController.createProfile);
app.post('/user/login', profileController.loginprofile)
app.put('/user/update/:username', profileController.updateProfileByUsername);
app.delete('/user/delete/:username', profileController.deleteProfileByUsername);

// Channel routes
app.get('/channel/all', channelController.getAllChannels);
app.post('/channel/create', channelController.createChannel);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
