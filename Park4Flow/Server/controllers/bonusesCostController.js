const {BonusesCost} = require('../models/models')

class BonusesCostController{
    // Create a new bonuses cost entry
    async create(req, res) {
        try {
            const { Currency, AmountForOneBonus } = req.body;

            // Validate request body
            if (!Currency || !AmountForOneBonus) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            const bonusesCost = await BonusesCost.create({ Currency, AmountForOneBonus });
            return res.status(201).json(bonusesCost);
        } catch (error) {
            console.error('Error creating bonuses cost:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Update an existing bonuses cost entry by ID
    async update(req, res) {
        try {
            const { BonusesCostID } = req.params;
            const { Currency, AmountForOneBonus } = req.body;

            const bonusesCost = await BonusesCost.findByPk(BonusesCostID);
            if (!bonusesCost) {
                return res.status(404).json({ message: 'Bonuses cost entry not found.' });
            }

            await bonusesCost.update({ Currency, AmountForOneBonus });
            return res.status(200).json(bonusesCost);
        } catch (error) {
            console.error('Error updating bonuses cost:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Delete a bonuses cost entry by ID
    async delete(req, res) {
        try {
            const { BonusesCostID } = req.params;

            const bonusesCost = await BonusesCost.findByPk(BonusesCostID);
            if (!bonusesCost) {
                return res.status(404).json({ message: 'Bonuses cost entry not found.' });
            }

            await bonusesCost.destroy();
            return res.status(200).json({ message: 'Bonuses cost entry deleted successfully.' });
        } catch (error) {
            console.error('Error deleting bonuses cost:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Get amount for one bonus filtered by currency
    async getWhereCurrency(req, res) {
        try {
            const { currency } = req.params;
            if (!currency) {
                return res.status(400).json({ message: 'Currency parameter is required.' });
            }

            const bonusesCost = await BonusesCost.findOne({
                where: { Currency: currency }
            });
            if (!bonusesCost) {
                return res.status(404).json({ message: 'No bonuses cost entry found for the specified currency.' });
            }

            return res.status(200).json(bonusesCost.AmountForOneBonus);
        } catch (error) {
            console.error('Error fetching bonuses cost:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }
}

module.exports = new BonusesCostController()