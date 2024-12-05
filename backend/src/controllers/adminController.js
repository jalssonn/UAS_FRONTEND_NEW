const User = require('../models/User');

// Get All Users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            message: 'Berhasil mendapatkan daftar user',
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete User (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        // Mencegah admin menghapus dirinya sendiri
        if (user._id.toString() === req.user.userId) {
            return res.status(400).json({ message: 'Anda tidak dapat menghapus akun sendiri' });
        }

        await User.findByIdAndDelete(req.params.id);
        
        res.json({
            message: 'User berhasil dihapus',
            deletedUser: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
