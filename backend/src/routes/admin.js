const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getAllUsers, deleteUser } = require('../controllers/adminController');
const { 
    createArticle, 
    getAllArticles, 
    updateArticle, 
    deleteArticle,
    getArticle
} = require('../controllers/adminArticleController');

// Gunakan kedua middleware untuk semua route admin
router.use(verifyToken, isAdmin);

// User Management Routes
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Article Management Routes
router.post('/articles', createArticle);
router.get('/articles', getAllArticles);
router.put('/articles/:id', updateArticle);
router.delete('/articles/:id', deleteArticle);
router.get('/articles/:id', getArticle);

// Tambahkan route ini setelah middleware
router.get('/check-auth', verifyToken, isAdmin, (req, res) => {
    res.json({ message: 'Authorized' });
});

module.exports = router;
