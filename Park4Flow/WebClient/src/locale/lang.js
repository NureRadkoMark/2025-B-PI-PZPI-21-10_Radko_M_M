const languages = {
    ua: {

    },

    en: {
        "Register": "Register",
        "Login": "Login",
        "Backup": "Backup",
        "tariffPlans": "Tariff plans",
        "Map": "Map",
        "MyBookings": "My Bookings",
        "Profile": "Profile",
        "MyVehicles": "My Vehicles",
        "Notifications": "Notifications",
        "FavoriteParkings": "Favorite Parkings",
        "Subscription": "Subscription",
        "ParkingManagement": "Parking Management",
        "MyParkings": "My Parkings",
        "ParkingAdminPanel": "Parking Admin Panel",
        "RegisterParking": "Register Parking",
        "RegisterManager": "Register Manager",
        "ManageUsers": "Users Management",
        "FollowUs": "Follow us",
        "UsefulLinks": "Useful Links",
        "PrivacyPolicy": "Privacy Policy",
        "TermsOfUse": "Terms of Use",
        "FAQ": "FAQ",
        "Support": "Support",
        "ContactUs": "Contact Us",
        "About": "About Park4Flow",
        "ReportProblem": "Report a Problem",
        "CreatedBy": "Created by",
        "SupportEmail": "Support",
        "Email": "Email",
        "Password": "Password",
        "SignIn": "Sign In",
        "NoAccount": "Don't have an account?",
        "RegisterHere": "Register here",
        "ForgotPassword": "Forgot password?",
        "LoginSuccess": "Login successful",
        "LoginFailed": "Login failed",
        "Email or password not provided": "Email or password not provided",
        "Server error": "Server error",
        "Unauthorized": "Unauthorized access"
    },

    de: {

    },

    fr: {

    }
}
function getLocalizedString(language, key) {
    const selectedLanguage = languages[language] || languages.en;
    return selectedLanguage[key] || key;
}

module.exports = {
    getLocalizedString
};