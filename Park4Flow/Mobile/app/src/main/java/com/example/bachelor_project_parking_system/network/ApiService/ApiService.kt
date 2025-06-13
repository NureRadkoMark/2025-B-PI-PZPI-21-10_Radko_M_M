package com.example.bachelor_project_parking_system.network.ApiService

import com.example.bachelor_project_parking_system.models.Deposit.DepositRequest
import com.example.bachelor_project_parking_system.models.Favorites.FavoriteParkingsRequest
import com.example.bachelor_project_parking_system.models.Favorites.UserFavoriteParkingsResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.ConfirmResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayConfirmRequest
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.LiqPayPayPalCreateOrderResponse
import com.example.bachelor_project_parking_system.models.LiqPayPayPal.PayPalConfirmRequest
import com.example.bachelor_project_parking_system.models.Login.LoginRequest
import com.example.bachelor_project_parking_system.models.Login.LoginResponse
import com.example.bachelor_project_parking_system.models.Parking.ParkingsListResponse
import com.example.bachelor_project_parking_system.models.ParkingAction.ParkingActionRequest
import com.example.bachelor_project_parking_system.models.ParkingAction.ParkingActionStartResponse
import com.example.bachelor_project_parking_system.models.ParkingAction.ParkingActionStopResponse
import com.example.bachelor_project_parking_system.models.PassRecovery.PassRecoveryRequest
import com.example.bachelor_project_parking_system.models.PassRecovery.PassRecoveryResponse
import com.example.bachelor_project_parking_system.models.PassRecovery.ResetPasswordRequest
import com.example.bachelor_project_parking_system.models.PassRecovery.ResetPasswordResponse
import com.example.bachelor_project_parking_system.models.Payment.PaymentRequest
import com.example.bachelor_project_parking_system.models.Register.RegisterRequest
import com.example.bachelor_project_parking_system.models.Register.RegisterResponse
import com.example.bachelor_project_parking_system.models.Reservation.CreateReservationRequest
import com.example.bachelor_project_parking_system.models.Reservation.CreateReservationResponse
import com.example.bachelor_project_parking_system.models.Reservation.SkipReservationResponse
import com.example.bachelor_project_parking_system.models.Reservation.UserReservationsResponse
import com.example.bachelor_project_parking_system.models.Response.MessageResponse
import com.example.bachelor_project_parking_system.models.User.User
import com.example.bachelor_project_parking_system.models.User.UpdateUserDataRequest
import com.example.bachelor_project_parking_system.models.User.UpdateUserDataResponse
import com.example.bachelor_project_parking_system.models.Vehicle.UpdateVehicleRequest
import com.example.bachelor_project_parking_system.models.Vehicle.Vehicle
import okhttp3.MultipartBody
import okhttp3.RequestBody

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.DELETE
import retrofit2.http.Multipart
import retrofit2.http.Part
import retrofit2.http.Path

interface ApiService {

    //User
    @POST("/api/users/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @POST("/api/users/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<MessageResponse>

    @GET("/api/users/check")
    suspend fun refreshToken(
        @Header("Authorization") token: String
    ): Response<LoginResponse>

    @GET("/api/users/details")
    suspend fun getUserDetails(
        @Header("Authorization") token: String
    ): Response<User>

    @PUT("/api/users/update")
    suspend fun updateUserDetails(
        @Header("Authorization") token: String,
        @Body userDetails: UpdateUserDataRequest
    ): Response<MessageResponse>

    @POST("/api/users/pass/code")
    suspend fun passRecovery(
        @Body request: PassRecoveryRequest
    ): Response<MessageResponse>

    @POST("/api/users/pass/reset")
    suspend fun passReset(
        @Body request: ResetPasswordRequest
    ): Response<MessageResponse>

    @DELETE("/api/users/delete")
    suspend fun deleteUser(
        @Header("Authorization") token: String
    ): Response<MessageResponse>

    //User reservations
    @GET("/api/reservations/user")
    suspend fun getUserReservations(
        @Header("Authorization") token: String
    ): Response<List<UserReservationsResponse>>

    @PUT("/api/reservations/skip/{reservationID}")
    suspend fun skipUserReservation(
        @Path("reservationID") reservationID: Int
    ): Response<SkipReservationResponse>

    @POST("/api/reservations/create")
    suspend fun createReservation(
        @Header("Authorization") token: String,
        @Body request: CreateReservationRequest
    ): Response<CreateReservationResponse>

    //Favorite parkings list
    @POST("/api/favoriteParkings/add")
    suspend fun addToFavorites(
        @Header("Authorization") token: String,
        @Body request: FavoriteParkingsRequest
    ) : Response<MessageResponse>

    @DELETE("/api/favoriteParkings/delete")
    suspend fun removeFromFavorites(
        @Header("Authorization") token: String,
        @Body request: FavoriteParkingsRequest
    ) : Response<MessageResponse>

    @GET("/api/favoriteParkings/user")
    suspend fun getUserFavorites(
        @Header("Authorization") token: String,
    ) : Response<List<UserFavoriteParkingsResponse>>

    //Deposit on balance
    @POST("/api/deposits/paypal/create")
    suspend fun depositPayPalCreate(
        @Header("Authorization") token: String,
        @Body request: DepositRequest
    ) : Response<LiqPayPayPalCreateOrderResponse>

    @POST("/api/deposits/paypal/confirm")
    suspend fun depositPayPalConfirm(
        @Header("Authorization") token: String,
        @Body request: PayPalConfirmRequest
    ) : Response<ConfirmResponse>

    @POST("/api/deposits/liqpay/create")
    suspend fun depositLiqPayCreate(
        @Header("Authorization") token: String,
        @Body request: DepositRequest
    ) : Response<LiqPayPayPalCreateOrderResponse>

    @POST("/api/deposits/liqpay/confirm")
    suspend fun depositLiqPayConfirm(
        @Header("Authorization") token: String,
        @Body request: LiqPayConfirmRequest
    ): Response<ConfirmResponse>

    //Payment for reservation
    @POST("/api/payments/paypal/create")
    suspend fun paymentPayPalCreate(
        @Header("Authorization") token: String,
        @Body request: PaymentRequest
    ) : Response<LiqPayPayPalCreateOrderResponse>

    @POST("/api/payments/paypal/confirm")
    suspend fun paymentPayPalConfirm(
        @Header("Authorization") token: String,
        @Body request: PayPalConfirmRequest
    ) : Response<ConfirmResponse>

    @POST("/api/payments/liqpay/create")
    suspend fun paymentLiqPayCreate(
        @Header("Authorization") token: String,
        @Body request: PaymentRequest
    ) : Response<LiqPayPayPalCreateOrderResponse>

    @POST("/api/payments/liqpay/confirm")
    suspend fun paymentLiqPayConfirm(
        @Header("Authorization") token: String,
        @Body request: LiqPayConfirmRequest
    ) : Response<ConfirmResponse>

    @POST("/api/payments/balance")
    suspend fun paymentBalance(
        @Header("Authorization") token: String,
        @Body request: PaymentRequest
    ) : Response<MessageResponse>

    //Parking Action
    @POST("/api/parkingActions/user/start/{ParkPlaceID}")
    suspend fun parkingActionStart(
        @Header("Authorization") token: String,
        @Body request: ParkingActionRequest,
        @Path("ParkPlaceID") parkPlaceID: Int
    ) : Response<ParkingActionStartResponse>

    @POST("/api/parkingActions/user/stop/{ParkPlaceID}")
    suspend fun parkingActionStop(
        @Header("Authorization") token: String,
        @Body request: ParkingActionRequest,
        @Path("ParkPlaceID") parkPlaceID: Int
    ) : Response<ParkingActionStopResponse>

    //Vehicle
    @Multipart
    @POST("/api/vehicles/create")
    suspend fun createVehicle(
        @Header("Authorization") token: String,
        @Part("VehicleCategory") vehicleCategory: RequestBody,
        @Part("StateNumber") stateNumber: RequestBody,
        @Part("VehicleBrand") vehicleBrand: RequestBody,
        @Part("VehicleModel") vehicleModel: RequestBody,
        @Part frontPhotoImage: MultipartBody.Part
    ): Response<Vehicle>

    @PUT("/api/vehicles/update/{VehicleID}")
    suspend fun updateVehicle(
        @Header("Authorization") token: String,
        @Path("VehicleID") vehicleID: Int,
        @Body request: UpdateVehicleRequest
    ): Response<Vehicle>

    @DELETE("/api/vehicles/delete/{VehicleID}")
    suspend fun deleteVehicle(
        @Header("Authorization") token: String,
        @Path("VehicleID") vehicleID: Int
    ): Response<MessageResponse>

    @GET("/api/vehicles/user")
    suspend fun getUserVehicles(
        @Header("Authorization") token: String
    ): Response<List<Vehicle>>

    @GET("/api/parkings/user")
    suspend fun getUserParkingsList(
        @Header("Authorization") token: String
    ) : Response<List<ParkingsListResponse>>
}