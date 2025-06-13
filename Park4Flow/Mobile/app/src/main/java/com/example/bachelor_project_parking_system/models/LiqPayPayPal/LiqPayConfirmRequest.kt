package com.example.bachelor_project_parking_system.models.LiqPayPayPal

data class LiqPayConfirmRequest (
    val transactionID: Int,
    val desiredAmount: String //Money type
)