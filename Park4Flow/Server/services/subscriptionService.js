const { Subscription } = require('../models/models');
const moment = require('moment');
const { Op } = require('sequelize');

class SubscriptionService {
    // Extend or create a subscription
    static async extendOrCreateSubscription(userID, tariffPlan, SubPayID) {
        const existingSubscription = await Subscription.findOne({
            where: { UserUserID: userID}
        });

        if (existingSubscription) {
            // Extend the existing subscription
            existingSubscription.SubscriptionEnd = moment(existingSubscription.SubscriptionEnd)
                .utc()
                .add(tariffPlan.SubscriptionDuration, 'days')
                .toDate();
            existingSubscription.SubPaySubPayID = SubPayID;
            existingSubscription.isActive = true;
            await existingSubscription.save();
            return existingSubscription;
        } else {
            // Create a new subscription if none exists
            return await Subscription.create({
                UserUserID: userID,
                SubscriptionEnd: moment().utc().add(tariffPlan.SubscriptionDuration, 'days').toDate(),
                SubPaySubPayID: SubPayID,
                isActive: true
            });
        }
    }

    // Deactivate expired subscriptions
    static async deactivateExpiredSubscriptions() {
        try {
            await Subscription.update(
                { isActive: false },
                {
                    where: {
                        SubscriptionEnd: { [Op.lt]: new Date() },
                        isActive: true
                    }
                }
            );
            console.log("✅ Expired subscriptions deactivated.");
        } catch (error) {
            console.error("❌ Error deactivating expired subscriptions:", error);
        }
    }
}

module.exports = SubscriptionService;