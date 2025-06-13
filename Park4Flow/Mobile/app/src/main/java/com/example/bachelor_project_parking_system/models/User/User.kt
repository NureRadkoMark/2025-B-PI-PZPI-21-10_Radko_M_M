package com.example.bachelor_project_parking_system.models.User

data class User (
    val Email: String,
    val PhoneNumber: String,
    val FirstName: String,
    val SecondName: String,
    val Role: String,
    val Bonuses: Int,
    val Balance: String, //Money format 12.50
    val Currency: String,
    val SecurityCode: String
)