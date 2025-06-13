export const createSalesPoliciesRequestModel = (email, isForEveryone, salePercent, ParkingID) => ({
    email,
    isForEveryone,
    salePercent,
})

export const createSalesPoliciesResponseModel = (ParkingParkingID, IsForEveryone, SalePercent, UserUserID) => ({
    ParkingParkingID,
    IsForEveryone,
    SalePercent,
    UserUserID
})