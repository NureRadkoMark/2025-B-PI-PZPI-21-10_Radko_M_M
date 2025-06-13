package com.example.bachelor_project_parking_system.models.ParkingAction

data class ParkingActionStartResponse(
    val message: String,
    val parkingAction: ParkingActionDto
)

data class ParkingActionDto(
    val ParkingActionID: Int,
    val StartTime: String,
    val EndTime: String?,
    val TotalFee: String,
    val Currency: String,
    val Status: String,
    val ParkPlaceParkPlaceID: Int,
    val VehicleVehicleID: Int
)