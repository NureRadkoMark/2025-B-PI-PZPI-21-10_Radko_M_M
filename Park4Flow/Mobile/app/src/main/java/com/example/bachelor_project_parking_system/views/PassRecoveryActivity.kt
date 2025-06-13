package com.example.bachelor_project_parking_system.views

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.example.bachelor_project_parking_system.databinding.ActivityPassRecoveryBinding
import com.example.bachelor_project_parking_system.models.PassRecovery.PassRecoveryRequest
import com.example.bachelor_project_parking_system.models.PassRecovery.ResetPasswordRequest
import com.example.bachelor_project_parking_system.network.ApiService.ApiServiceInstance
import com.example.bachelor_project_parking_system.network.Repositories.UserRepository
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModelFactory
import com.google.android.material.snackbar.Snackbar

class PassRecoveryActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPassRecoveryBinding

    private val userViewModel: UserViewModel by viewModels {
        UserViewModelFactory(UserRepository(ApiServiceInstance.apiService))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPassRecoveryBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupListeners()
        observeViewModel()
        setupCodeInputFocus()
    }

    private fun setupListeners() {
        binding.sendCodeButton.setOnClickListener {
            val email = binding.emailInput.text.toString().trim()
            if (email.isNotEmpty()) {
                userViewModel.passRecovery(PassRecoveryRequest(email))
                userViewModel.passRecoveryResponse.observe(this){
                    Toast.makeText(this, "Code sent to email", Toast.LENGTH_SHORT).show()
                }

            } else {
                showSnackbar("Please enter your email")
            }
        }

        binding.resetPasswordButton.setOnClickListener {
            val email = binding.emailInput.text.toString().trim()
            val newPassword = binding.newPasswordInput.text.toString().trim()
            val code = getEnteredCode()
            if (code.length == 6 && newPassword.isNotEmpty()) {
                userViewModel.passReset(
                    ResetPasswordRequest(
                        Email = email,
                        SecurityCode = code,
                        NewPassword = newPassword
                    )
                )
                userViewModel.passResetResponse.observe(this){
                    Toast.makeText(this, "Password changed successfully", Toast.LENGTH_SHORT).show()
                }
                startActivity(Intent(this, LoginActivity::class.java))
                finish()
            } else {
                showSnackbar("Please fill all fields correctly")
            }
        }
    }

    private fun observeViewModel() {
        userViewModel.passRecoveryResponse.observe(this) { response ->
            showSnackbar(response.Response)
            binding.emailStepLayout.visibility = View.GONE
            binding.codeStepLayout.visibility = View.VISIBLE
        }

        userViewModel.passResetResponse.observe(this) { response ->
            showSnackbar(response.Response)
            finish()
        }

        userViewModel.error.observe(this) { errorMsg ->
            showSnackbar(errorMsg)
        }
    }

    private fun getEnteredCode(): String {
        return listOf(
            binding.codeDigit1,
            binding.codeDigit2,
            binding.codeDigit3,
            binding.codeDigit4,
            binding.codeDigit5,
            binding.codeDigit6
        ).joinToString("") { it.text.toString().trim() }
    }

    private fun showSnackbar(message: String) {
        Snackbar.make(binding.root, message, Snackbar.LENGTH_LONG).show()
    }

    private fun setupCodeInputFocus() {
        val digits = listOf(
            binding.codeDigit1,
            binding.codeDigit2,
            binding.codeDigit3,
            binding.codeDigit4,
            binding.codeDigit5,
            binding.codeDigit6
        )

        for (i in digits.indices) {
            digits[i].addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    if (s?.length == 1 && i < digits.lastIndex) {
                        digits[i + 1].requestFocus()
                    }
                }
                override fun afterTextChanged(s: Editable?) {}
            })
        }
    }
}