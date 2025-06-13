package com.example.bachelor_project_parking_system.network.Repositories

import com.example.bachelor_project_parking_system.models.Parking.ParkingsListResponse
import com.example.bachelor_project_parking_system.models.Reservation.UserReservationsResponse
import com.example.bachelor_project_parking_system.network.ApiService.ApiService

class ParkingRepository(private val apiService: ApiService) {
    suspend fun getUserParkingsList(token: String): Result<List<ParkingsListResponse>> {
        return try {
            val response = apiService.getUserParkingsList("Bearer $token")
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