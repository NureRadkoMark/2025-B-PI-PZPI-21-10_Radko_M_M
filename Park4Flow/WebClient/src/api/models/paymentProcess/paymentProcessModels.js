export const paymentRequestModel = (reservationId, desiredAmount, payByBonuses, currency) => ({
    reservationId,
    desiredAmount,
    payByBonuses,
    currency
})

export const paymentResponseModel = (paymentUrl, transactionID) => ({
    paymentUrl,
    transactionID
})

export const payPalPaymentConfirmRequestModel = (transactionID, approvalUrl, reservationId) => ({
    transactionID,
    approvalUrl,
    reservationId
})

export const liqPayPaymentConfirmRequestModel = (transactionID, reservationId) => ({
    transactionID,
    reservationId
})

export const confirmPaymentResponseModel = (Message) => ({
    Message
})