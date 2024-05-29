const Profile = require('../models/profile');

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
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         bio:
 *           type: string
 *       example:
 *         username: johndoe
 *         email: johndoe@example.com
 *         bio: Software developer from San Francisco
 */

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Profile management
 */

/**
 * @swagger
 * /api/profile:
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
 * /api/profile/{username}:
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
 * /api/profile:
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
    try {
        const { username, email, bio } = req.body;
        const newProfile = new Profile({ username, email, bio });
        await newProfile.save();
        res.json({ message: 'Profile created successfully', newProfile });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

/**
 * @swagger
 * /api/profile/{username}:
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
 * /api/profile/{username}:
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