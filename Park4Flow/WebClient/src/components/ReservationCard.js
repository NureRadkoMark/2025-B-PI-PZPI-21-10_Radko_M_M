import React from 'react';
import '../styles/ReservationCard.css';

const ReservationCard = ({ reservation, onClick }) => {
    const {
        Vehicle,
        ParkPlace,
        StartDate,
        Status,
    } = reservation;

    const formattedDate = new Date(StartDate).toLocaleString();

    return (
        <div className="reservation-card" onClick={onClick}>
            <img
                src={ParkPlace.Parking.PhotoImage}
                alt={ParkPlace.Parking.Name}
                className="parking-image"
            />
            <div className="reservation-info">
                <h3>{ParkPlace.Parking.Name}</h3>
                <p>
                    {Vehicle.VehicleBrand} {Vehicle.VehicleModel} - {Vehicle.StateNumber}
                </p>
                <p>Start: {formattedDate}</p>
                <p className={`status ${Status.toLowerCase()}`}>{Status}</p>
            </div>
        </div>
    );
};

export default ReservationCard;
