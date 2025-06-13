const TransactionService = require('../services/transactionService');
const { Transaction, User, Reservation, SubPay, BonusesCost} = require('../models/models')
const {createOrder, captureOrder} = require('../APIs/paypal')
const {createLiqPayOrder, handleLiqPayWebhook} = require('../APIs/liqpay')
const UserBalanceService = require('../services/userBalanceService');
const CommissionService = require('../services/сommissionService')
const Decimal = require('decimal.js');

class BonusService{
    /**
     * Calculates bonus discount and deducts used bonuses from the user's account.
     * @param {Decimal} desiredAmount - The initial operation amount before commission.
     * @param {number} userID - ID of the user making the transaction.
     * @returns {Promise<Decimal>} - Final amount to be paid after applying bonus discount.
     */
    static async payBonuses(desiredAmount, userID) {
        try {
            if (!desiredAmount || desiredAmount <= 0) {
                throw new Error('Invalid desired amount');
            }

            // Get user's current balance info including currency
            const { balance, currency } = await UserBalanceService.getUserBalance(userID);

            // Get user's bonus info
            const user = await User.findByPk(userID);
            if (!user) {
                throw new Error(`User with ID ${userID} not found`);
            }

            const userBonuses = new Decimal(user.Bonuses || 0);

            // Get the cost per one bonus for the user's currency
            const bonusesCostRecord = await BonusesCost.findOne({
                where: { Currency: currency },
            });

            if (!bonusesCostRecord) {
                throw new Error(`Bonus cost not configured for currency: ${currency}`);
            }

            const bonusCostPerUnit = new Decimal(bonusesCostRecord.AmountForOneBonus);
            const totalAmount = new Decimal(desiredAmount);

            // 20% discount limit
            const maxBonusDiscount = totalAmount.mul(0.2);
            const maxUsableBonuses = maxBonusDiscount.div(bonusCostPerUnit).floor();
            const bonusesToUse = Decimal.min(userBonuses, maxUsableBonuses);
            const totalDiscount = bonusCostPerUnit.mul(bonusesToUse);
            const finalAmount = totalAmount.minus(totalDiscount);

            // Check balance
            if (new Decimal(balance).lt(finalAmount)) {
                console.warn(`User ${userID} doesn't have enough balance after bonuses. Proceeding without applying bonuses.`);
                return totalAmount;
            }

            if (bonusesToUse.gt(0)) {
                user.Bonuses = userBonuses.minus(bonusesToUse).toNumber();
                await user.save();
                console.log(`User ${userID} used ${bonusesToUse} bonuses for a discount of ${totalDiscount.toFixed(2)} ${currency}`);
            }

            return finalAmount;
        } catch (error) {
            console.error('Error while applying bonuses:', error.message || error);
            return new Decimal(desiredAmount);
        }
    }

}

module.exports = BonusService;