const { ParkingBalance, ParkingManager } = require('../models/models');
const Decimal = require('decimal.js');
const TransactionService = require('../services/transactionService');

class ParkingBalanceService {
    /**
     * Add funds to a parking balance.
     * Creates a 'revenue' transaction record using TransactionService.
     */
    static async addToParkingBalance(parkingId, amount, source = 'system') {
        try {
            if (amount <= 0) throw new Error('Amount must be a positive number.');

            const balanceRecord = await ParkingBalance.findOne({
                where: { ParkingParkingID: parkingId }
            });
            if (!balanceRecord) throw new Error('Parking balance not found.');

            const manager = await ParkingManager.findOne({
                where: { ParkingParkingID: parkingId, Role: 'owner' }
            });
            if (!manager || !manager.UserUserID) {
                throw new Error('Parking owner (UserUserID) not found. Cannot create transaction.');
            }

            const currentBalance = new Decimal(balanceRecord.Balance);
            const newBalance = currentBalance.plus(amount).toFixed(2); // Ensure 2 decimal precision
            balanceRecord.Balance = newBalance;
            await balanceRecord.save();

            // Create a transaction for the added funds
            const transaction = await TransactionService.create(
                amount,
                balanceRecord.Currency,
                manager.UserUserID,
                'revenue',
                source,
                'success',
                `Funds added to parking balance (ParkingID: ${parkingId}). Old balance: ${currentBalance.toFixed(2)}, New balance: ${newBalance}`
            );

            if (!transaction) {
                console.error('Error with creating transaction using TransactionService');
            }

            return {
                success: true,
                newBalance: newBalance
            };
        } catch (error) {
            console.error('Error in addToParkingBalance:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Deduct funds from a parking balance.
     * Creates a 'payout' transaction record using TransactionService.
     */
    static async deductFromParkingBalance(parkingId, amount, source = 'system') {
        try {
            if (amount <= 0) throw new Error('Amount must be a positive number.');

            const balanceRecord = await ParkingBalance.findOne({
                where: { ParkingParkingID: parkingId }
            });
            if (!balanceRecord) throw new Error('Parking balance not found.');

            const manager = await ParkingManager.findOne({
                where: { ParkingParkingID: parkingId, Role: 'owner' }
            });
            if (!manager || !manager.UserUserID) {
                throw new Error('Parking owner (UserUserID) not found. Cannot create transaction.');
            }

            const currentBalance = new Decimal(balanceRecord.Balance);
            const newBalance = currentBalance.minus(amount).toFixed(2); // Ensure 2 decimal precision
            balanceRecord.Balance = newBalance;
            await balanceRecord.save();

            // Create a transaction for the deducted funds
            const transaction = await TransactionService.create(
                amount,
                balanceRecord.Currency,
                manager.UserUserID,
                'payout',
                source,
                'success',
                `Funds deducted from parking balance (ParkingID: ${parkingId}). Old balance: ${currentBalance.toFixed(2)}, New balance: ${newBalance}`
            );

            if (!transaction) {
                console.error('Error with creating transaction using TransactionService');
            }

            return {
                success: true,
                newBalance: newBalance
            };
        } catch (error) {
            console.error('Error in deductFromParkingBalance:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get current balance of a parking.
     */
    static async getParkingBalance(parkingId) {
        try {
            const balanceRecord = await ParkingBalance.findOne({
                where: { ParkingParkingID: parkingId }
            });
            if (!balanceRecord) throw new Error('Parking balance not found.');

            // Return the balance with two decimal precision
            return {
                success: true,
                balance: parseFloat(new Decimal(balanceRecord.Balance).toFixed(2)),
                currency: balanceRecord.Currency
            };
        } catch (error) {
            console.error('Error in getParkingBalance:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = ParkingBalanceService;

