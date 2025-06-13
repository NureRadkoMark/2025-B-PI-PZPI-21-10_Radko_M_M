package com.example.bachelor_project_parking_system.models.Vehicle

data class CreateVehicleRequest(
    val VehicleCategory: String,
    val StateNumber: String,
    val VehicleBrand: String,
    val VehicleModel: String
    // image separately in multipart
)