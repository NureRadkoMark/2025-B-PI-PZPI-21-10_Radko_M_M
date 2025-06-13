package com.example.bachelor_project_parking_system.network.ViewModels.User

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bachelor_project_parking_system.models.Login.LoginRequest
import com.example.bachelor_project_parking_system.models.Login.LoginResponse
import com.example.bachelor_project_parking_system.models.PassRecovery.PassRecoveryRequest
import com.example.bachelor_project_parking_system.models.PassRecovery.ResetPasswordRequest
import com.example.bachelor_project_parking_system.models.Register.RegisterRequest
import com.example.bachelor_project_parking_system.models.Response.MessageResponse
import com.example.bachelor_project_parking_system.models.User.UpdateUserDataRequest
import com.example.bachelor_project_parking_system.models.User.User
import com.example.bachelor_project_parking_system.network.Repositories.UserRepository
import kotlinx.coroutines.launch

class UserViewModel(private val repository: UserRepository) : ViewModel() {

    val loginResponse = MutableLiveData<LoginResponse>()
    val registerResponse = MutableLiveData<MessageResponse>()
    val refreshTokenResponse = MutableLiveData<LoginResponse>()
    val userDetailsResponse = MutableLiveData<User>()
    val updateUserResponse = MutableLiveData<MessageResponse>()
    val passRecoveryResponse = MutableLiveData<MessageResponse>()
    val passResetResponse = MutableLiveData<MessageResponse>()
    val deleteUserResponse = MutableLiveData<MessageResponse>()
    val error = MutableLiveData<String>()

    fun passRecovery(request: PassRecoveryRequest) {
        viewModelScope.launch {
            try {
                val result = repository.passRecovery(request)
                if (result.isSuccess) {
                    passRecoveryResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error recovering password: ${e.message}")
            }
        }
    }

    fun passReset(request: ResetPasswordRequest) {
        viewModelScope.launch {
            try {
                val result = repository.passReset(request)
                if (result.isSuccess) {
                    passResetResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error resetting password: ${e.message}")
            }
        }
    }

    fun deleteUser (token: String) {
        viewModelScope.launch {
            try {
                val result = repository.deleteUser (token)
                if (result.isSuccess) {
                    deleteUserResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error deleting user: ${e.message}")
            }
        }
    }

    fun getUserDetails(token: String) {
        viewModelScope.launch {
            try {
                val result = repository.getUserDetails(token)
                if (result.isSuccess) {
                    userDetailsResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error getting user details: ${e.message}")
            }
        }
    }

    fun updateUserDetails(token: String, userDetails: UpdateUserDataRequest) {
        viewModelScope.launch {
            try {
                val result = repository.updateUserDetails(token, userDetails)
                if (result.isSuccess) {
                    updateUserResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error updating user details: ${e.message}")
            }
        }
    }

    fun login(request: LoginRequest) {
        viewModelScope.launch {
            try {
                val result = repository.login(request)
                if (result.isSuccess) {
                    loginResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error logging in: ${e.message}")
            }
        }
    }

    fun register(request: RegisterRequest) {
        viewModelScope.launch {
            try {
                val result = repository.register(request)
                if (result.isSuccess) {
                    registerResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error registering: ${e.message}")
            }
        }
    }

    fun refreshToken(token: String) {
        viewModelScope.launch {
            try {
                val result = repository.refreshToken(token)
                if (result.isSuccess) {
                    refreshTokenResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error refreshing token: ${e.message}")
            }
        }
    }
}