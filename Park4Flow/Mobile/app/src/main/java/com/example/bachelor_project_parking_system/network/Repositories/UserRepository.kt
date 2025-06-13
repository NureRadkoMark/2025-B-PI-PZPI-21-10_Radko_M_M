package com.example.bachelor_project_parking_system.network.Repositories

import com.example.bachelor_project_parking_system.models.Login.LoginRequest
import com.example.bachelor_project_parking_system.models.Login.LoginResponse
import com.example.bachelor_project_parking_system.models.PassRecovery.PassRecoveryRequest
import com.example.bachelor_project_parking_system.models.PassRecovery.ResetPasswordRequest
import com.example.bachelor_project_parking_system.models.Register.RegisterRequest
import com.example.bachelor_project_parking_system.models.Response.MessageResponse
import com.example.bachelor_project_parking_system.models.User.UpdateUserDataRequest
import com.example.bachelor_project_parking_system.models.User.User
import com.example.bachelor_project_parking_system.network.ApiService.ApiService

class UserRepository(private val apiService: ApiService) {

    suspend fun login(request: LoginRequest): Result<LoginResponse> {
        return try {
            val response = apiService.login(request)
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

    suspend fun register(request: RegisterRequest): Result<MessageResponse> {
        return try {
            val response = apiService.register(request)
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

    suspend fun refreshToken(token: String): Result<LoginResponse> {
        return try {
            val response = apiService.refreshToken("Bearer $token")
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

    suspend fun getUserDetails(token: String): Result<User> {
        return try {
            val response = apiService.getUserDetails("Bearer $token")
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

    suspend fun updateUserDetails(token: String, userDetails: UpdateUserDataRequest): Result<MessageResponse> {
        return try {
            val response = apiService.updateUserDetails("Bearer $token", userDetails)
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

    suspend fun passRecovery(request: PassRecoveryRequest): Result<MessageResponse> {
        return try {
            val response = apiService.passRecovery(request)
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

    suspend fun passReset(request: ResetPasswordRequest): Result<MessageResponse> {
        return try {
            val response = apiService.passReset(request)
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

    suspend fun deleteUser(token: String): Result<MessageResponse> {
        return try {
            val response = apiService.deleteUser ("Bearer $token")
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