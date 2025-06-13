import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiInfo, FiDollarSign, FiUpload, FiCheck } from 'react-icons/fi';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import apiService from "../api/apiService";
import { createParkingRequestModel } from "../api/models/parking/createParkingModels";
import '../styles/ParkingRegistrationPage.css';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const ParkingRegistrationPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Address: '',
        Name: '',
        Info: '',
        DynamicPricing: false,
        DemandFactor: 1.0,
    });
    const [coordinates, setCoordinates] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const handleMapClick = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setCoordinates({ lat, lng });
    }, []);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            if (!coordinates) throw new Error('Please select a location on the map');
            if (!photo) throw new Error('Parking photo is required');
            if (!formData.Address) throw new Error('Address is required');
            if (!formData.Name) throw new Error('Parking name is required');

            const token = localStorage.getItem('jwtToken');
            if (!token) throw new Error('Authentication required');

            const request = createParkingRequestModel(
                formData.Address,
                formData.Name,
                formData.Info,
                coordinates.lng,
                coordinates.lat,
                formData.DynamicPricing,
                formData.DemandFactor,
                photo
            );

            await apiService.createParking(request, token);

            setSuccessMessage('Parking registered successfully! Redirecting...');
            setTimeout(() => navigate('/owner-parkings'), 2000);
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to register parking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card fade-in">
                <h1 className="profile-title">
                    <FiMapPin size={24} />
                    Register New Parking
                </h1>

                <form className="parking-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-error">
                            <FiInfo size={18} />
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="alert alert-success">
                            <FiCheck size={18} />
                            {successMessage}
                        </div>
                    )}

                    <div className="form-group">
                        <label>
                            <FiMapPin size={16} />
                            Address *
                        </label>
                        <input
                            type="text"
                            value={formData.Address}
                            onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
                            placeholder="Enter parking address"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FiMapPin size={16} />
                            Parking Name *
                        </label>
                        <input
                            type="text"
                            value={formData.Name}
                            onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                            placeholder="Give your parking a name"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <FiInfo size={16} />
                            Description
                        </label>
                        <textarea
                            rows="4"
                            value={formData.Info}
                            onChange={(e) => setFormData({ ...formData, Info: e.target.value })}
                            placeholder="Additional information about your parking"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.DynamicPricing}
                                    onChange={(e) => setFormData({ ...formData, DynamicPricing: e.target.checked })}
                                />
                                <FiDollarSign size={16} />
                                Enable Dynamic Pricing
                            </label>
                        </div>

                        {formData.DynamicPricing && (
                            <div className="form-group">
                                <label>Demand Factor (1.0 - 3.0)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="3"
                                    step="0.1"
                                    value={formData.DemandFactor}
                                    onChange={(e) => setFormData({ ...formData, DemandFactor: parseFloat(e.target.value) })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiUpload size={16} />
                            Parking Photo *
                        </label>
                        <div className="photo-upload">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                id="photo-upload"
                            />
                            <label htmlFor="photo-upload" className="btn btn-secondary">
                                Choose File
                            </label>
                            {photo && <span>{photo.name}</span>}
                        </div>
                        {photoPreview && (
                            <div className="photo-preview">
                                <img src={photoPreview} alt="Parking preview" />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiMapPin size={16} />
                            Select Location on Map *
                        </label>
                        <div className="map-wrapper">
                            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                                <GoogleMap
                                    mapContainerStyle={{ height: '100%', width: '100%' }}
                                    center={coordinates || { lat: 50.4501, lng: 30.5234 }}
                                    zoom={14}
                                    onClick={handleMapClick}
                                >
                                    {coordinates && <Marker position={coordinates} />}
                                </GoogleMap>
                            </LoadScript>
                        </div>
                        {coordinates && (
                            <div className="coordinates-info">
                                Selected: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Registering...' : 'Register Parking'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ParkingRegistrationPage;
