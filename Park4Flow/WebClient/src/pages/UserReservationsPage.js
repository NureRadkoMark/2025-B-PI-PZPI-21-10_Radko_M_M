import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    FiCalendar,
    FiClock,
    FiFilter,
    FiArrowUp,
    FiArrowDown,
    FiX,
    FiRefreshCw,
    FiAlertTriangle,
    FiMapPin
} from 'react-icons/fi';
import {
    FaCar
} from 'react-icons/fa';
import apiService from '../api/apiService';
import ReservationModal from '../components/ReservationModal';
import '../styles/UserReservationsPage.css';
import {skipReservationRequestModel} from "../api/models/reservation/skipReservationModels";

const ReservationCard = ({ reservation, onClick, onCancel }) => {
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState(null);

    const handleCancel = async (e) => {
        e.stopPropagation();

        if (!window.confirm(
            `Are you sure you want to cancel this reservation?\n\n` +
            `Note: According to our cancellation policy, you may not receive a full refund. ` +
            `A cancellation fee might be applied.`
        )) return;

        try {
            setCancelling(true);
            setCancelError(null);

            console.log(reservation.ReservationID)
            const response = await apiService.skipReservation(
                reservation.ReservationID
            );

            if (response.refundAmount !== undefined) {
                alert(
                    `Reservation cancelled successfully.\n\n` +
                    `Refund amount: ${response.refundAmount} ${reservation.ParkPlace.Currency}\n` +
                    `Cancellation fee: ${response.feeAmount} ${reservation.ParkPlace.Currency}`
                );
            } else {
                alert('Reservation cancelled successfully');
            }

            if (onCancel) onCancel(reservation.ReservationID);
        } catch (error) {
            console.error('Cancellation error:', error);
            setCancelError(error.message || 'Failed to cancel reservation');
        } finally {
            setCancelling(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    };

    return (
        <div className="user-reservations-page">
        <div className="reservation-card" onClick={onClick}>
            <div className="reservation-images">
                <div className="parking-image-container">
                    <img
                        src={reservation.ParkPlace?.Parking?.PhotoImage}
                        alt="Parking"
                        className="parking-image"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Parking';
                        }}
                    />
                </div>
                <div className="vehicle-image-container">
                    <img
                        src={reservation.Vehicle?.FrontPhotoImage}
                        alt="Vehicle"
                        className="vehicle-image"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Vehicle';
                        }}
                    />
                </div>
            </div>

            <div className="reservation-content">
                <div className="reservation-header">
                    <h3>{reservation.ParkPlace?.Parking?.Name || "Unknown Parking"}</h3>
                    <span className={`reservation-status ${reservation.Status}`}>
                        {reservation.Status}
                    </span>
                </div>

                <div className="reservation-details">
                    <div className="detail-row">
                        <FiCalendar className="detail-icon" />
                        <span>{formatDate(reservation.StartTime)}</span>
                        <span className="time-range">
                            {formatTime(reservation.StartTime)} - {formatTime(reservation.EndTime)}
                        </span>
                    </div>

                    <div className="detail-row">
                        <FiMapPin className="detail-icon" />
                        <span>{reservation.ParkPlace?.Parking?.Address || "No address"}</span>
                    </div>

                    <div className="detail-row">
                        <FaCar className="detail-icon" />
                        <span>
                            {reservation.Vehicle?.VehicleBrand} {reservation.Vehicle?.VehicleModel}
                            ({reservation.Vehicle?.StateNumber || "No plate"})
                        </span>
                    </div>

                    <div className="price-row">
                        <span className="price-label">Total:</span>
                        <span className="price-amount">
                            {reservation.ParkPlace?.CurrentPrice || reservation.ParkPlace?.BasePrice}
                            {reservation.ParkPlace?.Currency}
                        </span>
                    </div>
                </div>

                {reservation.Status === 'active' && (
                    <div className="reservation-actions">
                        <button
                            className={`btn btn-danger btn-small ${cancelling ? 'btn-disabled' : ''}`}
                            onClick={handleCancel}
                            disabled={cancelling}
                        >
                            {cancelling ? (
                                <><FiRefreshCw className="spinner-icon" /> Cancelling...</>
                            ) : (
                                <><FiX size={14} /> Cancel</>
                            )}
                        </button>

                        {cancelError && (
                            <div className="error-notice">
                                <FiAlertTriangle size={14} />
                                {cancelError}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

const UserReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [statusFilter, setStatusFilter] = useState('active');
    const [sortField, setSortField] = useState('StartTime');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const reservationsPerPage = 5;

    const fetchReservations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                throw new Error('Authentication required');
            }

            const data = await apiService.getUserReservations(token);

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }

            // Validate and transform data
            const validatedData = data.map(item => ({
                ...item,
                ParkPlace: item.ParkPlace || {},
                Vehicle: item.Vehicle || {},
                Status: item.Status || 'active',
                StartTime: item.StartTime || item.DateAndTime,
                EndTime: item.EndTime || new Date(new Date(item.StartTime).getTime() + 3600000).toISOString()
            }));

            setReservations(validatedData);
        } catch (error) {
            console.error('Error fetching reservations:', error);
            setError(error.message || 'Failed to load reservations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const filteredReservations = useMemo(() => {
        const filtered = reservations.filter(
            (res) => res.Status === statusFilter
        );

        return filtered.sort((a, b) => {
            const dateA = new Date(a[sortField]);
            const dateB = new Date(b[sortField]);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [reservations, statusFilter, sortField, sortOrder]);

    const currentReservations = useMemo(() => {
        const indexOfLast = currentPage * reservationsPerPage;
        const indexOfFirst = indexOfLast - reservationsPerPage;
        return filteredReservations.slice(indexOfFirst, indexOfLast);
    }, [filteredReservations, currentPage]);

    const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage);

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleSortChange = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleRefresh = () => {
        setCurrentPage(1);
        fetchReservations();
    };

    const handleReservationCancel = useCallback((reservationID) => {
        setReservations(prev =>
            prev.map(res =>
                res.ReservationID === reservationID
                    ? { ...res, Status: 'cancelled' }
                    : res
            )
        );

        if (currentReservations.some(r => r.ReservationID === reservationID)) {
            const newTotal = filteredReservations.length - 1;
            const newTotalPages = Math.ceil(newTotal / reservationsPerPage);

            if (currentPage > newTotalPages) {
                setCurrentPage(newTotalPages);
            }
        }
    }, [currentReservations, filteredReservations, currentPage]);

    if (loading) {
        return (
            <div className="user-reservations-page">
            <div className="profile-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your reservations...</p>
                </div>
            </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-reservations-page">
            <div className="profile-container">
                <div className="error-message">
                    <h3>Error loading reservations</h3>
                    <p>{error}</p>
                    <button
                        className="btn btn-primary"
                        onClick={fetchReservations}
                    >
                        Retry
                    </button>
                </div>
            </div>
            </div>
        );
    }

    return (
        <div className="user-reservations-page">
        <div className="profile-container">
            <div className="profile-card fade-in">
                <div className="reservations-header">
                    <h1 className="profile-title">
                        <FiCalendar size={24} />
                        My Reservations
                    </h1>
                    <button
                        className="btn btn-secondary btn-small"
                        onClick={handleRefresh}
                    >
                        Refresh
                    </button>
                </div>

                <div className="filters-section">
                    <div className="filter-buttons">
                        <button
                            className={`btn btn-small ${statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleStatusFilterChange('active')}
                        >
                            <FiFilter size={14} />
                            Active
                        </button>
                        <button
                            className={`btn btn-small ${statusFilter === 'cancelled' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleStatusFilterChange('cancelled')}
                        >
                            <FiFilter size={14} />
                            Cancelled
                        </button>
                    </div>
                    <button
                        className="btn btn-small btn-secondary"
                        onClick={handleSortChange}
                    >
                        <FiClock size={14} />
                        Sort by Date
                        {sortOrder === 'asc' ? <FiArrowDown size={14} /> : <FiArrowUp size={14} />}
                    </button>
                </div>

                <div className="reservations-grid">
                    {currentReservations.length > 0 ? (
                        currentReservations.map((reservation) => (
                            <ReservationCard
                                key={reservation.ReservationID}
                                reservation={reservation}
                                onClick={() => setSelectedReservation(reservation)}
                                onCancel={handleReservationCancel}
                            />
                        ))
                    ) : (
                        <div className="no-reservations">
                            <p>No {statusFilter} reservations found</p>
                            {statusFilter !== 'active' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleStatusFilterChange('active')}
                                >
                                    Show Active Reservations
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="btn btn-small btn-secondary"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            Previous
                        </button>

                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    className={`btn btn-small ${currentPage === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            className="btn btn-small btn-secondary"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {selectedReservation && (
                <ReservationModal
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    onUpdate={fetchReservations}
                />
            )}
        </div>
        </div>
    );
};

export default UserReservationsPage;