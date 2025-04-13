const Archive = require('../models/archive');
const Post = require('../models/post');

exports.getArchives = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const archives = await Archive.find({ userId });
        res.json(archives);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user archives", error });
    }
};

exports.archivePost = async (req, res) => {
    try {
        const { postId, userId } = req.body;

        // Find original post
        if (!postId || !userId) {
            return res.status(400).json({ message: "Post ID and User ID are required" });
        }
        // Create an archive entry based on the post
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const archive = new Archive({
            userId,
            title: post.title,
            synopsis: post.synopsis,
            imageUrl: post.imageUrl,
            actionText: post.actionText,
        });

        await archive.save();
        res.json({ message: "Post archived successfully", archive });

    } catch (error) {
        res.status(500).json({ message: "Error archiving post", error });
    }
};
