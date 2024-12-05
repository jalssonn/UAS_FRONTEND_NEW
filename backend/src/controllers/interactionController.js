const Article = require('../models/Article');

// Toggle Like
exports.toggleLike = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }

        const userId = req.user.userId;
        const userIdStr = userId.toString();
        const likeIndex = article.likes.findIndex(id => id.toString() === userIdStr);

        if (likeIndex === -1) {
            // Tambah like
            article.likes.push(userId);
        } else {
            // Hapus like
            article.likes.splice(likeIndex, 1);
        }

        await article.save();

        res.json({
            message: likeIndex === -1 ? 'Like berhasil ditambahkan' : 'Like berhasil dihapus',
            likes: article.likes.length,
            isLiked: likeIndex === -1
        });
    } catch (error) {
        console.error('Error in toggleLike:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add Comment
exports.addComment = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }

        const newComment = {
            user: req.user.userId,
            content: req.body.content
        };

        article.comments.push(newComment);
        await article.save();

        // Populate user info untuk response
        const populatedArticle = await Article.findById(article._id)
            .populate('comments.user', 'username');

        const addedComment = populatedArticle.comments[populatedArticle.comments.length - 1];

        res.status(201).json(addedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Comments
exports.getComments = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('comments.user', 'username')
            .select('comments');

        if (!article) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }

        res.json(article.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
    try {
        const article = await Article.findById(req.params.articleId);
        if (!article) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }

        const comment = article.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Komentar tidak ditemukan' });
        }

        // Hanya user yang membuat komentar atau admin yang bisa menghapus
        if (comment.user.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Tidak memiliki izin untuk menghapus komentar ini' });
        }

        comment.remove();
        await article.save();

        res.json({ message: 'Komentar berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 