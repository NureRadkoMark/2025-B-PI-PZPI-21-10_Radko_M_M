package com.example.bachelor_project_parking_system.adapters

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.bachelor_project_parking_system.R
import com.example.bachelor_project_parking_system.models.Vehicle.Vehicle
import android.graphics.drawable.Drawable
import android.util.Log
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.Target
import com.example.bachelor_project_parking_system.network.ApiService.GlideHelper

class VehicleAdapter(
    private val vehicles: MutableList<Vehicle>,
    private val context: Context,
    private val onDeleteClick: (vehicleID: Int) -> Unit,
    private val onVehicleSelected: (vehicleID: Int) -> Unit
) : RecyclerView.Adapter<VehicleAdapter.VehicleViewHolder>() {

    private var selectedVehicleID: Int = -1
    private val sharedPrefs = context.getSharedPreferences("jwt_prefs", Context.MODE_PRIVATE)

    inner class VehicleViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val brandModelText: TextView = view.findViewById(R.id.vehicleBrand)
        val categoryText: TextView = view.findViewById(R.id.vehicleModel)
        val stateNumberText: TextView = view.findViewById(R.id.stateNumber)
        val frontPhotoImage: ImageView = view.findViewById(R.id.vehicleImage)
        val editButton: ImageView = view.findViewById(R.id.editButton)
        val deleteButton: ImageView = view.findViewById(R.id.deleteButton)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VehicleViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_vehicle, parent, false)
        return VehicleViewHolder(view)
    }

    override fun onBindViewHolder(holder: VehicleViewHolder, position: Int) {
        val vehicle = vehicles[position]
        holder.brandModelText.text = "${vehicle.VehicleBrand} ${vehicle.VehicleModel}"
        holder.categoryText.text = vehicle.VehicleCategory
        holder.stateNumberText.text = vehicle.StateNumber

        // Загрузка изображения (если используется Glide или Picasso)
        GlideHelper.loadImage(context, vehicle.FrontPhotoImage, holder.frontPhotoImage)

        // Проверка на выбранный автомобиль
        val savedVehicleID = sharedPrefs.getInt("selectedVehicleID", -1)
        if (vehicle.VehicleID == savedVehicleID) {
            holder.itemView.setBackgroundResource(R.drawable.selected_item_background)
        } else {
            holder.itemView.setBackgroundResource(R.drawable.item_background)
        }

        holder.itemView.setOnClickListener {
            selectedVehicleID = vehicle.VehicleID
            sharedPrefs.edit().putInt("selectedVehicleID", selectedVehicleID).apply()
            onVehicleSelected(selectedVehicleID)
            notifyDataSetChanged()
        }

        holder.deleteButton.setOnClickListener {
            onDeleteClick(vehicle.VehicleID)
        }

        holder.editButton.setOnClickListener {
            // Реализовать редактирование
        }
    }

    override fun getItemCount(): Int = vehicles.size

    fun updateVehicles(newVehicles: List<Vehicle>) {
        vehicles.clear()
        vehicles.addAll(newVehicles)
        notifyDataSetChanged()
    }

    fun removeVehicleById(vehicleID: Int) {
        val index = vehicles.indexOfFirst { it.VehicleID == vehicleID }
        if (index != -1) {
            vehicles.removeAt(index)
            notifyItemRemoved(index)
        }
    }

    fun updateVehicles(newVehicles: List<Vehicle>, autoSelectSingle: Boolean = false) {
        vehicles.clear()
        vehicles.addAll(newVehicles)

        if (autoSelectSingle && vehicles.size == 1) {
            selectedVehicleID = vehicles[0].VehicleID
            sharedPrefs.edit().putInt("selectedVehicleID", selectedVehicleID).apply()
            onVehicleSelected(selectedVehicleID)
        }

        notifyDataSetChanged()
    }
}
