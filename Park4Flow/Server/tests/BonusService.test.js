const BonusService = require('../services/bonusService');
const { User, BonusesCost } = require('../models/models');
const UserBalanceService = require('../services/userBalanceService');
const Decimal = require('decimal.js');

jest.mock('../models/models', () => ({
    User: {
        findByPk: jest.fn(),
    },
    BonusesCost: {
        findOne: jest.fn(),
    }
}));

jest.mock('../services/userBalanceService', () => ({
    getUserBalance: jest.fn(),
}));

describe('BonusService.payBonuses', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should apply bonuses correctly and return the discounted amount', async () => {
        const userID = 1;
        const initialAmount = new Decimal(100);

        UserBalanceService.getUserBalance.mockResolvedValue({
            balance: 100,
            currency: 'USD',
        });

        const user = {
            Bonuses: 10,
            save: jest.fn().mockResolvedValue(true),
        };

        User.findByPk.mockResolvedValue(user);

        BonusesCost.findOne.mockResolvedValue({
            AmountForOneBonus: 1, // 1 USD per bonus
        });

        const finalAmount = await BonusService.payBonuses(initialAmount, userID);

        expect(finalAmount.toNumber()).toBe(90); // 10 bonus * 1 = 10 USD discount
        expect(user.save).toHaveBeenCalled();
        expect(user.Bonuses).toBe(0); // 10 - 10 used
    });

    it('should not allow to proceed if desiredAmount is invalid', async () => {
        await expect(BonusService.payBonuses(0, 1)).rejects.toThrow('Failed to apply bonus discount');
        await expect(BonusService.payBonuses(-5, 1)).rejects.toThrow('Failed to apply bonus discount');
    });

    it('should throw if user not found', async () => {
        UserBalanceService.getUserBalance.mockResolvedValue({
            balance: 100,
            currency: 'USD',
        });

        User.findByPk.mockResolvedValue(null);

        await expect(BonusService.payBonuses(new Decimal(100), 1)).rejects.toThrow('Failed to apply bonus discount');
    });

    it('should throw if bonus cost not configured', async () => {
        UserBalanceService.getUserBalance.mockResolvedValue({
            balance: 100,
            currency: 'EUR',
        });

        User.findByPk.mockResolvedValue({ Bonuses: 5, save: jest.fn() });

        BonusesCost.findOne.mockResolvedValue(null);

        await expect(BonusService.payBonuses(new Decimal(100), 1)).rejects.toThrow('Failed to apply bonus discount');
    });

    it('should throw if not enough funds after bonus applied', async () => {
        UserBalanceService.getUserBalance.mockResolvedValue({
            balance: 10,
            currency: 'USD',
        });

        User.findByPk.mockResolvedValue({
            Bonuses: 10,
            save: jest.fn(),
        });

        BonusesCost.findOne.mockResolvedValue({
            AmountForOneBonus: 1,
        });

        await expect(BonusService.payBonuses(new Decimal(100), 1)).rejects.toThrow('Failed to apply bonus discount');
    });

    it('should not modify bonuses if zero usable bonuses', async () => {
        const user = {
            Bonuses: 0,
            save: jest.fn(),
        };

        UserBalanceService.getUserBalance.mockResolvedValue({
            balance: 100,
            currency: 'USD',
        });

        User.findByPk.mockResolvedValue(user);

        BonusesCost.findOne.mockResolvedValue({
            AmountForOneBonus: 1,
        });

        const result = await BonusService.payBonuses(new Decimal(100), 1);

        expect(result.toNumber()).toBe(100);
        expect(user.save).not.toHaveBeenCalled();
    });
});
