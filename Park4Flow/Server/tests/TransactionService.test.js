const TransactionService = require('../services/transactionService');
const { Transaction } = require('../models/models');

jest.mock('../models/models', () => ({
    Transaction: {
        create: jest.fn(),
        update: jest.fn(),
    }
}));

describe('TransactionService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create()', () => {
        it('should create a new transaction with correct fields', async () => {
            const mockData = {
                UserUserID: 1,
                Amount: 100,
                Currency: 'USD',
                Type: 'deposit',
                PaymentSource: 'paypal',
                Status: 'success',
                Info: 'Test transaction'
            };

            const expectedCreated = {
                ...mockData,
                DateAndTime: expect.any(Date)
            };

            Transaction.create.mockResolvedValue(expectedCreated);

            const result = await TransactionService.create(
                mockData.Amount,
                mockData.Currency,
                mockData.UserUserID,
                mockData.Type,
                mockData.PaymentSource,
                mockData.Status,
                mockData.Info
            );

            expect(Transaction.create).toHaveBeenCalledWith(expect.objectContaining({
                UserUserID: mockData.UserUserID,
                Type: mockData.Type,
                Amount: mockData.Amount,
                Currency: mockData.Currency,
                PaymentSource: mockData.PaymentSource,
                Status: mockData.Status,
                Info: mockData.Info,
                DateAndTime: expect.any(Date)
            }));

            expect(result).toEqual(expectedCreated);
        });
    });

    describe('update()', () => {
        it('should update the transaction status', async () => {
            Transaction.update.mockResolvedValue([1]); // 1 row updated

            const result = await TransactionService.update(42, 'failed');

            expect(Transaction.update).toHaveBeenCalledWith(
                { Status: 'failed' },
                { where: { TransactionID: 42 } }
            );

            expect(result).toEqual([1]);
        });
    });
});
