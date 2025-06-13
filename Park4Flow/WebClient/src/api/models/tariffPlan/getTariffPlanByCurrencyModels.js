export const getTariffPlanByCurrencyRequestModel = (currency) => ({
    currency
})

export const getTariffPlanByCurrencyResponseModel = (TariffPlanID, SubscriptionDuration, SubscriptionPrice, Currency, Type) => ({
    TariffPlanID,
    SubscriptionDuration,
    SubscriptionPrice,
    Currency,
    Type
})