package com.example.bachelor_project_parking_system.network.ViewModels.Deposit

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.bachelor_project_parking_system.network.Repositories.DepositRepository

class DepositViewModelFactory(private val repository: DepositRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(DepositViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return DepositViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}