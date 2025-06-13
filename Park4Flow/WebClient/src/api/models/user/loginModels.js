export const loginRequestModel = (Email, Password) => ({
    Email,
    Password
});

export const loginResponseModel = (token) => ({
    token
});