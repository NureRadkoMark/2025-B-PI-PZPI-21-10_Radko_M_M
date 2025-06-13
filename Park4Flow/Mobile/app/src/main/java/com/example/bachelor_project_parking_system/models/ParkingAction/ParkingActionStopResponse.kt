package com.example.bachelor_project_parking_system.models.ParkingAction

data class ParkingActionStopResponse(
    val message: String,
    val totalFee: String,
    val currency: String,
    val overstay: Boolean
)