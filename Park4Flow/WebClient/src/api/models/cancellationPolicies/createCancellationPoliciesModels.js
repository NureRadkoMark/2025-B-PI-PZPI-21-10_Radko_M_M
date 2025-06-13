export const createCancellationPoliciesRequestModel = (HoursBeforeStart, CancellationFeePercent) => ({
    HoursBeforeStart,
    CancellationFeePercent
})

export const createCancellationPoliciesResponseModel = (HoursBeforeStart, CancellationFeePercent, ParkingParkingID) => ({
    HoursBeforeStart,
    CancellationFeePercent,
    ParkingParkingID
})