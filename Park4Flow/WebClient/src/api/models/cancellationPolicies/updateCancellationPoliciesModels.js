export const updateCancellationPoliciesRequestModel = (CancellationPoliciesID, HoursBeforeStart, CancellationFeePercent) => ({
    CancellationPoliciesID,
    HoursBeforeStart,
    CancellationFeePercent
})

export const updateCancellationPoliciesResponseModel = (HoursBeforeStart, CancellationFeePercent, ParkingParkingID) => ({
    HoursBeforeStart,
    CancellationFeePercent,
    ParkingParkingID
})