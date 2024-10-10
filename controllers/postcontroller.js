const mongoose = require('mongoose');
const Post = require('../models/post');

/**
 * @swagger
 * /posts/like/{id}:
 *   post:
 *     summary: Like a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to like
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post liked
 *                 likes:
 *                   type: integer
 *                   example: 1
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
exports.likePost = async (req, res) => {
    try {
        const postId = req.params.id;

        // Validate ObjectID
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.likes += 1;
        await post.save();
        
        res.status(200).json({ message: 'Post liked', likes: post.likes });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the post to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post deleted successfully
 *       400:
 *         description: Invalid post ID
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        // Validate ObjectID
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const post = await Post.findByIdAndDelete(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
