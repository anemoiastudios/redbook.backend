const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

// Create the channel model
const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;