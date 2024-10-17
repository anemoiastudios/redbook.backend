const User = require("../models/user");
const Chat = require("../models/chat");
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

/**
 * @swagger
 * /user/follow/{username}:
 *   post:
 *     summary: Follow a user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user who is trying to follow someone.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               follow:
 *                 type: string
 *                 description: The username of the user to follow
 *     responses:
 *       200:
 *         description: User followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Followed user successfully"
 *       300:
 *         description: Follow request has been sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Request has been sent"
 *       400:
 *         description: Error with the follow request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cannot follow yourself"
 *       404:
 *         description: User or follower not found
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

// This API allows a user to follow another user adding that user to its following list which in turn adds the user to the ther user's followers list
exports.follow = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const newFollower = await User.findOne({ username: req.body.follow });

    if (user) {
      if (newFollower) {
        if (newFollower._id.toString() === user._id.toString()) {
          return res.status(400).json({ message: "Cannot follow yourself" });
        }

        if (newFollower.private) {
          return res.status(300).json({ message: "Request has been sent" });
        } else {
          try {
            const userHandle = await UserHandle.findOne({ userId: user._id });

            if (!userHandle) {
              await UserHandle.create({
                userId: user._id,
                following: [newFollower._id],
              });
            } else {
              if (userHandle.following.includes(newFollower._id.toString())) {
                return res
                  .status(400)
                  .json({ message: "Already follows this user" });
              }
              await UserHandle.findOneAndUpdate(
                {
                  userId: user._id,
                },
                {
                  $push: { following: newFollower._id },
                }
              );
            }
            const followingHandle = await UserHandle.findOne({
              userId: newFollower._id,
            });
            if (!followingHandle) {
              await UserHandle.create({
                userId: newFollower._id,
                followers: [user._id],
              });
            } else {
              if (followingHandle.followers.includes(user._id.toString())) {
                return res
                  .status(400)
                  .json({ message: "This user already follows you" });
              }

              await UserHandle.findOneAndUpdate(
                {
                  userId: newFollower._id,
                },
                { $push: { followers: user._id } }
              );
            }
            return res
              .status(200)
              .json({ message: "Followed user successfully" });
          } catch (err) {
            return res.status(500).json({ message: err.message });
          }
        }
      } else {
        return res.status(404).json({ message: "Follower not found" });
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// exports.acceptFollowRequest = async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.params.username });
//     const newFollower = await User.findOne({ username: req.body.follow });

//   }

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

exports.getUserChats = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const chats = await Chat.find({ participants: user._id }); // Assuming a participant field in Chat model
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @swagger
 * /user/get/chats/{username}:
 *   get:
 *     summary: Get chats for a specific user
 *     tags: [Users]
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: The username of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   chatId:
 *                     type: string
 *                     example: "60c72b2f9b1d4c001f6475c5"  # Example chat ID
 *                   participants:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/User'
 *                   messages:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         sender:
 *                           type: string
 *                           example: "johndoe"
 *                         content:
 *                           type: string
 *                           example: "Hello, how are you?"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-10-01T12:00:00Z"
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
