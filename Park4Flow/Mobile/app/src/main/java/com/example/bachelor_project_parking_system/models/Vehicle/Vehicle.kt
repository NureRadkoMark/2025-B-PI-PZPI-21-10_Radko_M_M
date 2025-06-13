package com.example.bachelor_project_parking_system.models.Vehicle

data class Vehicle(
    val VehicleID: Int,
    val VehicleCategory: String,
    val StateNumber: String,
    val VehicleBrand: String,
    val VehicleModel: String,
    val FrontPhotoImage: String,
    val UserUserID: Int
)