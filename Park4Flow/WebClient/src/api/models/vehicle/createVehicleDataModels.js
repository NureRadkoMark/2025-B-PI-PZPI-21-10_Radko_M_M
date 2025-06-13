export const createVehicleDataRequestModel = (VehicleCategory, StateNumber, VehicleBrand, VehicleModel, FrontPhotoImage) => ({
    VehicleCategory,
    StateNumber,
    VehicleBrand,
    VehicleModel,
    FrontPhotoImage // это объект File или Blob
})

export const createVehicleDataResponseModel = (VehicleCategory, StateNumber, VehicleBrand, VehicleModel, FrontPhotoImage) => ({
    VehicleCategory,
    StateNumber,
    VehicleBrand,
    VehicleModel,
    FrontPhotoImage // это объект File или Blob
})