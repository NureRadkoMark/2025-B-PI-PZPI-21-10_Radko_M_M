import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiCalendar, FiFilter, FiCheck, FiInfo} from 'react-icons/fi';
import apiService from '../api/apiService';
import { deleteTariffPlanRequestModel } from '../api/models/tariffPlan/deleteTariffPlanModels';
import '../styles/AdminTariffPlans.css';
import TariffPlanModal from "./TariffPlanModal";

export default function TariffPlansAdminPage() {
    const [tariffPlans, setTariffPlans] = useState([]);
    const [filteredPlans, setFilteredPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currencyFilter, setCurrencyFilter] = useState('All');
    const [successMessage, setSuccessMessage] = useState('');
    const token = localStorage.getItem('jwtToken');
    const navigate = useNavigate();
    const [modalData, setModalData] = useState({
        isOpen: false,
        tariffPlan: null
    });

    useEffect(() => {
        loadTariffPlans();
    }, []);

    useEffect(() => {
        if (currencyFilter === 'All') {
            setFilteredPlans(tariffPlans);
        } else {
            setFilteredPlans(tariffPlans.filter(plan => plan.Currency === currencyFilter));
        }
    }, [currencyFilter, tariffPlans]);

    const loadTariffPlans = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await apiService.getAllTariffPlans(token);
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }
            setTariffPlans(data);
        } catch (err) {
            console.error('Error loading tariff plans:', err);
            setError(err.response?.data?.message || 'Failed to load tariff plans. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (TariffPlanID) => {
        if (!window.confirm("Are you sure you want to delete this tariff plan? This action cannot be undone.")) return;

        try {
            setLoading(true);
            setError('');
            const requestModel = deleteTariffPlanRequestModel(TariffPlanID);
            await apiService.deleteTariffPlan(token, requestModel);
            setSuccessMessage('Tariff plan deleted successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
            await loadTariffPlans();
        } catch (err) {
            console.error('Delete failed:', err);
            setError(err.response?.data?.message || 'Failed to delete tariff plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan) => {
        setModalData({
            isOpen: true,
            tariffPlan: plan
        });
    };

    const handleCreate = () => {
        setModalData({
            isOpen: true,
            tariffPlan: null
        });
    };

    const handleSuccess = () => {
        loadTariffPlans();
        console.log('Operation successful');
    };

    if (loading && tariffPlans.length === 0) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading tariff plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="admin-header">
                    <h1 className="profile-title">
                        <FiDollarSign size={24} />
                        Manage Tariff Plans
                    </h1>
                    <button
                        className="btn btn-primary btn-small"
                        onClick={handleCreate}
                    >
                        <FiPlus size={16} />
                        Add New Plan
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <FiInfo size={16} />
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="alert alert-success">
                        <FiCheck size={16} />
                        {successMessage}
                    </div>
                )}

                <div className="filter-section">
                    <div className="form-group">
                        <label>
                            <FiFilter size={16} />
                            Filter by currency
                        </label>
                        <select
                            value={currencyFilter}
                            onChange={(e) => setCurrencyFilter(e.target.value)}
                            disabled={loading}
                        >
                            <option value="All">All Currencies</option>
                            <option value="UAH">UAH</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>

                {filteredPlans.length === 0 ? (
                    <div className="no-results">
                        <p>No tariff plans found</p>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreate}
                        >
                            <FiPlus size={16} />
                            Create First Plan
                        </button>
                    </div>
                ) : (
                    <div className="tariff-grid">
                        {filteredPlans.map(plan => (
                            <div className="tariff-card" key={plan.TariffPlanID}>
                                <div className="tariff-header">
                                    <h3>{plan.Type}</h3>
                                    <span className={`tariff-badge ${plan.Currency.toLowerCase()}`}>
                                        {plan.Currency}
                                    </span>
                                </div>
                                <div className="tariff-details">
                                    <p>
                                        <FiCalendar size={14} />
                                        <strong>Duration:</strong> {plan.SubscriptionDuration} days
                                    </p>
                                    <p className="tariff-price">
                                        <FiDollarSign size={14} />
                                        <strong>Price:</strong> {plan.SubscriptionPrice} {plan.Currency}
                                    </p>
                                </div>
                                <div className="tariff-actions">
                                    <button
                                        className="btn btn-secondary btn-small"
                                        onClick={() => handleEdit(plan)}
                                        disabled={loading}
                                    >
                                        <FiEdit2 size={14} />
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-small"
                                        onClick={() => handleDelete(plan.TariffPlanID)}
                                        disabled={loading}
                                    >
                                        <FiTrash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {modalData.isOpen && (
                <TariffPlanModal
                    tariffPlan={modalData.tariffPlan}
                    onClose={() => setModalData({ isOpen: false, tariffPlan: null })}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}