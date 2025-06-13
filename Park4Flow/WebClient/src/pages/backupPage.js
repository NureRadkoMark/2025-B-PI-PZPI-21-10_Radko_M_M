import React, { useState } from 'react';
import { FiDownload, FiDatabase, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import backupAnimation from '../utils/backupAnimation.json';
import apiService from "../api/apiService";
import '../styles/BackupPage.css';

const BackupPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleBackup = async () => {
        setIsLoading(true);
        setMessage('');
        setError('');
        setDownloadUrl(null);

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await apiService.backupCreate(token);

            if (response.error) {
                throw new Error(response.error);
            }

            setDownloadUrl(response.downloadUrl);
            setMessage(response.message || 'Backup created successfully');
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Error creating backup. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="backup-container">
            <motion.div
                className="backup-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="backup-header">
                    <FiDatabase size={32} className="backup-icon" />
                    <h1 className="backup-title">Data Backup</h1>
                </div>

                <p className="backup-description">
                    Create a complete backup of your data. This may take a few moments.
                </p>

                {(error || message) && (
                    <div className={`backup-alert ${error ? 'error' : 'success'}`}>
                        {error ? (
                            <>
                                <FiAlertCircle size={18} />
                                <span>{error}</span>
                            </>
                        ) : (
                            <>
                                <FiCheckCircle size={18} />
                                <span>{message}</span>
                            </>
                        )}
                    </div>
                )}

                {!isLoading && !downloadUrl && (
                    <button
                        className="btn btn-primary backup-button"
                        onClick={handleBackup}
                        disabled={isLoading}
                    >
                        <FiDownload size={18} />
                        {isLoading ? 'Creating Backup...' : 'Create Backup'}
                    </button>
                )}

                {isLoading && (
                    <div className="backup-animation">
                        <Lottie
                            animationData={backupAnimation}
                            loop={true}
                            style={{ height: 150 }}
                        />
                        <p className="backup-loading-text">Generating your backup, please wait...</p>
                    </div>
                )}

                {downloadUrl && (
                    <a
                        href={downloadUrl}
                        download="backup.zip"
                        className="btn btn-primary download-button"
                    >
                        <FiDownload size={18} />
                        Download Backup File
                    </a>
                )}
            </motion.div>
        </div>
    );
};

export default BackupPage;
