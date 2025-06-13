import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiDollarSign, FiInfo, FiCheck, FiX } from 'react-icons/fi';
import apiService from "../api/apiService";
import '../styles/PaymentModal.css';

const PaymentModal = ({ type, onClose }) => {
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState(localStorage.getItem("Currency"));
    const [method, setMethod] = useState("liqpay");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [payByBonuses, setPayByBonuses] = useState(false);
    const storedAmount = localStorage.getItem("amount");

    useEffect(() => {
        if (currency === "UAH") setMethod("liqpay");
        setAmount(storedAmount)
    }, [currency]);

    const handlePay = async () => {
        setError(null);
        setLoading(true);

        try {
            const token = localStorage.getItem("jwtToken");
            const tariffPlanID = localStorage.getItem("tariffPlanID");
            const reservationID = localStorage.getItem("reservationID");
            localStorage.setItem("transactionType", type);

            if (type === "payment") {
                const storedCurrency = localStorage.getItem("Currency");

                if (!storedAmount || !storedCurrency) {
                    throw new Error("Payment details not found. Please try again.");
                }

                setAmount(+storedAmount);

                const requestPayload = {
                    reservationId: reservationID,
                    desiredAmount: +storedAmount,
                    payByBonuses: payByBonuses,
                    currency: storedCurrency,
                };
                console.log(requestPayload)

                let response;
                if (method === "paypal") {
                    response = await apiService.payPalCreatePayment(token, requestPayload);
                } else if (method === "liqpay") {
                    response = await apiService.liqPayCreatePayment(token, requestPayload);
                } else {
                    response = await apiService.balancePayment(token, requestPayload);
                    if (response.success) {
                        window.location.href = '/payment-result';
                        return;
                    }
                    throw new Error("Balance payment failed");
                }

                if (!response?.paymentUrl) {
                    throw new Error("Payment gateway error. Please try another method.");
                }

                localStorage.setItem("transactionID", response.transactionID);
                localStorage.setItem("approvalUrl", response.paymentUrl);

                const win = window.open(response.paymentUrl, "_blank");
                if (!win) {
                    throw new Error("Popup blocked. Please allow popups for this site.");
                }
                return;
            }

            // Обработка подписки и депозита
            let response;
            if (type === "subscription") {
                response = method === "paypal"
                    ? await apiService.payPalCreateSubscribe(token, { tariffPlanID })
                    : await apiService.liqPayCreateSubscribe(token, { tariffPlanID });
            } else if (type === "deposit") {
                if (!amount || amount <= 0) {
                    throw new Error("Please enter a valid amount");
                }

                response = method === "paypal"
                    ? await apiService.payPalCreateDeposit(token, { desiredAmount: +amount, currency })
                    : await apiService.liqPayCreateDeposit(token, { desiredAmount: +amount, currency });
            }

            if (!response?.paymentUrl) {
                throw new Error("Payment processing failed. Please try again.");
            }

            localStorage.setItem("transactionID", response.transactionID);
            localStorage.setItem("approvalUrl", response.paymentUrl);
            localStorage.setItem("amount", amount.toString());

            const win = window.open(response.paymentUrl, "_blank");
            if (!win) {
                throw new Error("Popup blocked. Please allow popups for this site.");
            }
        } catch (err) {
            console.error("Payment error:", err);
            setError(err.message || "Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal">
                <div className="modal-header">
                    <h2>
                        <FiCreditCard size={24} />
                        {type === "deposit" ? "Top Up Balance" :
                            type === "subscription" ? "Subscribe" : "Complete Payment"}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="modal-content">
                    {type === "deposit" && (
                        <div className="form-group">
                            <label>
                                <FiDollarSign size={16} />
                                Amount *
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="1"
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>
                            <FiDollarSign size={16} />
                            Currency
                        </label>
                        <select value={currency} disabled={loading}>
                            <option value="UAH">UAH</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            <FiCreditCard size={16} />
                            Payment Method *
                        </label>
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            disabled={currency === "UAH" || loading}
                        >
                            <option value="liqpay">LiqPay</option>
                            <option value="paypal">PayPal</option>
                            <option value="balance">Balance</option>
                        </select>
                    </div>

                    {currency === "UAH" && method === "paypal" && (
                        <div className="alert alert-info">
                            <FiInfo size={16} />
                            PayPal is not available for UAH payments
                        </div>
                    )}

                    {type === "payment" && (
                        <>
                            <div className="payment-summary">
                                <p>Total amount: <strong>{amount} {currency}</strong></p>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={payByBonuses}
                                        onChange={(e) => setPayByBonuses(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <span>Use available bonuses</span>
                                </label>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="alert alert-error">
                            <FiX size={16} />
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handlePay}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner"></span>
                            ) : (
                                <>
                                    <FiCreditCard size={16} />
                                    {type === "payment" ? "Pay Now" : "Proceed to Payment"}
                                </>
                            )}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
