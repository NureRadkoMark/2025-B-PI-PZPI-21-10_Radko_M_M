require('dotenv').config();
const express = require('express');
const { callback } = require("pg/lib/native/query");
const PORT = process.env.PORT || 5000;
const sequelize = require('./db');
const cors = require('cors');
const app = express();
const fs = require('fs');
const router = require('./routes/index')
const https = require('https');
const models = require('./models/models')
const http = require("http");
const paypal = require('./APIs/paypal')
const SubscriptionController = require('./services/subscriptionService')
const UserDebtService = require('../server/services/userDebtService')
const  {handleLiqPayWebhook}  = require('./APIs/liqpay');
const {setupWebSocket} = require('../server/sockets/websocket')
const path = require('path');
const bodyParser = require("express");
const backupRoutes = require('../server/routes/backupRouter');
const axios = require("axios");
const WebSocketServer = require('../server/sockets/websocket');

const corsOptions = {
    origin: ['https://localhost:5190', 'http://localhost:3000 ', 'https://192.168.56.1:5190', 'http://192.168.56.1:3000 ', 'http://127.0.0.1:4040', "https://1fb5-141-105-139-189.ngrok-free.app", process.env.PAYPAL_BASE_URL, 'https://www.liqpay.ua', 'http://host.wokwi.internal'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    exposedHeaders: ['Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.get('/proxy-image/:imageName', (req, res) => {
    const { imageName } = req.params;
    const imagePath = path.join(__dirname, 'uploads', imageName);

    if (fs.existsSync(imagePath)) {
        console.log(imagePath)
        return res.sendFile(imagePath);
    }

    return res.status(404).send('Image not found');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', router)
app.use('/backup', backupRoutes)

console.log('📌 handleLiqPayWebhook загружен:', handleLiqPayWebhook);
app.post('/webhook', handleLiqPayWebhook);

const options = {
    key: fs.readFileSync('192.168.31.250-key.pem'),
    cert: fs.readFileSync('192.168.31.250.pem'),
    minVersion: 'TLSv1.3',
};

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');

        await sequelize.sync();
        console.log('All models were synchronized successfully.');

        // Deactivate expired subscriptions on startup
        await SubscriptionController.deactivateExpiredSubscriptions();

        //Block users who have overdue debt
        await UserDebtService.overdueDebt()

        // Run this function every hour to block users with debt
        setInterval(async () => {
            await UserDebtService.overdueDebt();
        }, 60 * 60 * 1000); // 1 hour in milliseconds

        // Run this function every hour to keep subscriptions updated
        setInterval(async () => {
            await SubscriptionController.deactivateExpiredSubscriptions();
        }, 60 * 60 * 1000); // 1 hour in milliseconds

        //const server = https.createServer(options, app);
        //192.168.31.250
        //192.168.137.143
        //const LOCAL_IP = process.env.LOCAL_IP
        //server.listen(PORT,  LOCAL_IP, () => {
          //  console.log(`🚀 Server started at https://${LOCAL_IP}:${PORT}`);
        //});

        //HTTPS-server (main)
        const httpsServer = https.createServer(options, app);
        httpsServer.listen(PORT, process.env.LOCAL_IP, () => {
            console.log(`🚀 HTTPS Server started at https://${process.env.LOCAL_IP}:${PORT}`);
            // https://192.168.31.250:5192
        });

        //HTTP-server (Wokwi)
        app.listen(5000, () => console.log('Server started on port ' + 5000))
        // http://localhost:5000
        const webSocketServer = new WebSocketServer(httpsServer);
        app.set('webSocketServer', webSocketServer);

    } catch (error) {
        console.error('Unable to start the server:', error);
    }
})();





