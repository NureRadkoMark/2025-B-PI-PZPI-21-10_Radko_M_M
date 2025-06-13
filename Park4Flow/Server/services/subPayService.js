const {SubPay} = require('../models/models')
class SubPayService {
    //Create Subscription Pay
    static async create(userID, tariffPlan) {
        return await SubPay.create({
            UserUserID: userID,
            TariffPlanTariffPlanID: tariffPlan.TariffPlanID,
            Amount: tariffPlan.SubscriptionPrice,
            Currency: tariffPlan.Currency,
            DateAndTime: new Date(),
            PayPurpose: `Subscription Payment by User ${userID} for TariffPlan ${tariffPlan.TariffPlanID}`
        });
    }
}

module.exports = SubPayService;