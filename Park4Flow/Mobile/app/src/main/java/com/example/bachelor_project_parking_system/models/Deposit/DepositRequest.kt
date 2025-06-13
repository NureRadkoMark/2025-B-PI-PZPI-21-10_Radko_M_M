package com.example.bachelor_project_parking_system.models.Deposit

data class DepositRequest (
    val currency: String,
    val desiredAmount: String //Money type
)