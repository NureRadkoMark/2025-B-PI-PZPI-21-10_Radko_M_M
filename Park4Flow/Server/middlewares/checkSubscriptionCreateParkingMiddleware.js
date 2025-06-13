const {ParkingManager, Subscription, SubPay, TariffPlan} = require("../models/models");
module.exports = async function (req, res, next) {
    try {
        // Check if there is an active subscription for this user
        const subscription = await Subscription.findOne({
            where: { UserUserID: req.user.UserID, isActive: true }
        });

        if (!subscription) {
            return res.status(403).json({ message: "No active subscription found. Access denied." });
        }
        // Proceed to the next middleware if subscription is active
        next();
    } catch (e) {
        console.error("Unexpected error:", e);
        return res.status(500).json({ message: "Internal server error." });
    }
};
