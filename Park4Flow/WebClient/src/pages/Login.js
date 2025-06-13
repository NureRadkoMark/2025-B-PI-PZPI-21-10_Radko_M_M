import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {FiMail, FiLock, FiLogIn, FiUserPlus, FiAlertCircle, FiEyeOff, FiEye} from 'react-icons/fi';
import { motion } from 'framer-motion';
import apiService from '../api/apiService';
import { getLocalizedString } from '../locale/lang';
import { loginRequestModel } from "../api/models/user/loginModels";
import PasswordRecoveryModal from "./PassRecoveryModal";
import '../styles/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const preferredLang = localStorage.getItem('language') || 'en';
    const [formData, setFormData] = useState({
        Email: '',
        Password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRecovery, setShowRecovery] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const requestModel = loginRequestModel(formData.Email, formData.Password);
            const response = await apiService.login(requestModel);

            if (response.error) {
                throw new Error(response.error);
            }

            const token = response.token;
            const userDetails = await apiService.getUserDetails(token);

            localStorage.setItem('jwtToken', token);
            localStorage.setItem('Role', userDetails.Role);
            localStorage.setItem('Currency', userDetails.Currency)

            setFormData({ Email: '', Password: '' });
            window.location.href = '/home';
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Login failed';
            setError(getLocalizedString(preferredLang, errorMessage));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="login-header">
                    <h2>{getLocalizedString(preferredLang, 'Login')}</h2>
                </div>

                {error && (
                    <div className="login-error-alert">
                        <FiAlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            name="Email"
                            placeholder={getLocalizedString(preferredLang, 'Email')}
                            value={formData.Email}
                            onChange={handleChange}
                            required
                            className="login-input"
                        />
                    </div>

                    <div className="input-group password-input-group">
                        <FiLock className="input-icon" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="Password"
                            placeholder={getLocalizedString(preferredLang, 'Password')}
                            value={formData.Password}
                            onChange={handleChange}
                            required
                            className="login-input"
                            minLength="6"
                        />
                        <button
                            type="button"
                            className="toggle-password-btn"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                    </div>

                    <div className="login-options">
                        <button
                            type="button"
                            className="forgot-password-btn"
                            onClick={() => setShowRecovery(true)}
                        >
                            {getLocalizedString(preferredLang, 'ForgotPassword')}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="spinner"></div>
                        ) : (
                            <>
                                <FiLogIn size={18} />
                                {getLocalizedString(preferredLang, 'SignIn')}
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <span>{getLocalizedString(preferredLang, 'NoAccount')}</span>
                    <Link to="/register" className="register-link">
                        <FiUserPlus size={16} />
                        {getLocalizedString(preferredLang, 'RegisterHere')}
                    </Link>
                </div>
            </motion.div>

            {showRecovery && (
                <PasswordRecoveryModal onClose={() => setShowRecovery(false)} />
            )}
        </div>
    );
};

export default Login;