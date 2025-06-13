package com.example.bachelor_project_parking_system.models.Favorites

data class UserFavoriteParkingsResponse (
    val ParkingiD: Int,
    val Address: String,
    val Name: String,
    val Info: String,
    val IsActive: Boolean,
    val Longitude: String,
    val Latitude: String,
)