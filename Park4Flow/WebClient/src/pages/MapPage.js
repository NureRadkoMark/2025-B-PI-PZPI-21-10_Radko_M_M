import React, { useEffect, useState, useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { createFavouriteParkingRequestModel } from "../api/models/favouriteParking/favouriteParkingModels";
import apiService from "../api/apiService";
import CreateReservationModal from '../pages/CreateReservationModal';
import {
    FiHeart,
    FiNavigation,
    FiClock,
    FiDollarSign,
    FiTrendingUp,
    FiAlertCircle,
    FiLoader
} from 'react-icons/fi';
import { FaParking } from 'react-icons/fa';
import '../styles/MapPage.css';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const defaultCenter = { lat: 47.249912, lng: 39.697196 };
const containerStyle = {
    width: "100%",
    height: "95vh"
};

const MapPage = () => {
    const [center, setCenter] = useState(defaultCenter);
    const [userLocation, setUserLocation] = useState(null);
    const [parkings, setParkings] = useState([]);
    const [selectedParking, setSelectedParking] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [error, setError] = useState(null);
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const token = localStorage.getItem("jwtToken");
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [parkingID, setParkingID] = useState(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        const fallbackCenter = { lat: 50.4501, lng: 30.5234 };

        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userPos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        setUserLocation(userPos);
                        setCenter(userPos);
                    },
                    (err) => {
                        console.warn("Geo error:", err);
                        setCenter(fallbackCenter);
                    }
                );
            } else {
                setCenter(fallbackCenter);
            }
        };

        const fetchParkings = async () => {
            try {
                const response = await apiService.getUserParkingList(token);
                setParkings(response);
            } catch (err) {
                console.error("Parking fetch error", err);
                setError("Could not load parking lots");
            }
        };

        getLocation();
        fetchParkings();
    }, [token]);

    const handleMarkerClick = useCallback(async (parking) => {
        setSelectedParking(parking);
        setLoadingFavorites(true);
        try {
            const favorites = await apiService.getFavouriteParking(token);
            const favoriteIds = favorites.map(fav => fav.ParkingID);
            setIsFavorite(favoriteIds.includes(parking.ParkingID));
        } catch (err) {
            console.error("Error checking favorites:", err);
            setIsFavorite(false);
        } finally {
            setLoadingFavorites(false);
        }
    }, [token]);

    const handleInfoClose = () => {
        setSelectedParking(null);
        setIsFavorite(false);
    };

    const handleAddToFavorites = async () => {
        if (!selectedParking) return;

        try {
            const request = createFavouriteParkingRequestModel(selectedParking.ParkingID);

            if (isFavorite) {
                await apiService.deleteFavouriteParking(token, request);
                setIsFavorite(false);
            } else {
                await apiService.createFavouriteParking(token, request);
                setIsFavorite(true);
            }
        } catch (err) {
            console.error("Favorites error:", err);
            alert(`Failed to ${isFavorite ? 'remove from' : 'add to'} favorites`);
        }
    };

    const handleReservationSuccess = (reservationData) => {
        console.log('Reservation created:', reservationData);
        // Можно обновить список бронирований или показать уведомление
    };

    const handleNavigate = () => {
        if (!selectedParking) return;
        const lat = parseFloat(selectedParking.Latitude);
        const lng = parseFloat(selectedParking.Longitude);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    };

    const handleReserve = () => {
        if (!selectedParking) return;
        setParkingID(selectedParking.ParkingID);
        setShowReservationModal(true);
    };

    if (loadError) {
        return (
            <div className="map-container">
                <div className="map-message error-message">
                    <FiAlertCircle size={24} className="mb-2" />
                    <p>Google Maps failed to load</p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="map-container">
                <div className="map-message loading-message">
                    <FiLoader size={24} className="mb-2 animate-spin" />
                    <p>Loading Google Maps...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="map-container">
                <div className="map-message error-message">
                    <FiAlertCircle size={24} className="mb-2" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="map-container">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false
                }}
            >
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={{
                            url: "/icons/user-location.png",
                            scaledSize: new window.google.maps.Size(30, 30),
                        }}
                    />
                )}

                {parkings.map((p) => {
                    const lat = parseFloat(p.Latitude);
                    const lng = parseFloat(p.Longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                        <Marker
                            key={p.ParkingID}
                            position={{ lat, lng }}
                            icon={{
                                url: isFavorite && selectedParking?.ParkingID === p.ParkingID
                                    ? "/icons/parking-marker-favorite.png"
                                    : "/icons/parking-marker.png",
                                scaledSize: new window.google.maps.Size(40, 40),
                            }}
                            onClick={() => handleMarkerClick(p)}
                            title={p.Name}
                            className="marker-icon"
                        />
                    );
                })}

                {selectedParking && (
                    <InfoWindow
                        position={{
                            lat: parseFloat(selectedParking.Latitude),
                            lng: parseFloat(selectedParking.Longitude),
                        }}
                        onCloseClick={handleInfoClose}
                    >
                        <div className="info-window fade-in">
                            <div className="info-window-header">
                                <FaParking className="inline mr-2" />
                                {selectedParking.Name}
                            </div>
                            <div className="info-window-content">
                                <div className="info-window-image-container">
                                    <img
                                        src={selectedParking.PhotoImage || "/placeholder-parking.jpg"}
                                        alt={selectedParking.Name}
                                        className="info-window-image"
                                        onError={(e) => {
                                            e.target.src = "/placeholder-parking.jpg";
                                        }}
                                    />
                                </div>
                                <div className="info-window-details-container">
                                    <div className="info-window-details">
                                        <div className="info-window-detail">
                                            <FaParking size={14} className="mr-2" />
                                            <span>00:00 - 23:50</span>
                                        </div>

                                        <div className="info-window-detail">
                                            <FiDollarSign size={14} className="mr-2" />
                                            <span>Dynamic Pricing: {selectedParking.DynamicPricing ? 'Enabled' : 'Disabled'}</span>
                                        </div>

                                        <div className="info-window-detail">
                                            <FiTrendingUp size={14} className="mr-2" />
                                            <span>Demand Factor: {selectedParking.DemandFactor}</span>
                                        </div>
                                    </div>

                                    <div className="info-window-actions">
                                        <button
                                            className={`info-window-button ${
                                                isFavorite
                                                    ? 'info-window-button-danger'
                                                    : 'info-window-button-secondary'
                                            }`}
                                            onClick={handleAddToFavorites}
                                            disabled={loadingFavorites}
                                        >
                                            <FiHeart className="mr-2" />
                                            {loadingFavorites ? 'Loading...' :
                                                isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                                        </button>

                                        <button
                                            className="info-window-button info-window-button-primary"
                                            onClick={handleReserve}
                                        >
                                            Reserve Spot
                                        </button>

                                        <button
                                            className="info-window-button info-window-button-secondary"
                                            onClick={handleNavigate}
                                        >
                                            <FiNavigation className="mr-2" />
                                            Navigate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
            {/* Модалка */}
            {showReservationModal && (
                <CreateReservationModal
                    parkingID={parkingID}
                    onClose={() => setShowReservationModal(false)}
                    onReservationSuccess={handleReservationSuccess}
                />
            )}
        </div>
    );
};

export default MapPage;





