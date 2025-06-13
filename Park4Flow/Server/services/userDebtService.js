const { UserDebt, UserBalance, User } = require('../models/models');
const { Op } = require('sequelize');
const Decimal = require('decimal.js');

class UserDebtService {
    /**
     * Check user balance. If it's less than 0, create a UserDebt record.
     */
    static async createUserDebt(userID, amount, currency, parkingID) {
        try {
            if (!userID || !amount || !currency || !parkingID) {
                throw new Error("Missing required parameters.");
            }

            const userBalance = await UserBalance.findOne({
                where: { UserUserID: userID }
            });

            if (!userBalance) {
                throw new Error(`User balance not found for UserID: ${userID}`);
            }

            const balance = new Decimal(userBalance.Balance);

            if (balance.isNegative()) {
                const existingDebt = await UserDebt.findOne({
                    where: {
                        UserUserID: userID,
                        isRepaid: false
                    }
                });

                if (!existingDebt) {
                    await UserDebt.create({
                        UserUserID: userID,
                        ParkingParkingID: parkingID,
                        Amount: new Decimal(amount).toFixed(2),
                        Currency: currency,
                        isRepaid: false,
                        DateAndTime: new Date()
                    });
                }
            }
        } catch (error) {
            console.error("Error in createUserDebt:", error.message);
        }
    }

    /**
     * Check user's current balance. If it is >= 0, mark the debt as repaid.
     */
    static async setIsRepaid(userID) {
        try {
            if (!userID) {
                throw new Error("UserID is required.");
            }

            const userBalance = await UserBalance.findOne({
                where: { UserUserID: userID }
            });

            if (!userBalance) {
                throw new Error(`User balance not found for UserID: ${userID}`);
            }

            const balance = new Decimal(userBalance.Balance);

            if (balance.greaterThanOrEqualTo(0)) {
                await UserDebt.update(
                    { isRepaid: true },
                    {
                        where: {
                            UserUserID: userID,
                            isRepaid: false
                        }
                    }
                );
            }
        } catch (error) {
            console.error("Error in setIsRepaid:", error.message);
        }
    }

    /**
     * If 24 hours have passed since the debt was created and the user still has negative balance, ban the user.
     */
    static async overdueDebt() {
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const overdueDebts = await UserDebt.findAll({
                where: {
                    isRepaid: false,
                    DateAndTime: {
                        [Op.lt]: oneDayAgo
                    }
                }
            });

            for (const debt of overdueDebts) {
                try {
                    const userBalance = await UserBalance.findOne({
                        where: { UserUserID: debt.UserUserID }
                    });

                    if (userBalance) {
                        const balance = new Decimal(userBalance.Balance);

                        if (balance.greaterThanOrEqualTo(0)) {
                            continue; // Skip banning if balance is now non-negative
                        }
                    }

                    await User.update(
                        { IsBanned: true },
                        { where: { UserID: debt.UserUserID } }
                    );
                } catch (innerError) {
                    console.error(`Error processing debt for UserID ${debt.UserUserID}:`, innerError.message);
                }
            }
        } catch (error) {
            console.error("Error in overdueDebt:", error.message);
        }
    }
}

module.exports = UserDebtService;
