const Decimal = require('decimal.js');
const UserDebtService = require('../services/userDebtService');


jest.mock('../models/models', () => ({
    User: { update: jest.fn() },
    UserBalance: { findOne: jest.fn() },
    UserDebt: {
        findOne: jest.fn(),
        create: jest.fn(),
        findAll: jest.fn(),
        update: jest.fn()
    },
    Op: {
        lt: Symbol('lt')
    }
}));

const { User, UserBalance, UserDebt } = require('../models/models');

describe('UserDebtService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUserDebt', () => {
        it('should create a new debt if balance is negative and no existing debt', async () => {
            UserBalance.findOne.mockResolvedValue({ Balance: '-10' });
            UserDebt.findOne.mockResolvedValue(null);

            await UserDebtService.createUserDebt(1, 5, 'USD', 2);

            expect(UserDebt.create).toHaveBeenCalledWith(expect.objectContaining({
                UserUserID: 1,
                ParkingParkingID: 2,
                Amount: '5.00',
                Currency: 'USD',
                isRepaid: false
            }));
        });

        it('should not create debt if balance is positive', async () => {
            UserBalance.findOne.mockResolvedValue({ Balance: '15' });

            await UserDebtService.createUserDebt(1, 5, 'USD', 2);

            expect(UserDebt.create).not.toHaveBeenCalled();
        });

        it('should not create debt if existing unpaid debt exists', async () => {
            UserBalance.findOne.mockResolvedValue({ Balance: '-20' });
            UserDebt.findOne.mockResolvedValue({ id: 1 });

            await UserDebtService.createUserDebt(1, 10, 'USD', 3);

            expect(UserDebt.create).not.toHaveBeenCalled();
        });

        it('should handle missing parameters', async () => {
            await UserDebtService.createUserDebt(null, 10, 'USD', 2);
            expect(UserDebt.create).not.toHaveBeenCalled();
        });
    });

    describe('setIsRepaid', () => {
        it('should update debt as repaid if balance >= 0', async () => {
            UserBalance.findOne.mockResolvedValue({ Balance: '0.00' });

            await UserDebtService.setIsRepaid(1);

            expect(UserDebt.update).toHaveBeenCalledWith(
                { isRepaid: true },
                { where: { UserUserID: 1, isRepaid: false } }
            );
        });

        it('should not update debt if balance is negative', async () => {
            UserBalance.findOne.mockResolvedValue({ Balance: '-3.00' });

            await UserDebtService.setIsRepaid(1);

            expect(UserDebt.update).not.toHaveBeenCalled();
        });

        it('should handle missing userID', async () => {
            await UserDebtService.setIsRepaid(null);

            expect(UserDebt.update).not.toHaveBeenCalled();
        });
    });

    describe('overdueDebt', () => {
        it('should ban user if debt is overdue and balance still negative', async () => {
            const userDebts = [
                { UserUserID: 1, DateAndTime: new Date(Date.now() - 25 * 60 * 60 * 1000) }
            ];

            UserDebt.findAll.mockResolvedValue(userDebts);
            UserBalance.findOne.mockResolvedValue({ Balance: '-1.00' });

            await UserDebtService.overdueDebt();

            expect(User.update).toHaveBeenCalledWith(
                { IsBanned: true },
                { where: { UserID: 1 } }
            );
        });

        it('should not ban user if balance is now non-negative', async () => {
            UserDebt.findAll.mockResolvedValue([{ UserUserID: 2, DateAndTime: new Date(Date.now() - 25 * 60 * 60 * 1000) }]);
            UserBalance.findOne.mockResolvedValue({ Balance: '2.00' });

            await UserDebtService.overdueDebt();

            expect(User.update).not.toHaveBeenCalled();
        });

        it('should skip user if no balance found', async () => {
            UserDebt.findAll.mockResolvedValue([{ UserUserID: 3, DateAndTime: new Date(Date.now() - 25 * 60 * 60 * 1000) }]);
            UserBalance.findOne.mockResolvedValue(null);

            await UserDebtService.overdueDebt();

            expect(User.update).toHaveBeenCalledWith(
                { IsBanned: true },
                { where: { UserID: 3 } }
            );
        });
    });
});
