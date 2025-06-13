export const passRecoveryRequestModel = (Email) => ({
    Email
})

export const passRecoveryResponseModel = (Message) => ({
    Message
})

export const resetPasswordRequestModel = (Email, SecurityCode, NewPassword) => ({
    Email,
    SecurityCode,
    NewPassword
})

export const resetPasswordResponseModel = (Message) => ({
    Message
})