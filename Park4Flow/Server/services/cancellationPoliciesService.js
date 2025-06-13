const {CancellationPolicies} = require('../models/models')
const {Op} = require("sequelize");
class CancellationPoliciesService{
    // Get cancellation fee percent based on parking ID and time before reservation start
    static async getWhereParkingAndTime(ParkingID, timeToStart) {
        try {
            const policy = await CancellationPolicies.findOne({
                where: { HoursBeforeStart: { [Op.gte]: timeToStart } },
                order: [['HoursBeforeStart', 'ASC']],
            });

            if (!policy) {
                console.error('Policy is not found');
                return { CancellationFeePercent: 0 };
            }

            return ({ CancellationFeePercent: policy.CancellationFeePercent });
        } catch (error) {
            console.error('Error fetching cancellation policy:', error);
            return { CancellationFeePercent: 0 };
        }
    }
}

module.exports = CancellationPoliciesService