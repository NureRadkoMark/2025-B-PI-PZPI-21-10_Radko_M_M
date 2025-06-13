import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {FiMail, FiLock, FiCode, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiX, FiEyeOff, FiEye} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../api/apiService';
import '../styles/PasswordRecoveryModal.css';
import {ModalWrapper} from "../components/ModalWrapper";

const PasswordRecoveryModal = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const codeRefs = useRef([]);
    const [codeValues, setCodeValues] = useState(Array(6).fill(''));
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (step === 2 && codeRefs.current[0]) {
            codeRefs.current[0].focus();
        }
    }, [step]);

    const handleSendCode = async (data) => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await apiService.passRecovery({ Email: data.email });
            setMessage('Verification code sent to your email');
            setEmail(data.email);
            setStep(2);
            setTimeout(() => setMessage(''), 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleResetPassword = async (data) => {
        const code = codeValues.join('');

        if (code.length !== 6) {
            console.log(code.length)
            setError('Please enter the full 6-digit code');
            return;
        }

        if (data.newPassword !== data.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            console.log(email, code, data.newPassword)
            const res = await apiService.passReset({
                Email: email,
                SecurityCode: code,
                NewPassword: data.newPassword,
            });

            setMessage('Password reset successfully! You can now login with your new password');
            setTimeout(() => onClose(), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeInput = (index, value) => {
        const newCodeValues = [...codeValues];
        newCodeValues[index] = value;
        setCodeValues(newCodeValues);

        if (value.length === 1 && index < 5) {
            codeRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && index > 0 && !e.target.value) {
            codeRefs.current[index - 1].focus();
        }
    };

    const handleBack = () => {
        setStep(1);
        setError('');
        setMessage('');
        setCodeValues(Array(6).fill(''));
    };

    return (
        <ModalWrapper onClose={onClose}>
        <div className="recovery-modal-container">
            <div className="recovery-modal-backdrop"></div>

            <motion.div
                className="recovery-modal-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="recovery-modal-header">
                    <h2 className="recovery-modal-title">
                        {step === 1 ? 'Password Recovery' : 'Reset Password'}
                    </h2>
                    <div className="recovery-modal-actions">
                        {step === 2 && (
                            <button className="recovery-back-button" onClick={handleBack}>
                                <FiArrowLeft size={20} />
                            </button>
                        )}
                        <button
                            className="recovery-close-button"
                            onClick={onClose}
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {(error || message) && (
                    <div className={`recovery-alert ${error ? 'error' : 'success'}`}>
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

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSubmit(handleSendCode)}
                            className="recovery-form"
                        >
                            <div className="input-group">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="recovery-input"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                />
                            </div>
                            {errors.email && (
                                <p className="input-error">{errors.email.message}</p>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary recovery-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner"></span>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSubmit(handleResetPassword)}
                            className="recovery-form"
                        >
                            <div className="code-section">
                                <div className="input-group">
                                    <FiCode className="input-icon" />
                                    <label className="code-label">Verification Code</label>
                                </div>
                                <div className="code-inputs">
                                    {Array.from({ length: 6 }, (_, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            maxLength={1}
                                            className="code-input"
                                            value={codeValues[i]}
                                            onChange={(e) => handleCodeInput(i, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(i, e)}
                                            ref={(el) => (codeRefs.current[i] = el)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="password-section">
                                <div className="input-group password-input-group">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="New password"
                                        className="recovery-input"
                                        {...register('newPassword', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 8,
                                                message: 'Password must be at least 8 characters',
                                            },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="input-error">{errors.newPassword.message}</p>
                                )}

                                <div className="input-group password-input-group">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        className="recovery-input"
                                        {...register('confirmPassword', {
                                            validate: (value) =>
                                                value === watch('newPassword') || 'Passwords do not match',
                                        })}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={toggleConfirmPasswordVisibility}
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="input-error">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary recovery-button"
                                disabled={loading}
                                onClick={handleResetPassword}
                            >
                                {loading ? (
                                    <span className="spinner"></span>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
        </ModalWrapper>
    );
};

export default PasswordRecoveryModal;

