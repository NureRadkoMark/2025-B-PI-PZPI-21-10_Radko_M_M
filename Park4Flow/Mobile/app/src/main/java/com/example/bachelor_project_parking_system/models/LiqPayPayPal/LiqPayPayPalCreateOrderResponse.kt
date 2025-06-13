package com.example.bachelor_project_parking_system.models.LiqPayPayPal

import com.google.gson.annotations.SerializedName

data class LiqPayPayPalCreateOrderResponse (
    @SerializedName("paymentUrl")
    val approvalUrl: String,
    @SerializedName("transactionID")
    val transactionID: Int
)