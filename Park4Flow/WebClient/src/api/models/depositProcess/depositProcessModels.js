export const depositProcessRequestModel = (desiredAmount, currency) => ({
    desiredAmount, currency
})

export const depositProcessResponseModel = (approvalUrl, transactionID) => ({
    approvalUrl, transactionID
})

export const payPalDepositConfirmRequestModel = (transactionID, approvalUrl, desiredAmount) => ({
    transactionID,
    approvalUrl,
    desiredAmount
})

export const liqPayDepositConfirmRequestModel = (transactionID, desiredAmount) => ({
    transactionID,
    desiredAmount
})

export const DepositConfirmResponseModel = (message) => ({
    message
})