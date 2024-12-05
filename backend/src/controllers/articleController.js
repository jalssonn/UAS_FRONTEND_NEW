const Article = require('../models/Article');

// Get Public Articles (untuk user biasa)
exports.getPublicArticles = async (req, res) => {
    try {
        const { category, country, page = 1, limit = 10 } = req.query;
        const query = { status: 'published' };
        
        if (category) query.category = category;
        if (country) query.country = country;
        
        const articles = await Article.find(query)
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
            
        const total = await Article.countDocuments(query);
        
        res.json({
            status: 'success',
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            articles
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Single Article
exports.getArticle = async (req, res) => {
    try {
        const article = await Article.findOne({
            _id: req.params.id,
            status: 'published'
        }).populate('author', 'username');
        
        if (!article) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }
        
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};