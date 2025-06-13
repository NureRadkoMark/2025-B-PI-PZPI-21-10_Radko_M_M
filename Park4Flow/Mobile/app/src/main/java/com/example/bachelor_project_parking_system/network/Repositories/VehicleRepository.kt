package com.example.bachelor_project_parking_system.network.Repositories

import com.example.bachelor_project_parking_system.models.Response.MessageResponse
import com.example.bachelor_project_parking_system.models.Vehicle.UpdateVehicleRequest
import com.example.bachelor_project_parking_system.models.Vehicle.Vehicle
import com.example.bachelor_project_parking_system.network.ApiService.ApiService
import okhttp3.MultipartBody
import okhttp3.RequestBody

class VehicleRepository(private val apiService: ApiService) {

    suspend fun createVehicle(
        token: String,
        vehicleCategory: RequestBody,
        stateNumber: RequestBody,
        vehicleBrand: RequestBody,
        vehicleModel: RequestBody,
        frontPhotoImage: MultipartBody.Part
    ): Result<Vehicle> {
        return try {
            val response = apiService.createVehicle(
                "Bearer $token",
                vehicleCategory,
                stateNumber,
                vehicleBrand,
                vehicleModel,
                frontPhotoImage
            )
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

    suspend fun updateVehicle(token: String, vehicleID: Int, request: UpdateVehicleRequest): Result<Vehicle> {
        return try {
            val response = apiService.updateVehicle("Bearer $token", vehicleID, request)
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

    suspend fun deleteVehicle(token: String, vehicleID: Int): Result<MessageResponse> {
        return try {
            val response = apiService.deleteVehicle("Bearer $token", vehicleID)
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

    suspend fun getUserVehicles(token: String): Result<List<Vehicle>> {
        return try {
            val response = apiService.getUserVehicles("Bearer $token")
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