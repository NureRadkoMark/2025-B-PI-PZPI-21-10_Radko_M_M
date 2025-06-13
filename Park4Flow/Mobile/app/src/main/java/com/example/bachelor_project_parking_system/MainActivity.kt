package com.example.bachelor_project_parking_system

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import com.google.android.material.bottomnavigation.BottomNavigationView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.example.bachelor_project_parking_system.controllers.JwtTokenController
import com.example.bachelor_project_parking_system.databinding.ActivityMainBinding
import com.example.bachelor_project_parking_system.databinding.DialogParkingEndedBinding
import com.example.bachelor_project_parking_system.databinding.DialogParkingStartedBinding
import com.example.bachelor_project_parking_system.network.ApiService.ApiServiceInstance
import com.example.bachelor_project_parking_system.network.ApiService.ParkingWebSocketManager
import com.example.bachelor_project_parking_system.network.Repositories.UserRepository
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModelFactory
import com.example.bachelor_project_parking_system.views.LoginActivity
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.clustering.ClusterItem
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var tokenController: JwtTokenController
    private val loginViewModel: UserViewModel by viewModels {
        UserViewModelFactory(UserRepository(ApiServiceInstance.apiService))
    }
    private lateinit var webSocketManager: ParkingWebSocketManager
    private var currentParkingDialog: AlertDialog? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        //------------
        val toolbar: Toolbar = findViewById(R.id.customToolbar)
        setSupportActionBar(toolbar)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val notificationsIcon: ImageView = findViewById(R.id.notificationsIcon)
        notificationsIcon.setOnClickListener {
            showNotificationsDialog()
        }
        //------------

        //  bottom nav
        val navView: BottomNavigationView = binding.navView
        val navController = findNavController(R.id.nav_host_fragment_activity_main)
        val appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.homeFragment,
                R.id.navigation_favorites,
                //R.id.navigation_profile,
                //R.id.navigation_notifications
            )
        )
        setupActionBarWithNavController(navController, appBarConfiguration)
        navView.setupWithNavController(navController)
        
        sharedPreferences = getSharedPreferences("jwt_prefs", MODE_PRIVATE)
        tokenController = JwtTokenController(sharedPreferences, loginViewModel, this)

        refreshToken()

        // Initialize WebSocket after user is authenticated
        val userId = 3
        setupWebSocket(userId.toString())

    }

    private fun setupWebSocket(userId: String) {
        webSocketManager = ParkingWebSocketManager(this, userId, sharedPreferences)

        webSocketManager.connect(object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                runOnUiThread {
                    try {
                        val json = JSONObject(text)
                        when (json.getString("type")) {
                            "parking_started" -> showParkingStartedDialog(json)
                            "parking_ended" -> showParkingEndedDialog(json)
                        }
                    } catch (e: Exception) {
                        Log.e("WebSocket", "Error processing message", e)
                    }
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("WebSocket", "Connection failed", t)
                // Implement reconnection logic here if needed
            }
        })
    }

    private fun showParkingStartedDialog(data: JSONObject) {
        // Dismiss any existing parking dialog
        currentParkingDialog?.dismiss()

        val binding = DialogParkingStartedBinding.inflate(layoutInflater)

        binding.apply {
            parkingPlaceText.text = "Parking Place #${data.getString("parkPlaceId")}"
            vehicleText.text = "${data.getJSONObject("vehicle").getString("category")} - " +
                    "${data.getJSONObject("vehicle").getString("licensePlate")}"

            if (data.has("endTime") && !data.isNull("endTime")) {
                val endTime = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                    .parse(data.getString("endTime"))
                val formattedTime = SimpleDateFormat("HH:mm, MMM dd", Locale.getDefault())
                    .format(endTime)
                reservationTimeText.text = "Reserved until $formattedTime"
                reservationTimeText.visibility = View.VISIBLE
            } else {
                reservationTimeText.visibility = View.GONE
            }

            stopButton.setOnClickListener {
                // Implement stop parking logic
                currentParkingDialog?.dismiss()
            }
        }

        currentParkingDialog = AlertDialog.Builder(this)
            .setView(binding.root)
            .setCancelable(false)
            .create()

        currentParkingDialog?.show()
    }

    private fun showParkingEndedDialog(data: JSONObject) {
        // Dismiss any existing parking dialog
        currentParkingDialog?.dismiss()

        val binding = DialogParkingEndedBinding.inflate(layoutInflater)

        binding.apply {
            parkingPlaceText.text = "Parking Place #${data.getString("parkPlaceId")}"
            durationText.text = data.getString("duration")
            totalFeeText.text = "${data.getString("totalFee")} ${data.getString("currency")}"

            if (data.getBoolean("overstay")) {
                overstayText.text = "Included overstay fee"
                overstayText.visibility = View.VISIBLE
            } else {
                overstayText.visibility = View.GONE
            }

            closeButton.setOnClickListener {
                currentParkingDialog?.dismiss()
            }
        }

        currentParkingDialog = AlertDialog.Builder(this)
            .setView(binding.root)
            .setCancelable(true)
            .create()

        currentParkingDialog?.show()
    }

    private fun showNotificationsDialog() {
        val notifications = listOf(
            "Parking lot A is full",
            "New parking rules in downtown",
            "Bonus added: +20 points",
            "Subscription expiring soon"
        )

        val builder = AlertDialog.Builder(this)
        builder.setTitle("Notifications")
        builder.setItems(notifications.toTypedArray(), null)
        builder.setPositiveButton("OK", null)
        builder.show()
    }

    private fun refreshToken() {
        val rememberMe = sharedPreferences.getBoolean("rememberMe", false)
        val token = sharedPreferences.getString("jwtToken", null)

        if (token.isNullOrEmpty()) {
            Log.d("MainActivity", "Token is null or empty")
            navigateToLoginActivity()
            return
        }

        tokenController.refreshToken(
            onSuccess = { newToken ->
                if (rememberMe) {
                    sharedPreferences.edit().putString("jwtToken", newToken).apply()
                    Log.d("MainActivity", "Token refreshed and saved")
                    showMessage("Token refreshed")
                } else {
                    Log.d("MainActivity", "Token is valid, not saved (RememberMe off)")
                    showMessage("Token is valid")
                }
            },
            onFailure = {
                Log.d("MainActivity", "Token is invalid, navigating to login")
                navigateToLoginActivity()
            }
        )
    }


    private fun logout() {
        sharedPreferences.edit().clear().apply()
        navigateToLoginActivity()
    }

    private fun navigateToLoginActivity() {
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
        finish()
    }

    private fun showMessage(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    class MyItem(private val pos: LatLng) : ClusterItem {
        override fun getPosition(): LatLng = pos
        override fun getTitle(): String = ""
        override fun getSnippet(): String = ""
    }
}
