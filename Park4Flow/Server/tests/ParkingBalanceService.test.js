const Decimal = require('decimal.js');
const ParkingBalanceService = require('../services/parkingBalanceService');
const { ParkingBalance, ParkingManager } = require('../models/models');
const TransactionService = require('../services/transactionService');

jest.mock('../models/models', () => ({
    ParkingBalance: {
        findOne: jest.fn()
    },
    ParkingManager: {
        findOne: jest.fn()
    }
}));

jest.mock('../services/transactionService', () => ({
    create: jest.fn()
}));

describe('ParkingBalanceService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addToParkingBalance', () => {
        it('should add funds and create revenue transaction', async () => {
            const parkingId = 1;
            const amount = 100;

            const mockBalance = {
                Balance: '50.00',
                Currency: 'USD',
                save: jest.fn()
            };
            const mockManager = { UserUserID: 10 };

            ParkingBalance.findOne.mockResolvedValue(mockBalance);
            ParkingManager.findOne.mockResolvedValue(mockManager);
            TransactionService.create.mockResolvedValue({ success: true });

            const result = await ParkingBalanceService.addToParkingBalance(parkingId, amount);

            expect(result.success).toBe(true);
            expect(result.newBalance).toBe('150.00');
            expect(mockBalance.save).toHaveBeenCalled();
            expect(TransactionService.create).toHaveBeenCalledWith(
                amount,
                'USD',
                10,
                'revenue',
                'system',
                'success',
                expect.stringContaining('Funds added to parking balance')
            );
        });

        it('should fail if balance not found', async () => {
            ParkingBalance.findOne.mockResolvedValue(null);

            const result = await ParkingBalanceService.addToParkingBalance(1, 50);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Parking balance not found.');
        });

        it('should fail on non-positive amount', async () => {
            const result = await ParkingBalanceService.addToParkingBalance(1, 0);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Amount must be a positive number.');
        });
    });

    describe('deductFromParkingBalance', () => {
        it('should deduct funds and create payout transaction', async () => {
            const parkingId = 2;
            const amount = 30;

            const mockBalance = {
                Balance: '100.00',
                Currency: 'EUR',
                save: jest.fn()
            };
            const mockManager = { UserUserID: 5 };

            ParkingBalance.findOne.mockResolvedValue(mockBalance);
            ParkingManager.findOne.mockResolvedValue(mockManager);
            TransactionService.create.mockResolvedValue({ success: true });

            const result = await ParkingBalanceService.deductFromParkingBalance(parkingId, amount);

            expect(result.success).toBe(true);
            expect(result.newBalance).toBe('70.00');
            expect(mockBalance.save).toHaveBeenCalled();
            expect(TransactionService.create).toHaveBeenCalledWith(
                amount,
                'EUR',
                5,
                'payout',
                'system',
                'success',
                expect.stringContaining('Funds deducted from parking balance')
            );
        });

        it('should fail if owner not found', async () => {
            const mockBalance = { Balance: '100', save: jest.fn() };
            ParkingBalance.findOne.mockResolvedValue(mockBalance);
            ParkingManager.findOne.mockResolvedValue(null);

            const result = await ParkingBalanceService.deductFromParkingBalance(1, 20);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Parking owner (UserUserID) not found. Cannot create transaction.');
        });
    });

    describe('getParkingBalance', () => {
        it('should return balance with currency', async () => {
            const mockBalance = { Balance: '250.556', Currency: 'UAH' };
            ParkingBalance.findOne.mockResolvedValue(mockBalance);

            const result = await ParkingBalanceService.getParkingBalance(1);

            expect(result.success).toBe(true);
            expect(result.balance).toBe(250.56);
            expect(result.currency).toBe('UAH');
        });

        it('should fail if balance not found', async () => {
            ParkingBalance.findOne.mockResolvedValue(null);

            const result = await ParkingBalanceService.getParkingBalance(999);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Parking balance not found.');
        });
    });
});
