import axiosInstance from "./axiosInstance";
import {loginResponseModel} from "./models/user/loginModels";
import {registerRequestModel, registerResponseModel} from "./models/user/registerModels";
import {banUserRequestModel, banUserResponseModel} from "./models/user/banUserModels";
import {updateUserRequestModel, updateUserResponseModel} from "./models/user/updateUserModels";
import {passRecoveryRequestModel, passRecoveryResponseModel, resetPasswordResponseModel} from "./models/user/passRecoveryModels";
import {userEmailResponseModel} from "./models/user/userSearchModels";
import {createVehicleDataRequestModel, createVehicleDataResponseModel} from "./models/vehicle/createVehicleDataModels";
import {updateVehicleDataRequestModel, updateVehicleDataResponseModel} from "./models/vehicle/updateVehicleDataModels";
import {deleteVehicleDataRequestModel, deleteVehicleDataResponseModel} from "./models/vehicle/deleteVehicleDataModels";
import {getUserVehicleResponseModel} from "./models/vehicle/getUserVehiclesDataModels";
import {createTariffPlanRequestModel, createTariffPlanResponseModel} from "./models/tariffPlan/createTariffPlanModels";
import {updateTariffPlanResponseModel} from "./models/tariffPlan/updateTariffPlanModels";
import {deleteTariffPlanResponseModel} from "./models/tariffPlan/deleteTariffPlanModels";
import {
    getTariffPlanByCurrencyRequestModel,
    getTariffPlanByCurrencyResponseModel
} from "./models/tariffPlan/getTariffPlanByCurrencyModels";
import {
    confirmSubscriptionResponseModel, liqPayConfirmModel,
    payPalConfirmModel,
    subscribeRequestModel,
    subscribeResponseModel
} from "./models/subscriptionProcess/subscribeModels";
import {
    createSalesPoliciesRequestModel,
    createSalesPoliciesResponseModel
} from "./models/salesPolicies/createSalesPoliciesModels";
import {
    deletePersonalSalesPoliciesRequestModel,
    deletePersonalSalesPoliciesResponseModel
} from "./models/salesPolicies/deleteSalesPoliciesModels";
import {
    createReservationRequestModel,
    createReservationResponseModel
} from "./models/reservation/createReservationModels";
import {skipReservationRequestModel, skipReservationResponseModel} from "./models/reservation/skipReservationModels";
import {getReservationsResponseModels} from "./models/reservation/getReservationsModels";
import {
    confirmPaymentResponseModel, liqPayPaymentConfirmRequestModel,
    paymentRequestModel,
    paymentResponseModel,
    payPalPaymentConfirmRequestModel
} from "./models/paymentProcess/paymentProcessModels";
import {createParkPlaceRequestModel, createParkPlaceResponseModel} from "./models/parkPlace/createParkPlaceModels";
import {updateParkPlaceRequestModel, updateParkPlaceResponseModel} from "./models/parkPlace/updateParkPlaceModels";
import {deleteParkPlaceRequestModel, deleteParkPlaceResponseModel} from "./models/parkPlace/deleteParkPlaceModels";
import {getInfoParkPlaceRequestModel, getInfoParkPlaceResponseModel} from "./models/parkPlace/getInfoParkPlaceModels";
import {
    createFavouriteParkingRequestModel,
    createFavouriteParkingResponseModel,
    deleteFavouriteParkingRequestModel,
    deleteFavouriteParkingResponseModel,
    getUserFavouriteParkingResponseModel
} from "./models/favouriteParking/favouriteParkingModels";
import {createParkingRequestModel, createParkingResponseModel} from "./models/parking/createParkingModels";
import {deleteParkingResponseModel} from "./models/parking/deleteParkingModels";
import {updateParkingRequestModel, updateParkingResponseModel} from "./models/parking/updateParkingModels";
import {getUserParkingListResponseModel} from "./models/parking/getUserParkingListModels";
import {getStatisticParkingInfoResponseModel} from "./models/parking/getStatisticParkingInfoModels";
import {
    DepositConfirmResponseModel,
    depositProcessRequestModel,
    depositProcessResponseModel, liqPayDepositConfirmRequestModel,
    payPalDepositConfirmRequestModel
} from "./models/depositProcess/depositProcessModels";
import {
    createCancellationPoliciesRequestModel,
    createCancellationPoliciesResponseModel
} from "./models/cancellationPolicies/createCancellationPoliciesModels";
import {
    updateCancellationPoliciesRequestModel,
    updateCancellationPoliciesResponseModel
} from "./models/cancellationPolicies/updateCancellationPoliciesModels";
import {
    deleteCancellationPoliciesRequestModel,
    deleteCancellationPoliciesResponseModel
} from "./models/cancellationPolicies/deleteCancellationPoliciesModels";
import {
    createBonusesCostRequestModel,
    createBonusesCostResponseModel
} from "./models/bonusesCost/createBonusesCostModels";
import {
    updateBonusesCostRequestModel,
    updateBonusesCostResponseModel
} from "./models/bonusesCost/updateBonusesCostModels";
import {
    deleteBonusesCostRequestModel,
    deleteBonusesCostResponseModel
} from "./models/bonusesCost/deleteBonusesCostModels";
import {
    getBonusesCostForCurrencyRequestModel,
    getBonusesCostForCurrencyResponseModel
} from "./models/bonusesCost/getBonusesCostForCurrencyModels";
import {userDetailsResponseModel} from "./models/user/userDetailsModel";
import axios from "axios";

export const ApiService = {

    login: async (loginRequestModel) => {
        const { Email, Password } = loginRequestModel;

        if (!Email || !Password) {
            throw new Error("Email or password not provided");
        }

        const response = await axiosInstance.post("/api/users/login", loginRequestModel);
        //const { token } = response.data;
        //return { token: token };
        return response.data
    },

    register: async (registerRequestModel) => {
        const {Email, Password, FirstName, SecondName, PhoneNumber, Currency} = registerRequestModel;

        if(!Email || !Password || !FirstName || !SecondName || !PhoneNumber || !Currency){
            throw new Error("Register data not provided");
        }

        const response = await axiosInstance.post("/api/users/register", registerRequestModel);

        return response.data;

    },

    banUser: async (banUserRequestModel, token) => {
        const {UserID} = banUserRequestModel;

        if(!UserID){
            throw new Error("UserID not provided");
        }

        const response = await axiosInstance.put("api/users/ban", {
            UserID,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data.message;
    },

    unbanUser: async (banUserRequestModel, token) => {
        const {UserID} = banUserRequestModel;

        if(!UserID){
            throw new Error("UserID not provided");
        }

        const response = await axiosInstance.put("api/users/unban", {
            UserID,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data.message;
    },

    getUserDetails: async (token) => {
        try {
            const response = await axiosInstance.get("api/users/details", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Полный ответ от сервера:", response);
            return response.data;
        } catch (error) {
            console.error('Error in getUserDetails:', error);
            throw error;
        }
    },

    updateUserData: async (token, updateUserRequestModel) => {
        const { PhoneNumber, FirstName, SecondName } = updateUserRequestModel;

        if (!PhoneNumber || !FirstName || !SecondName) {
            throw new Error("All fields are required");
        }

        const response = await axiosInstance.put("api/users/update",
            updateUserRequestModel, // Тело запроса
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return updateUserResponseModel(response.data.Message);
    },

    passRecovery: async (passRecoveryRequestModel ) => {
        const {Email} = passRecoveryRequestModel

        if(!Email){
            throw new Error("User email not provided")
        }

        const response = await axiosInstance.post("api/users/pass/code", {
            Email,
        })

        const {message} = response.data;
        return passRecoveryResponseModel(message);
    },

    passReset: async (resetPasswordRequestModel ) => {
        const {Email, SecurityCode, NewPassword} = resetPasswordRequestModel

        if(!Email || !SecurityCode || !NewPassword){
            throw new Error("New password data not provided")
        }

        const response = await axiosInstance.post("api/users/pass/reset", {
            Email,
            SecurityCode,
            NewPassword
        })

        const {message} = response.data;
        return resetPasswordResponseModel(message);
    },

    checkAuth: async (token) => {
        console.log(process.env.REACT_APP_BASE_URL)
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/check`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            }
        });
        const { token: refreshedToken } = response.data;
        return { token: refreshedToken };
    },

    getUserByEmail: async (email, token) => {
        if (!email) {
            throw new Error("Email not provided");
        }

        if (!token) {
            throw new Error("JWT token not provided");
        }

        const response = await axiosInstance.get(`/api/users/email/${email}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    },

    createVehicle: async (createVehicleDataRequestModel, token) => {
        const {
            VehicleCategory,
            StateNumber,
            VehicleBrand,
            VehicleModel,
            FrontPhotoImage
        } = createVehicleDataRequestModel;

        if (!FrontPhotoImage) {
            throw new Error("FrontPhotoImage (file) is required");
        }

        const formData = new FormData();
        formData.append("VehicleCategory", VehicleCategory);
        formData.append("StateNumber", StateNumber);
        formData.append("VehicleBrand", VehicleBrand);
        formData.append("VehicleModel", VehicleModel);
        formData.append("frontPhotoImage", FrontPhotoImage); // имя должно совпадать с multer.single('frontPhotoImage')

        const response = await axiosInstance.post("/api/vehicles/create", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });

        return createVehicleDataResponseModel(response.data);
    },

    updateVehicle: async (updateVehicleDataRequestModel, token) => {
        const {
            VehicleID,
            VehicleCategory,
            StateNumber,
            VehicleBrand,
            VehicleModel
        } = updateVehicleDataRequestModel;

        if (!VehicleID || !VehicleCategory || !StateNumber || !VehicleBrand || !VehicleModel) {
            throw new Error("Update vehicle params not provided");
        }

        const response = await axiosInstance.put(
            `api/vehicles/update/${VehicleID}`,
            {
                VehicleCategory,
                StateNumber,
                VehicleBrand,
                VehicleModel
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        return updateVehicleDataResponseModel(response.data);
    },

    deleteVehicle: async (VehicleID, token) => {
        const parsedId = Number(VehicleID);
        if (isNaN(parsedId)) throw new Error("Invalid VehicleID");

        const response = await axiosInstance.delete(`api/vehicles/delete/${parsedId}`, {
            headers: {Authorization: `Bearer ${token}`}
        });

        return deleteVehicleDataResponseModel(response.data);
    },

    getUserVehicles: async (token) => {
        const response = await axiosInstance.get("api/vehicles/user", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data.map(vehicle => getUserVehicleResponseModel(vehicle));
    },

    createTariffPlan: async (token, createTariffPlanRequestModel) => {
        const {SubscriptionDuration, SubscriptionPrice, Currency, Type} = createTariffPlanRequestModel

        if(!SubscriptionDuration || !SubscriptionPrice || !Currency || !Type){
            throw new Error("Create tariff plan params are not provided")
        }

        const response = await axiosInstance.post("api/tariffPlans/create", {
            SubscriptionDuration,
            SubscriptionPrice,
            Currency,
            Type},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return createTariffPlanResponseModel(response.data);
    },

    updateTariffPlan: async (token, updateTariffPlanRequestModel) => {
        const {TariffPlanID, SubscriptionDuration, SubscriptionPrice, Currency, Type} = updateTariffPlanRequestModel

        if(!SubscriptionDuration || !SubscriptionPrice || !Currency || !Type || !TariffPlanID){
            throw new Error("Update tariff plan params are not provided")
        }

        const response = await axiosInstance.put(
            `api/tariffPlans/update/${TariffPlanID}`,
            {
            SubscriptionDuration,
            SubscriptionPrice,
            Currency,
            Type
            },
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return updateTariffPlanResponseModel(response.data);
    },

    deleteTariffPlan: async (token, deleteTariffPlanRequestModel) => {
        const {TariffPlanID} = deleteTariffPlanRequestModel

        if(!TariffPlanID){
            throw new Error("Delete tariff plan params are not provided")
        }

        const response = await axiosInstance.delete(`api/tariffPlans/delete/${TariffPlanID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data.message;
    },

    getByCurrencyTariffPlans: async (token, currency) => {
        if(!currency){
            throw new Error("Currency for downloading tariff plans is not provided")
        }

        const response = await axiosInstance.get(`api/tariffPlans/currency/${currency}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    payPalCreateSubscribe: async (token, subscribeRequestModel) => {
        const {tariffPlanID} = subscribeRequestModel

        if(!tariffPlanID) {
            throw new Error("TariffPlanID is not provided for creating payment")
        }

        const response = await axiosInstance.post(`api/subscriptions/paypal/create`, {
            tariffPlanID},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    liqPayCreateSubscribe: async (token, subscribeRequestModel) => {
        const {tariffPlanID} = subscribeRequestModel

        if(!tariffPlanID) {
            throw new Error("TariffPlanID is not provided for creating payment")
        }

        const response = await axiosInstance.post(`api/subscriptions/liqpay/create`, {
            tariffPlanID},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    payPalConfirmSubscribe: async (token, payPalConfirmModel) => {
        const {transactionID, approvalUrl, tariffPlanID} = payPalConfirmModel

        if(!transactionID || !approvalUrl || !tariffPlanID){
            throw new Error("Params for confirming payPal subscription payment are not provided")
        }

        const response = await axiosInstance.post(`api/subscriptions/paypal/confirm`, {
            transactionID,
            approvalUrl,
            tariffPlanID},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    liqPayConfirmSubscribe: async (token, liqPayConfirmModel) => {
        const {transactionID, tariffPlanID} = liqPayConfirmModel

        if(!transactionID || !tariffPlanID){
            throw new Error("Params for confirming liqPay subscription payment are not provided")
        }

        const response = await axiosInstance.post(`api/subscriptions/liqpay/confirm`, {
            transactionID,
            tariffPlanID},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    createSalesPolicies: async (token, createSalesPoliciesRequestModel) => {
        const {email, isForEveryone, salePercent, ParkingID} = createSalesPoliciesRequestModel

        if(!salePercent || !ParkingID){
            throw new Error("Params for creating sales policy are not provided")
        }

        const response = await axiosInstance.post(`api/salesPolicies/create`, {
            email,
            isForEveryone,
            salePercent,
                ParkingID},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    deleteGeneralSalesPolicies: async (token, SalesPoliciesID) => {
        if(!SalesPoliciesID){
            throw new Error("Params for deleting sales policy are not provided")
        }
        const response = await axiosInstance.delete(`api/salesPolicies/delete/general/${SalesPoliciesID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return deletePersonalSalesPoliciesResponseModel(response.data);
    },

    deletePersonalSalesPolicies: async (token, deletePersonalSalesPoliciesRequestModel) => {
        const {email} = deletePersonalSalesPoliciesRequestModel

        if(!email){
            throw new Error("Params for deleting sales policy are not provided")
        }

        const response = await axiosInstance.delete(`api/salesPolicies/delete/personal/${email}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return deletePersonalSalesPoliciesResponseModel(response.data);
    },

    getParkingSalesPolicies: async (token, ParkingID) =>{
        const response = await axiosInstance.get(`api/salesPolicies/parking/${ParkingID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data.salesPolicies;
    },

    createReservation: async (token, createReservationRequestModel) => {
        const {ParkingID, VehicleID, StartTime, EndTime} = createReservationRequestModel

        if(!ParkingID || !VehicleID || !StartTime || !EndTime){
            throw new Error("Params for reservation are not provided")
        }

        const response = await axiosInstance.post(`api/reservations/create`, {
            ParkingID,
            VehicleID,
            StartTime,
            EndTime},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    skipReservation: async (reservationID) => {
        if (!reservationID) {
            throw new Error("Params for skipping reservation are not provided");
        }

        const response = await axiosInstance.put(`api/reservations/skip/${reservationID}`, {});
        return response.data;
    },

    getUserReservations: async (token) => {
        const response = await axiosInstance.get(`api/reservations/user`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data.reservations;
    },

    getParkingReservations: async (token) => {
        const response = await axiosInstance.get(`api/reservations/parking`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return getReservationsResponseModels(response.data);
    },

    payPalCreatePayment: async (token, paymentRequestModel) => {
        const {reservationId, desiredAmount, payByBonuses, currency} = paymentRequestModel

        if(!reservationId || !desiredAmount || !payByBonuses || !currency) {
            throw new Error("Some params are not provided for creating payment")
        }

        const response = await axiosInstance.post(`api/payments/paypal/create`, {
            reservationId,
            desiredAmount,
            payByBonuses,
            currency},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    liqPayCreatePayment: async (token, paymentRequestModel) => {
        const {reservationId, desiredAmount, payByBonuses, currency} = paymentRequestModel

        if(!reservationId || !desiredAmount || !currency) {
            throw new Error("Some params are not provided for creating payment")
        }

        const response = await axiosInstance.post(`api/payments/liqpay/create`, {
            reservationId,
            desiredAmount,
            payByBonuses,
            currency },
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    payPalConfirmPayment: async (token, payPalPaymentConfirmRequestModel) => {
        const {transactionID, approvalUrl, reservationId} = payPalPaymentConfirmRequestModel

        if(!transactionID || !approvalUrl || !reservationId){
            throw new Error("Params for confirming payPal payment are not provided")
        }

        const response = await axiosInstance.post(`api/payments/paypal/confirm`, {
            transactionID,
            approvalUrl,
            reservationId},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    liqPayConfirmPayment: async (token, liqPayPaymentConfirmRequestModel) => {
        const {transactionID, reservationId} = liqPayPaymentConfirmRequestModel

        if(!transactionID || !reservationId){
            throw new Error("Params for confirming liqPay payment are not provided")
        }

        const response = await axiosInstance.post(`api/payments/liqpay/confirm`, {
            transactionID,
            reservationId},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    balancePayment: async (token, paymentRequestModel) => {
        const {reservationId, desiredAmount, payByBonuses} = paymentRequestModel

        if(!reservationId || !desiredAmount || !payByBonuses){
            throw new Error("Params for confirming balance payment are not provided")
        }

        const response = await axiosInstance.post(`api/payments/balance`, {
            reservationId,
            desiredAmount,
            payByBonuses},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    createParkPlace: async (token, createParkPlaceRequestModel) =>{
        const {VehicleCategory, PlaceCategory, Name, Longitude, Latitude, BasePrice, PriceTimeDuration, ParkingID} = createParkPlaceRequestModel
        console.log(createParkPlaceRequestModel)
        if(!VehicleCategory || !PlaceCategory || !Name || !Longitude || !Latitude || !BasePrice || !PriceTimeDuration){
            throw new Error("Params for creating park place are not provided")
        }

        const response = await axiosInstance.post(`api/parkPlaces/create`, {
            VehicleCategory,
                PlaceCategory,
                Name, Longitude,
                Latitude,
                BasePrice,
                PriceTimeDuration,
                ParkingID
            },
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    updateParkPlace: async (token, updateParkPlaceRequestModel) =>{
        const {ParkPlaceID, VehicleCategory, PlaceCategory, Name, Longitude, Latitude, BasePrice, PriceTimeDuration} = updateParkPlaceRequestModel

        if(!ParkPlaceID || !VehicleCategory || !PlaceCategory || !Name || !Longitude || !Latitude || !BasePrice || !PriceTimeDuration){
            throw new Error("Params for updating park place are not provided")
        }

        const response = await axiosInstance.put(`api/parkPlaces/update/${ParkPlaceID}`, {
            ParkPlaceID,
            VehicleCategory,
            PlaceCategory,
            Name,
            Longitude,
            Latitude,
            BasePrice,
            PriceTimeDuration},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return updateParkPlaceResponseModel(response.data);
    },

    deleteParkPlace: async (token, ParkPlaceID) => {  // Принимаем только ID
        if(!ParkPlaceID){
            throw new Error("ParkPlaceID for deleting park place is not provided")
        }

        const response = await axiosInstance.delete(`api/parkPlaces/delete/${ParkPlaceID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return deleteParkPlaceResponseModel(response.data);
    },

    getParkPlacesInParking: async (token, ParkingID) => {
        const response = await axiosInstance.get(`api/parkPlaces/parking/${ParkingID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data.parkPlaces
    },

    getInfoParkPlace: async (token, getInfoParkPlaceRequestModel) =>{
        const {ParkPlaceID} = getInfoParkPlaceRequestModel

        if(!ParkPlaceID){
            throw new Error("Params for get info for park place are not provided")
        }

        const response = await axiosInstance.get(`api/parkPlaces/getInfo/${ParkPlaceID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return getInfoParkPlaceResponseModel(response.data);
    },

    createFavouriteParking: async (token, createFavouriteParkingRequestModel) => {
        const {ParkingID} = createFavouriteParkingRequestModel

        if(!ParkingID){
            throw new Error("ParkingID for adding to favourites is not provided")
        }

        const response = await axiosInstance.post(`api/favouriteParkings/add`, {
            ParkingID},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    deleteFavouriteParking: async (token, deleteFavouriteParkingRequestMode) => {
        const {ParkingID} = deleteFavouriteParkingRequestMode

        if(!ParkingID){
            throw new Error("ParkingID for deleting from favourites is not provided")
        }

        const response = await axiosInstance.delete(`api/favouriteParkings/delete/${ParkingID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return deleteFavouriteParkingResponseModel(response.data.message);
    },

    getFavouriteParking: async (token) => {
        const response = await axiosInstance.get(`api/favouriteParkings/user`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    createParking: async (createParkingRequestModel, token) => {
        const {
            Address, Name, Info, Longitude, Latitude, DynamicPricing, DemandFactor, PhotoImage
        } = createParkingRequestModel;

        if (!PhotoImage) {
            throw new Error("PhotoImage (file) is required");
        }

        const formData = new FormData();
        formData.append("Address", Address);
        formData.append("Name", Name);
        formData.append("Info", Info);
        formData.append("Longitude", Longitude);
        formData.append("Latitude", Latitude);
        formData.append("DynamicPricing", DynamicPricing);
        formData.append("DemandFactor", DemandFactor);
        formData.append("PhotoImage", PhotoImage); //  multer.single('PhotoImage')

        const response = await axiosInstance.post("/api/parkings/create", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    },

    deleteCodeParking: async (token) => {
        const response = await axiosInstance.post(`api/parkings/delete/confirm`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    deleteParking: async (token, SecurityCode, ParkingID) => {
        const response = await axiosInstance.post(`api/parkings/delete`, {
            SecurityCode,
            ParkingID},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    updateParking: async (token, updateParkingRequestModel) => {
        const { Address, Name, Info, DynamicPricing, DemandFactor, ParkingID } = updateParkingRequestModel;

        if (
            Address === undefined || Address === null || Address.trim() === '' ||
            Name === undefined || Name === null || Name.trim() === '' ||
            Info === undefined || Info === null ||
            DynamicPricing === undefined || DynamicPricing === null ||
            DemandFactor === undefined || DemandFactor === null ||
            !ParkingID
        ) {
            throw new Error("Params for updating parking is not provided");
        }

        const response = await axiosInstance.put(`api/parkings/update/${ParkingID}`, {
            Address,
            Name,
            Info,
            DynamicPricing,
            DemandFactor
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return updateParkingResponseModel(response.data);
    },

    getUserParkingList: async (token) => {
        const response = await axiosInstance.get(`api/parkings/user`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    getStatisticParkingInfo: async (token, ParkingID) => {
        const response = await axiosInstance.get(`api/parkings/getStatistics/${ParkingID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    payPalCreateDeposit: async (token, depositProcessRequestModel) => {
        const {desiredAmount, currency} = depositProcessRequestModel

        if(!desiredAmount || !currency) {
            throw new Error("Amount is not provided for creating payment")
        }

        const response = await axiosInstance.post(`api/deposits/paypal/create`,
            {
            desiredAmount,
            currency},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    liqPayCreateDeposit: async (token, depositProcessRequestModel) => {
        const {desiredAmount, currency} = depositProcessRequestModel

        if(!desiredAmount || !currency) {
            throw new Error("Amount is not provided for creating payment")
        }

        const response = await axiosInstance.post(
            `api/deposits/liqpay/create`,
            { desiredAmount, currency },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    },

    payPalConfirmDeposit: async (token, payPalDepositConfirmRequestModel) => {
        const {transactionID, approvalUrl, desiredAmount} = payPalDepositConfirmRequestModel

        if(!transactionID || !approvalUrl || !desiredAmount){
            throw new Error("Params for confirming payPal deposit are not provided")
        }

        const response = await axiosInstance.post(`api/deposits/paypal/confirm`, {
            transactionID,
            approvalUrl,
            desiredAmount},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    liqPayConfirmDeposit: async (token, liqPayDepositConfirmRequestModel) => {
        const {transactionID, desiredAmount} = liqPayDepositConfirmRequestModel

        if(!transactionID || !desiredAmount){
            throw new Error("Params for confirming liqPay subscription payment are not provided")
        }

        const response = await axiosInstance.post(`api/deposits/liqpay/confirm`, {
            transactionID,
            desiredAmount},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    createCancellationPolicies: async (token, createCancellationPoliciesRequestModel) => {
        const {HoursBeforeStart, CancellationFeePercent, ParkingID} = createCancellationPoliciesRequestModel

        if(!HoursBeforeStart || !CancellationFeePercent){
            throw new Error("Params for creating cancel policy are not provided")
        }

        const response = await axiosInstance.post(`api/cancellationPolicies/create`, {
            HoursBeforeStart,
            CancellationFeePercent,
            ParkingID},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return createCancellationPoliciesResponseModel(response.data);
    },

    updateCancellationPolicies: async (token, updateCancellationPoliciesRequestModel) => {
        const {CancellationPoliciesID, HoursBeforeStart, CancellationFeePercent} = updateCancellationPoliciesRequestModel

        if(!HoursBeforeStart || !CancellationFeePercent || !CancellationPoliciesID){
            throw new Error("Params for updating cancel policy are not provided")
        }

        const response = await axiosInstance.put(`api/cancellationPolicies/update/${CancellationPoliciesID}`, {
            HoursBeforeStart,
            CancellationFeePercent},
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return updateCancellationPoliciesResponseModel(response.data);
    },

    deleteCancellationPolicies: async (token, deleteCancellationPoliciesRequestModel) => {
        const {CancellationPoliciesID} = deleteCancellationPoliciesRequestModel

        if(!CancellationPoliciesID){
            throw new Error("Params for deleting cancel policy are not provided")
        }

        const response = await axiosInstance.delete(`api/cancellationPolicies/delete/${CancellationPoliciesID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return deleteCancellationPoliciesResponseModel(response.data);
    },

    getParkingCancellationPolicies: async (token, ParkingID) => {
        const response = await axiosInstance.get(`api/cancellationPolicies/parking/${ParkingID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data.policies;
    },

    createBonusesCost: async (token, createBonusesCostRequestModel) => {
        const {Currency, AmountForOneBonus} = createBonusesCostRequestModel

        if(!Currency || !AmountForOneBonus){
            throw new Error("Params for creating bonuses cost are not provided")
        }

        const response = await axiosInstance.post(`api/bonusesCosts/create`, {
            createBonusesCostRequestModel,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return createBonusesCostResponseModel(response.data);
    },

    updateBonusesCost: async (token, updateBonusesCostRequestModel) => {
        const {BonusesCostID, Currency, AmountForOneBonus} = updateBonusesCostRequestModel

        if(!BonusesCostID || !Currency || !AmountForOneBonus){
            throw new Error("Params for updating bonuses cost are not provided")
        }

        const response = await axiosInstance.put(
            `api/bonusesCosts/update/${BonusesCostID}`,
            {
                Currency,
                AmountForOneBonus,
            },
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return updateBonusesCostResponseModel(response.data);
    },

    deleteBonusesCost: async (token, deleteBonusesCostRequestModel) => {
        const {BonusesCostID} = deleteBonusesCostRequestModel

        if(!BonusesCostID){
            throw new Error("Params for deleting bonuses cost are not provided")
        }

        const response = await axiosInstance.delete(`api/bonusesCosts/delete/${BonusesCostID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return deleteBonusesCostResponseModel(response.data);
    },

    getBonusesCostForCurrency: async (token, getBonusesCostForCurrencyRequestModel) => {
        const {currency} = getBonusesCostForCurrencyRequestModel

        if(!currency){
            throw new Error("Params for getting bonuses cost are not provided")
        }

        const response = await axiosInstance.get(`api/bonusesCosts/currency/${currency}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return getBonusesCostForCurrencyResponseModel(response.data);
    },

    getUserSubscription: async (token) => {
        const response = await axiosInstance.get('api/subscriptions/user', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return response.data;
    },

    getAllTariffPlans: async (token) => {
        const response = await axiosInstance.get('api/tariffPlans/all', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data;
    },

    backupCreate: async (token) => {
        const response = await axiosInstance.post(
            '/backup/create',
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 0
            }
        );
        return response.data;
    },

    getParkingID: async (token) => {
        const response = await axiosInstance.get('/api/parkings/id', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.parkingID
    },

    getOwnersParkings: async (token) => {
        const response = await axiosInstance.get('/api/parkings/owner', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.parkings
    },

    getParkingInfo: async (token, ParkingID) => {
        const response = await axiosInstance.get(`/api/parkings/info/${ParkingID}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.parking
    }
};

export default ApiService