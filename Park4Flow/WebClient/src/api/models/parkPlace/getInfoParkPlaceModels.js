export const getInfoParkPlaceRequestModel = (ParkPlaceID) => ({
    ParkPlaceID
})

export const getInfoParkPlaceResponseModel = (ParkPlaceID, VehicleCategory, PlaceCategory, Name, Longitude, Latitude, BasePrice, PriceTimeDuration) => ({
    ParkPlaceID,
    VehicleCategory,
    PlaceCategory,
    Name,
    Longitude,
    Latitude,
    BasePrice,
    PriceTimeDuration
})