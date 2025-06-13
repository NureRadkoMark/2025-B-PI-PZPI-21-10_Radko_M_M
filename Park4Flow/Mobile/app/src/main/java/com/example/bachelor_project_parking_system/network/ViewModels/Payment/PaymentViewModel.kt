package com.example.bachelor_project_parking_system.network.ViewModels.Payment

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.ConfirmResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayConfirmRequest
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayPayPalCreateOrderResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.PayPalConfirmRequest
import com.example.bachelor_project_parking_system.models.Payment.PaymentRequest
import com.example.bachelor_project_parking_system.models.Response.MessageResponse
import com.example.bachelor_project_parking_system.network.Repositories.PaymentRepository
import kotlinx.coroutines.launch

class PaymentViewModel(private val repository: PaymentRepository) : ViewModel() {

    val paymentPayPalCreateResponse = MutableLiveData<LiqPayPayPalCreateOrderResponse>()
    val paymentPayPalConfirmResponse = MutableLiveData<ConfirmResponse>()
    val paymentLiqPayCreateResponse = MutableLiveData<LiqPayPayPalCreateOrderResponse>()
    val paymentLiqPayConfirmResponse = MutableLiveData<ConfirmResponse>()
    val paymentBalanceResponse = MutableLiveData<MessageResponse>()
    val error = MutableLiveData<String>()

    fun paymentPayPalCreate(token: String, request: PaymentRequest) {
        viewModelScope.launch {
            try {
                val result = repository.paymentPayPalCreate(token, request)
                if (result.isSuccess) {
                    paymentPayPalCreateResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error creating PayPal payment: ${e.message}")
            }
        }
    }

    fun paymentPayPalConfirm(token: String, request: PayPalConfirmRequest) {
        viewModelScope.launch {
            try {
                val result = repository.paymentPayPalConfirm(token, request)
                if (result.isSuccess) {
                    paymentPayPalConfirmResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error confirming PayPal payment: ${e.message}")
            }
        }
    }

    fun paymentLiqPayCreate(token: String, request: PaymentRequest) {
        viewModelScope.launch {
            try {
                val result = repository.paymentLiqPayCreate(token, request)
                if (result.isSuccess) {
                    paymentLiqPayCreateResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error creating LiqPay payment: ${e.message}")
            }
        }
    }

    fun paymentLiqPayConfirm(token: String, request: LiqPayConfirmRequest) {
        viewModelScope.launch {
            try {
                val result = repository.paymentLiqPayConfirm(token, request)
                if (result.isSuccess) {
                    paymentLiqPayConfirmResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error confirming LiqPay payment: ${e.message}")
            }
        }
    }

    fun paymentBalance(token: String, request: PaymentRequest) {
        viewModelScope.launch {
            try {
                val result = repository.paymentBalance(token, request)
                if (result.isSuccess) {
                    paymentBalanceResponse.postValue(result.getOrNull())
                } else {
                    error.postValue(result.exceptionOrNull()?.message ?: "Unknown error")
                }
            } catch (e: Exception) {
                error.postValue("Error processing balance payment: ${e.message}")
            }
        }
    }
}