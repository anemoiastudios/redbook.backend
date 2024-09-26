const Profile = require('../models/profile');
const jwt = require('jsonwebtoken')
const md5 = require('md5')

const JWT_SECRET = 'your_jwt_secret';

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - bio
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
 *   name: Profiles
 *   description: Profile management
 */

/**
 * @swagger
 * /user/get/all:
 *   get:
 *     summary: Get all profiles
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: List of profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *       500:
 *         description: Server error
 */
exports.getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @swagger
 * /user/get/{username}:
 *   get:
 *     summary: Get profile by username
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the profile
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
exports.getProfileByUsername = async (req, res) => {
    try {
        const profile = await Profile.findOne({ username: req.params.username });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Profile'
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       500:
 *         description: Server error
 */


exports.createProfile = async (req, res) => {
    const { email, username, password, firstName, lastName, bio, birthdate } = req.body;
    console.log('=>', email, username, password, firstName, lastName, bio, birthdate)
    try {
        const existingProfile = await Profile.findOne({ username });
        if (existingProfile) {
            return res.status(400).json({ message: 'The user name already exists' });
        }
        const newProfile = new Profile({
            email,
            username,
            password: md5(password),
            firstName,
            lastName,
            birthdate: new Date(birthdate)
        });
        await newProfile.save();
        res.status(201).json({ message: 'User registration succeeded', newProfile });
    } catch (err) {
        res.status(500).json({ message: 'server error', error: err.message });
    }
};

exports.loginprofile = async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password)
    try {
        const profile = await Profile.findOne({ username });
        console.log(profile)
        if (!profile) {
            return res.status(404).json({ message: 'The user does not exist' });
        }
        const hashedPassword = md5(password);
        console.log(hashedPassword)
        if (hashedPassword !== profile.password) {
            console.log('Check failure')
            return res.status(401).json({ message: 'password error' });
        }

        const token = jwt.sign({ username: profile.username }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'login successfully', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'server error', error: err.message });
    }
}


/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login to a profile
 *     tags: [Profiles]
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
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
exports.loginprofile = async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password)
    try {
        const profile = await Profile.findOne({ username });
        console.log(profile)
        if (!profile) {
            return res.status(404).json({ message: 'The user does not exist' });
        }
        const hashedPassword = md5(password);
        console.log(hashedPassword)
        if (hashedPassword !== profile.password) {
            console.log('Check failure')
            return res.status(401).json({ message: 'password error' });
        }

        const token = jwt.sign({ username: profile.username }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'login successfully', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'server error', error: err.message });
    }
}

/**
 * @swagger
 * /user/update/{username}:
 *   put:
 *     summary: Update a profile by username
 *     tags: [Profiles]
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
 *             $ref: '#/components/schemas/Profile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */
exports.updateProfileByUsername = async (req, res) => {
    try {
        const { username: oldUsername } = req.params;
        const { username, email, bio } = req.body;

        let profile = await Profile.findOne({ username: oldUsername });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        if (username && username !== oldUsername) {
            const existingProfile = await Profile.findOne({ username });
            if (existingProfile) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            profile.username = username;
        }

        if (email) profile.email = email;
        if (bio) profile.bio = bio;

        await profile.save();

        res.json({ message: 'Profile updated successfully', updatedProfile: profile });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};



/**
 * @swagger
 * /user/delete/{username}:
 *   delete:
 *     summary: Delete a profile by username
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the profile
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
exports.deleteProfileByUsername = async (req, res) => {
    try {
        const deletedProfile = await Profile.findOneAndDelete({ username: req.params.username });
        if (!deletedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json({ message: 'Profile deleted successfully', deletedProfile });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
