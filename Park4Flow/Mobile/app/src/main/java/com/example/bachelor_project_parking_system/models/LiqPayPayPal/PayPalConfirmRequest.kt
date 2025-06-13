package com.example.bachelor_project_parking_system.models.LiqPayPayPal

data class PayPalConfirmRequest (
    val transactionID: Int,
    val approvalUrl: String,
    val desiredAmount: String //Money type
)