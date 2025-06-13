import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiHome,
    FiMap,
    FiCalendar,
    FiUser,
    FiBell,
    FiStar,
    FiCreditCard,
    FiDatabase,
    FiUsers,
    FiDollarSign,
    FiLogOut,
    FiGlobe
} from 'react-icons/fi';
import { getLocalizedString } from "../locale/lang";
import '../styles/NavBar.css';

const NavBar = () => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'ua');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const preferredLang = language;
    const storedToken = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('Role');
    const isAuthenticated = !!storedToken;
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
        window.location.reload();
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('Role');
        if (window.location.pathname !== '/home') {
            window.location.href = '/home';
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const renderNavItems = () => {
        if (!isAuthenticated) {
            return (
                <div className="auth-buttons">
                    <button
                        className="btn btn-outline"
                        onClick={() => {
                            setIsMenuOpen(false);
                            navigate('/register');
                        }}
                    >
                        {getLocalizedString(preferredLang, "Register")}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setIsMenuOpen(false);
                            navigate('/login');
                        }}
                    >
                        {getLocalizedString(preferredLang, "Login")}
                    </button>
                </div>
            );
        }

        const commonDriverOwnerItems = [
            { to: "/map", icon: <FiMap />, text: "Map" },
            { to: "/bookings", icon: <FiCalendar />, text: "MyBookings" },
            { to: "/profile", icon: <FiUser />, text: "Profile" },
            { to: "/notifications", icon: <FiBell />, text: "Notifications" },
            { to: "/favorite-parkings", icon: <FiStar />, text: "FavoriteParkings" },
            { to: "/subscription-page", icon: <FiCreditCard />, text: "Subscription" }
        ];

        switch (role) {
            case 'driver':
                return (
                    <>
                        {commonDriverOwnerItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.to}
                                className="nav-link"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {getLocalizedString(preferredLang, item.text)}
                            </Link>
                        ))}
                    </>
                );
            case 'manager':
                return (
                    <Link
                        to="/parking"
                        className="nav-link"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <span className="nav-icon"><FiUser /></span>
                        {getLocalizedString(preferredLang, "ParkingManagement")}
                    </Link>
                );
            case 'owner':
                return (
                    <>
                        <Link
                            to="/my-parkings"
                            className="nav-link"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="nav-icon"><FiHome /></span>
                            {getLocalizedString(preferredLang, "MyParkings")}
                        </Link>
                        {commonDriverOwnerItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.to}
                                className="nav-link"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {getLocalizedString(preferredLang, item.text)}
                            </Link>
                        ))}
                    </>
                );
            case 'admin':
                return (
                    <>
                        <Link
                            to="/backup"
                            className="nav-link"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="nav-icon"><FiDatabase /></span>
                            {getLocalizedString(preferredLang, "Backup")}
                        </Link>
                        <Link
                            to="/user-manage"
                            className="nav-link"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="nav-icon"><FiUsers /></span>
                            {getLocalizedString(preferredLang, "ManageUsers")}
                        </Link>
                        <Link
                            to="/tariff-plans"
                            className="nav-link"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="nav-icon"><FiDollarSign /></span>
                            {getLocalizedString(preferredLang, "TariffPlans")}
                        </Link>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/home" className="logo-link">
                        <span className="logo-text">Park4Flow</span>
                    </Link>
                </div>

                <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    {renderNavItems()}

                    <div className="language-dropdown">
                        <button className="language-btn">
                            <FiGlobe className="language-icon" />
                            {language === 'ua' ? 'UA' : 'EN'}
                        </button>
                        <div className="language-dropdown-content">
                            <button onClick={() => handleLanguageChange('ua')}>Українська</button>
                            <button onClick={() => handleLanguageChange('en')}>English</button>
                        </div>
                    </div>

                    {isAuthenticated && (
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            <FiLogOut className="logout-icon" />
                            {getLocalizedString(preferredLang, "Logout") || "Logout"}
                        </button>
                    )}
                </div>

                <button
                    className="hamburger-menu"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
                    <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
                    <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
                </button>
            </div>
        </nav>
    );
};

export default NavBar;