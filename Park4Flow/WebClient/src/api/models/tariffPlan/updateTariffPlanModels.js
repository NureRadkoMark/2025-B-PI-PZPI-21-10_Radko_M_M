export const updateTariffPlanRequestModel = (TariffPlanID, SubscriptionDuration, SubscriptionPrice, Currency, Type) => ({
    TariffPlanID,
    SubscriptionDuration,
    SubscriptionPrice,
    Currency,
    Type
})

export const updateTariffPlanResponseModel = (SubscriptionDuration, SubscriptionPrice, Currency, Type) => ({
    SubscriptionDuration,
    SubscriptionPrice,
    Currency,
    Type
})