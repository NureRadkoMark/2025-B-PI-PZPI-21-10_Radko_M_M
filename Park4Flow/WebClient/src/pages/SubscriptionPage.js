import React, { useEffect, useState } from 'react';
import moment from "moment";
import {
    FiCreditCard,
    FiCalendar,
    FiZap,
    FiCheckCircle,
    FiAlertCircle,
    FiLoader,
    FiPlus
} from 'react-icons/fi';
import apiService from "../api/apiService";
import PaymentModal from "../pages/PaymentModal";
import '../styles/SubscriptionPage.css';

const SubscriptionPage = () => {
    const [subscription, setSubscription] = useState(null);
    const [tariffPlans, setTariffPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalType, setModalType] = useState(null);
    const jwt = localStorage.getItem("jwtToken");
    const currency = localStorage.getItem("Currency");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [plans, subscriptionData] = await Promise.all([
                    apiService.getByCurrencyTariffPlans(jwt, currency),
                    apiService.getUserSubscription(jwt)
                ]);

                setTariffPlans(plans);

                if (subscriptionData?.tariffType && subscriptionData?.subscriptionEndUTC) {
                    setSubscription(subscriptionData);
                } else {
                    setSubscription(null);
                }
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Failed to load subscription data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jwt, currency]);

    const handleBuyTariff = (tariffPlanId, currency) => {
        localStorage.setItem("tariffPlanID", tariffPlanId);
        localStorage.setItem("Currency", currency);
        setModalType("subscription");
    };

    const handleRegisterParking = () => {
        window.location.href = '/register-parking';
    };

    const isSubscriptionActive = subscription?.tariffType && subscription?.subscriptionEndUTC;

    return (
        <div className="subscription-container">
            <div className="subscription-layout">
                {/* Левая колонка - текущая подписка */}
                <div className="subscription-card fade-in">
                    <h1 className="subscription-title">
                        <FiCreditCard size={24} />
                        My Subscription
                    </h1>

                    {loading ? (
                        <div className="loading-message">
                            <FiLoader className="animate-spin" /> Loading...
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <FiAlertCircle /> {error}
                        </div>
                    ) : isSubscriptionActive ? (
                        <div className="subscription-info">
                            <div className="subscription-detail">
                                <span className="subscription-label">Tariff Type:</span>
                                <span className="subscription-value">{subscription.tariffType}</span>
                            </div>
                            <div className="subscription-detail">
                                <span className="subscription-label">Valid Until:</span>
                                <span className="subscription-value">
                                    {moment(subscription.subscriptionEndUTC).local().format("YYYY-MM-DD HH:mm")}
                                </span>
                            </div>
                            <div className="subscription-detail">
                                <span className="subscription-label">Status:</span>
                                <span className="subscription-value" style={{ color: '#16a085' }}>
                                    Active
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="subscription-info">
                            <p>You don't have an active subscription.</p>
                            <p>Please choose a tariff plan to continue.</p>
                        </div>
                    )}
                </div>

                {/* Правая колонка - доступные тарифы */}
                <div className="subscription-card fade-in">
                    <h1 className="subscription-title">
                        <FiZap size={24} />
                        Available Tariff Plans
                    </h1>

                    {loading ? (
                        <div className="loading-message">
                            <FiLoader className="animate-spin" /> Loading plans...
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <FiAlertCircle /> {error}
                        </div>
                    ) : tariffPlans.length === 0 ? (
                        <div className="subscription-info">
                            <p>No tariff plans available for your currency.</p>
                        </div>
                    ) : (
                        <div className="tariffs-grid">
                            {tariffPlans.map(plan => (
                                <div className="tariff-card fade-in" key={plan.TariffPlanID}>
                                    <h3 className="tariff-name">{plan.Type}</h3>

                                    <div className="tariff-feature">
                                        <FiCalendar />
                                        <span>Duration: {plan.SubscriptionDuration} days</span>
                                    </div>

                                    {plan.Type.toLowerCase() === 'base' ? (
                                        <>
                                            <div className="tariff-feature">
                                                <FiCheckCircle />
                                                <span>Base analytics</span>
                                            </div>

                                            <div className="tariff-feature">
                                                <FiCheckCircle />
                                                <span>Base support</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="tariff-feature">
                                                <FiCheckCircle />
                                                <span>Advanced analytics</span>
                                            </div>

                                            <div className="tariff-feature">
                                                <FiCheckCircle />
                                                <span>Priority support</span>
                                            </div>
                                        </>
                                    )}

                                    <div className="tariff-price">
                                        {plan.SubscriptionPrice} {plan.Currency}
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleBuyTariff(plan.TariffPlanID, plan.Currency)}
                                    >
                                        <FiCreditCard size={16} />
                                        Subscribe
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Кнопка регистрации парковки */}
            <div className="register-btn-container">
                <button
                    className={`register-btn ${!isSubscriptionActive ? 'disabled' : ''}`}
                    onClick={handleRegisterParking}
                    disabled={!isSubscriptionActive}
                >
                    <FiPlus size={18} />
                    Register Parking
                </button>
            </div>

            {modalType && (
                <PaymentModal
                    type={modalType}
                    onClose={() => setModalType(null)}
                />
            )}
        </div>
    );
}

export default SubscriptionPage;