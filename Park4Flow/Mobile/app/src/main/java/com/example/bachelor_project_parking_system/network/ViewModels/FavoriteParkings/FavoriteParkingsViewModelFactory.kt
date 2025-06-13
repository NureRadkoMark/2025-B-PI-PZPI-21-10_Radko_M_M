package com.example.bachelor_project_parking_system.network.ViewModels.FavoriteParkings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.bachelor_project_parking_system.network.Repositories.FavoriteParkingsRepository

class FavoriteParkingsViewModelFactory(private val repository: FavoriteParkingsRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(FavoriteParkingsViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return FavoriteParkingsViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}