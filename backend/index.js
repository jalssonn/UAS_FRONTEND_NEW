// Import dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require('mongoose');

// Import local modules
const connectDB = require('./src/config/db');
const { handleUnhandledRejection, handleUncaughtException } = require('./src/utils/processEvents');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const articlesRouter = require('./src/routes/articles');
const articleController = require('./src/controllers/articleController');
const userRouter = require('./src/routes/user');
// Initialize express
const app = express();

// Connect to Database
connectDB();

/**
 * Middleware Setup
 */
// CORS dan Parser
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files setup
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'views')));

// API routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/user'));
app.use('/api/users', userRouter);
app.use('/api/admin', require('./src/routes/admin'));
app.get('/api/articles', articleController.getPublicArticles);
app.use('/api/articles', articlesRouter);

// HTML routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'pages', 'home.html'));
});

app.get('/auth/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'auth', 'register.html'));
});

app.get('/auth/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'auth', 'login.html'));
});

app.get('/pages/:page', (req, res) => {
    const page = req.params.page;
    res.sendFile(path.join(__dirname, 'views', 'pages', `${page}.html`));
});

// Admin routes
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'adminDashboard.html'));
});

app.get('/admin/articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'adminArticles.html'));
});

app.get('/admin/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'users.html'));
});

app.get('/admin/categories', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'categories.html'));
});

app.get('/admin/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'profile.html'));
});

/**
 * Error Handling
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Server Setup
 */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log('\n🚀 Server berjalan di:');
    console.log(`   - Local: http://localhost:${PORT}`);
    console.log(`   - Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

/**
 * Process Event Handlers
 */
handleUncaughtException();
handleUnhandledRejection(server);

module.exports = server;