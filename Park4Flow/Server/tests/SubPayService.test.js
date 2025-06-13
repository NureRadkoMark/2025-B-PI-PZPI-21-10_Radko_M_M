const SubPayService = require('../services/subPayService');
const { SubPay } = require('../models/models');

jest.mock('../models/models', () => ({
    SubPay: {
        create: jest.fn()
    }
}));

describe('SubPayService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new subscription payment record', async () => {
            const userID = 1;
            const tariffPlan = {
                TariffPlanID: 5,
                SubscriptionPrice: 9.99,
                Currency: 'USD'
            };

            const mockCreatedPayment = {
                SubPayID: 101,
                UserUserID: userID,
                TariffPlanTariffPlanID: tariffPlan.TariffPlanID
            };

            SubPay.create.mockResolvedValue(mockCreatedPayment);

            const result = await SubPayService.create(userID, tariffPlan);

            expect(SubPay.create).toHaveBeenCalledWith(expect.objectContaining({
                UserUserID: userID,
                TariffPlanTariffPlanID: tariffPlan.TariffPlanID,
                Amount: tariffPlan.SubscriptionPrice,
                Currency: tariffPlan.Currency,
                PayPurpose: `Subscription Payment by User ${userID} for TariffPlan ${tariffPlan.TariffPlanID}`,
                DateAndTime: expect.any(Date)
            }));

            expect(result).toBe(mockCreatedPayment);
        });

        it('should throw if SubPay.create fails', async () => {
            SubPay.create.mockRejectedValue(new Error('DB error'));

            await expect(SubPayService.create(1, {
                TariffPlanID: 2,
                SubscriptionPrice: 5,
                Currency: 'UAH'
            })).rejects.toThrow('DB error');
        });
    });
});
