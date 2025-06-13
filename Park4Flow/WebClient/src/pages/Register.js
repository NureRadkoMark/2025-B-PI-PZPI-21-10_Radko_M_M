import React, { useState } from "react";
import { FiUser, FiMail, FiLock, FiPhone, FiDollarSign, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { registerRequestModel } from "../api/models/user/registerModels";
import ApiService from "../api/apiService";
import { getLocalizedString } from "../locale/lang";
import "../styles/Register.css";

const RegisterPage = () => {
    const navigate = useNavigate();
    const preferredLang = localStorage.getItem('language') || 'en';
    const [form, setForm] = useState({
        Email: "",
        Password: "",
        FirstName: "",
        SecondName: "",
        PhoneNumber: "",
        Currency: "USD",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const request = registerRequestModel(
                form.Email,
                form.Password,
                form.FirstName,
                form.SecondName,
                form.PhoneNumber,
                form.Currency
            );

            const response = await ApiService.register(request);

            if (response.error) {
                throw new Error(response.error);
            }

            setMessage(getLocalizedString(preferredLang, 'RegistrationSuccess'));
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
            setError(getLocalizedString(preferredLang, errorMessage));
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const fieldConfig = [
        {
            name: "FirstName",
            label: "FirstName",
            icon: <FiUser />,
            type: "text"
        },
        {
            name: "SecondName",
            label: "LastName",
            icon: <FiUser />,
            type: "text"
        },
        {
            name: "Email",
            label: "Email",
            icon: <FiMail />,
            type: "email"
        },
        {
            name: "PhoneNumber",
            label: "PhoneNumber",
            icon: <FiPhone />,
            type: "tel"
        },
        {
            name: "Password",
            label: "Password",
            icon: <FiLock />,
            type: showPassword ? "text" : "password",
            minLength: 8,
            showToggle: true
        },
        {
            name: "Currency",
            label: "Currency",
            icon: <FiDollarSign />,
            type: "select",
            options: ["USD", "EUR", "UAH"]
        }
    ];

    return (
        <div className="register-page-container">
            <motion.div
                className="register-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="register-header">
                    <h2>{getLocalizedString(preferredLang, 'Register')}</h2>
                </div>

                {(error || message) && (
                    <div className={`register-alert ${error ? 'error' : 'success'}`}>
                        {error ? (
                            <>
                                <FiAlertCircle size={18} />
                                <span>{error}</span>
                            </>
                        ) : (
                            <>
                                <FiCheckCircle size={18} />
                                <span>{message}</span>
                            </>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                    {fieldConfig.map((field) => (
                        <div key={field.name} className="input-group">
                            <label htmlFor={field.name} className="input-label">
                                {getLocalizedString(preferredLang, field.label)}
                            </label>

                            <div className="input-wrapper">
                                <span className="input-icon">{field.icon}</span>
                                {field.type === "select" ? (
                                    <select
                                        name={field.name}
                                        id={field.name}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        className="register-input"
                                        required
                                    >
                                        {field.options.map(option => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <>
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            id={field.name}
                                            value={form[field.name]}
                                            onChange={handleChange}
                                            className="register-input"
                                            required
                                            minLength={field.minLength}
                                            placeholder={getLocalizedString(preferredLang, field.label)}
                                        />
                                        {field.showToggle && (
                                            <button
                                                type="button"
                                                className="toggle-password-btn"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    <button
                        type="submit"
                        className="btn btn-primary register-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="spinner"></div>
                        ) : (
                            getLocalizedString(preferredLang, 'Register')
                        )}
                    </button>
                </form>

                <div className="register-footer">
                    <span>{getLocalizedString(preferredLang, 'AlreadyHaveAccount')}</span>
                    <Link to="/login" className="login-link">
                        {getLocalizedString(preferredLang, 'LoginHere')}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;