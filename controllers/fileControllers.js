const File = require('../models/File');
const path = require('path');

const uploadFile = async (req, res) => {
    try {
        const file = new File({
            filename: req.file.filename,
            path: req.file.path,
            channel: req.body.channel
        });
        await file.save();
        res.status(201).json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFilesByChannel = async (req, res) => {
    try {
        const files = await File.find({ channel: req.params.channel });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.download(path.resolve(file.path));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    uploadFile,
    getFilesByChannel,
    downloadFile
};
