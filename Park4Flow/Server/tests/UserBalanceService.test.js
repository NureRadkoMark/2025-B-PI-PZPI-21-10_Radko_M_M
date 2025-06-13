const Decimal = require('decimal.js');
const UserBalanceService = require('../services/userBalanceService');
const { UserBalance } = require('../models/models');
const TransactionService = require('../services/transactionService');
const CommissionService = require('../services/сommissionService');

jest.mock('../models/models', () => ({
    UserBalance: {
        findOne: jest.fn()
    }
}));

jest.mock('../services/transactionService', () => ({
    create: jest.fn()
}));

jest.mock('../services/сommissionService', () => ({
    calculateTotalWithCommission: jest.fn()
}));

describe('UserBalanceService', () => {
    const mockUserId = 1;
    const mockCurrency = 'USD';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('chargeUser', () => {
        it('charges user and creates transaction', async () => {
            const balance = '100.00';
            const amount = 30;

            UserBalance.findOne.mockResolvedValue({
                Balance: balance,
                Currency: mockCurrency,
                save: jest.fn()
            });

            TransactionService.create.mockResolvedValue({ id: 1 });

            const result = await UserBalanceService.chargeUser(mockUserId, amount);

            expect(UserBalance.findOne).toHaveBeenCalled();
            expect(TransactionService.create).toHaveBeenCalledWith(
                amount,
                mockCurrency,
                mockUserId,
                'payment',
                'balance',
                'success',
                expect.stringContaining('Charged')
            );
            expect(result).toEqual({
                success: true,
                newBalance: '70.00'
            });
        });

        it('handles going into debt', async () => {
            const balance = '10.00';
            const amount = 30;

            const saveMock = jest.fn();
            UserBalance.findOne.mockResolvedValue({
                Balance: balance,
                Currency: mockCurrency,
                save: saveMock
            });

            TransactionService.create.mockResolvedValue({ id: 1 });

            const result = await UserBalanceService.chargeUser(mockUserId, amount);

            expect(saveMock).toHaveBeenCalled();
            expect(TransactionService.create).toHaveBeenCalledWith(
                amount,
                mockCurrency,
                mockUserId,
                'debt',
                'balance',
                'success',
                expect.stringContaining('Old balance')
            );
            expect(result.newBalance).toBe('-20.00');
        });

        it('throws error on invalid amount', async () => {
            await expect(UserBalanceService.chargeUser(mockUserId, -5)).rejects.toThrow('Amount to charge must be positive.');
        });

        it('throws error if user balance not found', async () => {
            UserBalance.findOne.mockResolvedValue(null);

            await expect(UserBalanceService.chargeUser(mockUserId, 10)).rejects.toThrow('User balance not found.');
        });
    });

    describe('topUpUserBalance', () => {
        it('tops up balance and creates deposit transaction', async () => {
            const balance = '50.00';
            const amount = 25;

            UserBalance.findOne.mockResolvedValue({
                Balance: balance,
                Currency: mockCurrency,
                save: jest.fn()
            });

            TransactionService.create.mockResolvedValue({ id: 1 });

            const result = await UserBalanceService.topUpUserBalance(mockUserId, amount, 'paypal');

            expect(TransactionService.create).toHaveBeenCalledWith(
                amount,
                mockCurrency,
                mockUserId,
                'deposit',
                'paypal',
                'success',
                expect.stringContaining('Balance topped up')
            );
            expect(result.newBalance).toBe('75.00');
        });

        it('throws error on negative amount', async () => {
            await expect(UserBalanceService.topUpUserBalance(mockUserId, -10, 'paypal'))
                .rejects.toThrow('Failed to top up user balance: Top-up amount must be positive.');
        });

        it('throws error if user balance not found', async () => {
            UserBalance.findOne.mockResolvedValue(null);

            await expect(UserBalanceService.topUpUserBalance(mockUserId, 10, 'paypal')).rejects.toThrow('User balance not found.');
        });
    });

    describe('refundUser', () => {
        it('refunds amount and creates refund transaction', async () => {
            const balance = '20.00';
            const amount = 15;

            UserBalance.findOne.mockResolvedValue({
                Balance: balance,
                Currency: mockCurrency,
                save: jest.fn()
            });

            TransactionService.create.mockResolvedValue({ id: 1 });

            const result = await UserBalanceService.refundUser(mockUserId, amount);

            expect(TransactionService.create).toHaveBeenCalledWith(
                amount,
                mockCurrency,
                mockUserId,
                'refund',
                'balance',
                'success',
                expect.stringContaining('Refunded')
            );
            expect(result.newBalance).toBe('35.00');
        });

        it('throws error on negative amount', async () => {
            await expect(UserBalanceService.refundUser(mockUserId, -15))
                .rejects.toThrow('Failed to refund user: Refund amount must be positive.');
        });

        it('throws error if user balance not found', async () => {
            UserBalance.findOne.mockResolvedValue(null);

            await expect(UserBalanceService.refundUser(mockUserId, 10)).rejects.toThrow('User balance not found.');
        });
    });

    describe('getUserBalance', () => {
        it('returns user balance and currency', async () => {
            UserBalance.findOne.mockResolvedValue({
                Balance: '42.50',
                Currency: 'EUR'
            });

            const result = await UserBalanceService.getUserBalance(mockUserId);

            expect(result).toEqual({
                balance: new Decimal('42.50'),
                currency: 'EUR'
            });
        });

        it('throws error if user balance not found', async () => {
            UserBalance.findOne.mockResolvedValue(null);

            await expect(UserBalanceService.getUserBalance(mockUserId)).rejects.toThrow('User balance not found.');
        });
    });

    describe('calculateTotalPaymentWithCommission', () => {
        it('delegates to CommissionService', () => {
            CommissionService.calculateTotalWithCommission.mockReturnValue(107.5);

            const result = UserBalanceService.calculateTotalPaymentWithCommission(100);

            expect(CommissionService.calculateTotalWithCommission).toHaveBeenCalledWith(100);
            expect(result).toBe(107.5);
        });
    });
});

