const Article = require('../models/Article');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Konfigurasi storage multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/articles/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Hanya file gambar yang diperbolehkan!'));
        }
        cb(null, true);
    }
});

// Create Article
exports.createArticle = async (req, res) => {
    try {
        upload.single('image')(req, res, async function(err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'Gambar wajib diupload' });
            }

            const imagePath = `/uploads/articles/${req.file.filename}`;
            
            const article = await Article.create({
                ...req.body,
                image: imagePath,
                author: req.user.userId
            });
            
            res.status(201).json({
                message: 'Artikel berhasil dibuat',
                article
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Articles (with filter & pagination)
exports.getAllArticles = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = {};
        
        if (status) query.status = status;
        
        const articles = await Article.find(query)
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
            
        const total = await Article.countDocuments(query);
        
        res.json({
            message: 'Berhasil mendapatkan daftar artikel',
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            articles
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Article
exports.updateArticle = async (req, res) => {
    try {
        const { title, content, category, country, status } = req.body;
        
        // Pastikan likes adalah array yang valid
        let updateData = {
            title,
            content, 
            category,
            country,
            status
        };

        // Jika ada file gambar baru
        upload.single('image')(req, res, async function(err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (req.file) {
                updateData.image = `/uploads/articles/${req.file.filename}`;
            }

            const article = await Article.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!article) {
                return res.status(404).json({ message: 'Artikel tidak ditemukan' });
            }
            
            res.json({
                message: 'Artikel berhasil diupdate',
                article
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Article
exports.deleteArticle = async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        
        if (!article) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }
        
        res.json({
            message: 'Artikel berhasil dihapus',
            article
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Single Article
exports.getArticle = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        
        if (!article) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }
        
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};