const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    bio: {
        type: String
    },
    birthdate: {
        type: Date
    }
});

// Create the profile model
const Profile = mongoose.model("profile", profileSchema, "profiles");

module.exports = Profile;
