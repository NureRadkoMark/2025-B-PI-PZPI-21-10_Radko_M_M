package com.example.bachelor_project_parking_system.views

import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Paint
import android.os.Bundle
import android.text.InputType
import android.view.MotionEvent
import android.widget.*
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.lifecycle.Observer
import com.example.bachelor_project_parking_system.MainActivity
import com.example.bachelor_project_parking_system.views.MapActivity
import com.example.bachelor_project_parking_system.R
import com.example.bachelor_project_parking_system.models.Login.LoginRequest
import com.example.bachelor_project_parking_system.network.ApiService.ApiServiceInstance
import com.example.bachelor_project_parking_system.network.Repositories.UserRepository
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModelFactory
import com.example.bachelor_project_parking_system.controllers.JwtTokenController

class LoginActivity : AppCompatActivity() {

    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var loginButton: Button
    private lateinit var rememberCheckBox: CheckBox
    private lateinit var sharedPrefs: SharedPreferences

    private val userViewModel: UserViewModel by viewModels {
        UserViewModelFactory(UserRepository(ApiServiceInstance.apiService))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        sharedPrefs = getSharedPreferences("jwt_prefs", MODE_PRIVATE)

        emailEditText = findViewById(R.id.usernameInput)
        passwordEditText = findViewById(R.id.passwordInput)
        loginButton = findViewById(R.id.loginButton)
        rememberCheckBox = findViewById(R.id.rememberMeCheckbox)

        val forgotPassword = findViewById<TextView>(R.id.forgotPasswordText)
        val signUp = findViewById<TextView>(R.id.forgotPasswordLink)

        forgotPassword.paintFlags = forgotPassword.paintFlags or Paint.UNDERLINE_TEXT_FLAG
        signUp.paintFlags = signUp.paintFlags or Paint.UNDERLINE_TEXT_FLAG

        forgotPassword.setOnClickListener {
            startActivity(Intent(this, PassRecoveryActivity::class.java))
            finish()
        }

        signUp.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
            finish()
        }

        setupPasswordToggle()

        loginButton.setOnClickListener {
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter email and password", Toast.LENGTH_SHORT).show()
            } else {
                val request = LoginRequest(Email = email, Password = password)
                userViewModel.login(request)
            }
        }

        observeViewModel()
    }

    private fun setupPasswordToggle() {
        passwordEditText.setOnTouchListener { _, event ->
            val drawableEnd = 2
            if (event.action == MotionEvent.ACTION_UP) {
                if (event.rawX >= (passwordEditText.right - passwordEditText.compoundDrawables[drawableEnd].bounds.width())) {
                    val isVisible = passwordEditText.inputType !=
                            (InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD)

                    passwordEditText.inputType = if (isVisible) {
                        InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD
                    } else {
                        InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
                    }

                    passwordEditText.setSelection(passwordEditText.text.length)
                    return@setOnTouchListener true
                }
            }
            false
        }
    }

    private fun observeViewModel() {
        userViewModel.loginResponse.observe(this, Observer { response ->
            response?.token?.let { token ->
                // Сохраняем токен и состояние rememberMe
                sharedPrefs.edit()
                    .putString("jwtToken", token)
                    .putBoolean("rememberMe", rememberCheckBox.isChecked)
                    .apply()

                Toast.makeText(this, "Login success!", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            }
        })

        userViewModel.error.observe(this, Observer { errorMessage ->
            Toast.makeText(this, "Login failed: $errorMessage", Toast.LENGTH_LONG).show()
        })
    }
}


