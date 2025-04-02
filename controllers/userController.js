const User = require("../models/user");
const Chat = require("../models/chat");
const UserHandle = require("../models/userHandle");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const JWT_SECRET = "your_jwt_secret";
require("dotenv").config();
const fs = require("fs");
const nodemailer = require("nodemailer");
const { S3Client, GetObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
      res.status(200);
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
 * /user/get/username/{userId}:
 *   get:
 *     summary: Get user by userId
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Username
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.getUsernameById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user.username);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * @swagger
 * /user/update/uri/{userId}:
 *   put:
 *     summary: Update a user profile picture uri by userId
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: userId for the given profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User uri updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.updateUserURI = async (req, res) => {
  const { userId } = req.params;
  const { uri } = req.body;
  try {
    console.log(userId);
    
    console.log(uri);
    

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(uri);

    if (uri) user.profile_uri = uri;
    await user.save();
    res.json({ message: "User URI updated successfully", updatedUser: user });
  } catch (err) {
    console.log(err.message);
    res.status(500);
    res.json({ message: "Server error", error: err.message });
  }
}
/**
 * @swagger
 * /user/uri/{userId}:
 *   get:
 *     summary: Get profile uri by userId
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile image URI
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

exports.getURIById = async (req, res) => {
  const { userId } = req.params;
  const authenticatedUserUserId = req.params.userId;
  const key = `profile-picture/${authenticatedUserUserId}.png`;
  console.log(key);
  try {
    console.log("inside try block");
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }, 
    });
    const input = new GetObjectCommand( { // GetObjectRequest
      Bucket: "theredbook-development", // required
      Key: key, // required
    });
    //const response = await client.send(input);
    try {
      const fetchedSignedUrl = await Promise.resolve(getSignedUrl(client, input, {expriesIn: 10000}));
      res.status(200).json(fetchedSignedUrl);
      console.log("This should be the signed Url: "+ fetchedSignedUrl);
    } catch (error ) {
      console.log(error);
    }
     
    /*if (!response.Body) {
      throw new Error("Response body is empty");
    }
    console.log(signedUrl);
    console.log("This is the response.");
    console.log(response);
    console.log("This is the response.Body");
    console.log(response.Body);
    const base64Image = response.Body.toString("base64");*/
  } catch (err) {
  res.status(500).json({ message: 'Server error', error: err.message });
}
}
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
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully", deletedUser });
  } catch (err) {
    res.status(500);
    res.json({ message: "Server error", error: err.message });
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

exports.requestPasswordReset  = async (req, res) => {
  try {
      const { username, email } = req.body;

      const user = await User.findOne({ username, email });

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
      const expiration = new Date(Date.now() + 30 * 60 * 1000); // Expires 30 minutes from now()

      user.verificationCode = code;
      user.verificationCodeExpires = expiration;
      await user.save();

      // Send verification code via email using Nodemailer
      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS 
          }
      });

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your Verification Code",
          text: `Your verification code is ${code}. It will expire in 30 minutes.`
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
      const { username, code } = req.body;

      const user = await User.findOne({ username });

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      if (!user.verificationCode || !user.verificationCodeExpires) {
          return res.status(400).json({ message: "No verification code issued" });
      }

      if (Date.now() > user.verificationCodeExpires) {
          user.verificationCode = null;
          user.verificationCodeExpires = null;
          await user.save();
          return res.status(400).json({ message: "Verification code expired" });
      }

      if (user.verificationCode !== code) {
          return res.status(400).json({ message: "Invalid verification code" });
      }

      // Mark user as verified
      user.isVerified = true;
      user.resetPasswordToken = null; // Clear the used code
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
  }
};

const cleanupExpiredCodes = async () => {
  try {
      await User.updateMany(
          { verificationCodeExpires: { $lt: new Date() } },
          { $unset: { verificationCode: "", verificationCodeExpires: "" } }
      );
      console.log("Expired verification codes removed");
  } catch (error) {
      console.error("Error cleaning up expired verification codes", error);
  }
};

// Run cleanup every 30 minutes to avoid filling up the database with expired codes
setInterval(cleanupExpiredCodes, 30 * 60 * 1000);


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

/**
 * @swagger
 * /chat/participants/get/{chatId}:
 *   get:
 *     summary: Load the chat participants by chatId
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
 *         description: The chat participants
 *       404:
 *         description: Chat not found
 */
