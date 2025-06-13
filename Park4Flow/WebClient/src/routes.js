import ProfilePage from "./pages/ProfilePage"
import VehicleModal from "./pages/VehicleModal";
import TariffPlanModal from "./pages/TariffPlanModal";
import PasswordRecoveryModal from "./pages/PassRecoveryModal";
import MapPage from "./pages/MapPage";
import FavouriteParkingsPage from "./pages/FavouriteParkingsPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import UserManagementPage from "./pages/UserManagementPage";
import TariffPlansAdminPage from "./pages/TariffPlansAdminPage";
import backupPage from "./pages/backupPage";
import UserReservationsPage from "./pages/UserReservationsPage";
import PaymentResultPage from "./pages/PaymentResultPage";
import ParkingRegistrationPage from "./pages/ParkingRegistrationPage";
import CreateReservationModal from "./pages/CreateReservationModal";
import OwnerParkingsPage from "./pages/OwnerParkingsPage";
import ParkingStatisticsPage from "./pages/ParkingStatisticsPage";
import ParkingManagementPage from "./pages/ParkingManagementPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import HomePage from "./pages/HomePage";

import {PROFILE_ROUTE, ADD_VEHICLE_ROUTE, EDIT_VEHICLE_ROUTE, PASSWORD_RECOVERY_ROUTE, MAP_ROUTE, FAVOURITE_PARKINGS_PAGE,
    SUBSCRIPTION_PAGE, USER_MANAGEMENT_PAGE, TARIFF_PLANS_MANAGEMENT_PAGE, ADD_TARIFF_PLAN, EDIT_TARIFF_PLAN,
    BACKUP_ROUTE, USER_RESERVATIONS_ROUTE, PAYMENT_RESULT_ROUTE, PARKING_REGISTER_PAGE, CREATE_RESERVATION_MODAL_PAGE,
    OWNER_PARKINGS_PAGE, PARKING_STATISTICS_PAGE, PARKING_MANAGE_PAGE, REGISTER_ROUTE, LOGIN_ROUTE, HOME_ROUTE} from "./utils/consts";


export const publicRoutes = [
    {
        path: PROFILE_ROUTE,
        Element: ProfilePage
    },
    {
      path: HOME_ROUTE,
      Element: HomePage
    },
    {
        path: REGISTER_ROUTE,
        Element: Register
    },
    {
        path: LOGIN_ROUTE,
        Element: Login
    },
    {
        path: PARKING_MANAGE_PAGE,
        Element: ParkingManagementPage
    },
    {
        path: PARKING_STATISTICS_PAGE,
        Element: ParkingStatisticsPage
    },
    {
        path: OWNER_PARKINGS_PAGE,
        Element: OwnerParkingsPage
    },
    {
      path: CREATE_RESERVATION_MODAL_PAGE,
      Element: CreateReservationModal
    },
    {
        path: PARKING_REGISTER_PAGE,
        Element: ParkingRegistrationPage
    },
    {
      path: PAYMENT_RESULT_ROUTE,
      Element: PaymentResultPage
    },
    {
        path: USER_RESERVATIONS_ROUTE,
        Element: UserReservationsPage
    },
    {
        path: BACKUP_ROUTE,
        Element: backupPage
    },
    {
        path: ADD_TARIFF_PLAN,
        Element: TariffPlanModal
    },
    {
        path: EDIT_TARIFF_PLAN,
        Element: TariffPlanModal
    },
    {
        path: ADD_VEHICLE_ROUTE,
        Element: VehicleModal
    },
    {
        path: EDIT_VEHICLE_ROUTE,
        Element: VehicleModal
    },
    {
        path: MAP_ROUTE,
        Element: MapPage
    },
    {
        path: FAVOURITE_PARKINGS_PAGE,
        Element: FavouriteParkingsPage
    },
    {
        path: SUBSCRIPTION_PAGE,
        Element: SubscriptionPage
    },
    {
        path:USER_MANAGEMENT_PAGE,
        Element: UserManagementPage
    },
    {
        path: TARIFF_PLANS_MANAGEMENT_PAGE,
        Element: TariffPlansAdminPage
    }
]
