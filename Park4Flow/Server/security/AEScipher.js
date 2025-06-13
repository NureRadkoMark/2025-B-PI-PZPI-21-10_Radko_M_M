const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.AES_SECRET_KEY, 'hex'); // 32 байта (256 бит)
const iv = Buffer.from(process.env.AES_IV, 'hex'); // 16 байт (128 бит)

if (key.length !== 32) {
    throw new Error('AES_SECRET_KEY must be 32 bytes long');
}
if (iv.length !== 16) {
    throw new Error('AES_IV must be 16 bytes long');
}

const encryptData = (someData) => {
    if (!someData) return null;
    const cipher = crypto.createCipheriv(algorithm,
        key, iv);
    let encrypted = cipher.update(someData,
        'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const decryptData = (someData) => {
    if (!someData) return null;
    const decipher = crypto.createDecipheriv(algorithm,
        key, iv);
    let decrypted = decipher.update(someData,
        'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

module.exports = { encryptData, decryptData };