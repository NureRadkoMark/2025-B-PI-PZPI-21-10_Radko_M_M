package com.example.bachelor_project_parking_system.network.ApiService

import android.content.Context
import android.graphics.drawable.Drawable
import android.util.Log
import android.widget.ImageView
import com.bumptech.glide.Glide
import com.bumptech.glide.Registry
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.bumptech.glide.load.model.GlideUrl
import com.bumptech.glide.integration.okhttp3.OkHttpUrlLoader
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.Target
import okhttp3.OkHttpClient
import java.io.InputStream

object GlideHelper {
    private var initialized = false

    fun initGlide(context: Context) {
        if (initialized) return

        try {
            val registry: Registry = Glide.get(context).registry
            val factory = OkHttpUrlLoader.Factory(UnsafeHttpClient.create())
            registry.replace(GlideUrl::class.java, InputStream::class.java, factory)
            initialized = true
        } catch (e: Exception) {
            Log.e("GlideHelper", "Failed to initialize custom Glide client", e)
        }
    }

    fun loadImage(context: Context, url: String, imageView: ImageView) {
        initGlide(context)

        Glide.with(context)
            .load(url)
            .diskCacheStrategy(DiskCacheStrategy.NONE)
            .skipMemoryCache(true)
            .listener(object : RequestListener<Drawable> {
                override fun onLoadFailed(
                    e: GlideException?,
                    model: Any?,
                    target: Target<Drawable>,
                    isFirstResource: Boolean
                ): Boolean {
                    Log.e("Glide", "Image load failed: $url", e)
                    return false // Позволяет Glide показать placeholder
                }

                override fun onResourceReady(
                    resource: Drawable,
                    model: Any,
                    target: Target<Drawable>?,
                    dataSource: DataSource,
                    isFirstResource: Boolean
                ): Boolean {
                    Log.d("Glide", "Image loaded successfully: $url, from: $dataSource")
                    return false // Позволяет Glide показать картинку
                }
            })
            .into(imageView)
    }
}
