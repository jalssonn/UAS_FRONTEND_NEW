const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Terhubung: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Menangani event disconnect
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB terputus');
});

// Menangani event error
mongoose.connection.on('error', (err) => {
    console.error(`MongoDB error: ${err}`);
});

// Menangani event SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});

module.exports = connectDB;