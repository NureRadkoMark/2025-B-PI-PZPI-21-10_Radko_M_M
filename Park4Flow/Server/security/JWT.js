const jwt = require("jsonwebtoken");
const generateJwt = (UserID, Email, FirstName, SecondName, PhoneNumber, Role, IsBanned, IsBusiness) => {
    return jwt.sign({UserID, Email, FirstName, SecondName, PhoneNumber, Role, IsBanned, IsBusiness},
        process.env.JWT_SECRET_KEY,
        {expiresIn: '24h' }) //alive
}

module.exports = generateJwt;