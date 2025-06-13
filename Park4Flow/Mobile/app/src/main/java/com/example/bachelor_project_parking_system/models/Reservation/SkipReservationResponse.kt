package com.example.bachelor_project_parking_system.models.Reservation

data class SkipReservationResponse(
    val message: String,
    val refundAmount: String, // In money format: "12.50"
    val feeAmount: String
)