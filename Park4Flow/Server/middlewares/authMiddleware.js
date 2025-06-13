const jwt = require('jsonwebtoken')
const express = require("express");
const app = express();

module.exports = function (req, res, next) {
    try {
        console.log(`🔥 ${req.method} ${req.originalUrl}`);
        const authHeader = req.headers.authorization;
        if (!authHeader) {

            return res.status(401).json("Not authorised");
        }
        const token = authHeader.split(' ')[1]; // Bearer token
        if (!token || token === 'Bearer') {

            return res.status(401).json("Not authorised");
        }
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(req.user.IsBanned){
            return res.status(402).json("User account is banned");
        }
        next();
    } catch (e) {
        console.error("Unexpected error:", e);
        return res.status(401).json("Unexpected error");
    }
};