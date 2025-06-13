export const subscribeRequestModel = (tariffPlanID) => ({
    tariffPlanID
})

export const subscribeResponseModel = (paymentUrl, transactionID) => ({
    paymentUrl,
    transactionID
})

export const payPalConfirmModel = (transactionID, approvalUrl, tariffPlanID) => ({
    transactionID,
    approvalUrl,
    tariffPlanID
})

export const liqPayConfirmModel = (transactionID, tariffPlanID) => ({
    transactionID,
    tariffPlanID
})

export const confirmSubscriptionResponseModel = (Message) => ({
    Message
})
