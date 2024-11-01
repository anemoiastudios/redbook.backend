const User = require("../models/user");
const Chat = require('../models/chat');
const UserHandle = require("../models/userHandle");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

const JWT_SECRET = "your_jwt_secret";

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       example:
 *         email: johndoe@example.com
 *         username: johndoe
 *         password: pwdtmp2024
 *         firstName: John
 *         lastName: Doe
 *         bio: Software developer, Melbourne
 *         birthdate: 2000-01-01T00:00:00.000Z
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *         password:
 *           type: string
 *       example:
 *         username: johndoe
 *         password: mypassword
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /user/get/all:
 *   get:
 *     summary: Get all profiles
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500);
    res.json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /user/get/{username}:
 *   get:
 *     summary: Get user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      res.json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500);
    res.json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */

exports.createUser = async (req, res) => {
  const { email, username, password, firstName, lastName, bio, birthdate } =
    req.body;
  console.log(
    "=>",
    email,
    username,
    password,
    firstName,
    lastName,
    bio,
    birthdate
  );
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400);
      res.json({ message: "The user name already exists" });
    }

    const newUser = new User({
      email,
      username,
      password: md5(password),
      firstName,
      lastName,
      birthdate: new Date(birthdate),
    });
    await newUser.save();

    res.status(201);
    res.json({ message: "User registration succeeded", newUser: newUser });
  } catch (err) {
    res.status(500);
    res.json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login to a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);

  try {
    const user = await User.findOne({ username });
    console.log(user);
    if (user) {
      const hashedPassword = md5(password);

      if (hashedPassword !== user.password) {
        console.log("Check failure");
        res.status(401);
        res.json({ message: "password error" });
      }
      else {
        const token = jwt.sign({ username: user.username }, JWT_SECRET, {
          expiresIn: "1h",
        });
        res.status(200);
        res.json({ message: "login successfully", token });
      }
    }
    else {
      res.status(404);
      res.json({ message: "The user does not exist" });
    }

  } catch (err) {
    console.error(err);
    res.status(500);
    res.json({ message: "server error", error: err.message });
  }
};

/**
 * @swagger
 * /user/update/{username}:
 *   put:
 *     summary: Update a user rofile by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */
exports.updateUserByUsername = async (req, res) => {
  try {
    const { username: oldUsername } = req.params;
    const { username, email, bio } = req.body;

    let user = await User.findOne({ username: oldUsername });
    console.log(user)

    if (user) {
      console.log(username);
      if (username) {
        console.log(oldUsername);
        if (username !== oldUsername) {
          const existingUser = await User.findOne({ username });
          if (existingUser) {
            res.status(400);
            res.json({ message: "Username already exists" });
          }
          else {
            console.log('Username not taken');
            user.username = username;
            if (email)
              user.email = email;
            if (bio)
              user.bio = bio;

            const updatedUser = await User.findOneAndUpdate({ username: oldUsername }, { username: username, email: email, bio: bio });

            res.status(200);
            res.json({ message: "User updated successfully", updatedUser: user });
          }
        }
        else {
          res.status(400);
          res.json({ message: "New username can't be old username" });
        }
      }
      else {
        res.status(400);
        res.json({ message: "New username can't be null" });
      }

    }
    else {
      res.status(404);
      res.json({ message: "User not found" });
    }

  } catch (err) {
    console.log(err.message);
    res.status(500);
    res.json({ message: "Server error", error: err.message });
  }
};

/**
 * @swagger
 * /user/delete/{username}:
 *   delete:
 *     summary: Delete a profile by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the profile
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.deleteUserByUsername = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({
      username: req.params.username,
    });

    if (deletedUser) {
      res.status(200);
      res.json({ message: "User deleted successfully", deletedUser });
    }
    else {
      res.status(404);
      res.json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500);
    res.json({ message: "Server error", error: err.message });
  }
};

/**
 * @swagger
 * /user/get/following/{username}:
 *   get:
 *     summary: Get the following list of a user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: List of following
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      const followingInfo = await UserHandle.findOne({
        userId: user._id,
      }).populate({
        path: "following",
        select: "username -_id",
      });
      const usernames = followingInfo.following.map(
        (follow) => follow.username
      );
      res.status(200).json(usernames);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /user/get/followers/{username}:
 *   get:
 *     summary: Get the followers list of a user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the user
 *     responses:
 *       200:
 *         description: List of followers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      const followersInfo = await UserHandle.findOne({
        userId: user._id,
      }).populate({
        path: "followers",
        select: "username -_id",
      });
      const usernames = followersInfo.followers.map(
        (follow) => follow.username
      );
      res.status(200).json(usernames);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /user/get/chats/{username}:
 *   get:
 *     summary: Get active chat windows for a user
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user
 *     responses:
 *       200:
 *         description: List of active chats for the user
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /chat/get/{chatId}:
 *   get:
 *     summary: Load the chat contents by chatId
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the chat
 *     responses:
 *       200:
 *         description: The chat messages
 *       404:
 *         description: Chat not found
 */

/**
 * @swagger
 * /chat/new:
 *   post:
 *     summary: Create a new direct message chat
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username1:
 *                 type: string
 *               username2:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat created successfully
 *       404:
 *         description: User not found
 */



