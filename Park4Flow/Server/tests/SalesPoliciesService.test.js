const SalesPoliciesService = require('../services/salesPoliciesService');
const { SalesPolicies } = require('../models/models');

jest.mock('../models/models', () => ({
    SalesPolicies: {
        findOne: jest.fn()
    }
}));

describe('SalesPoliciesService.getApplicableSale', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw an error if UserID or ParkingID is missing', async () => {
        await expect(SalesPoliciesService.getApplicableSale(null, 1))
            .rejects.toThrow('UserID and ParkingID are required parameters.');

        await expect(SalesPoliciesService.getApplicableSale(1, null))
            .rejects.toThrow('UserID and ParkingID are required parameters.');
    });

    it('should return 0 if no sales are found', async () => {
        SalesPolicies.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

        const result = await SalesPoliciesService.getApplicableSale(1, 1);
        expect(result).toBe(0);
    });

    it('should return the personal sale if only personal sale exists', async () => {
        SalesPolicies.findOne
            .mockResolvedValueOnce({ SalePercent: 10 }) // personal
            .mockResolvedValueOnce(null);               // general

        const result = await SalesPoliciesService.getApplicableSale(1, 1);
        expect(result).toBe(10);
    });

    it('should return the general sale if only general sale exists', async () => {
        SalesPolicies.findOne
            .mockResolvedValueOnce(null)               // personal
            .mockResolvedValueOnce({ SalePercent: 20 }); // general

        const result = await SalesPoliciesService.getApplicableSale(1, 1);
        expect(result).toBe(20);
    });

    it('should return the combined discount if both sales exist', async () => {
        SalesPolicies.findOne
            .mockResolvedValueOnce({ SalePercent: 10 }) // personal
            .mockResolvedValueOnce({ SalePercent: 20 }); // general

        const result = await SalesPoliciesService.getApplicableSale(1, 1);
        // Combined: 1 - (1 - 0.10) * (1 - 0.20) = 0.28 → 28%
        expect(result).toBe(28);
    });

    it('should log and rethrow errors from inside the function', async () => {
        SalesPolicies.findOne.mockImplementation(() => { throw new Error('DB error'); });

        await expect(SalesPoliciesService.getApplicableSale(1, 1))
            .rejects.toThrow('DB error');
    });
});
