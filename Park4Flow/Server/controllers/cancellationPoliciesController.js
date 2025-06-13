const {CancellationPolicies, ParkingManager} = require('../models/models')
const {Op} = require("sequelize");
class CancellationPoliciesController{
    // Create a new cancellation policy
    async create(req, res) {
        try {
            const { HoursBeforeStart, CancellationFeePercent, ParkingID } = req.body;

            // Validate request body
            if (!HoursBeforeStart || CancellationFeePercent === undefined) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            const policy = await CancellationPolicies.create({
                HoursBeforeStart: HoursBeforeStart,
                CancellationFeePercent: CancellationFeePercent,
                ParkingParkingID : ParkingID });

            return res.status(201).json(policy);
        } catch (error) {
            console.error('Error creating cancellation policy:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Update an existing cancellation policy by ID
    async update(req, res) {
        try {
            const { CancellationPoliciesID } = req.params;
            const { HoursBeforeStart, CancellationFeePercent } = req.body;

            const policy = await CancellationPolicies.findByPk(CancellationPoliciesID);
            if (!policy) {
                return res.status(404).json({ message: 'Cancellation policy not found.' });
            }

            await policy.update({ HoursBeforeStart, CancellationFeePercent });
            return res.status(200).json(policy);
        } catch (error) {
            console.error('Error updating cancellation policy:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Delete a cancellation policy by ID
    async delete(req, res) {
        try {
            const { CancellationPoliciesID } = req.params;

            const policy = await CancellationPolicies.findByPk(CancellationPoliciesID);
            if (!policy) {
                return res.status(404).json({ message: 'Cancellation policy not found.' });
            }

            await policy.destroy();
            return res.status(200).json({ message: 'Cancellation policy deleted successfully.' });
        } catch (error) {
            console.error('Error deleting cancellation policy:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    async getWhereParking(req, res) {
        const {ParkingID} = req.params

        const policies = await CancellationPolicies.findAll({
            where: {
                ParkingParkingID: ParkingID
            }
        })
        return res.status(200).json({policies: policies})
    }
}

module.exports = new CancellationPoliciesController()