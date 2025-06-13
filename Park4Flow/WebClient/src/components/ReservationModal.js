import React from 'react';
import '../styles/ReservationModal.css';

const ReservationModal = ({ reservation, onClose }) => {
    const {
        Vehicle,
        ParkPlace,
        StartDate,
        EndDate,
        Status,
    } = reservation;

    const formattedStartDate = new Date(StartDate).toLocaleString();
    const formattedEndDate = new Date(EndDate).toLocaleString();

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Reservation Details</h2>
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <div className="modal-section">
                    <h3>Vehicle Information</h3>
                    <p>Brand: {Vehicle.VehicleBrand}</p>
                    <p>Model: {Vehicle.VehicleModel}</p>
                    <p>State Number: {Vehicle.StateNumber}</p>
                </div>
                <div className="modal-section">
                    <h3>Parking Information</h3>
                    <p>Name: {ParkPlace.Parking.Name}</p>
                    <p>Address: {ParkPlace.Parking.Address}</p>
                </div>
                <div className="modal-section">
                    <h3>Reservation Timing</h3>
                    <p>Start: {formattedStartDate}</p>
                    <p>End: {formattedEndDate}</p>
                </div>
                <div className="modal-section">
                    <h3>Status</h3>
                    <p className={`status ${Status.toLowerCase()}`}>{Status}</p>
                </div>
            </div>
        </div>
    );
};

export default ReservationModal;
