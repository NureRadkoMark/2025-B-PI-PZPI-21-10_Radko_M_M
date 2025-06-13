package com.example.bachelor_project_parking_system.ui

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.res.Configuration
import android.content.res.Resources
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.bumptech.glide.Glide
import com.example.bachelor_project_parking_system.R
import com.example.bachelor_project_parking_system.models.Favorites.FavoriteParkingsRequest
import com.example.bachelor_project_parking_system.models.Parking.ParkingsListResponse
import com.example.bachelor_project_parking_system.network.ApiService.ApiServiceInstance
import com.example.bachelor_project_parking_system.network.Repositories.FavoriteParkingsRepository
import com.example.bachelor_project_parking_system.network.Repositories.ParkingRepository
import com.example.bachelor_project_parking_system.network.ViewModels.FavoriteParkings.FavoriteParkingsViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.FavoriteParkings.FavoriteParkingsViewModelFactory
import com.example.bachelor_project_parking_system.network.ViewModels.Parking.ParkingViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.Parking.ParkingViewModelFactory
import com.example.bachelor_project_parking_system.views.CreateReservationActivity
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptor
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MapStyleOptions
import com.google.android.gms.maps.model.MarkerOptions
import com.google.maps.android.clustering.ClusterItem
import com.google.maps.android.clustering.ClusterManager
import com.google.maps.android.clustering.view.DefaultClusterRenderer

class HomeFragment : Fragment(), OnMapReadyCallback {

    private lateinit var map: GoogleMap
    private lateinit var mapFragment: SupportMapFragment
    private var clusterManager: ClusterManager<ParkingItem>? = null
    private var targetLatLng: LatLng? = null
    private var isDarkStyle = false
    private var pendingCameraUpdate = false
    private var activeDialog: AlertDialog? = null
    private var parkingItemToShow: ParkingItem? = null
    private var pendingShowDialog = false

    private lateinit var parkingViewModel: ParkingViewModel
    private lateinit var favoritesViewModel: FavoriteParkingsViewModel
    private lateinit var sharedPreferences: SharedPreferences

    private var currentFavoriteParkings = mutableListOf<Int>()
    private var currentSelectedParking: ParkingItem? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_home, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        sharedPreferences = requireContext().getSharedPreferences("jwt_prefs", Context.MODE_PRIVATE)

        // Initialize ViewModels
        val parkingRepository = ParkingRepository(ApiServiceInstance.apiService)
        val parkingViewModelFactory = ParkingViewModelFactory(parkingRepository)
        parkingViewModel = ViewModelProvider(this, parkingViewModelFactory)
            .get(ParkingViewModel::class.java)

        val favoritesRepository = FavoriteParkingsRepository(ApiServiceInstance.apiService)
        val favoritesViewModelFactory = FavoriteParkingsViewModelFactory(favoritesRepository)
        favoritesViewModel = ViewModelProvider(this, favoritesViewModelFactory)
            .get(FavoriteParkingsViewModel::class.java)

        setupObservers()
        loadData()

        // Set up fragment result listener for navigation
        parentFragmentManager.setFragmentResultListener("navigate_to_parking", viewLifecycleOwner) { _, result ->
            handleNavigationResult(result)
        }

        // Initialize map
        val existingMap = childFragmentManager.findFragmentById(R.id.map_container)
        if (existingMap == null) {
            mapFragment = SupportMapFragment.newInstance()
            childFragmentManager.beginTransaction()
                .replace(R.id.map_container, mapFragment)
                .commitNowAllowingStateLoss()
            mapFragment.getMapAsync(this)
        } else {
            (existingMap as SupportMapFragment).getMapAsync(this)
        }
    }

    private fun setupObservers() {
        parkingViewModel.userParkingsResponse.observe(viewLifecycleOwner) { parkings ->
            parkings?.let {
                updateParkingMarkers(it)
                view?.findViewById<ProgressBar>(R.id.progressBar)?.visibility = View.GONE
            }
        }

        parkingViewModel.error.observe(viewLifecycleOwner) { error ->
            error?.let {
                showError(it)
                view?.findViewById<ProgressBar>(R.id.progressBar)?.visibility = View.GONE
            }
        }

        favoritesViewModel.userFavoritesResponse.observe(viewLifecycleOwner) { favorites ->
            favorites?.let {
                currentFavoriteParkings = favorites.map { it.ParkingiD }.toMutableList()
                updateFavoriteMarkers()
            }
        }

        favoritesViewModel.addToFavoritesResponse.observe(viewLifecycleOwner) { response ->
            response?.let {
                Toast.makeText(context, "Added to favorites successfully", Toast.LENGTH_SHORT).show()
                currentSelectedParking?.let { item ->
                    currentFavoriteParkings.add(item.parkingID)
                    updateFavoriteStar(true)
                    updateFavoriteMarkers()
                }
            }
        }

        favoritesViewModel.removeFromFavoritesResponse.observe(viewLifecycleOwner) { response ->
            response?.let {
                Toast.makeText(context, "Removed from favorites successfully", Toast.LENGTH_SHORT).show()
                currentSelectedParking?.let { item ->
                    currentFavoriteParkings.remove(item.parkingID)
                    updateFavoriteStar(false)
                    updateFavoriteMarkers()
                }
            }
        }

        favoritesViewModel.error.observe(viewLifecycleOwner) { error ->
            error?.let {
            }
        }
    }

    private fun loadData() {
        view?.findViewById<ProgressBar>(R.id.progressBar)?.visibility = View.VISIBLE
        view?.findViewById<TextView>(R.id.errorTextView)?.visibility = View.GONE

        val token = sharedPreferences.getString("jwtToken", "") ?: ""
        if (token.isNotEmpty()) {
            parkingViewModel.getUserParkingsList(token)
            favoritesViewModel.getUserFavorites(token)
        } else {
            showError("Authentication required")
        }
    }

    private fun handleNavigationResult(result: Bundle) {
        val latStr = result.getString("lat")
        val lngStr = result.getString("lng")
        Log.d("HomeFragment", "Arguments received: lat=$latStr, lng=$lngStr")

        val lat = latStr?.toDoubleOrNull()
        val lng = lngStr?.toDoubleOrNull()

        if (lat != null && lng != null) {
            targetLatLng = LatLng(lat, lng)
            pendingCameraUpdate = true

            if (this::map.isInitialized) {
                val foundItem = clusterManager?.algorithm
                    ?.items
                    ?.firstOrNull { it.position.latitude == lat && it.position.longitude == lng }

                if (foundItem != null) {
                    parkingItemToShow = foundItem
                    pendingShowDialog = true
                    moveCameraToTarget()
                    tryShowParkingDialog()
                } else {
                    Log.w("HomeFragment", "No matching parking item found for provided coordinates")
                    moveCameraToTarget()
                    parkingItemToShow = null
                    pendingShowDialog = false
                }
            } else {
                val fakeItem = clusterManager?.algorithm
                    ?.items
                    ?.firstOrNull { it.position.latitude == lat && it.position.longitude == lng }
                parkingItemToShow = fakeItem
                pendingShowDialog = fakeItem != null
            }
        } else {
            Log.w("HomeFragment", "Invalid or missing coordinates received")
            targetLatLng = null
            parkingItemToShow = null
            pendingShowDialog = false
        }
    }

    private fun updateParkingMarkers(parkings: List<ParkingsListResponse>) {
        clusterManager?.clearItems()

        parkings.forEach { parking ->
            val lat = parking.Latitude
            val lng = parking.Longitude
            if (lat != 0.0 && lng != 0.0) {
                val item = ParkingItem(
                    latLng = LatLng(lat, lng),
                    name = parking.Name,
                    info = parking.Info,
                    isActive = parking.IsActive,
                    dynamicPricing = parking.DynamicPricing,
                    demandFactor = parking.DemandFactor,
                    parkingID = parking.ParkingID,
                    address = parking.Address,
                    photoUrl = parking.PhotoImage
                )
                clusterManager?.addItem(item)
            }
        }

        clusterManager?.cluster()
    }

    private fun updateFavoriteMarkers() {
        clusterManager?.algorithm?.items?.forEach { item ->
            val isFavorite = currentFavoriteParkings.contains(item.parkingID)
            clusterManager?.updateItem(item.apply { this.isFavorite = isFavorite })
        }
        clusterManager?.cluster()
    }

    private fun showError(message: String) {
        view?.findViewById<TextView>(R.id.errorTextView)?.let {
            it.text = message
            it.visibility = View.VISIBLE
        }
    }

    override fun onResume() {
        super.onResume()
        if (this::map.isInitialized && pendingCameraUpdate) {
            moveCameraToTarget()
            pendingCameraUpdate = false
        }
    }

    private fun moveCameraToTarget() {
        targetLatLng?.let {
            Log.d("HomeFragment", "Moving camera to ${it.latitude}, ${it.longitude}")
            map.moveCamera(CameraUpdateFactory.newLatLngZoom(it, 17f))
        } ?: run {
            Log.d("HomeFragment", "Moving camera to default location")
            map.moveCamera(CameraUpdateFactory.newLatLngZoom(LatLng(50.450981, 30.508513), 14f))
        }
    }

    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap
        detectInitialTheme()
        applyMapStyle()
        setupCluster()
        map.clear()

        moveCameraToTarget()
        tryShowParkingDialog()
    }

    private fun tryShowParkingDialog() {
        if (pendingShowDialog && parkingItemToShow != null && this::map.isInitialized) {
            showParkingInfoWindow(parkingItemToShow!!)
            pendingShowDialog = false
        }
    }

    private fun detectInitialTheme() {
        val nightModeFlags = resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK
        isDarkStyle = nightModeFlags == Configuration.UI_MODE_NIGHT_YES
    }

    private fun applyMapStyle() {
        try {
            if (isDarkStyle) {
                map.setMapStyle(MapStyleOptions.loadRawResourceStyle(requireContext(), R.raw.map_style_dark))
            } else {
                map.setMapStyle(null)
            }
        } catch (e: Resources.NotFoundException) {
            e.printStackTrace()
        }
    }

    private fun createCustomMarker(): Bitmap {
        val baseIcon = BitmapFactory.decodeResource(resources, R.drawable.parking_icon)
        return Bitmap.createScaledBitmap(baseIcon, 140, 140, false)
    }

    private fun setupCluster() {
        clusterManager = ClusterManager(requireContext(), map)
        clusterManager?.renderer = object : DefaultClusterRenderer<ParkingItem>(requireContext(), map, clusterManager) {
            override fun onBeforeClusterItemRendered(item: ParkingItem, markerOptions: MarkerOptions) {
                markerOptions.icon(BitmapDescriptorFactory.fromBitmap(createCustomMarker()))
                    .title(item.name)
                    .snippet(item.info)
            }
        }

        map.setOnCameraIdleListener { clusterManager?.cluster() }
        map.setOnMarkerClickListener(clusterManager)

        clusterManager?.setOnClusterItemClickListener { item ->
            showParkingInfoWindow(item)
            true
        }
    }

    private fun showParkingInfoWindow(item: ParkingItem) {
        if (activeDialog?.isShowing == true) return

        currentSelectedParking = item
        val isFavorite = currentFavoriteParkings.contains(item.parkingID)

        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_parking_info, null)

        // Set parking info
        dialogView.findViewById<TextView>(R.id.parkingTitle).text = item.name
        dialogView.findViewById<TextView>(R.id.parkingAddress).text = item.address
        dialogView.findViewById<TextView>(R.id.parkingStatus).text = "Status: ${if (item.isActive) "Active" else "Inactive"}"
        dialogView.findViewById<TextView>(R.id.dynamicPricing).text = "Dynamic pricing: ${if (item.dynamicPricing) "Yes" else "No"}"
        dialogView.findViewById<TextView>(R.id.demandFactor).text = "Demand factor: ${item.demandFactor}"

        // Load image
        Glide.with(this)
           .load(item.photoUrl)
           .placeholder(R.drawable.placeholder)
           .error(R.drawable.placeholder)
           .into(dialogView.findViewById(R.id.parkingImage))

        // Favorite star
        val star = dialogView.findViewById<ImageView>(R.id.favoriteStar)
        updateFavoriteStar(isFavorite, star)

        star.setOnClickListener {
            val token = sharedPreferences.getString("jwtToken", "") ?: ""
            if (token.isEmpty()) {
                Toast.makeText(context, "Please login to manage favorites", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val request = FavoriteParkingsRequest(item.parkingID)
            if (isFavorite) {
                favoritesViewModel.removeFromFavorites(token, request)
            } else {
                favoritesViewModel.addToFavorites(token, request)
            }
        }

        // Buttons
        dialogView.findViewById<Button>(R.id.navigateButton).setOnClickListener {
            val uri = Uri.parse("google.navigation:q=${item.position.latitude},${item.position.longitude}")
            val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                setPackage("com.google.android.apps.maps")
            }
            startActivity(intent)
        }

        dialogView.findViewById<Button>(R.id.parkButton).setOnClickListener {
            sharedPreferences.edit().putInt("selectedParkingID", item.parkingID).apply()
            Toast.makeText(context, "Attempting to park at ${item.name}", Toast.LENGTH_SHORT).show()
            // Start ParkActivity or other logic
        }

        dialogView.findViewById<Button>(R.id.reservationButton).setOnClickListener {
            sharedPreferences.edit().putInt("selectedParkingID", item.parkingID).apply()
            CreateReservationActivity.start(requireContext(), item.parkingID)
        }

        activeDialog = AlertDialog.Builder(requireContext())
            .setView(dialogView)
            .create()

        activeDialog?.setCanceledOnTouchOutside(true)
        activeDialog?.window?.setBackgroundDrawableResource(android.R.color.transparent)
        activeDialog?.show()
    }

    private fun updateFavoriteStar(isFavorite: Boolean, star: ImageView? = null) {
        val imageView = star ?: activeDialog?.findViewById<ImageView>(R.id.favoriteStar)
        imageView?.setImageResource(
            if (isFavorite) R.drawable.ic_star_filled else R.drawable.ic_star_outline
        )
        imageView?.setColorFilter(
            ContextCompat.getColor(requireContext(), R.color.colorAccent),
            android.graphics.PorterDuff.Mode.SRC_IN
        )
    }

    data class ParkingItem(
        val latLng: LatLng,
        val name: String,
        val info: String,
        val isActive: Boolean,
        val dynamicPricing: Boolean,
        val demandFactor: Double,
        val parkingID: Int,
        val address: String,
        val photoUrl: String,
        var isFavorite: Boolean = false
    ) : ClusterItem {
        override fun getPosition(): LatLng = latLng
        override fun getTitle(): String = name
        override fun getSnippet(): String = info
    }

    companion object {
        fun newInstance(lat: Double?, lng: Double?): HomeFragment {
            val fragment = HomeFragment()
            val args = Bundle().apply {
                if (lat != null && lng != null) {
                    putDouble("lat", lat)
                    putDouble("lng", lng)
                }
            }
            fragment.arguments = args
            return fragment
        }
    }
}


