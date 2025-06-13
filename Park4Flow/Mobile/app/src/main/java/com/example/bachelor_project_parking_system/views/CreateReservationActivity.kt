package com.example.bachelor_project_parking_system.views

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.*
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import com.example.bachelor_project_parking_system.R
import com.example.bachelor_project_parking_system.models.Reservation.CreateReservationRequest
import com.example.bachelor_project_parking_system.network.ApiService.ApiServiceInstance
import com.example.bachelor_project_parking_system.network.Repositories.ReservationRepository
import com.example.bachelor_project_parking_system.network.ViewModels.Reservation.ReservationViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.Reservation.ReservationViewModelFactory
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.datepicker.*
import com.google.android.material.timepicker.*
import java.time.*
import java.time.format.DateTimeFormatter

class CreateReservationActivity : AppCompatActivity() {

    private lateinit var startTimeInput: EditText
    private lateinit var endTimeInput: EditText
    private lateinit var createButton: Button

    private var startDateTime: ZonedDateTime? = null
    private var endDateTime: ZonedDateTime? = null

    private val viewModel: ReservationViewModel by viewModels {
        ReservationViewModelFactory(ReservationRepository(ApiServiceInstance.apiService))
    }

    private var parkingID: Int = -1
    private var vehicleID: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_reservation)

        // Init UI
        startTimeInput = findViewById(R.id.startTimeInput)
        endTimeInput = findViewById(R.id.endTimeInput)
        createButton = findViewById(R.id.createReservationButton)

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

        // Get ParkingID from Intent
        parkingID = intent.getIntExtra("ParkingID", -1)
        if (parkingID == -1) {
            Toast.makeText(this, "Parking ID not provided", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        // Get VehicleID from SharedPreferences
        val sharedPrefs = getSharedPreferences("jwt_prefs", Context.MODE_PRIVATE)
        vehicleID = sharedPrefs.getInt("selectedVehicleID", -1)
        if (vehicleID == -1) {
            Toast.makeText(this, "No vehicle selected", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        // Date/time pickers
        startTimeInput.setOnClickListener { pickDateTime { startDateTime = it; startTimeInput.setText(formatDate(it)) } }
        endTimeInput.setOnClickListener { pickDateTime { endDateTime = it; endTimeInput.setText(formatDate(it)) } }

        // Create reservation
        createButton.setOnClickListener {
            if (startDateTime == null || endDateTime == null) {
                Toast.makeText(this, "Please select both times", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (startDateTime!!.isAfter(endDateTime)) {
                Toast.makeText(this, "Start time must be before end time", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val request = CreateReservationRequest(
                ParkingID = parkingID,
                VehicleID = vehicleID,
                StartTime = startDateTime!!.withZoneSameInstant(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                EndTime = endDateTime!!.withZoneSameInstant(ZoneOffset.UTC).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
            )

            val token = getSharedPreferences("jwt_prefs", MODE_PRIVATE).getString("jwtToken", "") ?: ""
            if (token.isBlank()) {
                Toast.makeText(this, "No token found. Please login again.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            viewModel.createReservation(request, token)
            Handler(Looper.getMainLooper()).postDelayed({
                val message = viewModel.createReservationResponse.value?.message ?: "No response"
                Toast.makeText(this, message, Toast.LENGTH_LONG).show()
            }, 1000) // 1 секунда задержки
        }

        observeViewModel()
    }

    private fun observeViewModel() {
        viewModel.createReservationResponse.observe(this) {
            Toast.makeText(this, it.message, Toast.LENGTH_LONG).show()
            finish()
        }

        viewModel.error.observe(this) {
            Toast.makeText(this, it, Toast.LENGTH_LONG).show()
        }
    }

    private fun pickDateTime(callback: (ZonedDateTime) -> Unit) {
        val today = MaterialDatePicker.todayInUtcMilliseconds()
        val datePicker = MaterialDatePicker.Builder.datePicker()
            .setTitleText("Select date")
            .setSelection(today)
            .build()

        datePicker.show(supportFragmentManager, "DATE_PICKER")
        datePicker.addOnPositiveButtonClickListener { selection ->
            val selectedDate = Instant.ofEpochMilli(selection).atZone(ZoneId.systemDefault())

            val timePicker = MaterialTimePicker.Builder()
                .setTimeFormat(TimeFormat.CLOCK_24H)
                .setHour(LocalTime.now().hour)
                .setMinute(LocalTime.now().minute)
                .setTitleText("Select time")
                .build()

            timePicker.show(supportFragmentManager, "TIME_PICKER")
            timePicker.addOnPositiveButtonClickListener {
                val selectedDateTime = selectedDate.withHour(timePicker.hour).withMinute(timePicker.minute)
                callback(selectedDateTime)
            }
        }
    }

    private fun formatDate(dt: ZonedDateTime): String {
        return dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
    }

    companion object {
        fun start(context: Context, parkingID: Int) {
            val intent = Intent(context, CreateReservationActivity::class.java)
            intent.putExtra("ParkingID", parkingID)
            context.startActivity(intent)
        }
    }
}
