const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const {User, UserBalance} = require('../models/models')
const {encryptData, decryptData} = require('../security/AEScipher')
const generateJwt = require('../security/JWT')
const sendEmail = require('../notifications/sendEmail')
const securityCodesGenerator = require('../security/SecurutyCodesGenerator')
const {Op} = require("sequelize");

class UserController {

    // Register user, encrypt phone number, hash password, save user, and return JWT token.
    async registration(req, res) {
        try {
            const { Email, Password, FirstName, SecondName, PhoneNumber, Currency, Lang} = req.body;
            if (!Email || !Password || !FirstName || !SecondName || !PhoneNumber) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            // Check if user already exists
            const existingUser = await User.findOne(
                {
                    where: { [Op.or]: [{ Email }]
                    } });
            if (existingUser) {
                return res.status(409).json({ error: "User with this email already exists" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(Password, 10);
            const encryptedPhone = encryptData(PhoneNumber);

            // Save user
            const user = await User.create({
                Email,
                Password: hashedPassword,
                FirstName,
                SecondName,
                PhoneNumber: encryptedPhone,
                RegisterDate: new Date().toISOString(), // Save in UTC format
                Role: "driver",
                SecurityCode: securityCodesGenerator()
            });

            // Create user balance
            const userBalance = await UserBalance.create({
                UserUserID: user.UserID,
                Balance: 0.00,
                Currency: Currency
            })

            await sendEmail(Email, 'Welcome to Park4Flow!', 'Welcome to Park4Flow! Thank you for registering. ' +
                'We hope that using our system will leave you with only pleasant impressions. \n' + '😊');


            return res.json("Registration successful");
        } catch (e) {
            console.error("Unexpected error:", e);
            return res.status(500).json({ error: "Internal Server Error - Unexpected error" });
        }
    }

    // Login user with email and password, check if banned, return JWT token.
    async login(req, res) {
        try {
            const { Email, Password, Lang } = req.body;
            const user = await User.findOne(
                {
                    where: { Email }
                });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const isPasswordValid = await bcrypt.compare(Password, user.Password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: "Invalid password" });
            }

            if (user.IsBanned) {
                return res.status(403).json({ error: "User is banned" });
            }

            const decryptedPhone = decryptData(user.PhoneNumber);
            const token = generateJwt(user.UserID, user.Email, user.FirstName,
                user.SecondName, decryptedPhone, user.Role, user.IsBanned, user.IsBusiness);
            return res.json({ token });
        } catch (e) {
            console.error("Unexpected error:", e);
            return res.status(500).json({ error: "Internal Server Error - Unexpected error" });
        }
    }

    // Ban user by setting IsBanned to true
    async ban(req, res) {
        try {
            const { UserID } = req.body;
            const user = await User.findByPk(UserID);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            if (user.IsBanned) {
                return res.status(400).json({ error: "User is already banned" });
            }
            user.IsBanned = true;
            await user.save();
            return res.json({ message: "User banned successfully" });
        } catch (e) {
            console.error("Unexpected error:", e);
            return res.status(500).json({ error: "Internal Server Error - Unexpected error" });
        }
    }

    // Unban user by setting IsBanned to false
    async unban(req, res) {
        try {
            const { UserID } = req.body;
            const user = await User.findByPk(UserID);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            if (!user.IsBanned) {
                return res.status(400).json({ error: "User is not banned" });
            }
            user.IsBanned = false;
            await user.save();
            return res.json({ message: "User unbanned successfully" });
        } catch (e) {
            console.error("Unexpected error:", e);
            return res.status(500).json({ error: "Internal Server Error - Unexpected error" });
        }
    }

    // Get user details
    async getUserDetails(req, res) {
        try {
            const UserID  = req.user.UserID;
            const user = await User.findByPk(UserID);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const userBalance = await UserBalance.findOne({
                where: {UserUserID: user.UserID}
            })
            if (!userBalance) {
                return res.status(404).json({ error: "User balance not found" });
            }


            const decryptedPhone = decryptData(user.PhoneNumber);

            console.log({Email: user.Email,
                PhoneNumber: decryptedPhone,
                FirstName: user.FirstName,
                SecondName: user.SecondName,
                Role: user.Role,
                Bonuses: user.Bonuses,
                Balance: userBalance.Balance,
                Currency: userBalance.Currency,
                SecurityCode: user.SecurityCode})

            return res.json({
                Email: user.Email,
                PhoneNumber: decryptedPhone,
                FirstName: user.FirstName,
                SecondName: user.SecondName,
                Role: user.Role,
                Bonuses: user.Bonuses,
                Balance: userBalance.Balance,
                Currency: userBalance.Currency,
                SecurityCode: user.SecurityCode
            });
        } catch (e) {
            console.error("Unexpected error:", e);
            return res.status(500).json({ error: "Internal Server Error - Unexpected error" });
        }
    }

    // Update user data: PhoneNumber, FirstName, SecondName
    async updateUserData(req, res) {
        try {
            const { UserID } = req.user;
            const { PhoneNumber, FirstName, SecondName } = req.body;

            const user = await User.findByPk(UserID);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            if (PhoneNumber) {
                user.PhoneNumber = encryptData(PhoneNumber);
            }
            if (FirstName) {
                user.FirstName = FirstName;
            }
            if (SecondName) {
                user.SecondName = SecondName;
            }

            await user.save();
            return res.json({message: "User data updated successfully"})
        } catch (e) {
            console.error("Unexpected error:", e);
            return res.status(500).json({ error: "Internal Server Error - Unexpected error" });
        }
    }

    // Password recovery process.
    async passRecovery(req, res) {
        try {
            const { Email } = req.body;
            const user = await User.findOne(
                { where: { Email }
                });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Generate a 6-digit security code
            user.SecurityCode = securityCodesGenerator();
            await user.save();

            sendEmail(user.Email, 'Park4Flow password recovery', 'Your security code:\n' + user.SecurityCode + '\n' + 'Please, do not tell this code to anyone! ')

            return res.json({ message: "Security code sent to email" });
        } catch (e) {
            console.error("Unexpected error:", e);
            return res.status(500).json({ error: "Internal Server Error - Unexpected error" });
        }
    }

    async resetPassword(req, res) {
        try {
            const { Email, SecurityCode, NewPassword } = req.body;
            const user = await User.findOne(
                {
                    where: { Email, SecurityCode }
                });
            if (!user) {
                return res.status(400).json({ error: "Invalid security code or email" });
            }

            user.Password = await bcrypt.hash(NewPassword, 10);
            user.SecurityCode = securityCodesGenerator();
            await user.save();

            return res.json({ message: "Password reset successfully" });
        } catch (e) {
            console.error("Unexpected error:", e);
            return res.status(500).json({ error: "Internal Server Error - Unexpected error" });
        }
    }

    // Update user status to business
    async setBusiness(req, res) {
        try {
            const { UserID } = req.user;
            const user = await User.findByPk(UserID);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            if (user.IsBusiness) {
                return res.status(400).json({ error: "User is already a business account" });
            }
            user.IsBusiness = true;
            user.Role = 'owner';

            await user.save();
            return res.json({ message: "User upgraded to business account" });
        } catch (e) {
            console.error("Unexpected error:", e);
            return res.status(500).json({ error: "Internal Server Error - Unexpected error" });
        }
    }

    // Update JWT
    async check(req, res) {
        try {
            const token = generateJwt(req.user.UserID, req.user.Email,
                req.user.FirstName, req.user.SecondName, req.user.PhoneNumber, req.user.Role, req.user.IsBanned, req.user.IsBusiness)
            return res.json({token})
        } catch (e) {
            console.error(e)

        }
    }

    async getWhereEmail(req, res) {
        try {
            const { email } = req.params;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            const user = await User.findOne({
                where: { Email: email }
            });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({
                UserID: user.UserID,
                Email: user.Email,
                FirstName: user.FirstName,
                SecondName: user.SecondName,
                PhoneNumber: decryptData(user.PhoneNumber),
                IsBanned: user.IsBanned,
                IsBusiness: user.IsBusiness,
                Role: user.Role,
                RegistrationDate: user.createdAt
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Delete user account and all user data from database
    async delete(req, res){
        try {
            // Check if UserID is provided
            if (!req.user || !req.user.UserID) {
                return res.status(400).json({ error: 'UserID not found in the request' });
            }

            const userId = req.user.UserID;

            // Find the user in the database
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Delete the user
            await user.destroy();

            return res.status(200).json({ message: 'User successfully deleted' });
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new UserController()