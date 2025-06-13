package com.example.bachelor_project_parking_system.controllers

import android.content.SharedPreferences
import android.util.Log
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.Observer
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModel
import okhttp3.Call
import okhttp3.Callback
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import java.io.IOException

class JwtTokenController(
    private val sharedPreferences: SharedPreferences,
    private val loginViewModel: UserViewModel,
    private val lifecycleOwner: LifecycleOwner
) {

    fun refreshToken(onSuccess: (String) -> Unit, onFailure: () -> Unit) {
        val storedToken = sharedPreferences.getString("jwtToken", "")
        Log.d("TokenController", "Stored token: $storedToken")

        if (!storedToken.isNullOrEmpty()) {
            loginViewModel.refreshToken(storedToken)
            Log.d("TokenController", "Called refreshToken in ViewModel")

            loginViewModel.loginResponse.observe(lifecycleOwner, Observer { response ->
                response?.let {
                    val newToken = it.token
                    Log.d("TokenController", "New token received: $newToken")
                    if (newToken != null) {
                        sharedPreferences.edit().putString("jwtToken", newToken).apply()
                        onSuccess(newToken)
                    } else {
                        Log.d("TokenController", "New token is null")
                        onFailure()
                    }
                } ?: run {
                    Log.d("TokenController", "Login response is null")
                    onFailure()
                }
            })

            loginViewModel.error.observe(lifecycleOwner, Observer { errorMessage ->
                errorMessage?.let {
                    Log.d("TokenController", "Error refreshing token: $it")
                    onFailure()
                }
            })
        } else {
            Log.d("TokenController", "Stored token is null or empty")
            onFailure()
        }
    }

}