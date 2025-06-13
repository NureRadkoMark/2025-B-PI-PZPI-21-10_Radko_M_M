import React, { useState, useEffect } from 'react';
import {FiEdit2, FiSave, FiPlus, FiX, FiCamera, FiCheck} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import apiService from "../api/apiService";
import {ModalWrapper} from "../components/ModalWrapper";
import '../styles/VehicleModal.css';
import {updateVehicleDataRequestModel} from "../api/models/vehicle/updateVehicleDataModels";
import {createVehicleDataRequestModel} from "../api/models/vehicle/createVehicleDataModels";

export default function VehicleModal({ vehicle = null, onClose, onSuccess }) {
    const token = localStorage.getItem('jwtToken');
    const [formData, setFormData] = useState({
        VehicleCategory: '',
        StateNumber: '',
        VehicleBrand: '',
        VehicleModel: '',
        FrontPhotoImage: null,
        VehicleID: null
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [submissionError, setSubmissionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const isEdit = !!vehicle;

    useEffect(() => {
        if (vehicle) {
            setFormData({
                VehicleCategory: vehicle.VehicleCategory || '',
                StateNumber: vehicle.StateNumber || '',
                VehicleBrand: vehicle.VehicleBrand || '',
                VehicleModel: vehicle.VehicleModel || '',
                FrontPhotoImage: null,
                VehicleID: vehicle.VehicleID
            });
        }
    }, [vehicle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, FrontPhotoImage: file }));
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.VehicleCategory) newErrors.VehicleCategory = 'Category is required';
        if (!formData.StateNumber) newErrors.StateNumber = 'License plate is required';
        if (!formData.VehicleBrand) newErrors.VehicleBrand = 'Brand is required';
        if (!formData.VehicleModel) newErrors.VehicleModel = 'Model is required';
        if (!isEdit && !formData.FrontPhotoImage) newErrors.FrontPhotoImage = 'Photo is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionError('');
        setSuccess(false);

        if (!validate()) return;

        try {
            setIsSubmitting(true);

            if (isEdit) {
                const request = updateVehicleDataRequestModel(
                    formData.VehicleID,
                    formData.VehicleCategory,
                    formData.StateNumber,
                    formData.VehicleBrand,
                    formData.VehicleModel
                );
                await apiService.updateVehicle(request, token);
            } else {
                const request = createVehicleDataRequestModel(
                    formData.VehicleCategory,
                    formData.StateNumber,
                    formData.VehicleBrand,
                    formData.VehicleModel,
                    formData.FrontPhotoImage
                );
                await apiService.createVehicle(request, token);
            }

            setSuccess(true);
            if (onSuccess) onSuccess();

            // Auto-close after 2 seconds
            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);
        } catch (err) {
            console.error('Vehicle operation error:', err);
            setSubmissionError(err.response?.data?.message ||
                `Failed to ${isEdit ? 'update' : 'create'} vehicle. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="vehicle-modal">
                <div className="modal-header">
                    <h2>
                        {isEdit ? <FiEdit2 size={24} /> : <FiPlus size={24} />}
                        {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="modal-content-wrapper">
                    <form onSubmit={handleSubmit}>
                        {submissionError && (
                            <div className="alert alert-error">
                                <FiX size={18} />
                                {submissionError}
                            </div>
                        )}

                        {success ? (
                            <div className="alert alert-success">
                                <FiCheck size={18} />
                                {isEdit ? 'Vehicle updated!' : 'Vehicle added!'}
                            </div>
                        ) : (
                            <>
                                <div className="form-columns">
                                    <div className="form-column">
                                        <div className="form-group">
                                            <label>
                                                <FaCar size={16} />
                                                Category *
                                            </label>
                                            <select
                                                name="VehicleCategory"
                                                value={formData.VehicleCategory}
                                                onChange={handleChange}
                                                className={errors.VehicleCategory ? 'error' : ''}
                                            >
                                                <option value="">Select</option>
                                                <option value="A">A (Motorcycles)</option>
                                                <option value="B">B (Cars)</option>
                                                <option value="C">C (Trucks)</option>
                                                <option value="D">D (Buses)</option>
                                            </select>
                                            {errors.VehicleCategory && <span className="error-message">{errors.VehicleCategory}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                <FaCar size={16} />
                                                License Plate *
                                            </label>
                                            <input
                                                type="text"
                                                name="StateNumber"
                                                value={formData.StateNumber}
                                                onChange={handleChange}
                                                placeholder="AB1234CD"
                                                className={errors.StateNumber ? 'error' : ''}
                                            />
                                            {errors.StateNumber && <span className="error-message">{errors.StateNumber}</span>}
                                        </div>
                                    </div>

                                    <div className="form-column">
                                        <div className="form-group">
                                            <label>
                                                <FaCar size={16} />
                                                Brand *
                                            </label>
                                            <input
                                                type="text"
                                                name="VehicleBrand"
                                                value={formData.VehicleBrand}
                                                onChange={handleChange}
                                                placeholder="Toyota"
                                                className={errors.VehicleBrand ? 'error' : ''}
                                            />
                                            {errors.VehicleBrand && <span className="error-message">{errors.VehicleBrand}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                <FaCar size={16} />
                                                Model *
                                            </label>
                                            <input
                                                type="text"
                                                name="VehicleModel"
                                                value={formData.VehicleModel}
                                                onChange={handleChange}
                                                placeholder="Camry"
                                                className={errors.VehicleModel ? 'error' : ''}
                                            />
                                            {errors.VehicleModel && <span className="error-message">{errors.VehicleModel}</span>}
                                        </div>
                                    </div>
                                </div>

                                {!isEdit && (
                                    <div className="photo-section">
                                        <div className="form-group">
                                            <label>
                                                <FiCamera size={16} />
                                                Front Photo *
                                            </label>
                                            <div className="photo-upload">
                                                <input
                                                    type="file"
                                                    id="vehicle-photo"
                                                    name="FrontPhotoImage"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                                <label htmlFor="vehicle-photo" className="btn btn-secondary">
                                                    Choose File
                                                </label>
                                                {photoPreview && (
                                                    <div className="photo-preview">
                                                        <img src={photoPreview} alt="Vehicle preview" />
                                                    </div>
                                                )}
                                            </div>
                                            {errors.FrontPhotoImage && <span className="error-message">{errors.FrontPhotoImage}</span>}
                                        </div>
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="spinner"></span>
                                        ) : isEdit ? (
                                            <><FiSave size={16} /> Save</>
                                        ) : (
                                            <><FiPlus size={16} /> Add</>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </ModalWrapper>
    );
}
