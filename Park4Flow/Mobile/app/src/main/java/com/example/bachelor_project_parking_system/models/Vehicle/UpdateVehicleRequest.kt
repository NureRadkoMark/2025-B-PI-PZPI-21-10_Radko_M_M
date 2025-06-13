package com.example.bachelor_project_parking_system.models.Vehicle

data class UpdateVehicleRequest(
    val VehicleCategory: String,
    val StateNumber: String,
    val VehicleBrand: String,
    val VehicleModel: String
)