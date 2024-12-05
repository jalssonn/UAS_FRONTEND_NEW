const crypto = require('crypto');

const generateSecret = () => {
    const secret = crypto.randomBytes(64).toString('hex');
    console.log('\nCopy JWT Secret ini ke file .env Anda:');
    console.log('JWT_SECRET=' + secret + '\n');
};

generateSecret();