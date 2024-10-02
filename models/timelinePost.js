const mongoose = require('mongoose');

const timelinePostSchema = new mongoose.Schema({
    /*
    id: {
        type: String,
        unique: true,
        required: true
    },*/
    username: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    followers: [{
        userId: {
            type: [mongoose.Schema.Types.ObjectId],
            required: true
        },
        hasRead: {  // Indicates whether the follower has read the post
            type: Boolean,
            default: false  // Default to false, meaning the follower hasn't read the post yet
        }
    }]
});

const TimelinePost = mongoose.model("TimelinePost", timelinePostSchema);

module.exports = TimelinePost;
