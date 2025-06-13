package com.example.bachelor_project_parking_system.network.ApiService

import android.content.Context
import android.content.SharedPreferences
import android.os.Handler
import android.os.Looper
import android.util.Log
import okhttp3.*
import org.json.JSONObject
import java.security.SecureRandom
import java.security.cert.X509Certificate
import java.util.concurrent.TimeUnit
import javax.net.ssl.*

class ParkingWebSocketManager(
    private val context: Context,
    private val userId: String,
    private val sharedPreferences: SharedPreferences
) {
    private var webSocket: WebSocket? = null
    private var currentListener: WebSocketListener? = null
    private val reconnectHandler = Handler(Looper.getMainLooper())
    private var reconnectAttempts = 0
    private val maxReconnectAttempts = 40

    private fun createUnsafeClient(): OkHttpClient {
        val trustAllCerts = arrayOf<TrustManager>(object : X509TrustManager {
            override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}
            override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {}
            override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
        })

        val sslContext = SSLContext.getInstance("SSL").apply {
            init(null, trustAllCerts, SecureRandom())
        }

        val sslSocketFactory = sslContext.socketFactory

        return OkHttpClient.Builder()
            .sslSocketFactory(sslSocketFactory, trustAllCerts[0] as X509TrustManager)
            .hostnameVerifier { _, _ -> true }
            .pingInterval(30, TimeUnit.SECONDS)
            .build()
    }

    private val client = createUnsafeClient()

    fun connect(listener: WebSocketListener) {
        currentListener = listener
        val token = sharedPreferences.getString("jwtToken", null)
        if (token.isNullOrEmpty()) {
            Log.e("WebSocket", "No JWT token available")
            return
        }

        val request = Request.Builder()
            .url("wss://192.168.31.250:5192/ws")
            .addHeader("Authorization", "Bearer $token")
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                reconnectAttempts = 0 // reset on success
                Log.d("WebSocket", "Connected to server")
                val registerMessage = JSONObject().apply {
                    put("type", "register")
                    put("userId", userId)
                }
                webSocket.send(registerMessage.toString())
                listener.onOpen(webSocket, response)
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d("WebSocket", "Received: $text")
                listener.onMessage(webSocket, text)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d("WebSocket", "Connection closed: $code / $reason")
                scheduleReconnect()
                listener.onClosed(webSocket, code, reason)
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("WebSocket", "Connection error: ${t.message}", t)
                response?.let {
                    Log.e("WebSocket", "Response code: ${it.code}")
                    Log.e("WebSocket", "Response message: ${it.message}")
                    Log.e("WebSocket", "Response body: ${it.body?.string()}")
                }
                scheduleReconnect()
                listener.onFailure(webSocket, t, response)
            }
        })
    }

    private fun scheduleReconnect() {
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            Log.d("WebSocket", "Reconnecting in 2 seconds... (Attempt $reconnectAttempts)")
            reconnectHandler.postDelayed({
                currentListener?.let { connect(it) }
            }, 2000)
        } else {
            Log.e("WebSocket", "Max reconnect attempts reached. Giving up.")
        }
    }

    fun disconnect() {
        reconnectHandler.removeCallbacksAndMessages(null)
        webSocket?.close(1000, "User initiated disconnect")
        client.dispatcher.executorService.shutdown()
    }
}

