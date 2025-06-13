export const updateBonusesCostRequestModel = (BonusesCostID, Currency, AmountForOneBonus) => ({
    BonusesCostID,
    Currency,
    AmountForOneBonus
})

export const updateBonusesCostResponseModel = (Currency, AmountForOneBonus) => ({
    Currency,
    AmountForOneBonus
})