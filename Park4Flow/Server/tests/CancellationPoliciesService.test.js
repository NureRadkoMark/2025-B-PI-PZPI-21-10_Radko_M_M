const CancellationPoliciesService = require('../services/cancellationPoliciesService');
const { CancellationPolicies } = require('../models/models');
const { Op } = require('sequelize');

jest.mock('../models/models', () => ({
    CancellationPolicies: {
        findOne: jest.fn()
    }
}));

describe('CancellationPoliciesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getWhereParkingAndTime', () => {
        it('should return the correct cancellation fee percent if policy is found', async () => {
            const mockPolicy = { CancellationFeePercent: 20 };

            CancellationPolicies.findOne.mockResolvedValue(mockPolicy);

            const result = await CancellationPoliciesService.getWhereParkingAndTime(1, 5);

            expect(result).toEqual({ CancellationFeePercent: 20 });
            expect(CancellationPolicies.findOne).toHaveBeenCalledWith({
                where: { HoursBeforeStart: { [Op.gte]: 5 } },
                order: [['HoursBeforeStart', 'ASC']]
            });
        });

        it('should log and return 0 if no policy is found', async () => {
            console.error = jest.fn();
            CancellationPolicies.findOne.mockResolvedValue(null);

            const result = await CancellationPoliciesService.getWhereParkingAndTime(1, 10);

            expect(console.error).toHaveBeenCalledWith('Policy is not found');
            expect(result).toEqual({ CancellationFeePercent: 0 });
        });

        it('should log error and return 0 if exception is thrown', async () => {
            console.error = jest.fn();
            CancellationPolicies.findOne.mockRejectedValue(new Error('DB error'));

            const result = await CancellationPoliciesService.getWhereParkingAndTime(1, 3);

            expect(console.error).toHaveBeenCalledWith(
                'Error fetching cancellation policy:',
                expect.any(Error)
            );
            expect(result).toEqual({ CancellationFeePercent: 0 });
        });
    });
});
