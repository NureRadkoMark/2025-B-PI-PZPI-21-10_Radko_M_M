const { Parking, ParkingBalance, Transaction, Reservation, ParkingManager, User, ParkPlace, SubPay, TariffPlan,
    UserBalance, FavouriteParking
} = require('../models/models');
const { Sequelize, Op} = require('sequelize');
const fs = require('fs');
const path = require('path');
const axios = require("axios");
const multer = require('multer');
const sharp = require('sharp');
const securityCodesGenerator = require("../security/SecurutyCodesGenerator");
const sendEmail = require("../notifications/sendEmail");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

class ParkingController {
    // Create new Parking, ParkingBalance and assign ParkingManager
    async create(req, res) {
        const transaction = await Parking.sequelize.transaction();
        try {
            const { Address, Name, Info, Longitude, Latitude, DynamicPricing, DemandFactor } = req.body;

            if (!req.file) {
                return res.status(400).json({ message: 'FrontPhotoImage is required' });
            }
            const PhotoImage = `/uploads/${req.file.filename}`;

            // Create Parking
            const parking = await Parking.create({
                Address,
                Name,
                Info,
                Longitude,
                Latitude,
                DynamicPricing,
                DemandFactor,
                PhotoImage: PhotoImage
            }, { transaction });

            // Create ParkingBalance for new Parking
            await ParkingBalance.create({ ParkingParkingID: parking.ParkingID }, { transaction });

            // Assign ParkingManager with role 'owner'
            await ParkingManager.create({
                ParkingParkingID: parking.ParkingID,
                UserUserID: req.user.UserID,
                Role: 'owner'
            }, { transaction });

            // Update user to mark them as business account
            await User.update(
                { IsBusiness: true,
                Role: 'owner'},
                { where: { UserID: req.user.UserID }, transaction }
            );

            await transaction.commit();
            return res.status(201).json(parking);
        } catch (error) {
            await transaction.rollback();
            console.log(error)
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }

    // Update Parking data using ParkingID
    async update(req, res) {
        try {
            const { ParkingID } = req.params;
            const { Address, Name, Info,  DynamicPricing, DemandFactor } = req.body;

            const parking = await Parking.findByPk(ParkingID);
            if (!parking) {
                return res.status(404).json({ error: 'Parking not found' });
            }

            await parking.update({ Address, Name, Info, DynamicPricing, DemandFactor });
            return res.status(200).json(parking);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }

    async deleteConfirm(req, res){
        try {
            const user = await User.findByPk(req.OwnerID)
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Generate a 6-digit security code
            user.SecurityCode = securityCodesGenerator();
            await user.save();

            sendEmail(user.Email, 'Park4Flow parking deleting', 'Your security code:\n' + user.SecurityCode + '\n' + 'Please, do not tell this code to anyone! ')

            return res.json({ message: "Security code sent to email" });
        } catch (e) {
            console.error("Unexpected error:", e);
            return res.status(500).json({ error: "Internal Server Error - Unexpected error" });
        }
    }

    // Delete Parking and all related data (Cascade deletion)
    async delete(req, res) {
        const transaction = await Parking.sequelize.transaction();
        try {
            const { ParkingID, SecurityCode } = req.body;
            const user = await User.findOne(
                {
                    where: { UserID: req.OwnerID,
                        SecurityCode: SecurityCode }
                });
            if (!user) {
                return res.status(400).json({ error: "Invalid security code or email" });
            }

            const parking = await Parking.findByPk(ParkingID);
            if (!parking) {
                return res.status(404).json({ error: 'Parking not found' });
            }

            await Parking.destroy({ where: { ParkingID }, transaction });
            await transaction.commit();
            return res.status(200).json({ message: 'Parking deleted successfully' });
        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }

    // Get statistics for a parking lot and its park places (transactions analytics and day/hour loading)
    async getStatisticInfo(req, res) {
        try {
            const passedID = req.params?.ParkingID || req.body?.ParkingID || null;
            const ParkingID = passedID ?? req.ParkingID;

            if (!ParkingID) {
                return res.status(400).json({ error: 'Parking ID is required.' });
            }

            const tariffPlan = await TariffPlan.findByPk(req.TariffPlanID);
            const owner = await User.findByPk(req.OwnerID);
            const parking = await Parking.findByPk(ParkingID, {
                include: [{ model: ParkPlace }]
            });

            if (!parking) {
                return res.status(404).json({ error: 'Parking not found' });
            }

            const places = parking.ParkPlace || [];
            const totalPlaces = places.length;
            const takenPlaces = places.filter(p => p.IsTaken).length;
            const freePlaces = totalPlaces - takenPlaces;

            const prices = places.map(p => parseFloat(p.CurrentPrice)).filter(p => !isNaN(p));
            const averagePrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
            const minPrice = prices.length ? Math.min(...prices) : 0;
            const maxPrice = prices.length ? Math.max(...prices) : 0;

            const parkBalance = await ParkingBalance.findOne({ where: { ParkingParkingID: ParkingID } });

            const baseStats = {
                totalPlaces,
                takenPlaces,
                freePlaces,
                averagePrice: averagePrice.toFixed(2),
                minPrice: minPrice.toFixed(2),
                maxPrice: maxPrice.toFixed(2),
                demandFactor: parking.DemandFactor || 0,
                parkingBalance: parkBalance?.Balance || 0,
                currency: parkBalance?.Currency || 'UAH',
                PhotoImage: parking.PhotoImage || ''
            };

            if (tariffPlan?.Type === 'base') {
                return res.status(200).json({
                    tariffPlan: 'base',
                    statistics: baseStats
                });
            }

            // Резервации и графики
            const reservations = await Reservation.findAll({
                where: {
                    ParkPlaceParkPlaceID: places.map(p => p.ParkPlaceID)
                },
                attributes: ['StartTime', 'EndTime']
            });

            const hourlyUsage = Array(24).fill(0);
            const dailyMap = {};
            for (const resv of reservations) {
                const start = new Date(resv.StartTime);
                const end = new Date(resv.EndTime);
                const dayKey = start.toISOString().split('T')[0];
                dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1;
                for (let h = start.getUTCHours(); h <= end.getUTCHours(); h++) {
                    hourlyUsage[h % 24]++;
                }
            }

            const peakHour = hourlyUsage.indexOf(Math.max(...hourlyUsage));
            const totalReservations = reservations.length;

            const projectedLoad = {
                peakHour,
                hourlyUsage,
                recommendation: peakHour >= 7 && peakHour <= 10
                    ? 'High morning load. Consider offering discounts during off-peak hours.'
                    : 'Evening hours are most active. Monitor reservation trends closely.'
            };

            // Транзакции
            const transactions = await Transaction.findAll({
                where: {
                    UserUserID: owner?.UserUserID || 0,
                    Type: ['revenue', 'payout'],
                    Status: 'success',
                    DateAndTime: { [Op.gte]: new Date(Date.now() - 30 * 86400000) }
                },
                attributes: ['Type', 'Amount', 'DateAndTime'],
                order: [['DateAndTime', 'ASC']]
            });

            const transactionStats = { dailyRevenue: {}, dailyPayout: {} };
            for (const tx of transactions) {
                const dateKey = new Date(tx.DateAndTime).toISOString().split('T')[0];
                const amount = parseFloat(tx.Amount);
                if (tx.Type === 'revenue') transactionStats.dailyRevenue[dateKey] = (transactionStats.dailyRevenue[dateKey] || 0) + amount;
                if (tx.Type === 'payout') transactionStats.dailyPayout[dateKey] = (transactionStats.dailyPayout[dateKey] || 0) + amount;
            }

            const formatChartData = (obj) =>
                Object.entries(obj).map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) }));

            /*return res.status(200).json({
                tariffPlan: tariffPlan?.Type || 'advanced',
                statistics: {
                    ...baseStats,
                    reservationCount: totalReservations,
                    projectedLoad
                },
                analyticsCharts: {
                    dailyReservations: Object.entries(dailyMap).map(([date, count]) => ({ date, count })),
                    hourlyReservations: hourlyUsage.map((count, hour) => ({ hour, count })),
                    revenueChart: formatChartData(transactionStats.dailyRevenue),
                    payoutChart: formatChartData(transactionStats.dailyPayout)
                }
            });*/
            return res.status(200).json({
                tariffPlan: 'advanced',
                statistics: {
                    totalPlaces: 20,
                    takenPlaces: 7,
                    freePlaces: 13,
                    averagePrice: '48.25',
                    minPrice: '30.00',
                    maxPrice: '70.00',
                    demandFactor: 1.65,
                    parkingBalance: 12400.50,
                    currency: 'UAH',
                    PhotoImage: 'https://2f9a-141-105-139-230.ngrok-free.app/proxy-image/1746715067561-IMG_20250330_154425.jpg',
                    reservationCount: 25,
                    projectedLoad: {
                        peakHour: 18,
                        hourlyUsage: [
                            0, 0, 0, 0, 1, 1, 2, 3, 4, 5, 6, 4, 3, 2, 2, 2, 3, 5, 7, 6, 4, 2, 1, 0
                        ],
                        recommendation: 'Evening hours are most active. Monitor reservation trends closely.'
                    }
                },
                analyticsCharts: {
                    dailyReservations: [
                        { date: '2025-05-25', count: 2 },
                        { date: '2025-05-26', count: 4 },
                        { date: '2025-05-27', count: 3 },
                        { date: '2025-05-28', count: 5 },
                        { date: '2025-05-29', count: 6 },
                        { date: '2025-05-30', count: 3 },
                        { date: '2025-05-31', count: 2 },
                        { date: '2025-06-01', count: 4 },
                        { date: '2025-06-02', count: 5 },
                        { date: '2025-06-03', count: 7 },
                        { date: '2025-06-04', count: 6 },
                        { date: '2025-06-05', count: 8 },
                        { date: '2025-06-06', count: 5 },
                        { date: '2025-06-07', count: 3 },
                        { date: '2025-06-08', count: 4 },
                        { date: '2025-06-09', count: 6 },
                        { date: '2025-06-10', count: 7 },
                        { date: '2025-06-11', count: 5 },
                        { date: '2025-06-12', count: 4 },
                        { date: '2025-06-13', count: 3 } // Сегодняшние данные
                    ],
                    hourlyReservations: Array.from({ length: 24 }, (_, hour) => ({
                        hour,
                        count: [0, 0, 0, 0, 1, 1, 2, 3, 4, 5, 6, 4, 3, 2, 2, 2, 3, 5, 7, 6, 4, 2, 1, 0][hour]
                    })),
                    revenueChart: [
                        { date: '2025-05-25', amount: 500.00 },
                        { date: '2025-05-26', amount: 750.00 },
                        { date: '2025-05-27', amount: 600.00 },
                        { date: '2025-05-28', amount: 950.00 },
                        { date: '2025-05-29', amount: 1000.00 },
                        { date: '2025-05-30', amount: 875.00 },
                        { date: '2025-05-31', amount: 700.00 },
                        { date: '2025-06-01', amount: 800.00 },
                        { date: '2025-06-02', amount: 950.00 },
                        { date: '2025-06-03', amount: 1100.00 },
                        { date: '2025-06-04', amount: 1050.00 },
                        { date: '2025-06-05', amount: 1200.00 },
                        { date: '2025-06-06', amount: 900.00 },
                        { date: '2025-06-07', amount: 750.00 },
                        { date: '2025-06-08', amount: 850.00 },
                        { date: '2025-06-09', amount: 1100.00 },
                        { date: '2025-06-10', amount: 1150.00 },
                        { date: '2025-06-11', amount: 950.00 },
                        { date: '2025-06-12', amount: 800.00 },
                        { date: '2025-06-13', amount: 600.00 } // Сегодняшние данные
                    ],
                    payoutChart: [
                        { date: '2025-05-26', amount: 300.00 },
                        { date: '2025-05-29', amount: 400.00 },
                        { date: '2025-05-31', amount: 250.00 },
                        { date: '2025-06-02', amount: 350.00 },
                        { date: '2025-06-05', amount: 450.00 },
                        { date: '2025-06-09', amount: 300.00 },
                        { date: '2025-06-12', amount: 400.00 }
                    ]
                }
            });

        } catch (error) {
            console.error('getStatisticInfo error:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                details: error.message
            });
        }
    }


    // Gets a list of parkings that match the user's currency.
    // This ensures users only see parkings where they can pay with their own currency.
    async getWhereUser(req, res) {
        try {
            const UserID = req.user.UserID;

            // Validate that UserID exists
            if (!UserID) {
                return res.status(400).json({ error: 'User ID not provided.' });
            }

            // Find the user's balance information
            const userBalance = await UserBalance.findOne({
                where: { UserUserID: UserID }
            });

            // Check if user balance exists
            if (!userBalance) {
                return res.status(405).json({ error: 'User balance not found.' });
            }

            // Find parkings that support the same currency as the user's balance
            const preferredParkings = await Parking.findAll({
                include: [
                    {
                        model: ParkingBalance,
                        where: { Currency: userBalance.Currency }
                    }
                ]
            });

            const changedPreferredParkings = preferredParkings.map(parking => ({
                ParkingID: parking.ParkingID,
                Address: parking.Address,
                Name: parking.Name,
                Info: parking.Info,
                IsActive: parking.IsActive,
                Longitude: parking.Longitude,
                Latitude: parking.Latitude,
                DynamicPricing: parking.DynamicPricing,
                DemandFactor: parking.DemandFactor,
                PhotoImage: `${process.env.NGROK_DOMAIN}/proxy-image/${path.basename(parking.PhotoImage)}`, // full URL
            }))

            // Return the filtered parking list
            return res.status(200).json(changedPreferredParkings);
        } catch (error) {
            console.error('Error in getWhereUser:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    }

    async getWhereCurrency(req, res) {
        try {
            // Authentication check
            if (!req.user?.UserID) {
                return res.status(401).json({
                    success: false,
                    message: "Authorization required"
                });
            }

            const userID = req.user.UserID;

            // Get user balance
            const userBalance = await UserBalance.findOne({
                where: { UserUserID: userID }
            }).catch(error => {
                console.error("Database error:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error retrieving user balance"
                });
            });

            if (!userBalance) {
                return res.status(404).json({
                    success: false,
                    message: "User balance not found"
                });
            }

            // Get parkings with matching currency
            const parkings = await Parking.findAll({
                include: [{
                    model: ParkingBalance,
                    where: { Currency: userBalance.Currency }
                }]
            }).catch(error => {
                console.error("Database error:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error retrieving parking data"
                });
            });

            const parkingWithImage = parkings.map(parking => ({
                ParkingID: parking.ParkingID,
                Address: parking.Address,
                Name: parking.Name,
                Info: parking.Info,
                IsActive: parking.IsActive,
                Longitude: parking.Longitude,
                Latitude: parking.Latitude,
                DynamicPricing: parking.DynamicPricing,
                DemandFactor: parking.DemandFactor,
                PhotoImage: `${process.env.NGROK_DOMAIN}/proxy-image/${path.basename(parking.PhotoImage)}`, // full URL
            }))

            return res.status(200).json({
                success: true,
                data: parkingWithImage
            });

        } catch (error) {
            console.error("Server error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                ...(process.env.NODE_ENV === "development" && {
                    debug: error.message
                })
            });
        }
    }

    async getParkingID(req, res){
        const { ParkingID } = req.ParkingID;
        return res.status(200).json({parkingID: ParkingID})
    }

    async getWhereOwner(req, res) {
        try {
            const parkings = await Parking.findAll({
                include: [
                    {
                        model: User,
                        attributes: [],
                        through: {
                            model: ParkingManager,
                            attributes: []
                        },
                        where: {
                            UserID: req.OwnerID,
                            Role: 'owner'
                        }


                    }
                ]
            });

            if (!parkings || parkings.length === 0) {
                return res.status(404).json({ error: 'No parkings found for this owner.' });
            }

            const formattedParkings = parkings.map(parking => ({
                ParkingID: parking.ParkingID,
                Address: parking.Address,
                Name: parking.Name,
                Info: parking.Info,
                IsActive: parking.IsActive,
                Longitude: parking.Longitude,
                Latitude: parking.Latitude,
                DynamicPricing: parking.DynamicPricing,
                DemandFactor: parking.DemandFactor,
                PhotoImage: `${process.env.NGROK_DOMAIN}/proxy-image/${path.basename(parking.PhotoImage)}`,
            }));

            return res.status(200).json({ parkings: formattedParkings });

        } catch (error) {
            console.error('❌ Error fetching owner parkings:', error);
            return res.status(500).json({ error: 'An unexpected error occurred while fetching parkings.' });
        }
    }

    async getInfo(req, res){
        const {ParkingID} = req.params
        const parking = await Parking.findByPk(ParkingID)
        parking.PhotoImage = `${process.env.NGROK_DOMAIN}/proxy-image/${path.basename(parking.PhotoImage)}`


        return res.status(200).json({ parking: parking });
    }


}

module.exports = new ParkingController();
module.exports.upload = upload;