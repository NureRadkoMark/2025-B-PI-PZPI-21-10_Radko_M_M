package com.example.bachelor_project_parking_system.models.Login

data class LoginRequest (
    val Email: String,
    val Password: String,
    val Lang: String = "en"
)