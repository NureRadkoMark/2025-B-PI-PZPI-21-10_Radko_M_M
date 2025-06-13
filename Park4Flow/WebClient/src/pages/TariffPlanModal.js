import React, { useState, useEffect } from 'react';
import {FiDollarSign, FiCalendar, FiSave, FiPlus, FiX, FiInfo, FiCheck} from 'react-icons/fi';
import apiService from "../api/apiService";
import {ModalWrapper} from "../components/ModalWrapper";
import '../styles/TariffPlanModal.css';
import {updateTariffPlanRequestModel} from "../api/models/tariffPlan/updateTariffPlanModels";
import {createTariffPlanRequestModel} from "../api/models/tariffPlan/createTariffPlanModels";

export default function TariffPlanModal({ tariffPlan = null, onClose, onSuccess }) {
    const token = localStorage.getItem('jwtToken');
    const [formData, setFormData] = useState({
        SubscriptionDuration: '',
        SubscriptionPrice: '',
        Currency: '',
        Type: '',
        TariffPlanID: null,
    });
    const [errors, setErrors] = useState({});
    const [submissionError, setSubmissionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const isEdit = !!tariffPlan;

    useEffect(() => {
        if (tariffPlan) {
            setFormData({
                SubscriptionDuration: tariffPlan.SubscriptionDuration || '',
                SubscriptionPrice: tariffPlan.SubscriptionPrice || '',
                Currency: tariffPlan.Currency || '',
                Type: tariffPlan.Type || '',
                TariffPlanID: tariffPlan.TariffPlanID,
            });
        }
    }, [tariffPlan]);

    const validate = () => {
        const newErrors = {};
        if (!formData.SubscriptionDuration || formData.SubscriptionDuration <= 0) {
            newErrors.SubscriptionDuration = 'Please enter valid duration (at least 1 day)';
        }
        if (!formData.SubscriptionPrice || formData.SubscriptionPrice <= 0) {
            newErrors.SubscriptionPrice = 'Please enter valid price (greater than 0)';
        }
        if (!formData.Currency) {
            newErrors.Currency = 'Please select currency';
        }
        if (!formData.Type) {
            newErrors.Type = 'Please enter plan type';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionError('');
        setSuccess(false);

        if (!validate()) return;

        try {
            setIsSubmitting(true);

            if (isEdit) {
                const request = updateTariffPlanRequestModel(
                    formData.TariffPlanID,
                    formData.SubscriptionDuration,
                    formData.SubscriptionPrice,
                    formData.Currency,
                    formData.Type
                );
                await apiService.updateTariffPlan(token, request);
            } else {
                const request = createTariffPlanRequestModel(
                    formData.SubscriptionDuration,
                    formData.SubscriptionPrice,
                    formData.Currency,
                    formData.Type
                );
                await apiService.createTariffPlan(token, request);
            }

            setSuccess(true);
            if (onSuccess) onSuccess();

            // Auto-close after 2 seconds
            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);
        } catch (err) {
            console.error('Tariff plan operation error:', err);
            setSubmissionError(err.response?.data?.message ||
                `Failed to ${isEdit ? 'update' : 'create'} tariff plan. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="tariff-modal">
                <div className="modal-header">
                    <h2>
                        {isEdit ? <FiSave size={24} /> : <FiPlus size={24} />}
                        {isEdit ? 'Edit Tariff Plan' : 'Create Tariff Plan'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {submissionError && (
                        <div className="alert alert-error">
                            <FiX size={16} />
                            {submissionError}
                        </div>
                    )}

                    {success ? (
                        <div className="alert alert-success">
                            <FiCheck size={16} />
                            {isEdit ? 'Tariff plan updated successfully!' : 'Tariff plan created successfully!'}
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label>
                                    <FiCalendar size={16} />
                                    Duration (days) *
                                </label>
                                <input
                                    type="number"
                                    name="SubscriptionDuration"
                                    value={formData.SubscriptionDuration}
                                    onChange={handleChange}
                                    min="1"
                                    className={errors.SubscriptionDuration ? 'error' : ''}
                                />
                                {errors.SubscriptionDuration && (
                                    <span className="error-message">{errors.SubscriptionDuration}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>
                                    <FiDollarSign size={16} />
                                    Price *
                                </label>
                                <input
                                    type="number"
                                    name="SubscriptionPrice"
                                    value={formData.SubscriptionPrice}
                                    onChange={handleChange}
                                    min="0.01"
                                    step="0.01"
                                    className={errors.SubscriptionPrice ? 'error' : ''}
                                />
                                {errors.SubscriptionPrice && (
                                    <span className="error-message">{errors.SubscriptionPrice}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>
                                    <FiDollarSign size={16} />
                                    Currency *
                                </label>
                                <select
                                    name="Currency"
                                    value={formData.Currency}
                                    onChange={handleChange}
                                    className={errors.Currency ? 'error' : ''}
                                >
                                    <option value="">Select currency</option>
                                    <option value="USD">USD</option>
                                    <option value="UAH">UAH</option>
                                    <option value="EUR">EUR</option>
                                </select>
                                {errors.Currency && (
                                    <span className="error-message">{errors.Currency}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>
                                    <FiInfo size={16} />
                                    Plan Type *
                                </label>
                                <input
                                    type="text"
                                    name="Type"
                                    value={formData.Type}
                                    onChange={handleChange}
                                    placeholder="e.g. Premium, Basic, etc."
                                    className={errors.Type ? 'error' : ''}
                                />
                                {errors.Type && (
                                    <span className="error-message">{errors.Type}</span>
                                )}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="spinner"></span>
                                    ) : isEdit ? (
                                        <><FiSave size={16} /> Save Changes</>
                                    ) : (
                                        <><FiPlus size={16} /> Create Plan</>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </ModalWrapper>
    );
}