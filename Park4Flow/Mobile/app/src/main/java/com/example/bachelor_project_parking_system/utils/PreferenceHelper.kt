package com.example.bachelor_project_parking_system.utils

import android.content.SharedPreferences

inline fun <reified T : Any> SharedPreferences.get(key: String, defaultValue: T): T {
    return when (T::class) {
        String::class -> getString(key, defaultValue as? String ?: "") as T
        Int::class -> getInt(key, defaultValue as? Int ?: 0) as T
        Boolean::class -> getBoolean(key, defaultValue as? Boolean ?: false) as T
        Float::class -> getFloat(key, defaultValue as? Float ?: 0f) as T
        Long::class -> getLong(key, defaultValue as? Long ?: 0L) as T
        else -> throw IllegalArgumentException("Unsupported type")
    }
}

inline fun <reified T : Any> SharedPreferences.set(key: String, value: T) {
    with(edit()) {
        when (T::class) {
            String::class -> putString(key, value as? String)
            Int::class -> putInt(key, value as? Int ?: 0)
            Boolean::class -> putBoolean(key, value as? Boolean ?: false)
            Float::class -> putFloat(key, value as? Float ?: 0f)
            Long::class -> putLong(key, value as? Long ?: 0L)
            else -> throw IllegalArgumentException("Unsupported type")
        }
        apply()
    }
}