const Profile = require('../models/profile');

exports.getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find();
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

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
