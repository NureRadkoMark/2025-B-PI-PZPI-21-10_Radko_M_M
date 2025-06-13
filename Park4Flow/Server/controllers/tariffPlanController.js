const {TariffPlan} = require("../models/models");

class TariffPlanController{
    // Create a new tariff plan
    async create(req, res) {
        try {
            const { SubscriptionDuration, SubscriptionPrice, Currency, Type } = req.body;

            // Validate request body
            if (!SubscriptionDuration || !SubscriptionPrice || !Currency || !Type) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            const tariffPlan = await TariffPlan.create({
                SubscriptionDuration,
                SubscriptionPrice,
                Currency,
                Type
            });

            return res.status(201).json(tariffPlan);
        } catch (error) {
            console.error('Error creating tariff plan:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Update an existing tariff plan by ID
    async update(req, res) {
        try {
            const { TariffPlanID } = req.params;
            const { SubscriptionDuration, SubscriptionPrice, Currency, Type} = req.body;

            const tariffPlan = await TariffPlan.findByPk(TariffPlanID);
            if (!tariffPlan) {
                return res.status(404).json({ message: 'Tariff plan not found.' });
            }

            await tariffPlan.update({ SubscriptionDuration, SubscriptionPrice, Currency, Type });

            return res.status(200).json(tariffPlan);
        } catch (error) {
            console.error('Error updating tariff plan:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Delete a tariff plan by ID
    async delete(req, res) {
        try {
            const { TariffPlanID } = req.params;

            const tariffPlan = await TariffPlan.findByPk(TariffPlanID);
            if (!tariffPlan) {
                return res.status(404).json({ message: 'Tariff plan not found.' });
            }

            await tariffPlan.destroy();
            return res.status(200).json({ message: 'Tariff plan deleted successfully.' });
        } catch (error) {
            console.error('Error deleting tariff plan:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Get tariff plans filtered by currency
    async getWhereCurrency(req, res) {
        try {
            const { currency } = req.params;
            if (!currency || currency.trim() === '') {
                return res.status(400).json({ message: 'Currency parameter is required.' });
            }

            const tariffPlans = await TariffPlan.findAll({ where: { Currency: currency } });
            return res.status(200).json(tariffPlans);
        } catch (error) {
            console.error('Error fetching tariff plans:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    async getAll(req, res){
        try {
            const tariffPlans = await TariffPlan.findAll();
            return res.status(200).json(tariffPlans);
        } catch (error) {
            console.error('Error fetching tariff plans:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }
}

module.exports = new TariffPlanController();
