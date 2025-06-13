package com.example.bachelor_project_parking_system.models.Parking

data class ParkingsListResponse (
    val ParkingID: Int,
    val Address: String,
    val Name: String,
    val Info: String,
    val IsActive: Boolean,
    val Longitude: Double,
    val Latitude: Double,
    val DynamicPricing: Boolean,
    val DemandFactor: Double,
    val PhotoImage: String //full url to image
)