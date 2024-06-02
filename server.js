const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Endpoint to list files in a specific channel
app.get('/files/:channel', (req, res) => {
    const channelPath = path.join(__dirname, 'uploads', req.params.channel);
    fs.readdir(channelPath, (err, files) => {
        if (err) {
            return res.status(500).send({ message: 'Error reading directory or channel does not exist' });
        }
        res.status(200).send({ files });
    });
});

// Endpoint to download a specific file from a channel
app.get('/files/:channel/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.channel, req.params.filename);
    res.download(filePath, (err) => {
        if (err) {
            res.status(404).send({ message: 'File not found' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});