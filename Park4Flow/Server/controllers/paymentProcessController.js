const TransactionService = require('../services/transactionService');
const { Transaction, User, Reservation, SubPay, ParkPlace, BonusesCost} = require('../models/models')
const {createOrder, captureOrder} = require('../APIs/paypal')
const {createLiqPayOrder, handleLiqPayWebhook} = require('../APIs/liqpay')
const UserBalanceService = require('../services/userBalanceService');
const CommissionService = require('../services/сommissionService')
const BonusService = require('../services/bonusService')
const Decimal = require('decimal.js');
const SalesPoliciesService = require('../services/salesPoliciesService');
const {extractOrderId} = require("../services/URLService");

class PaymentProcessController{
    // Create PayPal order for reservation (step 1)
    async payPalPayment(req, res) {
        try {
            const { reservationId, desiredAmount, payByBonuses, currency } = req.body;
            const userID = req.user.UserID;

            if (!reservationId || !desiredAmount || desiredAmount <= 0 || !currency) {
                return res.status(400).json({ message: 'Invalid payment data' });
            }

            const reservation = await Reservation.findByPk(reservationId);
            if (!reservation) {
                return res.status(404).json({ message: 'Reservation not found' });
            }

            const parkPlace = await ParkPlace.findByPk(reservation.ParkPlaceParkPlaceID);
            if (!parkPlace) {
                return res.status(404).json({ message: 'Parking place not found' });
            }

            // Calculate total amount with commission and sales
            const salePercent = await SalesPoliciesService.getApplicableSale(userID, parkPlace.ParkingParkingID);
            const totalAmountWithCommission = new Decimal(
                CommissionService.calculateTotalWithCommission(desiredAmount - (desiredAmount * salePercent))
            );

            // Apply bonuses if requested
            let resultAmount = totalAmountWithCommission;
            try {
                if (payByBonuses === true) {
                    resultAmount = await BonusService.payBonuses(totalAmountWithCommission, userID);
                }
            } catch (error) {
                console.error('Error applying bonuses:', error.message);
                return res.status(400).json({ message: error.message || 'Failed to apply bonuses' });
            }

            // Create transaction
            const transaction = await TransactionService.create(
                resultAmount.toFixed(2),
                currency,
                userID,
                'payment',
                'paypal',
                'CREATED',
                `User ${userID} initiated PayPal payment for reservation ${reservationId}. Amount: ${resultAmount.toFixed(2)} ${currency}`
            );

            transaction.ReservationReservationID = reservationId
            await transaction.save()

            // Create PayPal order
            const approvalUrl = await createOrder(currency, resultAmount.toFixed(2), transaction.Info);
            if (!approvalUrl) {
                return res.status(500).json({ message: 'Failed to create PayPal order' });
            }

            res.status(200).json({ paymentUrl: approvalUrl, transactionID: transaction.TransactionID });
        } catch (error) {
            console.error('Error during PayPal payment:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Confirm PayPal payment (step 2)
    async payPalConfirmPayment(req, res) {
        try {
            const { transactionID, approvalUrl, reservationId } = req.body;
            const userID = req.user.UserID;

            const orderID = extractOrderId(approvalUrl);
            // Capture payment
            const paymentResult = await captureOrder(orderID);
            if (!paymentResult || paymentResult.status !== 'COMPLETED') {
                return res.status(400).json({ message: 'Payment not completed or failed' });
            }

            const transaction = await Transaction.findByPk(transactionID);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            // Mark transaction completed
            await TransactionService.update(transactionID, 'success');

            // Mark reservation as paid
            const reservation = await Reservation.findByPk(reservationId);
            if (!reservation) {
                return res.status(404).json({ message: 'Reservation not found' });
            }

            reservation.status = 'PAID';
            await reservation.save();

            res.status(200).json({ message: 'Reservation payment confirmed successfully' });
        } catch (error) {
            console.error('Error during PayPal confirmation:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Create LiqPay order for reservation (step 1)
    async liqPayPayment(req, res) {
        try {
            const { reservationId, desiredAmount, payByBonuses, currency } = req.body;
            const userID = req.user.UserID;

            if (!reservationId || !desiredAmount || desiredAmount <= 0 || !currency) {
                return res.status(400).json({ message: 'Invalid payment data' });
            }

            const reservation = await Reservation.findByPk(reservationId);
            if (!reservation) {
                return res.status(404).json({ message: 'Reservation not found' });
            }

            const parkPlace = await ParkPlace.findByPk(reservation.ParkPlaceParkPlaceID);
            if (!parkPlace) {
                return res.status(404).json({ message: 'Parking place not found' });
            }

            // Calculate total amount with commission and sales
            const salePercent = await SalesPoliciesService.getApplicableSale(userID, parkPlace.ParkingParkingID);
            const totalAmountWithCommission = new Decimal(
                CommissionService.calculateTotalWithCommission(desiredAmount - (desiredAmount * salePercent))
            );

            // Apply bonuses if requested
            let resultAmount = totalAmountWithCommission;
            try {
                if (payByBonuses === true) {
                    resultAmount = await BonusService.payBonuses(totalAmountWithCommission, userID);
                    console.log(resultAmount)
                }
            } catch (error) {
                console.error('Error applying bonuses:', error.message);
                return res.status(400).json({ message: error.message || 'Failed to apply bonuses' });
            }

            // Create transaction
            const transaction = await TransactionService.create(
                resultAmount.toFixed(2),
                currency,
                userID,
                'payment',
                'liqpay',
                'CREATED',
                `User ${userID} initiated LiqPay payment for reservation ${reservationId}. Amount: ${resultAmount.toFixed(2)} ${currency}`
            );

            transaction.ReservationReservationID = reservationId
            await transaction.save()

            // Create LiqPay order
            const paymentUrl = await createLiqPayOrder(
                currency,
                resultAmount.toFixed(2),
                transaction.Info,
                transaction.TransactionID
            );

            if (!paymentUrl) {
                return res.status(500).json({ message: 'Failed to create LiqPay order' });
            }

            res.status(200).json({ paymentUrl: paymentUrl, transactionID: transaction.TransactionID });
        } catch (error) {
            console.error('Error during LiqPay payment:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Confirm LiqPay payment (step 2)
    async liqPayConfirmPayment(req, res) {
        try {
            const { transactionID, reservationId } = req.body;
            const userID = req.user.UserID;

            const transaction = await Transaction.findByPk(transactionID);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }

            if (transaction.Status !== 'success') {
                return res.status(400).json({ message: 'Payment not completed' });
            }

            const reservation = await Reservation.findByPk(reservationId);
            if (!reservation) {
                return res.status(404).json({ message: 'Reservation not found' });
            }

            reservation.status = 'PAID';
            await reservation.save();

            res.status(200).json({ message: 'Reservation payment confirmed successfully' });
        } catch (error) {
            console.error('Error during LiqPay confirmation:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Controller for processing reservation payment from user balance
    async balancePayment(req, res) {
        try {
            const { reservationId, desiredAmount, payByBonuses } = req.body;
            const userID = req.user.UserID;

            // Validate input
            if (!reservationId || !desiredAmount || isNaN(desiredAmount) || desiredAmount <= 0) {
                return res.status(400).json({ message: 'Invalid payment data' });
            }

            // Fetch user balance and currency
            const { balance, currency } = await UserBalanceService.getUserBalance(userID);

            // Check if reservation exists
            const reservation = await Reservation.findByPk(reservationId);
            if (!reservation) {
                return res.status(404).json({ message: 'Reservation not found' });
            }

            const parkPlace = await ParkPlace.findByPk(reservation.ParkPlaceParkPlaceID)
            if (!parkPlace){
                return res.status(404).json({ message: 'Parking place not found' });
            }

            // Calculate total amount including commission
            const totalAmountWithCommission = new Decimal(
                CommissionService.calculateTotalWithCommission(desiredAmount - (desiredAmount * await SalesPoliciesService.getApplicableSale(userID, parkPlace.ParkingParkingID)))
            );

            // Apply bonuses if requested
            let resultAmount = totalAmountWithCommission;
            try {
                if (payByBonuses === true) {
                    resultAmount = await BonusService.payBonuses(totalAmountWithCommission, userID);
                }
            } catch (error) {
                console.error('Error applying bonuses:', error.message);
                return res.status(400).json({ message: error.message || 'Failed to apply bonuses' });
            }

            // Check user has sufficient funds
            if (new Decimal(balance).lessThan(resultAmount)) {
                return res.status(407).json({ message: 'Not enough funds on balance' });
            }

            // Create a transaction record
            const transaction = await TransactionService.create(
                resultAmount.toFixed(2),
                currency,
                userID,
                'payment',
                'balance',
                'CREATED',
                `User ${userID} paid for reservation ${reservationId}. Amount: ${resultAmount.toFixed(2)} ${currency}`
            );

            if (!transaction) {
                return res.status(500).json({ message: 'Transaction creation failed' });
            }

            // Charge user's balance
            await UserBalanceService.chargeUser(userID, resultAmount);

            // Mark reservation as paid
            reservation.status = 'PAID';
            transaction.status = 'success';
            await reservation.save();
            await transaction.save();

            return res.status(200).json({ message: 'Reservation payment successful' });

        } catch (error) {
            console.error('Error in balance payment:', error);
            return res.status(500).json({ message: 'Internal server error during balance payment' });
        }
    }

}



module.exports = new PaymentProcessController()