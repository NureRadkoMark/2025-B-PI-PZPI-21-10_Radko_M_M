export const skipReservationRequestModel = (reservationID) => ({
    reservationID
})

export const skipReservationResponseModel = (message, refundAmount, feeAmount) => ({
    message,
    refundAmount,
    feeAmount
})