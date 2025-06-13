package com.example.bachelor_project_parking_system.utils

object Constants {
    const val SHARED_PREFS_NAME = "parking_app_prefs"

    // Transaction types
    const val TRANSACTION_TYPE_PAYMENT = "payment"
    const val TRANSACTION_TYPE_DEPOSIT = "deposit"

    // SharedPreferences keys
    const val TOKEN = "auth_token"
    const val TRANSACTION_TYPE = "transaction_type"
    const val AMOUNT = "amount"
    const val CURRENCY = "currency"
    const val RESERVATION_ID = "reservation_id"
    const val TRANSACTION_ID = "transaction_id"
    const val APPROVAL_URL = "approval_url"
}