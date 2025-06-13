//process.env.AES_SECRET_KEY = '555eee4d48f7965ca35b94b5701d3f55bbb90a55cf9a4ae62513fd9d6e829e40'; // 32 байта = 64 hex символа
//process.env.AES_IV = '4a3cd8cd05eba9b002496ece9f591ad1'; // 16 байт

const { encryptData, decryptData } = require('../security/AEScipher');



describe('AES encryption and decryption', () => {
    const testString = 'Sensitive data to encrypt';

    it('should encrypt and decrypt correctly', () => {
        const encrypted = encryptData(testString);
        const decrypted = decryptData(encrypted);
        expect(decrypted).toBe(testString);
    });

    it('should return null when encrypting null or undefined', () => {
        expect(encryptData(null)).toBeNull();
        expect(encryptData(undefined)).toBeNull();
    });

    it('should return null when decrypting null or undefined', () => {
        expect(decryptData(null)).toBeNull();
        expect(decryptData(undefined)).toBeNull();
    });

    it('should return different encrypted output for different input', () => {
        const encrypted1 = encryptData('First string');
        const encrypted2 = encryptData('Second string');
        expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw error if decrypting corrupted data', () => {
        expect(() => decryptData('invalidhex')).toThrow();
    });
});
