const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String,
        required: true
    }
});

// Create the profile model
const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
