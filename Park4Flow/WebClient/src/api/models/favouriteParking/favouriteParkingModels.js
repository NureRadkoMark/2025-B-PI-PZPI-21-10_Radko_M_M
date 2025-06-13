export const createFavouriteParkingRequestModel = (ParkingID) => ({
    ParkingID
})

export const createFavouriteParkingResponseModel = (message) => ({
    message
})

export const deleteFavouriteParkingRequestModel = (ParkingID) => ({
    ParkingID
})

export const deleteFavouriteParkingResponseModel = (message) => ({
    message
})

export const getUserFavouriteParkingResponseModel = (ParkingID, Address, Name, Info, IsActive, Longitude, Latitude, PhotoImage) => ({
    ParkingID,
    Address,
    Name,
    Info,
    IsActive,
    Longitude,
    Latitude,
    PhotoImage
})