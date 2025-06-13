const jwt = require('jsonwebtoken');

function socketAuthMiddleware(socket, next) {
    try {
        const authHeader = socket.handshake.auth?.token;
        if (!authHeader) {
            return next(new Error('Not authorised (no token)'));
        }

        const token = authHeader.split(' ')[1]; // Bearer token
        if (!token) {
            return next(new Error('Not authorised (no token)'));
        }

        socket.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        next();
    } catch (e) {
        console.error("Socket auth error:", e.message);
        return next(new Error('Not authorised (invalid token)'));
    }
}

module.exports = socketAuthMiddleware;