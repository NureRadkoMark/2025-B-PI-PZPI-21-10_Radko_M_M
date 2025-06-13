const TransactionService = require('../services/transactionService');
const SubPayService = require('../services/subPayService')
const SubscriptionService = require('../services/subscriptionService')
const {TariffPlan, Transaction, SubPay, Subscription} = require('../models/models')
const {createOrder, captureOrder} = require('../APIs/paypal')
const {createLiqPayOrder, handleLiqPayWebhook} = require('../APIs/liqpay')
const moment = require('moment');
const {Op} = require("sequelize");
const {extractOrderId} = require("../services/URLService");

class SubscriptionProcessController {
    // PayPal subscription (step 1)
    async payPalSubscribe(req, res) {
        try {
            const { tariffPlanID } = req.body;
            const userID = req.user.UserID;

            // Retrieve tariff plan
            const tariffPlan = await TariffPlan.findByPk(tariffPlanID);
            if (!tariffPlan) {
                return res.status(404).json({ message: 'Tariff Plan not found' });
            }

            // Create transaction
            const transaction = await TransactionService.create(
                tariffPlan.SubscriptionPrice,
                tariffPlan.Currency,
                userID,
                'subscription',
                'paypal',
                'CREATED',
                `Subscription transaction for TariffPlan ${tariffPlan.TariffPlanID} by User ${userID}`
            );

            // Create PayPal order
            const approvalUrl = await createOrder(tariffPlan.Currency, tariffPlan.SubscriptionPrice, transaction.Info);
            if (!approvalUrl) {
                return res.status(500).json({ message: 'Failed to create PayPal order' });
            }

            res.status(200).json({ paymentUrl: approvalUrl, transactionID: transaction.TransactionID });
        } catch (error) {
            console.error('Error during PayPal subscription:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Confirm PayPal payment (step 2)
    async payPalConfirmPayment(req, res) {
        try {
            const { transactionID, approvalUrl, tariffPlanID } = req.body;

            const orderID = extractOrderId(approvalUrl);
            // Capture PayPal payment
            const paymentResult = await captureOrder(orderID);
            if (!paymentResult || paymentResult.status !== 'COMPLETED') {
                return res.status(400).json({ message: 'Payment not completed or failed' });
            }

            // Update transaction status
            await TransactionService.update(transactionID, 'success');

            // Retrieve transaction
            const transaction = await Transaction.findByPk(transactionID);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            // Retrieve tariff plan
            const tariffPlan = await TariffPlan.findByPk(tariffPlanID);
            if (!tariffPlan) {
                return res.status(404).json({ message: 'Tariff Plan not found' });
            }

            // Create SubPay record
            await SubPayService.create(req.user.UserID, tariffPlan);

            const subPay = await SubPay.findOne({
                where: { UserUserID: req.user.UserID },
                order: [['createdAt', 'DESC']]
            });

            if (!subPay) {
                return res.status(500).json({ message: 'SubPay creation failed' });
            }

            // Update or create subscription
            await SubscriptionService.extendOrCreateSubscription(req.user.UserID, tariffPlan, subPay.SubPayID);

            res.status(200).json({ message: 'Subscription updated successfully' });
        } catch (error) {
            console.error('Error during PayPal payment confirmation:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // LiqPay subscription (step 1)
    async liqPaySubscribe(req, res) {
        try {
            const { tariffPlanID } = req.body;
            const userID = req.user.UserID;

            // Retrieve tariff plan
            const tariffPlan = await TariffPlan.findByPk(tariffPlanID);
            if (!tariffPlan) {
                return res.status(404).json({ message: 'Tariff Plan not found' });
            }

            // Create transaction
            const transaction = await TransactionService.create(
                tariffPlan.SubscriptionPrice,
                tariffPlan.Currency,
                userID,
                'subscription',
                'liqpay',
                'CREATED',
                `Subscription transaction for TariffPlan ${tariffPlan.TariffPlanID} by User ${userID}`
            );

            // Create LiqPay order
            const paymentUrl = await createLiqPayOrder(
                tariffPlan.Currency,
                tariffPlan.SubscriptionPrice,
                transaction.Info,
                transaction.TransactionID
            );

            if (!paymentUrl) {
                return res.status(500).json({ message: 'Failed to create LiqPay order' });
            }

            res.status(200).json({ paymentUrl: paymentUrl, transactionID: transaction.TransactionID });
        } catch (error) {
            console.error('Error during LiqPay subscription:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Confirm LiqPay payment (step 2)
    async liqPayConfirmPayment(req, res) {
        try {
            const { transactionID, tariffPlanID } = req.body;

            // Retrieve transaction
            const transaction = await Transaction.findByPk(transactionID);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            if (transaction.Status !== 'success') {
                return res.status(400).json({ message: 'Payment not completed' });
            }

            // Retrieve tariff plan
            const tariffPlan = await TariffPlan.findByPk(tariffPlanID);
            if (!tariffPlan) {
                return res.status(404).json({ message: 'Tariff Plan not found' });
            }

            // Create SubPay record
            await SubPayService.create(req.user.UserID, tariffPlan);

            const subPay = await SubPay.findOne({
                where: { UserUserID: req.user.UserID },
                order: [['createdAt', 'DESC']]
            });

            if (!subPay) {
                return res.status(500).json({ message: 'SubPay creation failed' });
            }

            // Update or create subscription
            await SubscriptionService.extendOrCreateSubscription(req.user.UserID, tariffPlan, subPay.SubPayID);

            res.status(200).json({ message: 'Subscription updated successfully' });
        } catch (error) {
            console.error('Error during LiqPay payment confirmation:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async getWhereUser(req, res) {
        try {
            const userID = req.user.UserID;
            const now = moment.utc().toDate();
            // Find active subscription for the user
            const subscription = await Subscription.findOne({
                where: {
                    UserUserID: userID,
                    isActive: true,
                    SubscriptionEnd: {
                        [Op.gt]: now
                    }
                },
                include: [
                    {
                        model: SubPay,
                        where: { UserUserID: userID },
                        include: [
                            {
                                model: TariffPlan
                            }
                        ]
                    }
                ]
            });

            // If no active subscription found
            if (!subscription) {
                return res.status(200).json({
                    message: "No active subscription found for this user."
                });
            }

            // Extract relevant data
            const subscriptionEnd = subscription.SubscriptionEnd;
            const tariffType = subscription.SubPay.TariffPlan.Type;

            // Return subscription end date and plan type
            return res.status(200).json({
                subscriptionEndUTC: moment(subscriptionEnd).utc().toISOString(),
                tariffType: tariffType
            });

        } catch (error) {
            console.error('Error fetching subscription info:', error);
            return res.status(500).json({
                message: 'Internal server error.'
            });
        }
    }


}

module.exports = new SubscriptionProcessController();

