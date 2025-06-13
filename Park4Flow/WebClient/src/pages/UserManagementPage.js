import React, { useState } from 'react';
import { FiSearch, FiUser, FiMail, FiPhone, FiShield, FiBriefcase, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import moment from 'moment';
import { banUserRequestModel } from "../api/models/user/banUserModels";
import apiService from "../api/apiService";
import "../styles/UserManagementPage.css";

const UserManagementPage = () => {
    const [email, setEmail] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const token = localStorage.getItem("jwtToken");

    const handleSearch = async () => {
        setError('');
        setMessage('');
        setUser(null);

        if (!email.trim()) {
            setError('Please enter a valid email address');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email format');
            return;
        }

        setLoading(true);
        try {
            const result = await apiService.getUserByEmail(email, token);
            if (!result) {
                setError('User not found');
                return;
            }
            setUser(result);
            setMessage('User found successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch user data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBanUnban = async () => {
        if (!user) return;

        setActionLoading(true);
        setError('');
        setMessage('');

        try {
            const action = user.IsBanned ? 'unban' : 'ban';
            const confirmMessage = `Are you sure you want to ${action} this user?`;

            if (!window.confirm(confirmMessage)) {
                setActionLoading(false);
                return;
            }

            const response = user.IsBanned
                ? await apiService.unbanUser(banUserRequestModel(user.UserID), token)
                : await apiService.banUser(banUserRequestModel(user.UserID), token);

            setUser({ ...user, IsBanned: !user.IsBanned });
            setMessage(response.Message || `User ${action}ned successfully.`);
            setTimeout(() => setMessage(''), 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user status. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="management-container">
            <div className="management-card fade-in">
                <h1 className="management-title">
                    <FiShield size={24} />
                    User Management
                </h1>

                <div className="search-section">
                    <div className="input-group">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter user email..."
                            className="management-input"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        <FiSearch size={16} />
                        {loading ? 'Searching...' : 'Search User'}
                    </button>
                </div>

                {(error || message) && (
                    <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                        {error ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />}
                        <span>{error || message}</span>
                    </div>
                )}

                {user && (
                    <div className="user-details-card">
                        <div className="user-header">
                            <div className="user-avatar">
                                <FiUser size={40} />
                            </div>
                            <div className="user-info">
                                <h2>{user.FirstName} {user.SecondName}</h2>
                                <p className="user-email">{user.Email}</p>
                            </div>
                            <div className={`user-status ${user.IsBanned ? 'banned' : 'active'}`}>
                                {user.IsBanned ? 'Banned' : 'Active'}
                            </div>
                        </div>

                        <div className="user-details-grid">
                            <div className="detail-item">
                                <FiPhone className="detail-icon" />
                                <div>
                                    <p className="detail-label">Phone</p>
                                    <p className="detail-value">{user.PhoneNumber || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FiShield className="detail-icon" />
                                <div>
                                    <p className="detail-label">Role</p>
                                    <p className="detail-value">{user.Role}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FiBriefcase className="detail-icon" />
                                <div>
                                    <p className="detail-label">Business Account</p>
                                    <p className="detail-value">{user.IsBusiness ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div>
                                    <p className="detail-label">Registration Date</p>
                                    <p className="detail-value">
                                        {moment(user.RegistrationDate).format('MMMM Do YYYY')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button
                                className={`btn ${user.IsBanned ? 'btn-success' : 'btn-warning'}`}
                                onClick={handleBanUnban}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Processing...' : user.IsBanned ? 'Unban User' : 'Ban User'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagementPage;