package com.example.bachelor_project_parking_system.views

import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Paint
import android.os.Bundle
import android.text.InputType
import android.view.MotionEvent
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import com.example.bachelor_project_parking_system.R
import com.example.bachelor_project_parking_system.models.Register.RegisterRequest
import com.example.bachelor_project_parking_system.network.ApiService.ApiServiceInstance
import com.example.bachelor_project_parking_system.network.Repositories.UserRepository
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModelFactory

class RegisterActivity : AppCompatActivity() {

    private lateinit var sharedPrefs: SharedPreferences

    private val userViewModel: UserViewModel by viewModels {
        UserViewModelFactory(UserRepository(ApiServiceInstance.apiService))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        sharedPrefs = getSharedPreferences("jwt_prefs", MODE_PRIVATE)

        val firstName = findViewById<EditText>(R.id.firstNameInput)
        val secondName = findViewById<EditText>(R.id.secondNameInput)
        val email = findViewById<EditText>(R.id.emailInput)
        val phone = findViewById<EditText>(R.id.phoneInput)
        val password = findViewById<EditText>(R.id.passwordInput)

        val languageSpinner = findViewById<Spinner>(R.id.languageSpinner)
        val currencySpinner = findViewById<Spinner>(R.id.currencySpinner)

        val registerButton = findViewById<Button>(R.id.registerButton)
        val loginLink = findViewById<TextView>(R.id.loginLink)

        loginLink.paintFlags = loginLink.paintFlags or Paint.UNDERLINE_TEXT_FLAG

        ArrayAdapter.createFromResource(
            this,
            R.array.languages_array,
            android.R.layout.simple_spinner_item
        ).also { adapter ->
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            languageSpinner.adapter = adapter
        }

        ArrayAdapter.createFromResource(
            this,
            R.array.currencies_array,
            android.R.layout.simple_spinner_item
        ).also { adapter ->
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            currencySpinner.adapter = adapter
        }

        registerButton.setOnClickListener {
            val registerRequest = RegisterRequest(
                Email = email.text.toString().trim(),
                Password = password.text.toString().trim(),
                FirstName = firstName.text.toString().trim(),
                SecondName = secondName.text.toString().trim(),
                PhoneNumber = phone.text.toString().trim(),
                Currency = currencySpinner.selectedItem.toString(),
                Lang = languageSpinner.selectedItem.toString()
            )

            userViewModel.register(registerRequest)
        }

        userViewModel.registerResponse.observe(this) { response ->
            Toast.makeText(this, response?.Response ?: "Registered!", Toast.LENGTH_LONG).show()
            sharedPrefs.edit().putString("lang", languageSpinner.selectedItem.toString()).apply()
            startActivity(Intent(this, LoginActivity::class.java))
            finish() // вернуться на LoginActivity
        }

        userViewModel.error.observe(this) { errorMsg ->
            Toast.makeText(this, "Registration failed: $errorMsg", Toast.LENGTH_LONG).show()
        }

        loginLink.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        setupPasswordToggle(password)
    }

    private fun setupPasswordToggle(passwordEditText: EditText) {
        passwordEditText.setOnTouchListener { _, event ->
            if (event.action == MotionEvent.ACTION_UP) {
                val drawableEnd = 2
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
}
