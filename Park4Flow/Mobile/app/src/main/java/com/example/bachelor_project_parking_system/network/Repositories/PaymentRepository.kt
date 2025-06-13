package com.example.bachelor_project_parking_system.network.Repositories

import com.example.bachelor_project_parking_system.models.LiqPayPayPal.ConfirmResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayConfirmRequest
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayPayPalCreateOrderResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.PayPalConfirmRequest
import com.example.bachelor_project_parking_system.models.Payment.PaymentRequest
import com.example.bachelor_project_parking_system.models.Response.MessageResponse
import com.example.bachelor_project_parking_system.network.ApiService.ApiService

class PaymentRepository (private val apiService: ApiService) {

    suspend fun paymentPayPalCreate(token: String, request: PaymentRequest): Result<LiqPayPayPalCreateOrderResponse> {
        return try {
            val response = apiService.paymentPayPalCreate("Bearer $token", request)
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun paymentPayPalConfirm(token: String, request: PayPalConfirmRequest): Result<ConfirmResponse> {
        return try {
            val response = apiService.paymentPayPalConfirm("Bearer $token", request)
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun paymentLiqPayCreate(token: String, request: PaymentRequest): Result<LiqPayPayPalCreateOrderResponse> {
        return try {
            val response = apiService.paymentLiqPayCreate("Bearer $token", request)
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun paymentLiqPayConfirm(token: String, request: LiqPayConfirmRequest): Result<ConfirmResponse> {
        return try {
            val response = apiService.paymentLiqPayConfirm("Bearer $token", request)
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun paymentBalance(token: String, request: PaymentRequest): Result<MessageResponse> {
        return try {
            val response = apiService.paymentBalance("Bearer $token", request)
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("Error ${response.code()}: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}