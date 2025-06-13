package com.example.bachelor_project_parking_system.network.ViewModels.Reservation

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bachelor_project_parking_system.models.Reservation.CreateReservationRequest
import com.example.bachelor_project_parking_system.models.Reservation.CreateReservationResponse
import com.example.bachelor_project_parking_system.models.Reservation.SkipReservationResponse
import com.example.bachelor_project_parking_system.models.Reservation.UserReservationsResponse
import com.example.bachelor_project_parking_system.network.Repositories.ReservationRepository
import kotlinx.coroutines.launch

class ReservationViewModel(private val repository: ReservationRepository) : ViewModel() {

    val userReservationsResponse = MutableLiveData<List<UserReservationsResponse>>()
    val skipReservationResponse = MutableLiveData<SkipReservationResponse>()
    val createReservationResponse = MutableLiveData<CreateReservationResponse>()
    val error = MutableLiveData<String>()

    fun createReservation(request: CreateReservationRequest, token: String) {
        viewModelScope.launch {
            try {
                val result = repository.createReservation(request, token)
                if (result.isSuccess) {
                    createReservationResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error creating reservation: ${e.message}")
            }
        }
    }

    fun getUserReservations(token: String) {
        viewModelScope.launch {
            try {
                val result = repository.getUserReservations(token)
                if (result.isSuccess) {
                    userReservationsResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error getting user reservations: ${e.message}")
            }
        }
    }

    fun skipUserReservation(reservationID: Int) {
        viewModelScope.launch {
            try {
                val result = repository.skipUserReservation(reservationID)
                if (result.isSuccess) {
                    skipReservationResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error skipping user reservation: ${e.message}")
            }
        }
    }


}