import React, { useState, useEffect } from 'react';
import {
    FiPercent,
    FiClock,
    FiInfo,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiX,
    FiChevronRight, FiImage, FiAlertTriangle
} from 'react-icons/fi';

import {FaParking} from 'react-icons/fa'
import apiService from "../api/apiService";
import '../styles/ParkingManagement.css';

const ParkingManagementPage = () => {
    const [activeTab, setActiveTab] = useState('parkingSpaces');
    const [parkingSpaces, setParkingSpaces] = useState([]);
    const [salesPolicies, setSalesPolicies] = useState([]);
    const [cancellationPolicies, setCancellationPolicies] = useState([]);
    const [parkingInfo, setParkingInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // Состояния для модальных окон
    const [showParkingSpaceModal, setShowParkingSpaceModal] = useState(false);
    const [showSalesPolicyModal, setShowSalesPolicyModal] = useState(false);
    const [showCancellationPolicyModal, setShowCancellationPolicyModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [securityCode, setSecurityCode] = useState(['', '', '', '', '', '']);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');

    // Состояния форм
    const [parkingSpaceForm, setParkingSpaceForm] = useState({
        ParkPlaceID: null,
        VehicleCategory: 'B',
        PlaceCategory: 'standard',
        Name: '',
        Longitude: '',
        Latitude: '',
        BasePrice: '',
        PriceTimeDuration: '01:00:00'
    });

    const [salesPolicyForm, setSalesPolicyForm] = useState({
        email: '',
        isForEveryone: false,
        salePercent: 10
    });

    const [cancellationPolicyForm, setCancellationPolicyForm] = useState({
        CancellationPoliciesID: null,
        HoursBeforeStart: 24,
        CancellationFeePercent: 10
    });

    const [infoForm, setInfoForm] = useState({
        Name: '',
        Address: '',
        Description: '',
        DynamicPricing: '',
        DemandFactor: '',

    });

    const token = localStorage.getItem('jwtToken');
    const parkingID = localStorage.getItem('ParkingID');

    // Загрузка данных
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [spaces, sales, cancellation, info] = await Promise.all([
                    apiService.getParkPlacesInParking(token, parkingID),
                    apiService.getParkingSalesPolicies(token, parkingID),
                    apiService.getParkingCancellationPolicies(token, parkingID),
                    apiService.getParkingInfo(token, parkingID)
                ]);

                console.log(info)
                setParkingSpaces(spaces);
                setSalesPolicies(sales);
                setCancellationPolicies(cancellation);
                setParkingInfo(info);

            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load parking management data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, parkingID]);

    // Обработчики для парковочных мест
    const handleCreateParkingSpace = async () => {
        try {
            const requestData = {
                VehicleCategory: parkingSpaceForm.VehicleCategory,
                PlaceCategory: parkingSpaceForm.PlaceCategory,
                Name: parkingSpaceForm.Name,
                Longitude: parseFloat(parkingSpaceForm.Longitude),
                Latitude: parseFloat(parkingSpaceForm.Latitude),
                BasePrice: parseFloat(parkingSpaceForm.BasePrice),
                PriceTimeDuration: parkingSpaceForm.PriceTimeDuration,
                ParkingID: parkingID,
            };

            console.log('Creating parking space with:', requestData);

            await apiService.createParkPlace(token, requestData);
            const updated = await apiService.getParkPlacesInParking(token, parkingID);
            setParkingSpaces(updated);
            setShowParkingSpaceModal(false);
        } catch (err) {
            console.error('Create parking space error:', err);
            alert(err.message);
        }
    };

    const handleUpdateParkingSpace = async () => {
        try {
            const { ParkPlaceID, VehicleCategory, PlaceCategory, Name, Longitude, Latitude, BasePrice, PriceTimeDuration } = parkingSpaceForm;
            await apiService.updateParkPlace(token, {
                ParkPlaceID,
                VehicleCategory,
                PlaceCategory,
                Name,
                Longitude: parseFloat(Longitude),
                Latitude: parseFloat(Latitude),
                BasePrice: parseFloat(BasePrice),
                PriceTimeDuration
            });

            const updated = await apiService.getParkPlacesInParking(token, parkingID);
            setParkingSpaces(updated);
            setShowParkingSpaceModal(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteParkingSpace = async (id) => {
        if (!window.confirm('Are you sure you want to delete this parking space?')) return;

        try {
            console.log('Deleting parking space with ID:', id);

            await apiService.deleteParkPlace(token, id);

            const updated = await apiService.getParkPlacesInParking(token, parkingID);
            setParkingSpaces(updated);
        } catch (err) {
            console.error('Delete parking space error:', err);
            alert(err.message);
        }
    };

    // Обработчики для политик скидок
    const handleCreateSalesPolicy = async () => {
        try {
            console.log('Creating sales policy with data:', {
                ...salesPolicyForm,
                salePercent: salesPolicyForm.salePercent / 100,
                ParkingID: parkingID
            });

            const response = await apiService.createSalesPolicies(token, {
                ...salesPolicyForm,
                salePercent: salesPolicyForm.salePercent / 100,
                ParkingID: parkingID
            });

            console.log('Sales policy created:', response);

            const updated = await apiService.getParkingSalesPolicies(token, parkingID);
            setSalesPolicies(updated);
            setShowSalesPolicyModal(false);
        } catch (err) {
            console.error('Create sales policy error:', err);
            alert(err.message);
        }
    };

    const handleDeleteSalesPolicy = async (salesPoliciesID) => {
        if (!window.confirm('Are you sure you want to delete this sales policy?')) return;

        try {
            await apiService.deleteGeneralSalesPolicies(token, salesPoliciesID);

            const updated = await apiService.getParkingSalesPolicies(token, parkingID);
            setSalesPolicies(updated);
        } catch (err) {
            alert(err.message);
        }
    };

    // Обработчики для политик отмены
    const handleCreateCancellationPolicy = async () => {
        try {
            console.log('Creating cancellation policy with data:', {
                ...cancellationPolicyForm,
                CancellationFeePercent: cancellationPolicyForm.CancellationFeePercent / 100,
                HoursBeforeStart: `${cancellationPolicyForm.HoursBeforeStart.toString().padStart(2, '0')}:00:00`,
                ParkingID: parkingID
            });

            const response = await apiService.createCancellationPolicies(token, {
                ...cancellationPolicyForm,
                CancellationFeePercent: cancellationPolicyForm.CancellationFeePercent / 100,
                HoursBeforeStart: `${cancellationPolicyForm.HoursBeforeStart.toString().padStart(2, '0')}:00:00`,
                ParkingID: parkingID // Добавляем ParkingID
            });

            console.log('Cancellation policy created:', response);

            const updated = await apiService.getParkingCancellationPolicies(token, parkingID);
            setCancellationPolicies(updated);
            setShowCancellationPolicyModal(false);
        } catch (err) {
            console.error('Create cancellation policy error:', err);
            alert(err.message);
        }
    };

    const handleUpdateCancellationPolicy = async () => {
        try {
            await apiService.updateCancellationPolicies(token, cancellationPolicyForm);
            const updated = await apiService.getParkingCancellationPolicies(token, parkingID);
            setCancellationPolicies(updated);
            setShowCancellationPolicyModal(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteCancellationPolicy = async (id) => {
        if (!window.confirm('Are you sure you want to delete this cancellation policy?')) return;

        try {
            await apiService.deleteCancellationPolicies(token, { CancellationPoliciesID: id });
            const updated = await apiService.getParkingCancellationPolicies(token, parkingID);
            setCancellationPolicies(updated);
        } catch (err) {
            alert(err.message);
        }
    };

    // Обработчики для информации о парковке
    const handleUpdateParkingInfo = async () => {
        try {
            const requestData = {
                Address: infoForm.Address,
                Name: infoForm.Name,
                Info: infoForm.Description,
                DynamicPricing: infoForm.DynamicPricing,
                DemandFactor: parseFloat(infoForm.DemandFactor),
                ParkingID: parkingID
            };

            console.log('Updating parking info with:', requestData);

            await apiService.updateParking(token, requestData);
            const updated = await apiService.getParkingInfo(token, parkingID);
            setParkingInfo(updated);
            setShowInfoModal(false);
        } catch (err) {
            console.error('Update parking info error:', err);
            alert(err.message);
        }
    };

    const initiateParkingDeletion = async () => {
        if (!window.confirm('Are you sure you want to delete this parking? This action cannot be undone.')) {
            return;
        }

        try {
            await apiService.deleteCodeParking(token);
            setIsCodeSent(true);
            setShowDeleteModal(true);
            setDeleteMessage('Security code has been sent to your email');
        } catch (err) {
            console.error('Error sending security code:', err);
            alert(err.message || 'Failed to initiate parking deletion');
        }
    };

    const handleDeleteParking = async () => {
        try {
            const code = securityCode.join('');
            if (code.length !== 6) {
                setDeleteMessage('Please enter a valid 6-digit code');
                return;
            }
            console.log(code, parkingID)
            const response = await apiService.deleteParking(token, code, parkingID);
            setDeleteMessage(response.message || 'Parking deleted successfully');
            setTimeout(() => {
                window.location.href = '/parkings'; // Redirect after successful deletion
            }, 2000);
        } catch (err) {
            console.error('Error deleting parking:', err);
            setDeleteMessage(err.response?.data?.message || 'Failed to delete parking');
        }
    };

    const handleCodeChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...securityCode];
        newCode[index] = value;
        setSecurityCode(newCode);

        // Auto-focus to next input
        if (value && index < 5) {
            document.getElementById(`security-code-${index + 1}`).focus();
        }
    };

    const handleCodePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pasteData)) {
            const pasteArray = pasteData.split('').slice(0, 6);
            setSecurityCode(pasteArray);
        }
    };

    // Открытие модальных окон для редактирования
    const openEditParkingSpaceModal = (space) => {
        setParkingSpaceForm({
            ParkPlaceID: space.ParkPlaceID,
            VehicleCategory: space.VehicleCategory,
            PlaceCategory: space.PlaceCategory,
            Name: space.Name,
            Longitude: space.Longitude,
            Latitude: space.Latitude,
            BasePrice: space.BasePrice,
            PriceTimeDuration: space.PriceTimeDuration
        });
        setShowParkingSpaceModal(true);
    };

    const openEditCancellationPolicyModal = (policy) => {
        setCancellationPolicyForm({
            CancellationPoliciesID: policy.CancellationPoliciesID,
            HoursBeforeStart: policy.HoursBeforeStart,
            CancellationFeePercent: policy.CancellationFeePercent
        });
        setShowCancellationPolicyModal(true);
    };

    const openEditInfoModal = () => {
        setInfoForm({
            Name: parkingInfo.Name || '',
            Address: parkingInfo.Address || '',
            Description: parkingInfo.Info || '',
            DynamicPricing: parkingInfo.DynamicPricing || false,
            DemandFactor: parkingInfo.DemandFactor || 1.0
        });
        setShowInfoModal(true);
    };

    if (loading) return <div className="loading-message">Loading parking management data...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="parking-management-container">
            <h1>Parking Management</h1>

            {/* Навигационные вкладки */}
            <div className="management-tabs">
                <div
                    className={`management-tab ${activeTab === 'parkingSpaces' ? 'active' : ''}`}
                    onClick={() => setActiveTab('parkingSpaces')}
                >
                    <FaParking /> Parking Spaces
                </div>
                <div
                    className={`management-tab ${activeTab === 'salesPolicies' ? 'active' : ''}`}
                    onClick={() => setActiveTab('salesPolicies')}
                >
                    <FiPercent /> Sales Policies
                </div>
                <div
                    className={`management-tab ${activeTab === 'cancellationPolicies' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cancellationPolicies')}
                >
                    <FiClock /> Cancellation
                </div>
                <div
                    className={`management-tab ${activeTab === 'parkingInfo' ? 'active' : ''}`}
                    onClick={() => setActiveTab('parkingInfo')}
                >
                    <FiInfo /> Parking Info
                </div>
            </div>

            {/* Секция парковочных мест */}
            {activeTab === 'parkingSpaces' && (
                <div className="management-section fade-in">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FaParking /> Parking Spaces
                        </h2>
                        <button
                            className="action-btn btn-primary"
                            onClick={() => {
                                setParkingSpaceForm({
                                    ParkPlaceID: null,
                                    VehicleCategory: 'B',
                                    PlaceCategory: 'standard',
                                    Name: '',
                                    Longitude: '',
                                    Latitude: '',
                                    BasePrice: '',
                                    PriceTimeDuration: '01:00:00'
                                });
                                setShowParkingSpaceModal(true);
                            }}
                        >
                            <FiPlus /> Add Space
                        </button>
                    </div>

                    <div className="items-list">
                        {parkingSpaces.length === 0 ? (
                            <p>No parking spaces found</p>
                        ) : (
                            parkingSpaces.map(space => (
                                <div key={space.ParkPlaceID} className="item-card">
                                    <div className="item-info">
                                        <div className="item-title">{space.Name}</div>
                                        <div className="item-detail">
                                            <span>Type: {space.VehicleCategory}</span>
                                            <span>Category: {space.PlaceCategory}</span>
                                            <span>Price: {space.BasePrice} {space.Currency}</span>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            className="action-btn btn-secondary"
                                            onClick={() => openEditParkingSpaceModal(space)}
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            className="action-btn btn-danger"
                                            onClick={() => handleDeleteParkingSpace(space.ParkPlaceID)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Секция политик скидок */}
            {activeTab === 'salesPolicies' && (
                <div className="management-section fade-in">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FiPercent /> Sales Policies
                        </h2>
                        <button
                            className="action-btn btn-primary"
                            onClick={() => {
                                setSalesPolicyForm({
                                    email: '',
                                    isForEveryone: false,
                                    salePercent: 10
                                });
                                setShowSalesPolicyModal(true);
                            }}
                        >
                            <FiPlus /> Add Policy
                        </button>
                    </div>

                    <div className="items-list">
                        {salesPolicies.length === 0 ? (
                            <p>No sales policies found</p>
                        ) : (
                            salesPolicies.map(policy => (
                                <div key={policy.IsForEveryone ? 'general' : policy.User.Email} className="item-card">
                                    <div className="item-info">
                                        <div className="item-title">
                                            {policy.IsForEveryone ? 'General Discount' : `Discount for ${policy.User.Email}`}
                                        </div>
                                        <div className="item-detail">
                                            <span>Discount: {policy.SalePercent * 100 }%</span>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            className="action-btn btn-danger"
                                            onClick={() => handleDeleteSalesPolicy(policy.SalesPoliciesID)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Секция политик отмены */}
            {activeTab === 'cancellationPolicies' && (
                <div className="management-section fade-in">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FiClock /> Cancellation Policies
                        </h2>
                        <button
                            className="action-btn btn-primary"
                            onClick={() => {
                                setCancellationPolicyForm({
                                    CancellationPoliciesID: null,
                                    HoursBeforeStart: 24,
                                    CancellationFeePercent: 10
                                });
                                setShowCancellationPolicyModal(true);
                            }}
                        >
                            <FiPlus /> Add Policy
                        </button>
                    </div>

                    <div className="items-list">
                        {cancellationPolicies.length === 0 ? (
                            <p>No cancellation policies found</p>
                        ) : (
                            cancellationPolicies.map(policy => (
                                <div key={policy.CancellationPoliciesID} className="item-card">
                                    <div className="item-info">
                                        <div className="item-title">Cancellation Policy</div>
                                        <div className="item-detail">
                                            <span>Before: {policy.HoursBeforeStart} hours</span>
                                            <span>Fee: {policy.CancellationFeePercent}%</span>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            className="action-btn btn-secondary"
                                            onClick={() => openEditCancellationPolicyModal(policy)}
                                        >
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            className="action-btn btn-danger"
                                            onClick={() => handleDeleteCancellationPolicy(policy.CancellationPoliciesID)}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Секция информации о парковке */}
            {activeTab === 'parkingInfo' && (
                <div className="management-section fade-in">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FiInfo /> Parking Information
                        </h2>
                        <div>
                            <button
                                className="action-btn btn-primary"
                                onClick={openEditInfoModal}
                            >
                                <FiEdit2 /> Edit Info
                            </button>
                            <button
                                className="action-btn btn-secondary"
                                onClick={() => window.location.href = '/parking-statistics'}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                <FiChevronRight /> View Statistics
                            </button>
                            <button
                                className="action-btn btn-danger"
                                onClick={initiateParkingDeletion}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                <FiTrash2 /> Delete Parking
                            </button>
                        </div>
                    </div>

                    {parkingInfo && (
                        <div className="parking-info-container">
                            <div className="parking-image-container">
                                {parkingInfo.PhotoImage ? (
                                    <img
                                        src={parkingInfo.PhotoImage}
                                        alt={parkingInfo.Name}
                                        className="parking-image"
                                    />
                                ) : (
                                    <div className="parking-image-placeholder">
                                        <FiImage size={48} />
                                        <span>No image available</span>
                                    </div>
                                )}
                            </div>

                            <div className="item-card">
                                <div className="item-info">
                                    <div className="item-title">{parkingInfo.Name}</div>
                                    <div className="item-detail">
                                        <span><strong>Address:</strong> {parkingInfo.Address || 'Not specified'}</span>
                                    </div>
                                    <div className="item-detail">
                                        <span><strong>Dynamic Pricing:</strong> {parkingInfo.DynamicPricing ? 'Enabled' : 'Disabled'}</span>
                                        <span><strong>Demand Factor:</strong> {parkingInfo.DemandFactor || 1.0}</span>
                                    </div>
                                    <div className="item-detail" style={{ marginTop: '0.5rem'}}>
                                        <strong>Description:</strong> {parkingInfo.Info || 'No description provided'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Модальное окно для парковочных мест */}
            {showParkingSpaceModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {parkingSpaceForm.ParkPlaceID ? 'Edit Parking Space' : 'Add Parking Space'}
                            </h3>
                            <button className="modal-close" onClick={() => setShowParkingSpaceModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-form">
                            <div className="form-group">
                                <label className="form-label">Vehicle Category</label>
                                <select
                                    className="form-input"
                                    value={parkingSpaceForm.VehicleCategory}
                                    onChange={(e) => setParkingSpaceForm({...parkingSpaceForm, VehicleCategory: e.target.value})}
                                >
                                    <option value="A">A (Motorcycles)</option>
                                    <option value="B">B (Cars)</option>
                                    <option value="C">C (Trucks)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Place Category</label>
                                <select
                                    className="form-input"
                                    value={parkingSpaceForm.PlaceCategory}
                                    onChange={(e) => setParkingSpaceForm({...parkingSpaceForm, PlaceCategory: e.target.value})}
                                >
                                    <option value="standard">Standard</option>
                                    <option value="premium">Premium</option>
                                    <option value="disabled">Disabled</option>
                                    <option value="electric">Electric</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Name/Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={parkingSpaceForm.Name}
                                    onChange={(e) => setParkingSpaceForm({...parkingSpaceForm, Name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Latitude</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    className="form-input"
                                    value={parkingSpaceForm.Latitude}
                                    onChange={(e) => setParkingSpaceForm({...parkingSpaceForm, Latitude: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Longitude</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    className="form-input"
                                    value={parkingSpaceForm.Longitude}
                                    onChange={(e) => setParkingSpaceForm({...parkingSpaceForm, Longitude: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Base Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="form-input"
                                    value={parkingSpaceForm.BasePrice}
                                    onChange={(e) => setParkingSpaceForm({...parkingSpaceForm, BasePrice: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Price Duration (HH:MM:SS)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={parkingSpaceForm.PriceTimeDuration}
                                    onChange={(e) => setParkingSpaceForm({...parkingSpaceForm, PriceTimeDuration: e.target.value})}
                                    placeholder="01:00:00"
                                    required
                                    pattern="\d{2}:\d{2}:\d{2}"
                                    title="Please enter time in HH:MM:SS format"
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="action-btn btn-secondary"
                                    onClick={() => setShowParkingSpaceModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="action-btn btn-primary"
                                    onClick={parkingSpaceForm.ParkPlaceID ? handleUpdateParkingSpace : handleCreateParkingSpace}
                                    disabled={!parkingSpaceForm.Name || !parkingSpaceForm.Latitude || !parkingSpaceForm.Longitude || !parkingSpaceForm.BasePrice || !parkingSpaceForm.PriceTimeDuration}
                                >
                                    {parkingSpaceForm.ParkPlaceID ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для политик скидок */}
            {showSalesPolicyModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add Sales Policy</h3>
                            <button className="modal-close" onClick={() => setShowSalesPolicyModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-form">
                            <div className="form-group">
                                <label className="form-label">
                                    <input
                                        type="checkbox"
                                        checked={salesPolicyForm.isForEveryone}
                                        onChange={(e) => setSalesPolicyForm({...salesPolicyForm, isForEveryone: e.target.checked})}
                                    />
                                    <span style={{ marginLeft: '0.5rem' }}>Apply to all users</span>
                                </label>
                            </div>

                            {!salesPolicyForm.isForEveryone && (
                                <div className="form-group">
                                    <label className="form-label">User Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={salesPolicyForm.email}
                                        onChange={(e) => setSalesPolicyForm({...salesPolicyForm, email: e.target.value})}
                                        disabled={salesPolicyForm.isForEveryone}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Discount Percent</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="form-input"
                                    value={salesPolicyForm.salePercent}
                                    onChange={(e) => setSalesPolicyForm({...salesPolicyForm, salePercent: parseInt(e.target.value)})}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="action-btn btn-secondary"
                                    onClick={() => setShowSalesPolicyModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="action-btn btn-primary"
                                    onClick={handleCreateSalesPolicy}
                                >
                                    Create Policy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для политик отмены */}
            {showCancellationPolicyModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {cancellationPolicyForm.CancellationPoliciesID ? 'Edit Cancellation Policy' : 'Add Cancellation Policy'}
                            </h3>
                            <button className="modal-close" onClick={() => setShowCancellationPolicyModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-form">
                            <div className="form-group">
                                <label className="form-label">Hours Before Start</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-input"
                                    value={cancellationPolicyForm.HoursBeforeStart}
                                    onChange={(e) => setCancellationPolicyForm({...cancellationPolicyForm, HoursBeforeStart: parseInt(e.target.value)})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Cancellation Fee Percent</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="form-input"
                                    value={cancellationPolicyForm.CancellationFeePercent}
                                    onChange={(e) => setCancellationPolicyForm({...cancellationPolicyForm, CancellationFeePercent: parseInt(e.target.value)})}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="action-btn btn-secondary"
                                    onClick={() => setShowCancellationPolicyModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="action-btn btn-primary"
                                    onClick={cancellationPolicyForm.CancellationPoliciesID ? handleUpdateCancellationPolicy : handleCreateCancellationPolicy}
                                >
                                    {cancellationPolicyForm.CancellationPoliciesID ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно для информации о парковке */}
            {showInfoModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Parking Information</h3>
                            <button className="modal-close" onClick={() => setShowInfoModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-form">
                            <div className="form-group">
                                <label className="form-label">Parking Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={infoForm.Name}
                                    onChange={(e) => setInfoForm({...infoForm, Name: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={infoForm.Address}
                                    onChange={(e) => setInfoForm({...infoForm, Address: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    rows="4"
                                    value={infoForm.Description}
                                    onChange={(e) => setInfoForm({...infoForm, Description: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Dynamic Pricing</label>
                                <select
                                    className="form-input"
                                    value={infoForm.DynamicPricing}
                                    onChange={(e) => setInfoForm({...infoForm, DynamicPricing: e.target.value === 'true'})}
                                >
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Demand Factor</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1.0"
                                    max="3.0"
                                    className="form-input"
                                    value={infoForm.DemandFactor}
                                    onChange={(e) => setInfoForm({...infoForm, DemandFactor: parseFloat(e.target.value)})}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="action-btn btn-secondary"
                                    onClick={() => setShowInfoModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="action-btn btn-primary"
                                    onClick={handleUpdateParkingInfo}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно удаления парковки */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Confirm Parking Deletion</h3>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-form">
                            <div className="form-group">
                                <p className="delete-warning-text">
                                    <FiAlertTriangle className="warning-icon" />
                                    Warning: This action will permanently delete the parking and all associated data.
                                </p>

                                {isCodeSent && (
                                    <>
                                        <label className="form-label">Enter 6-digit security code</label>
                                        <div className="security-code-inputs">
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <input
                                                    key={index}
                                                    id={`security-code-${index}`}
                                                    type="text"
                                                    maxLength="1"
                                                    className="security-code-input"
                                                    value={securityCode[index]}
                                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                                    onPaste={handleCodePaste}
                                                    autoFocus={index === 0}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {deleteMessage && (
                                    <p className={`delete-message ${deleteMessage.includes('success') ? 'success' : 'error'}`}>
                                        {deleteMessage}
                                    </p>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="action-btn btn-secondary"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSecurityCode(['', '', '', '', '', '']);
                                        setDeleteMessage('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="action-btn btn-danger"
                                    onClick={handleDeleteParking}
                                    disabled={!isCodeSent}
                                >
                                    <FiTrash2 /> Confirm Deletion
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParkingManagementPage;