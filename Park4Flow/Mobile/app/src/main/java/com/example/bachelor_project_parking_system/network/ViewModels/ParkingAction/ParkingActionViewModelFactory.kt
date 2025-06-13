package com.example.bachelor_project_parking_system.network.ViewModels.ParkingAction

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.bachelor_project_parking_system.network.Repositories.ParkingActionRepository

class ParkingActionViewModelFactory(private val repository: ParkingActionRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ParkingActionViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ParkingActionViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}