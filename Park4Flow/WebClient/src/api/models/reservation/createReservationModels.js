export const createReservationRequestModel = (ParkingID, VehicleID, StartTime, EndTime) => ({
    ParkingID,
    VehicleID,
    StartTime,
    EndTime
})

export const createReservationResponseModel = (message, reservationID, price, currency) => ({
    message,
    reservationID,
    price,
    currency
})