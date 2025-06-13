package com.example.bachelor_project_parking_system.network.Repositories

import com.example.bachelor_project_parking_system.models.Reservation.CreateReservationRequest
import com.example.bachelor_project_parking_system.models.Reservation.CreateReservationResponse
import com.example.bachelor_project_parking_system.models.Reservation.SkipReservationResponse
import com.example.bachelor_project_parking_system.models.Reservation.UserReservationsResponse
import com.example.bachelor_project_parking_system.network.ApiService.ApiService

class ReservationRepository(private val apiService: ApiService) {

    suspend fun getUserReservations(token: String): Result<List<UserReservationsResponse>> {
        return try {
            val response = apiService.getUserReservations("Bearer $token")
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

    suspend fun skipUserReservation(reservationID: Int): Result<SkipReservationResponse> {
        return try {
            val response = apiService.skipUserReservation(reservationID)
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

    suspend fun createReservation(request: CreateReservationRequest, token: String): Result<CreateReservationResponse> {
        return try {
            val response = apiService.createReservation(token, request)
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