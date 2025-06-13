package com.example.bachelor_project_parking_system.network.ViewModels.Deposit

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bachelor_project_parking_system.models.Deposit.DepositRequest
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.ConfirmResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayConfirmRequest
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayPayPalCreateOrderResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.PayPalConfirmRequest
import com.example.bachelor_project_parking_system.network.Repositories.DepositRepository
import kotlinx.coroutines.launch

class DepositViewModel(private val repository: DepositRepository) : ViewModel() {

    val depositPayPalCreateResponse = MutableLiveData<LiqPayPayPalCreateOrderResponse>()
    val depositPayPalConfirmResponse = MutableLiveData<ConfirmResponse>()
    val depositLiqPayCreateResponse = MutableLiveData<LiqPayPayPalCreateOrderResponse>()
    val depositLiqPayConfirmResponse = MutableLiveData<ConfirmResponse>()
    val error = MutableLiveData<String>()

    fun depositPayPalCreate(token: String, request: DepositRequest) {
        viewModelScope.launch {
            try {
                val result = repository.depositPayPalCreate(token, request)
                if (result.isSuccess) {
                    depositPayPalCreateResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error creating PayPal deposit: ${e.message}")
            }
        }
    }

    fun depositPayPalConfirm(token: String, request: PayPalConfirmRequest) {
        viewModelScope.launch {
            try {
                val result = repository.depositPayPalConfirm(token, request)
                if (result.isSuccess) {
                    depositPayPalConfirmResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error confirming PayPal deposit: ${e.message}")
            }
        }
    }

    fun depositLiqPayCreate(token: String, request: DepositRequest) {
        viewModelScope.launch {
            try {
                val result = repository.depositLiqPayCreate(token, request)
                if (result.isSuccess) {
                    depositLiqPayCreateResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error creating LiqPay deposit: ${e.message}")
            }
        }
    }

    fun depositLiqPayConfirm(token: String, request: LiqPayConfirmRequest) {
        viewModelScope.launch {
            try {
                val result = repository.depositLiqPayConfirm(token, request)
                if (result.isSuccess) {
                    depositLiqPayConfirmResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error confirming LiqPay deposit: ${e.message}")
            }
        }
    }
}