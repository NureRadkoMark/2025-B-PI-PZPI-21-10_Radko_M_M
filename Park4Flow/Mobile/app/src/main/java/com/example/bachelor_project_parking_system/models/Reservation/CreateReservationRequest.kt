package com.example.bachelor_project_parking_system.models.Reservation

data class CreateReservationRequest(
    val ParkingID: Int,
    val VehicleID: Int,
    val StartTime: String, // ISO 8601 format: "2025-04-16T10:00:00"
    val EndTime: String
)