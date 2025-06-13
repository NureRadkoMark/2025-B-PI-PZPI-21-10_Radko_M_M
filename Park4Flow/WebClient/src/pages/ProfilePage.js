import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
    FiUser,
    FiPhone,
    FiDollarSign,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCreditCard,
    FiAward
} from 'react-icons/fi';
import apiService from "../api/apiService";
import PaymentModal from "../pages/PaymentModal";
import '../styles/ProfilePage.css';
import VehicleModal from "./VehicleModal";

export default function ProfilePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("jwtToken");
    const [user, setUser] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState(
        parseInt(localStorage.getItem("selectedVehicleID")) || -1
    );
    const [modalType, setModalType] = useState(null);
    const [form, setForm] = useState({
        FirstName: "",
        SecondName: "",
        PhoneNumber: ""
    });
    const [initialForm, setInitialForm] = useState({ ...form });
    const [editModalData, setEditModalData] = useState({
        isOpen: false,
        vehicle: null
    });

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                const [userData, vehiclesData] = await Promise.all([
                    apiService.getUserDetails(token),
                    apiService.getUserVehicles(token)
                ]);

                setUser(userData);
                setForm({
                    FirstName: userData.FirstName,
                    SecondName: userData.SecondName,
                    PhoneNumber: userData.PhoneNumber,
                });
                setInitialForm({
                    FirstName: userData.FirstName,
                    SecondName: userData.SecondName,
                    PhoneNumber: userData.PhoneNumber,
                });
                setVehicles(vehiclesData);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        fetchData();
    }, [token]);

    const fetchVehicles = async () => {
        try {
            const vehiclesData = await apiService.getUserVehicles(token);
            setVehicles(vehiclesData);
        } catch (error) {
            console.error("Error loading vehicles:", error);
        }
    };

    useEffect(() => {
        if (vehicles.length === 0) return;

        const savedId = parseInt(localStorage.getItem("selectedVehicleID"));
        const isValidId = vehicles.some(v => v.VehicleID === savedId);

        if (!isValidId) {
            const newId = vehicles[0]?.VehicleID ?? -1;
            localStorage.setItem("selectedVehicleID", newId);
            setSelectedVehicleId(newId);
        }
    }, [vehicles]);

    const handleSave = async () => {
        try {
            await apiService.updateUserData(token, form);
            setInitialForm({ ...form });
            alert("Profile updated successfully");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDeleteVehicle = async (vehicleID, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

        try {
            await apiService.deleteVehicle(vehicleID, token);
            const updated = await apiService.getUserVehicles(token);
            setVehicles(updated);

            if (vehicleID === selectedVehicleId) {
                const newId = updated[0]?.VehicleID ?? -1;
                localStorage.setItem("selectedVehicleID", newId);
                setSelectedVehicleId(newId);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleSelectVehicle = (vehicleID) => {
        localStorage.setItem("selectedVehicleID", vehicleID);
        setSelectedVehicleId(vehicleID);
    };

    const showSaveButton = JSON.stringify(form) !== JSON.stringify(initialForm);

    return (
        <div className="profile-container">
            <div className="profile-layout">
                {/* Левая колонка - профиль */}
                <div className="profile-card fade-in">
                    <h1 className="profile-title">
                        <FiUser size={24} />
                        My Profile
                    </h1>

                    {user && (
                        <div className="profile-content">
                            <div className="balance-section">
                                <div className="balance-row">
                                    <span className="balance-label">Balance:</span>
                                    <span className="balance-value">
                                        {user.Balance} {user.Currency}
                                    </span>
                                </div>
                                <div className="balance-row">
                                    <span className="balance-label">Bonuses:</span>
                                    <span className="bonus-value">
                                        {user.Bonuses}
                                    </span>
                                </div>
                                <button
                                    className="btn btn-primary btn-small"
                                    onClick={() => setModalType("deposit")}
                                >
                                    <FiCreditCard size={16} />
                                    Top Up
                                </button>
                            </div>

                            <div className="profile-form">
                                <div className="input-group">
                                    <FiUser className="input-icon" />
                                    <input
                                        type="text"
                                        className="profile-input"
                                        placeholder="First Name"
                                        value={form.FirstName}
                                        onChange={(e) => setForm({ ...form, FirstName: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <FiUser className="input-icon" />
                                    <input
                                        type="text"
                                        className="profile-input"
                                        placeholder="Last Name"
                                        value={form.SecondName}
                                        onChange={(e) => setForm({ ...form, SecondName: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <FiPhone className="input-icon" />
                                    <input
                                        type="text"
                                        className="profile-input"
                                        placeholder="Phone Number"
                                        value={form.PhoneNumber}
                                        onChange={(e) => setForm({ ...form, PhoneNumber: e.target.value })}
                                    />
                                </div>

                                {showSaveButton && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSave}
                                    >
                                        Save Changes
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Правая колонка - транспорт */}
                <div className="profile-card fade-in">
                    <div className="vehicles-header">
                        <h1 className="profile-title">
                            <FiAward size={24} />
                            My Vehicles
                        </h1>
                        <button
                            className="btn btn-primary btn-small"
                            onClick={() => navigate('/add-vehicle')}
                        >
                            <FiPlus size={16} />
                            Add Vehicle
                        </button>
                    </div>

                    <div className="vehicles-grid">
                        {vehicles.length === 0 ? (
                            <div className="no-vehicles">
                                <p>No vehicles added yet</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/add-vehicle')}
                                >
                                    <FiPlus size={16} />
                                    Add Your First Vehicle
                                </button>
                            </div>
                        ) : (
                            vehicles.map((vehicle) => (
                                <div
                                    key={vehicle.VehicleID}
                                    className={`vehicle-card ${vehicle.VehicleID === selectedVehicleId ? "selected" : ""}`}
                                    onClick={() => handleSelectVehicle(vehicle.VehicleID)}
                                >
                                    <img
                                        className="vehicle-image"
                                        src={vehicle.FrontPhotoImage || "/placeholder.png"}
                                        alt="Vehicle"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/placeholder.png";
                                        }}
                                    />
                                    <div className="vehicle-body">
                                        <h3 className="vehicle-title">
                                            {vehicle.VehicleBrand || "Unknown Brand"} {vehicle.VehicleModel || ""}
                                        </h3>
                                        <p className="vehicle-detail">
                                            Category: {vehicle.VehicleCategory || "Not specified"}
                                        </p>
                                        <p className="vehicle-detail">
                                            License: {vehicle.StateNumber || "Not specified"}
                                        </p>
                                        <div className="vehicle-actions">
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditModalData({
                                                        isOpen: true,
                                                        vehicle: vehicle
                                                    });
                                                }}
                                            >
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={(e) => handleDeleteVehicle(vehicle.VehicleID, e)}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {modalType && (
                <PaymentModal
                    type={modalType}
                    onClose={() => setModalType(null)}
                />
            )}
            {editModalData.isOpen && (
                <VehicleModal
                    vehicle={editModalData.vehicle}
                    onClose={() => setEditModalData({ isOpen: false, vehicle: null })}
                    onSuccess={() => {
                        fetchVehicles()
                        setEditModalData({ isOpen: false, vehicle: null });
                    }}
                />
            )}
        </div>
    );
}
