package com.example.bachelor_project_parking_system.views

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.example.bachelor_project_parking_system.R
import com.example.bachelor_project_parking_system.databinding.ActivityAddVehicleBinding
import com.example.bachelor_project_parking_system.network.ApiService.ApiServiceInstance
import com.example.bachelor_project_parking_system.network.Repositories.VehicleRepository
import com.example.bachelor_project_parking_system.network.ViewModels.Vehicle.VehicleViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.Vehicle.VehicleViewModelFactory
import com.google.android.material.appbar.MaterialToolbar
import okhttp3.MultipartBody
import java.io.File
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody

class AddVehicleActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddVehicleBinding
    private var imageUri: Uri? = null

    private val vehicleViewModel: VehicleViewModel by viewModels {
        VehicleViewModelFactory(VehicleRepository(ApiServiceInstance.apiService))
    }

    private val selectImageLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            imageUri = result.data!!.data
            imageUri?.let {
                val inputStream = contentResolver.openInputStream(it)
                BitmapFactory.decodeStream(inputStream)?.let {
                    binding.uploadImageButton.text = "Image Selected ✅"
                }
            }
        }
    }

    private val requestPermissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        if (isGranted) {
            openGallery()
        } else {
            Toast.makeText(this, "Permission denied. Cannot open gallery.", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddVehicleBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val toolbar: MaterialToolbar = findViewById(R.id.customToolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "" // или нужный заголовок, если он есть

        // Кнопка "назад"
        toolbar.setNavigationOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }

        // Обработка иконки уведомлений
        val notificationsIcon: ImageView = findViewById(R.id.notificationsIcon)
        notificationsIcon.setOnClickListener {
            // Реализация показа уведомлений
            //showNotificationsDialog() // или открой NotificationActivity/BottomSheet
        }

        binding.uploadImageButton.setOnClickListener {
            checkAndRequestPermission()
        }

        binding.addVehicleButton.setOnClickListener {
            val category = binding.vehicleCategoryInput.text.toString().trim()
            val stateNumber = binding.stateNumberInput.text.toString().trim()
            val brand = binding.vehicleBrandInput.text.toString().trim()
            val model = binding.vehicleModelInput.text.toString().trim()

            if (category.isEmpty() || stateNumber.isEmpty() || brand.isEmpty() || model.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val categoryPart = category.toRequestBody("text/plain".toMediaTypeOrNull())
            val stateNumberPart = stateNumber.toRequestBody("text/plain".toMediaTypeOrNull())
            val brandPart = brand.toRequestBody("text/plain".toMediaTypeOrNull())
            val modelPart = model.toRequestBody("text/plain".toMediaTypeOrNull())

            val imagePart: MultipartBody.Part? = imageUri?.let { uri ->
                val file = File(getRealPathFromURI(uri))
                val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                MultipartBody.Part.createFormData("frontPhotoImage", file.name, requestFile)
            }

            val token = getSharedPreferences("jwt_prefs", MODE_PRIVATE).getString("jwtToken", "") ?: ""
            if (token.isBlank()) {
                Toast.makeText(this, "No token found. Please login again.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            vehicleViewModel.createVehicle(token, categoryPart, stateNumberPart, brandPart, modelPart, imagePart!!)
            vehicleViewModel.createVehicleResponse.observe(this) {
                Toast.makeText(this, "Vehicle added successfully", Toast.LENGTH_SHORT).show()
                finish()
            }
            vehicleViewModel.error.observe(this) {
                Toast.makeText(this, it, Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun openGallery() {
        val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
        selectImageLauncher.launch(intent)
    }

    private fun checkAndRequestPermission() {
        when {
            ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED -> {
                openGallery()
            }
            else -> {
                requestPermissionLauncher.launch(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
        }
    }

    private fun getRealPathFromURI(uri: Uri): String {
        val projection = arrayOf(MediaStore.Images.Media.DATA)
        contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
            val columnIndex = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA)
            cursor.moveToFirst()
            return cursor.getString(columnIndex)
        }
        throw IllegalArgumentException("Unable to get file path from URI")
    }
}
