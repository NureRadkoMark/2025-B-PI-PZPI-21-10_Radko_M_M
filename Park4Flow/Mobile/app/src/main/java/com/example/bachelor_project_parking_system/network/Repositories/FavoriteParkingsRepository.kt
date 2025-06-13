package com.example.bachelor_project_parking_system.network.Repositories

import com.example.bachelor_project_parking_system.models.Favorites.FavoriteParkingsRequest
import com.example.bachelor_project_parking_system.models.Favorites.UserFavoriteParkingsResponse
import com.example.bachelor_project_parking_system.models.Response.MessageResponse
import com.example.bachelor_project_parking_system.network.ApiService.ApiService

class FavoriteParkingsRepository(private val apiService: ApiService) {

    suspend fun addToFavorites(token: String, request: FavoriteParkingsRequest): Result<MessageResponse> {
        return try {
            val response = apiService.addToFavorites("Bearer $token", request)
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

    suspend fun removeFromFavorites(token: String, request: FavoriteParkingsRequest): Result<MessageResponse> {
        return try {
            val response = apiService.removeFromFavorites("Bearer $token", request)
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

    suspend fun getUserFavorites(token: String): Result<List<UserFavoriteParkingsResponse>> {
        return try {
            val response = apiService.getUserFavorites("Bearer $token")
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