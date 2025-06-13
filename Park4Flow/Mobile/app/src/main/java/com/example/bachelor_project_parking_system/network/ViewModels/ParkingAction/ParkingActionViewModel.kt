package com.example.bachelor_project_parking_system.network.ViewModels.ParkingAction

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bachelor_project_parking_system.models.ParkingAction.ParkingActionRequest
import com.example.bachelor_project_parking_system.models.ParkingAction.ParkingActionStartResponse
import com.example.bachelor_project_parking_system.models.ParkingAction.ParkingActionStopResponse
import com.example.bachelor_project_parking_system.network.Repositories.ParkingActionRepository
import kotlinx.coroutines.launch

class ParkingActionViewModel(private val repository: ParkingActionRepository) : ViewModel() {

    val parkingActionStartResponse = MutableLiveData<ParkingActionStartResponse>()
    val parkingActionStopResponse = MutableLiveData<ParkingActionStopResponse>()
    val error = MutableLiveData<String>()

    fun parkingActionStart(token: String, request: ParkingActionRequest, parkPlaceID: Int) {
        viewModelScope.launch {
            try {
                val result = repository.parkingActionStart(token, request, parkPlaceID)
                if (result.isSuccess) {
                    parkingActionStartResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error starting parking action: ${e.message}")
            }
        }
    }

    fun parkingActionStop(token: String, request: ParkingActionRequest, parkPlaceID: Int) {
        viewModelScope.launch {
            try {
                val result = repository.parkingActionStop(token, request, parkPlaceID)
                if (result.isSuccess) {
                    parkingActionStopResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error stopping parking action: ${e.message}")
            }
        }
    }
}