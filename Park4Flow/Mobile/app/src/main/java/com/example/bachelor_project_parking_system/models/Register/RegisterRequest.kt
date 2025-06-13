package com.example.bachelor_project_parking_system.models.Register

data class RegisterRequest (
    val Email: String,
    val Password: String,
    val FirstName: String,
    val SecondName: String,
    val PhoneNumber: String,
    val Currency: String,
    val Lang: String = "en"
)