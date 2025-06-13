const axios = require('axios');
const crypto = require('crypto');
const {Transaction} = require('../models/models')

const LIQPAY_PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY;
const LIQPAY_PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;

// Function to generate LiqPay signature
function generateSignature(data) {
    return crypto.createHash('sha1')
        .update(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY)
        .digest('base64');
}

// Create a payment order
const createLiqPayOrder = async (currency, amount, description, orderId) => {
    try {
        console.log('Creating link in LiqPay');

        const requestData = {
            public_key: LIQPAY_PUBLIC_KEY,
            version: 3,
            action: 'pay',
            amount: amount,
            currency: currency,
            description: description,
            order_id: orderId,
            language: "ru",
            result_url: 'https://localhost:5190/payment-result',
            server_url: `${process.env.NGROK_DOMAIN}/webhook`,
            sandbox: 1 // Remove for production
        };

        console.log(requestData)

        const data = Buffer.from(JSON.stringify(requestData)).toString('base64');
        const signature = generateSignature(data);

        console.log(`https://www.liqpay.ua/api/3/checkout?data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`)
        return `https://www.liqpay.ua/api/3/checkout?data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`;
    } catch (error) {
        console.error('LiqPay API Error:', error);
        throw error;
    }
};

// Confirm Webhook by LiqPay
const handleLiqPayWebhook = async (req, res) => {
    try {
        if (!req.body.data || !req.body.signature) {
            return res.status(400).json({ error: 'Missing data or signature in request' });
        }
        const { data, signature } = req.body;
        const expectedSignature = generateSignature(data);

        if (signature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const responseData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

        const existingTransaction = await Transaction.findOne({
            where: { TransactionID: responseData.order_id }
        });

        if (!existingTransaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        if (existingTransaction.Status === 'success') {
            return res.status(200).json({ message: 'Payment already processed' });
        }

        if (responseData.status === 'success' || responseData.status === 'sandbox') {
            await Transaction.update(
                { Status: 'success' },
                { where: { TransactionID: responseData.order_id } }
            );
            return res.status(200).json({ message: 'Payment successful' });
        }
        return res.status(400).json({ error: 'Payment failed' });

    } catch (error) {
        console.error('❌ Error Webhook:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



module.exports = { createLiqPayOrder, handleLiqPayWebhook };
