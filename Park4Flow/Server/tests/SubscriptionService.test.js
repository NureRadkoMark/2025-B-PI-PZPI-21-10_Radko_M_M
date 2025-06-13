const SubscriptionService = require('../services/subscriptionService');
const { Subscription } = require('../models/models');
const moment = require('moment');
const { Op } = require('sequelize');

jest.mock('../models/models', () => ({
    Subscription: {
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    }
}));

describe('SubscriptionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('extendOrCreateSubscription', () => {
        const mockTariff = { SubscriptionDuration: 30 };

        it('should extend an existing subscription', async () => {
            const mockSave = jest.fn();
            const existingSubscription = {
                SubscriptionEnd: moment().add(10, 'days').toDate(),
                SubPaySubPayID: 1,
                isActive: true,
                save: mockSave
            };

            Subscription.findOne.mockResolvedValue(existingSubscription);

            const result = await SubscriptionService.extendOrCreateSubscription(1, mockTariff, 123);

            expect(Subscription.findOne).toHaveBeenCalledWith({ where: { UserUserID: 1 } });
            expect(existingSubscription.SubscriptionEnd).toBeInstanceOf(Date);
            expect(existingSubscription.SubPaySubPayID).toBe(123);
            expect(existingSubscription.isActive).toBe(true);
            expect(mockSave).toHaveBeenCalled();
            expect(result).toEqual(existingSubscription);
        });

        it('should create a new subscription if none exists', async () => {
            Subscription.findOne.mockResolvedValue(null);

            const mockCreatedSubscription = { id: 42 };
            Subscription.create.mockResolvedValue(mockCreatedSubscription);

            const result = await SubscriptionService.extendOrCreateSubscription(2, mockTariff, 456);

            expect(Subscription.create).toHaveBeenCalledWith(expect.objectContaining({
                UserUserID: 2,
                SubPaySubPayID: 456,
                isActive: true,
                SubscriptionEnd: expect.any(Date)
            }));
            expect(result).toBe(mockCreatedSubscription);
        });
    });

    describe('deactivateExpiredSubscriptions', () => {
        it('should deactivate subscriptions where SubscriptionEnd < now and isActive is true', async () => {
            Subscription.update.mockResolvedValue([1]);

            await SubscriptionService.deactivateExpiredSubscriptions();

            expect(Subscription.update).toHaveBeenCalledWith(
                { isActive: false },
                {
                    where: {
                        SubscriptionEnd: { [Op.lt]: expect.any(Date) },
                        isActive: true
                    }
                }
            );
        });

        it('should log error on failure', async () => {
            console.error = jest.fn();
            Subscription.update.mockRejectedValue(new Error('DB error'));

            await SubscriptionService.deactivateExpiredSubscriptions();

            expect(console.error).toHaveBeenCalledWith(
                '❌ Error deactivating expired subscriptions:',
                expect.any(Error)
            );
        });
    });
});
