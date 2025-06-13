const { User, SalesPolicies } = require('../models/models');
class SalesPoliciesService{

    /**
     * Get the applicable sale for a user and parking.
     * Priority: combine personal and general if both exist.
     * This function is static and designed to be called internally by the server.
     *
     * @param {number} UserID - The ID of the user.
     * @param {number} ParkingID - The ID of the parking.
     * @returns {Promise<number>} - Returns the final sale percent (e.g., 15 means 15%).
     */
    static async getApplicableSale(UserID, ParkingID) {
        try {
            if (!UserID || !ParkingID) {
                throw new Error("UserID and ParkingID are required parameters.");
            }

            // Find personal sale
            const personalSale = await SalesPolicies.findOne({
                where: {
                    ParkingParkingID: ParkingID,
                    IsForEveryone: false,
                    UserUserID: UserID
                }
            });

            // Find general sale
            const generalSale = await SalesPolicies.findOne({
                where: {
                    ParkingParkingID: ParkingID,
                    IsForEveryone: true
                }
            });

            const personalPercent = personalSale ? personalSale.SalePercent : 0;
            const generalPercent = generalSale ? generalSale.SalePercent : 0;

            // Combine if both exist
            let finalPercent = 0;

            if (personalPercent > 0 && generalPercent > 0) {
                // Combine discounts (multiplicative approach)
                const combined = 1 - (1 - personalPercent / 100) * (1 - generalPercent / 100);
                finalPercent = Math.round(combined * 100);
            } else {
                // Use the higher one
                finalPercent = Math.max(personalPercent, generalPercent);
            }

            return finalPercent;
        } catch (error) {
            console.error("Error in getApplicableSale:", error.message);
            throw error;
        }
    }
}

module.exports = SalesPoliciesService