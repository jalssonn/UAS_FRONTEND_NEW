const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
};

const notFound = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route tidak ditemukan'
    });
};

module.exports = {
    errorHandler,
    notFound
};