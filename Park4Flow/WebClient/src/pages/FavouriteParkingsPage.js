import React, { useEffect, useState, useCallback } from 'react';
import { FiTrash2, FiStar, FiMapPin, FiInfo } from 'react-icons/fi';
import apiService from "../api/apiService";
import { deleteFavouriteParkingRequestModel } from "../api/models/favouriteParking/favouriteParkingModels";
import '../styles/FavouriteParkingsPage.css';

const FavouriteParkingsPage = () => {
    const [favourites, setFavourites] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFavourites = useCallback(async () => {
        const storedToken = localStorage.getItem('jwtToken');
        if (!storedToken) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await apiService.getFavouriteParking(storedToken);
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }
            setFavourites(data);
        } catch (err) {
            console.error('Error fetching favourites:', err);
            setError(err.message || 'Failed to load favourite parkings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavourites();
    }, [fetchFavourites]);

    const handleSelectParking = (parkingID) => {
        setSelectedId(parkingID);
        // Дополнительная логика при выборе парковки
    };

    const handleDeleteParking = async (parkingIDToDelete, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to remove this parking from favourites?')) return;

        const storedToken = localStorage.getItem('jwtToken');
        if (!storedToken) {
            setError('Authentication required');
            return;
        }

        try {
            const deleteRequest = deleteFavouriteParkingRequestModel(parkingIDToDelete);
            await apiService.deleteFavouriteParking(storedToken, deleteRequest);

            setFavourites(prev => prev.filter(p => p.ParkingID !== parkingIDToDelete));
            if (selectedId === parkingIDToDelete) {
                setSelectedId(null);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert(`Failed to delete: ${error.message || 'Unknown error'}`);
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your favourites...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">
                    <h3>Error loading favourites</h3>
                    <p>{error}</p>
                    <button
                        className="btn btn-primary"
                        onClick={fetchFavourites}
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
                <div className="vehicles-header">
                    <h1 className="profile-title">
                        <FiStar size={24} />
                        Favourite Parkings
                    </h1>
                </div>

                <div className="vehicles-grid">
                    {favourites.length === 0 ? (
                        <div className="no-items">
                            <p>You don't have any favourite parkings yet</p>
                        </div>
                    ) : (
                        favourites.map((parking) => (
                            <div
                                key={parking.ParkingID}
                                className={`parking-card ${parking.ParkingID === selectedId ? "selected" : ""}`}
                                onClick={() => handleSelectParking(parking.ParkingID)}
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
                                    <div className={`parking-status ${parking.IsActive ? "active" : "inactive"}`}>
                                        {parking.IsActive ? "Available" : "Unavailable"}
                                    </div>
                                </div>
                                <div className="parking-actions">
                                    <button
                                        className="btn btn-secondary btn-small"
                                        onClick={(e) => handleDeleteParking(parking.ParkingID, e)}
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavouriteParkingsPage;
