const User = require('../models/User');
const bcrypt = require('bcrypt');

// Get Profile
exports.getProfile = async (req, res) => {
    try {
        console.log('Getting profile for user:', req.user.userId);
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            console.log('User not found:', req.user.userId);
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }
        
        console.log('User found:', user);
        res.json(user);
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findById(req.user.userId);

        // Cek username unik
        if (username !== user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) {
                return res.status(400).json({ message: 'Username sudah digunakan' });
            }
        }

        // Cek email unik
        if (email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email sudah digunakan' });
            }
        }

        user.username = username;
        user.email = email;
        await user.save();

        res.json({
            message: 'Profil berhasil diperbarui',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Password saat ini salah' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password berhasil diubah' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.userId);
        res.json({ message: 'Akun berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};