import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import apiService from "../api/apiService";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #e8f5e9;
  text-align: center;
`;

const Message = styled.h2`
  color: #2e7d32;
`;

const IconWrapper = styled.div`
  margin: 20px;
`;

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        const transactionType = localStorage.getItem("transactionType");
        const transactionID = localStorage.getItem("transactionID");
        const approvalUrl = localStorage.getItem("approvalUrl");
        const currency = localStorage.getItem("currency");
        const amount = localStorage.getItem("amount");
        const reservationId = localStorage.getItem("reservationID");
        const tariffPlanID = localStorage.getItem("tariffPlanID");

        const confirm = async () => {
            try {
                let res;
                if (transactionType === "subscription") {
                    res = approvalUrl.includes("paypal")
                        ? await apiService.payPalConfirmSubscribe(token, {
                            transactionID,
                            approvalUrl,
                            tariffPlanID,
                        })
                        : await apiService.liqPayConfirmSubscribe(token, {
                            transactionID,
                            tariffPlanID,
                        });
                } else if (transactionType === "deposit") {
                    res = approvalUrl.includes("paypal")
                        ? await apiService.payPalConfirmDeposit(token, {
                            transactionID,
                            approvalUrl,
                            desiredAmount: amount,
                        })
                        : await apiService.liqPayConfirmDeposit(token, {
                            transactionID,
                            desiredAmount: amount,
                        });
                } else if (transactionType === "payment") {
                    res = approvalUrl.includes("paypal")
                        ? await apiService.payPalConfirmPayment(token, {
                            transactionID,
                            approvalUrl,
                            desiredAmount: amount,
                        })
                        : await apiService.liqPayConfirmPayment(token, {
                            transactionID,
                            reservationId: reservationId,
                        });
                }
                setStatus(res.message?.toLowerCase().includes("success") ? "success" : "error");
            } catch (err) {
                setStatus("error");
            } finally {
                setLoading(false);
            }
        };
        confirm();
    }, []);

    return (
        <Container>
            {loading ? (
                <Message>Processing your payment...</Message>
            ) : status === "success" ? (
                <>
                    <IconWrapper>
                        <CheckCircle size={64} color="#2e7d32" />
                    </IconWrapper>
                    <Message>Payment Successful!</Message>
                    <Message>You can close this page</Message>
                </>
            ) : (
                <>
                    <IconWrapper>
                        <XCircle size={64} color="#d32f2f" />
                    </IconWrapper>
                    <Message>Payment Failed. Please try again.</Message>
                    <Message>You can close this page</Message>
                </>
            )}
        </Container>
    );
};

export default PaymentResult;