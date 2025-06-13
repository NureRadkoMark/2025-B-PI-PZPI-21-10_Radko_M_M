package com.example.bachelor_project_parking_system.network.Repositories

import com.example.bachelor_project_parking_system.models.Deposit.DepositRequest
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.ConfirmResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayConfirmRequest
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayPayPalCreateOrderResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.PayPalConfirmRequest
import com.example.bachelor_project_parking_system.network.ApiService.ApiService

class DepositRepository(private val apiService: ApiService) {

    suspend fun depositPayPalCreate(token: String, request: DepositRequest): Result<LiqPayPayPalCreateOrderResponse> {
        return try {
            val response = apiService.depositPayPalCreate("Bearer $token", request)
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

    suspend fun depositPayPalConfirm(token: String, request: PayPalConfirmRequest): Result<ConfirmResponse> {
        return try {
            val response = apiService.depositPayPalConfirm("Bearer $token", request)
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

    suspend fun depositLiqPayCreate(token: String, request: DepositRequest): Result<LiqPayPayPalCreateOrderResponse> {
        return try {
            val response = apiService.depositLiqPayCreate("Bearer $token", request)
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

    suspend fun depositLiqPayConfirm(token: String, request: LiqPayConfirmRequest): Result<ConfirmResponse> {
        return try {
            val response = apiService.depositLiqPayConfirm("Bearer $token", request)
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