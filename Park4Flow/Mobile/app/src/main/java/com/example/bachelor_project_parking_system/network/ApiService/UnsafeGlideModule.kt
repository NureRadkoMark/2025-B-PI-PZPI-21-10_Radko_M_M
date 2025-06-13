package com.example.bachelor_project_parking_system.network.ApiService

import android.content.Context
import com.bumptech.glide.Glide
import com.bumptech.glide.Registry
import com.bumptech.glide.annotation.GlideModule
import com.bumptech.glide.integration.okhttp3.OkHttpUrlLoader
import com.bumptech.glide.load.model.GlideUrl
import com.bumptech.glide.module.AppGlideModule
import java.io.InputStream

@GlideModule
class UnsafeGlideModule : AppGlideModule() {
    override fun registerComponents(
        context: Context,
        glide: Glide,
        registry: Registry
    ) {
        val unsafeClient = UnsafeHttpClient.create()
        val factory = OkHttpUrlLoader.Factory(unsafeClient)
        registry.replace(
            GlideUrl::class.java,
            InputStream::class.java,
            factory
        )
    }

    override fun isManifestParsingEnabled(): Boolean = false
}