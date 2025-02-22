const mongoose = require('mongoose');

const ArchiveSchema = new mongoose.Schema({
    title: String,
    synopsis: String,
    imageUrl: String,
    actionText: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Archive', ArchiveSchema);
