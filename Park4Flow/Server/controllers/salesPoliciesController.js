const { User, SalesPolicies } = require('../models/models');

class SalesPoliciesController {
    /**
     * Create a new SalesPolicy.
     * If IsForEveryone = true, UserUserID is null.
     * If IsForEveryone = false, find the user by email and assign UserUserID.
     */
    async create(req, res) {
        try {
            const { email, isForEveryone, salePercent, ParkingID} = req.body;
            let userId = null;

            if (!isForEveryone) {
                if (!email) {
                    return res.status(400).json({ message: "Email is required for personal sale policies." });
                }
                const user = await User.findOne({
                    where: { Email: email } });
                if (!user) {
                    return res.status(404).json({ message: "User not found." });
                }
                userId = user.UserID;
            }

            const salesPolicy = await SalesPolicies.create({
                ParkingParkingID: ParkingID,
                IsForEveryone: isForEveryone,
                SalePercent: salePercent,
                UserUserID: userId,
            });
            res.status(201).json(salesPolicy);
        } catch (error) {
            res.status(500).json({ message: "Internal server error.", error: error.message });
        }
    }

    /**
     * Delete general sales policies for a parking.
     * Keeps personal sales policies (where IsForEveryone = false).
     */
    async deleteGeneral(req, res) {
        try {
            const {SalesPoliciesID} = req.params;
            const deletedRows = await SalesPolicies.destroy({
                where: {
                    SalesPoliciesID: SalesPoliciesID
                },
            });
            res.status(200).json({ message: `Deleted ${deletedRows} general sales policies.` });
        } catch (error) {
            res.status(500).json({ message: "Internal server error.", error: error.message });
        }
    }

    /**
     * Delete a personal sales policy for a user found by email.
     */
    async deletePersonal(req, res) {
        try {
            const { email } = req.params;
            if (!email) {
                return res.status(400).json({ message: "Email is required." });
            }

            const user = await User.findOne({
                where: { Email: email } });
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            const deletedRows = await SalesPolicies.destroy({ where: { UserUserID: user.UserID } });
            res.status(200).json({ message: `Deleted ${deletedRows} sales policies for user ${email}.` });
        } catch (error) {
            res.status(500).json({ message: "Internal server error.", error: error.message });
        }
    }

    async getWhereParking(req, res){
        const {ParkingID} = req.params

        const salesPolicies = await SalesPolicies.findAll({
            where: {
                ParkingParkingID: ParkingID
            },
            include: [
                {
                    model: User,
                    attributes: ["Email"],
                }
            ]
        })

        return res.status(200).json({salesPolicies: salesPolicies})
    }

}

module.exports = new SalesPoliciesController();