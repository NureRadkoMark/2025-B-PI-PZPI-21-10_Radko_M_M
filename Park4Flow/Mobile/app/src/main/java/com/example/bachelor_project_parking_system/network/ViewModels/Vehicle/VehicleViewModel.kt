package com.example.bachelor_project_parking_system.network.ViewModels.Vehicle

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bachelor_project_parking_system.models.Response.MessageResponse
import com.example.bachelor_project_parking_system.models.Vehicle.UpdateVehicleRequest
import com.example.bachelor_project_parking_system.models.Vehicle.Vehicle
import com.example.bachelor_project_parking_system.network.Repositories.VehicleRepository
import kotlinx.coroutines.launch
import okhttp3.MultipartBody
import okhttp3.RequestBody

class VehicleViewModel(private val repository: VehicleRepository) : ViewModel() {

    val createVehicleResponse = MutableLiveData<Vehicle>()
    val updateVehicleResponse = MutableLiveData<Vehicle>()
    val deleteVehicleResponse = MutableLiveData<MessageResponse>()
    val userVehiclesResponse = MutableLiveData<List<Vehicle>>()
    val error = MutableLiveData<String>()



    fun deleteVehicle(token: String, vehicleID: Int) {
        viewModelScope.launch {
            try {
                val result = repository.deleteVehicle(token, vehicleID)
                if (result.isSuccess) {
                    deleteVehicleResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error deleting vehicle: ${e.message}")
            }
        }
    }

    fun getUserVehicles(token: String) {
        viewModelScope.launch {
            try {
                val result = repository.getUserVehicles(token)
                if (result.isSuccess) {
                    userVehiclesResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error getting user vehicles: ${e.message}")
            }
        }
    }

    fun createVehicle(
        token: String,
        vehicleCategory: RequestBody,
        stateNumber: RequestBody,
        vehicleBrand: RequestBody,
        vehicleModel: RequestBody,
        frontPhotoImage: MultipartBody.Part
    ) {
        viewModelScope.launch {
            try {
                val result = repository.createVehicle(
                    token,
                    vehicleCategory,
                    stateNumber,
                    vehicleBrand,
                    vehicleModel,
                    frontPhotoImage
                )
                if (result.isSuccess) {
                    createVehicleResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error creating vehicle: ${e.message}")
            }
        }
    }

    fun updateVehicle(token: String, vehicleID: Int, request: UpdateVehicleRequest) {
        viewModelScope.launch {
            try {
                val result = repository.updateVehicle(token, vehicleID, request)
                if (result.isSuccess) {
                    updateVehicleResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error updating vehicle: ${e.message}")
            }
        }
    }

}