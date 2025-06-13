export const registerRequestModel = (Email, Password, FirstName, SecondName, PhoneNumber, Currency) => ({
    Email,
    Password,
    FirstName,
    SecondName,
    PhoneNumber,
    Currency
});

export const registerResponseModel = (Message) => ({
    Message
})