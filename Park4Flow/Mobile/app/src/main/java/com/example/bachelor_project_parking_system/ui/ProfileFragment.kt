package com.example.bachelor_project_parking_system.ui

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.bachelor_project_parking_system.R
import com.example.bachelor_project_parking_system.adapters.VehicleAdapter
import com.example.bachelor_project_parking_system.databinding.FragmentProfileBinding
import com.example.bachelor_project_parking_system.models.User.UpdateUserDataRequest
import com.example.bachelor_project_parking_system.models.Vehicle.Vehicle
import com.example.bachelor_project_parking_system.network.ApiService.ApiServiceInstance
import com.example.bachelor_project_parking_system.network.Repositories.UserRepository
import com.example.bachelor_project_parking_system.network.Repositories.VehicleRepository
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.User.UserViewModelFactory
import com.example.bachelor_project_parking_system.network.ViewModels.Vehicle.VehicleViewModel
import com.example.bachelor_project_parking_system.network.ViewModels.Vehicle.VehicleViewModelFactory
import com.example.bachelor_project_parking_system.utils.Constants
import com.example.bachelor_project_parking_system.views.AddVehicleActivity
import com.example.bachelor_project_parking_system.views.LoginActivity
import com.example.bachelor_project_parking_system.views.PaymentActivity

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!
    private val userViewModel: UserViewModel by viewModels {
        UserViewModelFactory(UserRepository(ApiServiceInstance.apiService))
    }
    private val vehicleViewModel: VehicleViewModel by viewModels {
        VehicleViewModelFactory(VehicleRepository(ApiServiceInstance.apiService))
    }

    private lateinit var sharedPrefs: SharedPreferences
    private lateinit var vehicleAdapter: VehicleAdapter
    private lateinit var token: String

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        sharedPrefs = requireContext().getSharedPreferences("jwt_prefs", Context.MODE_PRIVATE)
        token = sharedPrefs.getString("jwtToken", null) ?: ""

        // ---------- Загрузка данных пользователя ----------
        userViewModel.getUserDetails(token)
        userViewModel.userDetailsResponse.observe(viewLifecycleOwner) { user ->
            binding.userEmail.text = user.Email
            binding.userFirstName.setText(user.FirstName)
            binding.userSecondName.setText(user.SecondName)
            binding.userPhone.setText(user.PhoneNumber)
            binding.userBalance.text = "Balance: ${user.Balance} ${user.Currency}"
            binding.userBonuses.text = "Bonuses: ${user.Bonuses}"
        }

        userViewModel.updateUserResponse.observe(viewLifecycleOwner) {
            val message = it.Response?.takeIf { it.isNotBlank() } ?: "No message from server"
            Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
        }

        userViewModel.error.observe(viewLifecycleOwner) {
            Toast.makeText(requireContext(), "Error: $it", Toast.LENGTH_LONG).show()
        }

        // ---------- Обновление данных пользователя ----------
        binding.saveButton.setOnClickListener {
            val updateRequest = UpdateUserDataRequest(
                FirstName = binding.userFirstName.text.toString(),
                SecondName = binding.userSecondName.text.toString(),
                PhoneNumber = binding.userPhone.text.toString()
            )
            userViewModel.updateUserDetails(token, updateRequest)
        }

        // ---------- Кнопки ----------
        binding.addFundsButton.setOnClickListener {
            binding.addFundsButton.setOnClickListener {
                val intent = Intent(context, PaymentActivity::class.java).apply {
                    putExtra(Constants.TRANSACTION_TYPE, Constants.TRANSACTION_TYPE_DEPOSIT)
                }
                startActivity(intent)
            }
        }

        binding.addVehicleButton.setOnClickListener {
            val intent = Intent(requireContext(), AddVehicleActivity::class.java)
            startActivity(intent)
        }

        // ---------- Список транспортных средств ----------
        val recyclerView = binding.vehiclesRecyclerView
        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        vehicleAdapter = VehicleAdapter(mutableListOf(), requireContext(),
            onDeleteClick = { vehicleID ->
                vehicleViewModel.deleteVehicle(token, vehicleID)
            },
            onVehicleSelected = { vehicleID ->
                sharedPrefs.edit().putInt("selectedVehicleID", vehicleID).apply()
            }
        )
        recyclerView.adapter = vehicleAdapter

        vehicleViewModel.userVehiclesResponse.observe(viewLifecycleOwner) { vehicles ->
            vehicleAdapter.updateVehicles(vehicles.toMutableList(), autoSelectSingle = true)
        }

        vehicleViewModel.deleteVehicleResponse.observe(viewLifecycleOwner) {
            Toast.makeText(requireContext(), "Vehicle deleted", Toast.LENGTH_SHORT).show()
            vehicleViewModel.getUserVehicles(token)
        }

        vehicleViewModel.error.observe(viewLifecycleOwner) { errorMessage ->
            Toast.makeText(requireContext(), errorMessage, Toast.LENGTH_SHORT).show()
        }

        vehicleViewModel.getUserVehicles(token)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}


