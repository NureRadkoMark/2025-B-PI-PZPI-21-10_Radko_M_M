package com.example.bachelor_project_parking_system.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.bachelor_project_parking_system.R
import com.example.bachelor_project_parking_system.models.Favorites.UserFavoriteParkingsResponse

class FavoriteParkingAdapter(
    private val items: MutableList<UserFavoriteParkingsResponse>,
    private val onDelete: (UserFavoriteParkingsResponse) -> Unit,
    private val onClick: (UserFavoriteParkingsResponse) -> Unit
) : RecyclerView.Adapter<FavoriteParkingAdapter.FavViewHolder>() {

    inner class FavViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title = view.findViewById<TextView>(R.id.parkingTitle)
        val info = view.findViewById<TextView>(R.id.parkingInfo)
        val dynamic = view.findViewById<TextView>(R.id.dynamicPricing)
        val delete = view.findViewById<ImageView>(R.id.deleteButton)

        fun bind(item: UserFavoriteParkingsResponse) {
            title.text = item.Name
            info.text = item.Info
            dynamic.text = "Active: ${if (item.IsActive) "Yes" else "No"}"

            delete.setOnClickListener { onDelete(item) }
            itemView.setOnClickListener { onClick(item) }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FavViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_favorite_parking, parent, false)
        return FavViewHolder(view)
    }

    override fun getItemCount(): Int = items.size

    override fun onBindViewHolder(holder: FavViewHolder, position: Int) {
        holder.bind(items[position])
    }

    fun removeItem(item: UserFavoriteParkingsResponse) {
        val index = items.indexOf(item)
        if (index >= 0) {
            items.removeAt(index)
            notifyItemRemoved(index)
        }
    }

    fun updateList(newList: List<UserFavoriteParkingsResponse>) {
        items.clear()
        items.addAll(newList)
        notifyDataSetChanged()
    }
}
