//const { v4: uuidv4 } = require('uuid'); // Import the uuid library
const jwt = require('jsonwebtoken')
const md5 = require('md5');
const TimelinePost = require('../models/timelinePost');
const UserHandle = require("../models/userHandle");
const User = require("../models/user");

const JWT_SECRET = 'your_jwt_secret';

/**
 * @swagger
 * components:
 *   schemas:
 *     TimelinePost:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         content:
 *           type: string
 *         createdAt: 
 *           type: date
 *       example:
 *         id: 6F9619FF-8B86-D011-B42D-00CF4FC964FF
 *         username: Joe
 *         content: Have a nice day!
 *         createdAt: 2024-10-01T00:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: TimelinePost
 *   description: TimelinePost management
 */


/**
 * @swagger
 * /post/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimelinePost'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimelinePost'
 *       500:
 *         description: Server error
 */

exports.createPost = async (req, res) => {
    const { username, content } = req.body;
    console.log('=> createPost ', username, content)
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userHandle = await UserHandle.findOne({ userId: user._id });

        const followersList = userHandle.followers;
        const followers = followersList.map(follower => ({
            userId: follower,
            hasRead: false,
            notified: false
        }));

        // const id = uuidv4();
        const newPost = new TimelinePost({
            // id,
            username,
            content,
            followers,
            createAt: new Date()
        });
        await newPost.save();
        res.status(201).json({ message: 'User post created', newPost });
    } catch (err) {
        res.status(500).json({ message: 'server error', error: err.message });
    }
};

/**
 * @swagger
 * /feed/{username}:
 *   get:
 *     summary: Retrieve the user's feed of unread posts
 *     tags: [TimelinePost]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user to retrieve the feed for
 *     responses:
 *       200:
 *         description: User feed retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User feed retrieved
 *                 unreadPosts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TimelinePost'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

exports.getUserFeed = async (req, res) => {
    const { username } = req.params;
    console.log('=> getUserFeed ', username )
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const unreadPosts = await TimelinePost.find({
            followers: {  
              $elemMatch: { 
                userId: user._id,
                hasRead: false 
              }
            }
          });
        res.status(200).json({ message: 'User feed retrieved', unreadPosts });
    } catch (err) {
        res.status(500).json({ message: 'server error', error: err.message });
    }
};

exports.getUserPosts = async (req, res) => {
    const { username } = req.params;
    console.log('=> getUserFeed ', username )
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("This is user.username...");
        console.log(user.username);
        const unreadPosts = await TimelinePost.find({
            username: user.username
          });
        res.status(200).json({ message: 'User feed retrieved', unreadPosts });
    } catch (err) {
        res.status(500).json({ message: 'server error', error: err.message });
    }
};
/**
 * @swagger
 * /post/read/{postId}/username/{username}:
 *   post:
 *     summary: Mark a post as read for a specific user
 *     tags: [TimelinePost]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to mark as read
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user who has read the post
 *     responses:
 *       200:
 *         description: Post marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Post marked as read
 *                 post:
 *                   $ref: '#/components/schemas/TimelinePost'
 *       404:
 *         description: Post or user not found
 *       500:
 *         description: Server error
 */

exports.markPostAsRead = async (req, res) => {
    const { postId, username } = req.params;
    console.log('=> markPostAsRead ', postId, username )

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userId = user._id;

        const post = await TimelinePost.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const follower = post.followers.find(f => f.userId.toString() === userId.toString());
        if (!follower) {
            return res.status(404).json({ message: 'Follower not found for this post' });
        }

        follower.hasRead = true;

        await post.save();

        // Respond with a success message
        res.status(200).json({ message: 'Post marked as read', post });
    } catch (err) {
        // Handle server errors
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}


/**
 * @swagger
 * /post/{postId}/markNotified/{username}:
 *   post:
 *     summary: Mark a post as notified for a specific follower
 *     tags: [TimelinePost]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to mark as notified
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the follower to notify
 *     responses:
 *       200:
 *         description: Post marked as notified
 *       404:
 *         description: Post or follower not found
 *       500:
 *         description: Server error
 */

exports.markPostAsNotified = async (req, res) => {
    const { postId, username } = req.params; 
    console.log('=> markPostAsNotified ', postId, username);

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userId = user._id;

        const post = await TimelinePost.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const follower = post.followers.find(f => f.userId.toString() === userId.toString());
        if (!follower) {
            return res.status(404).json({ message: 'Follower not found for this post' });
        }

        follower.notified = true;

        await post.save();

        res.status(200).json({ message: 'Post marked as notified', post });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

/**
 * @swagger
 * /post/update/{postId}/username/{username}:
 *   put:
 *     summary: Update an existing post
 *     tags: [TimelinePost]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to be updated
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user updating the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The new content of the post
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User post updated
 *                 post:
 *                   $ref: '#/components/schemas/TimelinePost'
 *       404:
 *         description: Post or user not found
 *       500:
 *         description: Server error
 */

exports.updatePost = async (req, res) => {
    const { postId, username } = req.params;
    const { content } = req.body;
    console.log('=> updatePost ', content) 

    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userHandle = await UserHandle.findOne({ userId: user._id });

        const post = await TimelinePost.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const followersList = userHandle.followers;
        const followers = followersList.map(follower => ({
            userId: follower,
            hasRead: false,
            notified: false
        }));

        post.followers = followers;

        await post.save();
        res.status(201).json({ message: 'User post updated', post });
    } catch (err) {
        res.status(500).json({ message: 'server error', error: err.message });
    }
};
    