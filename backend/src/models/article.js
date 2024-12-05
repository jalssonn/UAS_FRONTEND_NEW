const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Judul wajib diisi'],
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Konten wajib diisi']
    },
    image: {
        type: String,
        required: [true, 'Gambar wajib diisi']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'Kategori wajib diisi'],
        enum: ['Pantai', 'Gunung', 'Kota', 'Budaya', 'Kuliner']
    },
    country: {
        type: String,
        required: [true, 'Negara wajib diisi'],
        enum: ['Indonesia', 'Malaysia', 'Singapura', 'Thailand', 'Vietnam', 'Filipina']
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Article', articleSchema);