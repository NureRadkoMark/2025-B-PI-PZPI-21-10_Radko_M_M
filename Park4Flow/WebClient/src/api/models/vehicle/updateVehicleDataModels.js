export const updateVehicleDataRequestModel = (VehicleID, VehicleCategory, StateNumber, VehicleBrand, VehicleModel) => ({
    VehicleID,
    VehicleCategory,
    StateNumber,
    VehicleBrand,
    VehicleModel
})

export const updateVehicleDataResponseModel = (VehicleCategory, StateNumber, VehicleBrand, VehicleModel, FrontPhotoImage) => ({
    VehicleCategory,
    StateNumber,
    VehicleBrand,
    VehicleModel,
    FrontPhotoImage // это объект File или Blob
})