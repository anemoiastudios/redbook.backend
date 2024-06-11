const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    bio: {
        type: String
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    birthday: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the profile model
const Profile = mongoose.model("profile", profileSchema, "profiles");

module.exports = Profile;
