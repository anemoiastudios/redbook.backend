const User = require("../models/user");
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
    res.status(500).json({ message: "Server error" });
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
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
      return res.status(400).json({ message: "The user name already exists" });
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
    res.status(201).json({ message: "User registration succeeded", newUser });
  } catch (err) {
    res.status(500).json({ message: "server error", error: err.message });
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
    if (!user) {
      return res.status(404).json({ message: "The user does not exist" });
    }
    const hashedPassword = md5(password);
    console.log(hashedPassword);
    if (hashedPassword !== user.password) {
      console.log("Check failure");
      return res.status(401).json({ message: "password error" });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "login successfully", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error", error: err.message });
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
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== oldUsername) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      user.username = username;
    }

    if (email) user.email = email;
    if (bio) user.bio = bio;

    await user.save();

    res.json({ message: "User updated successfully", updatedUser: user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully", deletedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

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
