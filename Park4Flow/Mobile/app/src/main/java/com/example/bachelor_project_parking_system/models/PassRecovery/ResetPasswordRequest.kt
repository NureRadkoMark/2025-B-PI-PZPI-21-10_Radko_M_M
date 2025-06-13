package com.example.bachelor_project_parking_system.models.PassRecovery

data class ResetPasswordRequest (
    val Email: String,
    val SecurityCode: String,
    val NewPassword: String
)