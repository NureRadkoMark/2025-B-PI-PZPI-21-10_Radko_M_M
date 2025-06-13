package com.example.bachelor_project_parking_system.network.Repositories

import com.example.bachelor_project_parking_system.models.ParkingAction.ParkingActionRequest
import com.example.bachelor_project_parking_system.models.ParkingAction.ParkingActionStartResponse
import com.example.bachelor_project_parking_system.models.ParkingAction.ParkingActionStopResponse
import com.example.bachelor_project_parking_system.network.ApiService.ApiService

class ParkingActionRepository(private val apiService: ApiService) {

    suspend fun parkingActionStart(token: String, request: ParkingActionRequest, parkPlaceID: Int): Result<ParkingActionStartResponse> {
        return try {
            val response = apiService.parkingActionStart("Bearer $token", request, parkPlaceID)
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

    suspend fun parkingActionStop(token: String, request: ParkingActionRequest, parkPlaceID: Int): Result<ParkingActionStopResponse> {
        return try {
            val response = apiService.parkingActionStop("Bearer $token", request, parkPlaceID)
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