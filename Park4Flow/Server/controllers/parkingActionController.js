const { ParkingAction, Vehicle, ParkPay, ParkPlace, Reservation, User, Transaction} = require('../models/models');
const UserBalanceService = require('../services/userBalanceService');
const ParkingBalanceService = require('../services/parkingBalanceService')
const ParkPlaceService = require('../services/parkPlaceService');
const SalesPoliciesService = require('../services/salesPoliciesService')
const UserDebtService = require('../services/userDebtService')
const { Op } = require('sequelize');
const Decimal = require('decimal.js');
const sequelize = require('../db');
const {decryptData} = require("../security/AEScipher");
const {formatDuration} = require("../localisations/time");

class ParkingActionController {
    async startParkingAction(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { SecurityCode, ParkPlaceID } = req.body;

            // Determine user
            let user = null;
            if (SecurityCode) {
                user = await User.findOne({
                    where: { SecurityCode }
                });
                if (!user) {
                    await transaction.rollback();
                    return res.status(404).json({ error: 'User not found by SecurityCode' });
                }
            } else if (req.user?.UserID) {
                user = await User.findByPk(req.user.UserID);
                if (!user) {
                    await transaction.rollback();
                    return res.status(404).json({ error: 'User not found' });
                }
            } else {
                await transaction.rollback();
                return res.status(400).json({ error: 'No authorization method provided' });
            }

            // Get park place
            const parkPlace = await ParkPlace.findByPk(ParkPlaceID);
            if (!parkPlace) {
                await transaction.rollback();
                return res.status(404).json({ error: 'ParkPlace not found' });
            }

            // Get user vehicle
            const vehicle = await Vehicle.findOne({
                where: {
                    UserUserID: user.UserID,
                    VehicleCategory: parkPlace.VehicleCategory
                }
            });
            
            if (!vehicle) {
                await transaction.rollback();
                return res.status(404).json({ error: 'User vehicle not found' });
            }

            const nowUTC = new Date();

            // Check if user has a valid active reservation for this place
            let reservation = await Reservation.findOne({
                where: {
                    VehicleVehicleID: vehicle.VehicleID,
                    ParkPlaceParkPlaceID: parkPlace.ParkPlaceID,
                    Status: 'created',
                }
            });

            let currency = parkPlace.Currency;
            let reservationFee = parkPlace.CurrentPrice;
            let endTime = null;

            if (reservation) {
                if (nowUTC >= reservation.StartTime && nowUTC <= reservation.EndTime) {
                    // Valid reservation in time
                    const prepayTransaction = await Transaction.findOne({
                        where: {
                            ReservationReservationID: reservation.ReservationID,
                            Type: 'payment',
                            UserUserID: user.UserID
                        }
                    });

                    currency = prepayTransaction?.Currency || currency;
                    reservationFee = prepayTransaction?.Amount || reservationFee;
                    endTime = reservation.EndTime;

                    await reservation.update({ Status: 'used' }, { transaction });
                } else if (nowUTC > reservation.EndTime) {
                    // Reservation expired, mark as such
                    await reservation.update({ Status: 'expired' }, { transaction });
                    reservation = null;
                }
            }

            // If no valid reservation, ensure no conflicting future reservation exists
            if (!reservation) {
                const conflictingReservation = await Reservation.findOne({
                    where: {
                        ParkPlaceParkPlaceID: parkPlace.ParkPlaceID,
                        Status: 'created',
                        StartTime: { [Op.gte]: nowUTC }
                    }
                });

                if (conflictingReservation) {
                    await transaction.rollback();
                    return res.status(403).json({
                        error: 'This parking spot is reserved in the near future. You cannot park here now.'
                    });
                }
            }

            // Create ParkingAction
            const parkingAction = await ParkingAction.create({
                StartTime: nowUTC,
                EndTime: endTime,
                TotalFee: reservationFee,
                Currency: currency,
                Status: 'started',
                ParkPlaceParkPlaceID: parkPlace.ParkPlaceID,
                VehicleVehicleID: vehicle.VehicleID
            }, { transaction });

            // Update park place status and demand
            await ParkPlaceService.setIsTakenTrue({ params: { ParkPlaceID } }, res);

            await transaction.commit();

            // Send WebSocket notification
            const wss = req.app.get('webSocketServer');
            wss.sendToUser(user.UserID.toString(), {
                type: 'parking_started',
                message: 'Parking session started successfully',
                parkingActionId: parkingAction.ParkingActionID,
                parkPlaceId: parkPlace.ParkPlaceID,
                startTime: nowUTC.toISOString(),
                endTime: endTime ? endTime.toISOString() : null,
                vehicle: {
                    licensePlate: decryptData(vehicle.StateNumber),
                    category: vehicle.VehicleCategory
                }
            });

            return res.status(201).json({
                message: 'Parking session started successfully',
                parkingAction
            });

        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({
                error: 'Internal Server Error',
                details: error.message
            });
        }
    }

    async stopParkingAction(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { SecurityCode, ParkPlaceID } = req.body;

            // Determine user
            let user = null;
            if (SecurityCode) {
                user = await User.findOne({
                    where: { SecurityCode }
                });
                if (!user) {
                    await transaction.rollback();
                    return res.status(404).json({ error: 'User not found by SecurityCode' });
                }
            } else if (req.user?.UserID) {
                user = await User.findByPk(req.user.UserID);
                if (!user) {
                    await transaction.rollback();
                    return res.status(404).json({ error: 'User not found' });
                }
            } else {
                await transaction.rollback();
                return res.status(400).json({ error: 'No authorization method provided' });
            }

            // Get user vehicle
            const vehicle = await Vehicle.findOne({
                where: { UserUserID: user.UserID }
            });
            if (!vehicle) {
                await transaction.rollback();
                return res.status(404).json({ error: 'User vehicle not found' });
            }

            // Get active parking action
            const parkingAction = await ParkingAction.findOne({
                where: {
                    VehicleVehicleID: vehicle.VehicleID,
                    ParkPlaceParkPlaceID: ParkPlaceID,
                    Status: 'started'
                }
            });

            if (!parkingAction) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Active parking session not found' });
            }

            const nowUTC = new Date();

            // Update parking action
            let totalFee = new Decimal(0);
            let currency = parkingAction.Currency;
            let overstay = false;

            // Check if session linked to reservation
            const reservation = await Reservation.findOne({
                where: {
                    VehicleVehicleID: vehicle.VehicleID,
                    ParkPlaceParkPlaceID: ParkPlaceID,
                    Status: 'used'
                }
            });

            const parkPlace = await ParkPlace.findByPk(ParkPlaceID);
            if (!parkPlace) {
                await transaction.rollback();
                return res.status(404).json({ error: 'ParkPlace not found' });
            }

            const priceIntervalMin = parseDurationToMinutes(parkPlace.PriceTimeDuration || '00:01:00'); // Fallback: 1 min

            if (reservation) {
                if (nowUTC > reservation.EndTime) {
                    const overstayMinutes = Math.ceil((nowUTC - new Date(reservation.EndTime)) / (60 * 1000));
                    const blocks = Math.ceil(overstayMinutes / priceIntervalMin);
                    const rate = new Decimal(parkPlace.CurrentPrice);
                    totalFee = rate.mul(blocks);
                    overstay = true;
                } else{
                    totalFee = new Decimal(0);
                }

                await reservation.update({ Status: 'completed' }, { transaction });

            } else {
                const startTime = new Date(parkingAction.StartTime);
                const durationMinutes = Math.ceil((nowUTC - startTime) / (60 * 1000));
                const blocks = Math.ceil(durationMinutes / priceIntervalMin);
                const rate = new Decimal(parkingAction.TotalFee);
                const sale = await SalesPoliciesService.getApplicableSale(user.UserID, parkPlace.ParkingParkingID);
                totalFee = (rate.mul(blocks) - (rate.mul(blocks) * await SalesPoliciesService.getApplicableSale(user.UserID, parkPlace.ParkingParkingID)));
                parkingAction.TotalFee = totalFee.toFixed(2);
            }

            parkingAction.Status = 'completed';
            parkingAction.EndTime = nowUTC;
            await parkingAction.save({ transaction });



            // Charge user and update parking balance
            console.log(totalFee.toFixed(2))
            const userChargeResult = await UserBalanceService.chargeUser(user.UserID, totalFee.toFixed(2));
            const parkingChargeResult = await ParkingBalanceService.addToParkingBalance(
                parkPlace.ParkingParkingID,
                totalFee.toFixed(2),
                'balance'
            );

            const userBalance = await UserBalanceService.getUserBalance(user.UserID);

            if (userBalance.balance.isNegative()) {
                await UserDebtService.createUserDebt(
                    user.UserID,
                    userBalance.balance.abs(),
                    userBalance.currency,
                    parkPlace.ParkingParkingID
                );
                console.log(`Created Debt for User ${user.UserID}`)
            }

            // Link to ParkPay if this wasn't a reservation
            if (!reservation) {
                const transactionRecord = await Transaction.findOne({
                    where: {
                        UserUserID: user.UserID,
                        Type: ['payment', 'debt'],
                        Amount: totalFee.toFixed(2)
                    },
                    order: [['createdAt', 'DESC']]
                });

                if (transactionRecord) {
                    await ParkPay.create({
                        ParkingActionParkingActionID: parkingAction.ParkingActionID,
                        TransactionTransactionID: transactionRecord.TransactionID
                    }, { transaction });
                }
            }

            // Free the park place
            await ParkPlaceService.setIsTakenFalse({ params: { ParkPlaceID } }, res);

            await transaction.commit();

            // Send WebSocket notification
            const wss = req.app.get('webSocketServer');
            wss.sendToUser(user.UserID.toString(), {
                type: 'parking_ended',
                message: 'Parking session ended successfully',
                parkingActionId: parkingAction.ParkingActionID,
                parkPlaceId: parkPlace.ParkPlaceID,
                totalFee: totalFee.toFixed(2),
                currency,
                overstay,
                duration: formatDuration(nowUTC - new Date(parkingAction.StartTime))
            });
            console.log(nowUTC - new Date(parkingAction.StartTime))
            return res.status(200).json({
                message: 'Parking session ended successfully',
                totalFee: totalFee.toFixed(2),
                currency,
                overstay
            });

        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({
                error: 'Failed to stop parking session',
                details: error.message
            });
        }
    }
}

function parseDurationToMinutes(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 60 + minutes + Math.ceil(seconds / 60);
}

module.exports = new ParkingActionController();
