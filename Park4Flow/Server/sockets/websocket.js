const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server, path: "/ws" });
        this.clients = new Map(); // userId -> WebSocket

        this.setupConnectionHandling();
    }

    setupConnectionHandling() {
        this.wss.on('connection', (ws) => {
            console.log('New WebSocket connection');

            // Generate unique ID for this connection
            const connectionId = uuidv4();

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);

                    if (data.type === 'register' && data.userId) {
                        // Associate this connection with a user
                        this.clients.set(String(data.userId), ws);
                        console.log(`User ${data.userId} registered for WebSocket updates`);
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            });

            ws.on('close', () => {
                // Remove this connection from our map
                for (const [userId, clientWs] of this.clients.entries()) {
                    if (clientWs === ws) {
                        this.clients.delete(userId);
                        console.log(`User ${userId} disconnected`);
                        break;
                    }
                }
            });
        });
    }

    sendToUser(userId, message) {
        const ws = this.clients.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
            return true;
        }
        console.log(`User ${userId} not connected via WebSocket`);
        return false;
    }
}

module.exports = WebSocketServer;
