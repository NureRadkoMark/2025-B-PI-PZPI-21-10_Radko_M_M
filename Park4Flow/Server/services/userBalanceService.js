const { UserBalance , UserDebt} = require('../models/models');
const CommissionService = require('./сommissionService');
const TransactionService = require('./transactionService');
const Decimal = require('decimal.js');

class UserBalanceService {
    /**
     * Deduct funds from user balance.
     * Allows going into negative balance and creates a debt transaction if necessary.
     */
    static async chargeUser(userId, amount) {
        try {
            if (amount <= 0) throw new Error('Amount to charge must be positive.');

            const balanceRecord = await UserBalance.findOne({
                where: { UserUserID: userId }
            });
            if (!balanceRecord) throw new Error('User balance not found.');

            const oldBalance = new Decimal(balanceRecord.Balance);
            const newBalance = oldBalance.minus(amount).toFixed(2); // Ensure 2 decimal precision

            balanceRecord.Balance = newBalance;
            await balanceRecord.save();

            const type = new Decimal(newBalance).lessThan(0) ? 'debt' : 'payment'; // Check for negative balance

            const transaction = await TransactionService.create(
                amount,
                balanceRecord.Currency,
                userId,
                type,
                'balance',
                'success',
                `Charged ${amount}. Old balance: ${oldBalance.toFixed(2)}, New balance: ${newBalance}`
            );

            if (!transaction) {
                console.error("Error with creating transaction using TransactionService");
            }

            return {
                success: true,
                newBalance: newBalance
            };
        } catch (error) {
            console.error('Error in chargeUser:', error.message);
            throw new Error(`Failed to charge user: ${error.message}`);
        }
    }

    /**
     * Top up the user balance.
     * The provided amount is net, commission is handled externally.
     */
    static async topUpUserBalance(userId, amount, paymentSource) {
        try {
            if (amount <= 0) throw new Error('Top-up amount must be positive.');

            const balanceRecord = await UserBalance.findOne({
                where: { UserUserID: userId }
            });
            if (!balanceRecord) throw new Error('User balance not found.');

            const oldBalance = new Decimal(balanceRecord.Balance);
            const newBalance = oldBalance.plus(amount).toFixed(2); // Ensure 2 decimal precision

            balanceRecord.Balance = newBalance;
            await balanceRecord.save();

            const transaction = await TransactionService.create(
                amount,
                balanceRecord.Currency,
                userId,
                'deposit',
                paymentSource,
                'success',
                `Balance topped up by ${amount}. Old balance: ${oldBalance.toFixed(2)}, New balance: ${newBalance}`
            );

            if (!transaction) {
                console.error("Error with creating transaction using TransactionService");
            }

            return {
                success: true,
                newBalance: newBalance
            };
        } catch (error) {
            console.error('Error in topUpUserBalance:', error.message);
            throw new Error(`Failed to top up user balance: ${error.message}`);
        }
    }

    /**
     * Refund a specific amount to user's balance.
     */
    static async refundUser(userId, amount) {
        try {
            if (amount <= 0) throw new Error('Refund amount must be positive.');

            const balanceRecord = await UserBalance.findOne({
                where: { UserUserID: userId }
            });
            if (!balanceRecord) throw new Error('User balance not found.');

            const oldBalance = new Decimal(balanceRecord.Balance);
            const newBalance = oldBalance.plus(amount).toFixed(2); // Ensure 2 decimal precision

            balanceRecord.Balance = newBalance;
            await balanceRecord.save();

            const transaction = await TransactionService.create(
                amount,
                balanceRecord.Currency,
                userId,
                'refund',
                'balance',
                'success',
                `Refunded ${amount}. Old balance: ${oldBalance.toFixed(2)}, New balance: ${newBalance}`
            );

            if (!transaction) {
                console.error("Error with creating transaction using TransactionService");
            }

            return {
                success: true,
                newBalance: newBalance
            };
        } catch (error) {
            console.error('Error in refundUser:', error.message);
            throw new Error(`Failed to refund user: ${error.message}`);
        }
    }

    /**
     * Get the current user balance and currency.
     */
    static async getUserBalance(userId) {
        try {
            const balanceRecord = await UserBalance.findOne({
                where: { UserUserID: userId }
            });

            if (!balanceRecord) throw new Error('User balance not found.');

            return {
                balance: new Decimal(balanceRecord.Balance),
                currency: balanceRecord.Currency
            };
        } catch (error) {
            console.error('Error in getUserBalance:', error.message);
            throw new Error(`Failed to retrieve user balance: ${error.message}`);
        }
    }

    /**
     * Calculate the total amount the user must pay including commission
     * in order to receive a specific balance top-up amount.
     */
    static calculateTotalPaymentWithCommission(desiredAmount) {
        return CommissionService.calculateTotalWithCommission(desiredAmount);
    }
}

module.exports = UserBalanceService;


