const { Subscription, ParkingManager, SubPay, TariffPlan} = require('../models/models');

module.exports = async function (req, res, next) {
    try {
        // Find the Parking Manager record associated with the user
        const parkingManager = await ParkingManager.findOne({
            where: { UserUserID: req.user.UserID }
        });

        if (!parkingManager) {
            return res.status(401).json({ message: "Your account is not a manager." });
        }

        req.ParkingID = parkingManager.ParkingParkingID

        const parkingManagerOwner = await ParkingManager.findOne({
            where: {
                ParkingParkingID: parkingManager.ParkingParkingID,
                Role: 'owner'
            }
        });
        req.OwnerID = parkingManagerOwner.UserUserID

        if (!parkingManager) {
            return res.status(401).json({ message: "This parking has not an owner" });
        }

        // Check if there is an active subscription for this user
        const subscription = await Subscription.findOne({
            where: { UserUserID: parkingManagerOwner.UserUserID, isActive: true }
        });

        if (!subscription) {
            return res.status(403).json({ message: "No active subscription found. Access denied." });
        }

        const subPay = await SubPay.findByPk(subscription.SubPaySubPayID)
        const tariffPlan = await TariffPlan.findByPk(subPay.TariffPlanTariffPlanID)
        req.TariffPlanID = tariffPlan.TariffPlanID

        // Proceed to the next middleware if subscription is active
        next();
    } catch (e) {
        console.error("Unexpected error:", e);
        return res.status(500).json({ message: "Internal server error." });
    }
};
