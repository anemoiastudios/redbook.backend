// const { v4: uuidv4 } = require("uuid"); // Import the uuid library
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const TimelinePost = require("../models/timelinePost");
const UserHandle = require("../models/userHandle");
const User = require("../models/user");

const JWT_SECRET = "your_jwt_secret";

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
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */

exports.createPost = async (req, res) => {
  const { username, content } = req.body;
  console.log("=> createPost ", username, content);
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userHandle = await UserHandle.findOne({ userId: user._id });

    const followersList = userHandle.followers;
    const followers = followersList.map((follower) => ({
      userId: follower,
      hasRead: false,
    }));

    // const id = uuidv4();
    const newPost = new TimelinePost({
      // id,
      username,
      content,
      followers,
      createAt: new Date(),
    });
    await newPost.save();
    res.status(201).json({ message: "User post created", newPost });
  } catch (err) {
    res.status(500).json({ message: "server error", error: err.message });
  }
};

exports.getUserFeed = async (req, res) => {
  const { username } = req.params;
  console.log("=> getUserFeed ", username);
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const unreadPosts = await TimelinePost.find({
      followers: {
        $elemMatch: {
          userId: user._id,
          hasRead: false,
        },
      },
    });
    res.status(201).json({ message: "User feed retrieved", unreadPosts });
  } catch (err) {
    res.status(500).json({ message: "server error", error: err.message });
  }
};

exports.markPostAsRead = async (req, res) => {
  const { postId, username } = req.params;
  console.log("=> markPostAsRead ", postId, username);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = user._id;

    const post = await TimelinePost.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const follower = post.followers.find(
      (f) => f.userId.toString() === userId.toString()
    );
    if (!follower) {
      return res
        .status(404)
        .json({ message: "Follower not found for this post" });
    }

    follower.hasRead = true;

    await post.save();

    // Respond with a success message
    res.status(200).json({ message: "Post marked as read", post });
  } catch (err) {
    // Handle server errors
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
