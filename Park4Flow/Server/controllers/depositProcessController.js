const TransactionService = require('../services/transactionService');
const { Transaction } = require('../models/models');
const { createOrder, captureOrder } = require('../APIs/paypal');
const { createLiqPayOrder } = require('../APIs/liqpay');
const UserBalanceService = require('../services/userBalanceService');
const CommissionService = require('../services/сommissionService');
const UserDebtService = require("../services/userDebtService");
const {extractOrderId} = require("../services/URLService");

class DepositProcessController {
    // PayPal deposit (step 1)
    async payPalDeposit(req, res) {
        try {
            const { desiredAmount, currency } = req.body;
            const userID = req.user.UserID;

            if (!desiredAmount || desiredAmount <= 0) {
                return res.status(400).json({ message: 'Invalid deposit amount' });
            }

            // Calculate total amount with commission
            const totalAmount = CommissionService.calculateTotalWithCommission(desiredAmount);

            // Create transaction
            const transaction = await TransactionService.create(
                totalAmount,
                currency,
                userID,
                'deposit',
                'paypal',
                'CREATED',
                `User ${userID} wants to top up balance by ${desiredAmount} ${currency}, total with commission: ${totalAmount}`
            );

            // Create PayPal order
            const approvalUrl = await createOrder(currency, totalAmount, transaction.Info);
            if (!approvalUrl) {
                return res.status(500).json({ message: 'Failed to create PayPal order' });
            }

            res.status(200).json({ paymentUrl: approvalUrl, transactionID: transaction.TransactionID });
        } catch (error) {
            console.error('Error during PayPal deposit:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Confirm PayPal deposit (step 2)
    async payPalConfirmDeposit(req, res) {
        try {
            const { transactionID, approvalUrl, desiredAmount } = req.body;
            const userID = req.user.UserID;

            const orderID = extractOrderId(approvalUrl);
            // Capture payment
            const paymentResult = await captureOrder(orderID);
            if (!paymentResult || paymentResult.status !== 'COMPLETED') {
                return res.status(400).json({ message: 'Payment not completed or failed' });
            }

            // Update transaction status
            await TransactionService.update(transactionID, 'success');

            // Add net amount to user balance
            await UserBalanceService.topUpUserBalance(userID, desiredAmount, 'paypal');

            const userBalance = await UserBalanceService.getUserBalance(userID);

            if (userBalance.balance.isPositive()) {
                await UserDebtService.setIsRepaid(
                    userID
                );
                console.log(`Repaid Debt for User ${userID}`)
            }

            res.status(200).json({ message: 'Balance topped up successfully' });
        } catch (error) {
            console.error('Error during PayPal deposit confirmation:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // LiqPay deposit (step 1)
    async liqPayDeposit(req, res) {
        try {
            const { desiredAmount, currency } = req.body;
            const userID = req.user.UserID;

            if (!desiredAmount || desiredAmount <= 0) {
                return res.status(400).json({ message: 'Invalid deposit amount' });
            }

            // Calculate total with commission
            const totalAmount = CommissionService.calculateTotalWithCommission(desiredAmount);

            // Create transaction
            const transaction = await TransactionService.create(
                totalAmount,
                currency,
                userID,
                'deposit',
                'liqpay',
                'CREATED',
                `User ${userID} wants to top up balance by ${desiredAmount} ${currency}, total with commission: ${totalAmount}`
            );

            // Create LiqPay order
            const paymentUrl = await createLiqPayOrder(
                currency,
                totalAmount,
                transaction.Info,
                transaction.TransactionID
            );

            if (!paymentUrl) {
                return res.status(500).json({ message: 'Failed to create LiqPay order' });
            }

            res.status(200).json({ paymentUrl: paymentUrl, transactionID: transaction.TransactionID });
        } catch (error) {
            console.error('Error during LiqPay deposit:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Confirm LiqPay deposit (step 2)
    async liqPayConfirmDeposit(req, res) {
        try {
            const { transactionID, desiredAmount } = req.body;
            const userID = req.user.UserID;

            // Retrieve transaction
            const transaction = await Transaction.findByPk(transactionID);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            if (transaction.Status !== 'success') {
                return res.status(400).json({ message: 'Payment not completed' });
            }

            // Add net amount to user balance
            await UserBalanceService.topUpUserBalance(userID, desiredAmount, 'liqpay');

            const userBalance = await UserBalanceService.getUserBalance(userID);

            if (userBalance.balance.isPositive()) {
                await UserDebtService.setIsRepaid(
                    userID
                );
                console.log(`Repaid Debt for User ${userID}`)
            }

            res.status(200).json({ message: 'Balance topped up successfully' });
        } catch (error) {
            console.error('Error during LiqPay deposit confirmation:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}

module.exports = new DepositProcessController();

