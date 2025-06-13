package com.example.bachelor_project_parking_system.network.ViewModels.FavoriteParkings

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bachelor_project_parking_system.models.Favorites.FavoriteParkingsRequest
import com.example.bachelor_project_parking_system.models.Favorites.UserFavoriteParkingsResponse
import com.example.bachelor_project_parking_system.models.Response.MessageResponse
import com.example.bachelor_project_parking_system.network.Repositories.FavoriteParkingsRepository
import kotlinx.coroutines.launch

class FavoriteParkingsViewModel(private val repository: FavoriteParkingsRepository) : ViewModel() {

    val addToFavoritesResponse = MutableLiveData<MessageResponse>()
    val removeFromFavoritesResponse = MutableLiveData<MessageResponse>()
    val userFavoritesResponse = MutableLiveData<List<UserFavoriteParkingsResponse>>()
    val error = MutableLiveData<String>()

    fun addToFavorites(token: String, request: FavoriteParkingsRequest) {
        viewModelScope.launch {
            try {
                val result = repository.addToFavorites(token, request)
                if (result.isSuccess) {
                    addToFavoritesResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error adding to favorites: ${e.message}")
            }
        }
    }

    fun removeFromFavorites(token: String, request: FavoriteParkingsRequest) {
        viewModelScope.launch {
            try {
                val result = repository.removeFromFavorites(token, request)
                if (result.isSuccess) {
                    removeFromFavoritesResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error removing from favorites: ${e.message}")
            }
        }
    }

    fun getUserFavorites(token: String) {
        viewModelScope.launch {
            try {
                val result = repository.getUserFavorites(token)
                if (result.isSuccess) {
                    userFavoritesResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error getting user favorites: ${e.message}")
            }
        }
    }
}