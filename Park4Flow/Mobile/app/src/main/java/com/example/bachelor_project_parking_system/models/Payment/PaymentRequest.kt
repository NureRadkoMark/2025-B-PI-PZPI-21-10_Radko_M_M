package com.example.bachelor_project_parking_system.models.Payment

data class PaymentRequest (
    val reservationId: Int,
    val desiredAmount: String, //Money type
    val payByBonuses: Boolean = false,
    val currency: String
)