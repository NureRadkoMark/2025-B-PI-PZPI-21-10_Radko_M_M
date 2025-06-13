const { languages } = require('../localisations/lang');
const { Notification } = require('../models/models');
const { io } = require('../sockets/websocket'); // WebSocket push

class NotificationService {
    static async sendNotification(user, type, variables = {}, language = 'en') {
        try {
            // Load localized template or fallback to English
            const template = languages[language]?.[type] || languages['en']?.[type];
            if (!template) {
                console.warn(`Template not found for type: ${type} in language: ${language}`);
                return null; // Exit silently or handle default behavior
            }

            // Replace placeholders like [User], [Location] with actual values
            let body = template;
            for (const key in variables) {
                const value = variables[key];
                const placeholder = `[${key}]`;
                body = body.split(placeholder).join(value);
            }

            // Save notification to the database
            const notification = await Notification.create({
                Type: type,
                Body: body,
                DateAndTime: new Date(),
                Language: language,
                UserUserID: user.UserID
            });

            // Emit push notification via WebSocket
            io.to(`user_${user.UserID}`).emit('new_notification', {
                NotificationID: notification.NotificationID,
                Type: type,
                Body: body,
                DateAndTime: notification.DateAndTime
            });

            return notification;
        } catch (error) {
            // Catch and log any unexpected errors to avoid server crash
            console.error(`Failed to send notification: ${error.message}`, error);
            return null;
        }
    }
}

module.exports = NotificationService;