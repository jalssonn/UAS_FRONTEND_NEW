const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// Endpoint untuk mendapatkan semua artikel
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint untuk pencarian
router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        console.log('Search Query:', searchQuery); // Debugging

        const articles = await Article.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { content: { $regex: searchQuery, $options: 'i' } },
                { category: { $regex: searchQuery, $options: 'i' } },
                { country: { $regex: searchQuery, $options: 'i' } }
            ]
        });
        
        console.log('Search Results:', articles.length); // Debugging
        res.json(articles);
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint untuk mendapatkan detail artikel
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;