package com.example.bachelor_project_parking_system.network.ViewModels.Parking

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bachelor_project_parking_system.models.Parking.ParkingsListResponse
import com.example.bachelor_project_parking_system.network.Repositories.ParkingRepository
import kotlinx.coroutines.launch

class ParkingViewModel(private val repository: ParkingRepository) : ViewModel(){
    val userParkingsResponse = MutableLiveData<List<ParkingsListResponse>>()
    val error = MutableLiveData<String>()

    fun getUserParkingsList (token: String) {
        viewModelScope.launch {
            try {
                val result = repository.getUserParkingsList(token)
                if (result.isSuccess) {
                    userParkingsResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception){
                error.postValue("Error getting user parkings on map: ${e.message}")
            }
        }
    }

}