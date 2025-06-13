const fs = require('fs');
const path = require('path');

jest.mock('fs');

const CommissionService = require('../services/сommissionService');

describe('CommissionService', () => {
    const mockConfigPath = path.join(__dirname, '../services/settings.json');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getCommissionPercent', () => {
        it('should read commission percent from config file', () => {
            fs.readFileSync.mockReturnValue(JSON.stringify({ commission_percent: 7.5 }));

            const percent = CommissionService.getCommissionPercent();

            expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('settings.json'), 'utf-8');
            expect(percent).toBe(7.5);
        });
    });

    describe('setCommissionPercent', () => {
        it('should write new commission percent to config file', () => {
            CommissionService.setCommissionPercent(15.2);

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                expect.stringContaining('settings.json'),
                JSON.stringify({ commission_percent: 15.2 }, null, 2),
                'utf-8'
            );
        });

        it('should throw error if percent < 0 or > 100', () => {
            expect(() => CommissionService.setCommissionPercent(-5)).toThrow();
            expect(() => CommissionService.setCommissionPercent(150)).toThrow();
        });
    });

    describe('calculateTotalWithCommission', () => {
        it('should return total including commission', () => {
            // підставимо getCommissionPercent
            jest.spyOn(CommissionService, 'getCommissionPercent').mockReturnValue(10);

            const result = CommissionService.calculateTotalWithCommission(200);

            expect(result).toBe(220.00);
            expect(CommissionService.getCommissionPercent).toHaveBeenCalled();
        });

        it('should round result to 2 decimals', () => {
            jest.spyOn(CommissionService, 'getCommissionPercent').mockReturnValue(7.5);

            const result = CommissionService.calculateTotalWithCommission(123.456);
            expect(result).toBeCloseTo(132.71, 2); // 123.456 * 1.075 = 132.7122
        });
    });
});
