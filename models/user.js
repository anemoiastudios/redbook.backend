const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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

const User = mongoose.model("User", userSchema);

module.exports = User;
