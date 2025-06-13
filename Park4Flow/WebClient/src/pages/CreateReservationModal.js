import React, { useState } from 'react';
import { FiClock, FiCheckCircle, FiAlertCircle, FiX, FiCreditCard } from 'react-icons/fi';
import { createReservationRequestModel } from "../api/models/reservation/createReservationModels";
import apiService from "../api/apiService";
import {ModalWrapper} from "../components/ModalWrapper";
import PaymentModal from "../pages/PaymentModal";
import '../styles/CreateReservationModal.css';

export default function CreateReservationModal({ parkingID, onClose, onReservationSuccess }) {
    const token = localStorage.getItem('jwtToken');
    const vehicleID = localStorage.getItem('selectedVehicleID');

    const [formData, setFormData] = useState({
        startTime: '',
        endTime: ''
    });
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const validate = () => {
        if (!formData.startTime || !formData.endTime) {
            return 'Please select both start and end times';
        }

        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        const now = new Date();

        if (start >= end) {
            return 'End time must be after start time';
        }
        if (start < now) {
            return 'Start time cannot be in the past';
        }
        if (!vehicleID || vehicleID === '-1') {
            return 'Please select a vehicle in your profile';
        }
        if (!parkingID) {
            return 'Parking information is missing';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessData(null);

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsSubmitting(true);
            const request = createReservationRequestModel(
                parkingID,
                vehicleID,
                formData.startTime,
                formData.endTime
            );

            const response = await apiService.createReservation(token, request);
            setSuccessData(response);

            // Сохраняем reservationID в localStorage для использования при оплате
            localStorage.setItem('reservationID', response.reservationID);
            localStorage.setItem('amount', response.price);
            localStorage.setItem('Currency', response.currency);

            if (onReservationSuccess) {
                onReservationSuccess(response);
            }

        } catch (err) {
            console.error('Reservation error:', err);
            setError(err.response?.data?.message ||
                'Failed to create reservation. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePaymentClick = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentClose = () => {
        setShowPaymentModal(false);
        // Закрываем модалку бронирования после оплаты
        if (onClose) onClose();
    };

    return (
        <>
            <ModalWrapper onClose={onClose}>
                <div className="reservation-modal">
                    <div className="modal-header">
                        <h2>
                            <FiClock size={24} />
                            Reserve Parking Spot
                        </h2>
                        <button className="close-btn" onClick={onClose}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="alert alert-error">
                                <FiAlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {successData ? (
                            <div className="reservation-success">
                                <div className="alert alert-success">
                                    <FiCheckCircle size={18} />
                                    {successData.message}
                                </div>
                                <div className="reservation-details">
                                    <p><strong>Reservation ID:</strong> {successData.reservationID}</p>
                                    <p><strong>Total Price:</strong> {successData.price} {successData.currency}</p>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary payment-btn"
                                    onClick={handlePaymentClick}
                                >
                                    <FiCreditCard size={16} />
                                    Proceed to Payment
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>
                                        <FiClock size={16} />
                                        Start Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <FiClock size={16} />
                                        End Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        min={formData.startTime || new Date().toISOString().slice(0, 16)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </ModalWrapper>

            {showPaymentModal && (
                <PaymentModal
                    type="payment"
                    onClose={handlePaymentClose}
                />
            )}
        </>
    );
}
