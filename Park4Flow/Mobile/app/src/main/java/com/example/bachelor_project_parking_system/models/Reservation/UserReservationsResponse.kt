package com.example.bachelor_project_parking_system.models.Reservation

import java.sql.Time

data class UserReservationsResponse(
    val success: Boolean,
    val reservations: List<ReservationData>
)

data class ReservationData(
    val ReservationID: Int,
    val DateAndTime: String,
    val StartTime: String,
    val EndTime: String,
    val Status: String,
    val Vehicle: VehicleShort,
    val ParkPlace: ParkPlaceWithParking
)

data class VehicleShort(
    val VehicleID: Int,
    val VehicleCategory: String,
    val VehicleBrand: String,
    val VehicleModel: String
)

data class ParkPlaceWithParking(
    val ParkPlaceID: Int,
    val VehicleCategory: String,
    val Name: String,
    val Longitude: String,
    val Lattitude: String,
    val IsTaken: Boolean,
    val CurrentPrice: Double,
    val PriceTimeDuration: Time,
    val Parking: ParkingInfo
)

data class ParkingInfo(
    val ParkingID: Int,
    val Name: String,
    val Address: String,
    val Info: String,
    val DynamicPricing: Boolean,
    val Lattitude: String,
    val Longitude: String
)