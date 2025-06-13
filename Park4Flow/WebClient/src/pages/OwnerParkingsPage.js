import React, { useEffect, useState, useCallback } from 'react';
import { FiMapPin, FiInfo, FiDollarSign, FiActivity, FiPlus } from 'react-icons/fi';
import {FaParking} from 'react-icons/fa';
import apiService from '../api/apiService';
import { useNavigate } from 'react-router-dom';
import '../styles/OwnerParkingsPage.css';

const OwnerParkingsPage = () => {
    const [parkings, setParkings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchOwnerParkings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                throw new Error('Authentication required');
            }

            const data = await apiService.getOwnersParkings(token);
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }
            setParkings(data);
        } catch (err) {
            console.error('Failed to load owner parkings:', err);
            setError(err.message || 'Failed to load parkings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOwnerParkings();
    }, [fetchOwnerParkings]);

    const handleCardClick = (id) => {
        localStorage.setItem("ParkingID", id);
        navigate('/parking-manage');
    };

    const handleAddParking = () => {
        window.location.href = '/register-parking';
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your parkings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">
                    <h3>Error loading parkings</h3>
                    <p>{error}</p>
                    <button
                        className="btn btn-primary"
                        onClick={fetchOwnerParkings}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-card fade-in">
                <div className="parkings-header">
                    <h1 className="profile-title">
                        <FaParking size={24} />
                        Your Parkings
                    </h1>
                    <button
                        className="btn btn-primary btn-small"
                        onClick={handleAddParking}
                    >
                        <FiPlus size={16} />
                        Add Parking
                    </button>
                </div>

                <div className="parkings-grid">
                    {parkings.length === 0 ? (
                        <div className="no-parkings">
                            <p>You don't have any parkings yet</p>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddParking}
                            >
                                <FiPlus size={16} />
                                Add Your First Parking
                            </button>
                        </div>
                    ) : (
                        parkings.map((parking) => (
                            <div
                                key={parking.ParkingID}
                                className="parking-card"
                                onClick={() => handleCardClick(parking.ParkingID)}
                            >
                                <img
                                    className="parking-image"
                                    src={parking.PhotoImage || "/placeholder-parking.png"}
                                    alt={parking.Name || "Parking"}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder-parking.png";
                                    }}
                                />
                                <div className="parking-body">
                                    <h3 className="parking-title">
                                        {parking.Name || "Unnamed Parking"}
                                    </h3>
                                    <div className="parking-details">
                                        <p className="parking-detail">
                                            <FiMapPin size={14} />
                                            {parking.Address || "No address available"}
                                        </p>
                                        {parking.Info && (
                                            <p className="parking-detail">
                                                <FiInfo size={14} />
                                                {parking.Info}
                                            </p>
                                        )}
                                        <div className="parking-features">
                                            <span className={`feature-tag ${parking.IsActive ? 'active' : 'inactive'}`}>
                                                {parking.IsActive ? "Active" : "Inactive"}
                                            </span>
                                            <span className={`feature-tag ${parking.DynamicPricing ? 'enabled' : 'disabled'}`}>
                                                <FiDollarSign size={12} />
                                                {parking.DynamicPricing ? "Dynamic" : "Fixed"}
                                            </span>
                                            {parking.DynamicPricing && (
                                                <span className="feature-tag demand">
                                                    <FiActivity size={12} />
                                                    Demand: {parking.DemandFactor}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerParkingsPage;
