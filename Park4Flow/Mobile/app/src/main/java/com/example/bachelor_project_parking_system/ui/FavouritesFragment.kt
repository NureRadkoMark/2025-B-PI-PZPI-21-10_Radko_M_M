package com.example.bachelor_project_parking_system.ui

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.setFragmentResult
import androidx.fragment.app.viewModels
import androidx.navigation.Navigation.findNavController
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.bachelor_project_parking_system.R
import com.example.bachelor_project_parking_system.adapters.FavoriteParkingAdapter
import com.example.bachelor_project_parking_system.models.Favorites.UserFavoriteParkingsResponse
import com.example.bachelor_project_parking_system.network.ApiService.ApiServiceInstance
import com.example.bachelor_project_parking_system.network.Repositories.FavoriteParkingsRepository
import com.example.bachelor_project_parking_system.network.ViewModels.FavoriteParkings.FavoriteParkingsViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.FavoriteParkings.FavoriteParkingsViewModelFactory

class FavouritesFragment : Fragment(R.layout.fragment_favourites) {

    private val viewModel: FavoriteParkingsViewModel by viewModels {
        FavoriteParkingsViewModelFactory(FavoriteParkingsRepository(ApiServiceInstance.apiService))
    }

    private lateinit var adapter: FavoriteParkingAdapter
    private lateinit var recyclerView: RecyclerView
    private val testData = listOf(
        UserFavoriteParkingsResponse(1, "Address 1", "Central Park", "Near center", true, "39.697196", "47.249912"),
        UserFavoriteParkingsResponse(2, "Address 2", "Mall Parking", "Covered parking", false, "39.697196", "47.240912")
    )

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        recyclerView = view.findViewById(R.id.favoritesRecyclerView)
        adapter = FavoriteParkingAdapter(testData.toMutableList(),
            onDelete = { item -> handleDelete(item) },
            onClick = { item -> navigateToMap(item) }
        )

        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = adapter

        // TODO: Заменить на реальные данные
        // val token = getSharedPreferences("jwt_prefs", MODE_PRIVATE).getString("jwtToken", "") ?: ""
        // viewModel.getUserFavorites(token)

        observeViewModel()
    }

    private fun handleDelete(item: UserFavoriteParkingsResponse) {
        adapter.removeItem(item)

        // TODO: Вызов API на удаление
        // val token = ...
        // viewModel.removeFromFavorites(token, FavoriteParkingsRequest(item.ParkingiD))
    }

    private fun navigateToMap(item: UserFavoriteParkingsResponse) {
        val lat = item.Latitude.toString()
        val lng = item.Longitude.toString()

        if (lat != null && lng != null) {
            val bundle = Bundle().apply {
                putString("lat", lat)
                putString("lng", lng)
            }
            // Устанавливаем результат для слушателя
            setFragmentResult("navigate_to_parking", bundle)

            // Здесь вы можете выполнить навигацию к фрагменту, если это необходимо
            // Например, если вы хотите перейти к HomeFragment:
            findNavController().navigate(R.id.homeFragment)
        } else {
            Toast.makeText(requireContext(), "Invalid coordinates", Toast.LENGTH_SHORT).show()
        }
    }


    private fun observeViewModel() {
        viewModel.userFavoritesResponse.observe(viewLifecycleOwner) {
            adapter.updateList(it)
        }

        viewModel.error.observe(viewLifecycleOwner) {
            Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
        }
    }
}
