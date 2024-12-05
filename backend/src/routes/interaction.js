const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
    toggleLike,
    addComment,
    getComments,
    deleteComment
} = require('../controllers/interactionController');

// Like routes
router.post('/articles/:id/like', verifyToken, toggleLike);

// Comment routes
router.get('/articles/:id/comments', getComments);
router.post('/articles/:id/comments', verifyToken, addComment);
router.delete('/articles/:articleId/comments/:commentId', verifyToken, deleteComment);

module.exports = router; 