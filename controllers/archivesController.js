const Archive = require('../models/archive'); // Import model

exports.getArchives = async (req, res) => {
    try {
        const archives = await Archive.find(); // Fetch all archived posts
        res.json(archives);
    } catch (error) {
        res.status(500).json({ message: "Error fetching archives", error });
    }
};
