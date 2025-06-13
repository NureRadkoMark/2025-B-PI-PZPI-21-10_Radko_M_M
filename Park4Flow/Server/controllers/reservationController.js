const { Reservation, Parking, User, ParkingManager, ParkPlace, Transaction, Vehicle} = require('../models/models');
const { Op } = require('sequelize');
const UserBalanceService = require('../services/userBalanceService')
const cancellationPoliciesService = require('../services/cancellationPoliciesService')
const Decimal = require('decimal.js');
const TransactionService = require("../services/transactionService");
const {decryptData} = require("../security/AEScipher");

class ReservationController {
    /**
     * Create a reservation for a given parking and assign an optimal park place.
     */
    async createReservation(req, res) {
        try {
            const { ParkingID, VehicleID, StartTime, EndTime } = req.body;

            if (!ParkingID || !VehicleID || !StartTime || !EndTime) {
                return res.status(400).json({ message: 'ParkingID, VehicleID, StartTime and EndTime are required.' });
            }

            // UTC
            const startUTC = new Date(StartTime).toISOString(); // ISO 8601 format in UTC
            const endUTC = new Date(EndTime).toISOString();

            if (isNaN(Date.parse(startUTC)) || isNaN(Date.parse(endUTC))) {
                return res.status(400).json({ message: 'Invalid date format for StartTime or EndTime.' });
            }

            const vehicle = await Vehicle.findByPk(VehicleID);
            if (!vehicle) {
                return res.status(404).json({ message: 'Vehicle not found.' });
            }

            const vehicleCategory = vehicle.VehicleCategory; // A, B, C, D

            const parkPlaces = await ParkPlace.findAll({
                where: {
                    ParkingParkingID: ParkingID,
                    IsTaken: false,
                    VehicleCategory: vehicleCategory
                }
            });

            if (parkPlaces.length === 0) {
                return res.status(404).json({ message: 'No compatible park places available for your vehicle category.' });
            }

            const reservations = await Reservation.findAll({
                include: [{
                    model: ParkPlace,
                    where: {
                        ParkingParkingID: ParkingID,
                        VehicleCategory: vehicleCategory
                    }
                }],
                where: {
                    [Op.and]: [
                        {
                            [Op.not]: {
                                [Op.or]: [
                                    { StartTime: { [Op.gte]: endUTC } },
                                    { EndTime: { [Op.lte]: startUTC } }
                                ]
                            }
                        }
                    ]
                }
            });

            const reservedPlaceIds = reservations.map(r => r.ParkPlaceParkPlaceID);
            const availablePlaces = parkPlaces.filter(p => !reservedPlaceIds.includes(p.ParkPlaceID));

            if (availablePlaces.length === 0) {
                return res.status(409).json({ message: 'No free park places available for the selected time range.' });
            }

            const selectedPlace = availablePlaces[0];

            const start = new Date(startUTC);
            const end = new Date(endUTC);
            const durationMs = end - start;

            if (durationMs <= 0) {
                return res.status(400).json({ message: 'EndTime must be after StartTime.' });
            }

            // PriceTimeDuration (HH:mm:ss)
            const [hours, minutes, seconds] = selectedPlace.PriceTimeDuration.split(':').map(Number);
            const unitMs = ((hours * 60 + minutes) * 60 + seconds) * 1000;

            const units = Math.ceil(durationMs / unitMs);

            const currentPrice = new Decimal(selectedPlace.CurrentPrice);
            const totalPrice = currentPrice.mul(units); // decimal.js

            const reservation = await Reservation.create({
                DateAndTime: new Date().toISOString(),
                StartTime: startUTC,
                EndTime: endUTC,
                Status: 'active',
                VehicleVehicleID: VehicleID,
                ParkPlaceParkPlaceID: selectedPlace.ParkPlaceID
            });



            return res.status(201).json({
                message: 'Reservation created successfully.',
                reservationID: reservation.ReservationID,
                price: totalPrice.toFixed(2),
                currency: selectedPlace.Currency
            });

        } catch (error) {
            console.error('Error creating reservation:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    /**
     * Skip reservation and handle refund with cancellation policy.
     */
    async skipReservation(req, res) {
        try {
            const { reservationID } = req.params;

            if (!reservationID) {
                return res.status(400).json({ message: 'ReservationID parameter is required.' });
            }

            // Fetch reservation
            const reservation = await Reservation.findByPk(reservationID);
            if (!reservation) {
                return res.status(404).json({ message: 'Reservation not found.' });
            }

            if (reservation.Status !== 'active') {
                return res.status(409).json({ message: 'Only active reservations can be skipped.' });
            }

            // Fetch related park place and parking
            const parkPlace = await ParkPlace.findByPk(reservation.ParkPlaceParkPlaceID);
            if (!parkPlace) {
                return res.status(404).json({ message: 'Associated park place not found.' });
            }

            const parking = await Parking.findByPk(parkPlace.ParkingParkingID);
            if (!parking) {
                return res.status(404).json({ message: 'Associated parking not found.' });
            }

            // Get user ID through vehicle
            const vehicle = await Vehicle.findByPk(reservation.VehicleVehicleID);
            if (!vehicle) {
                return res.status(404).json({ message: 'Vehicle associated with reservation not found.' });
            }

            const userId = vehicle.UserUserID;

            // Time before reservation starts in hours
            const now = new Date();
            const timeToStart = (new Date(reservation.StartTime) - now) / 3600000;

            // Fetch original successful payment transaction
            const transaction = await Transaction.findOne({
                where: {
                    ReservationReservationID: reservationID,
                    UserUserID: userId,
                    Type: 'payment',
                    Status: 'success'
                }
            });

            if (!transaction) {
                return res.status(402).json({ message: 'Original payment transaction not found.' });
            }



            // Calculate refund and fee
            const originalAmount = new Decimal(transaction.Amount);

            // Get cancellation policy
            const policy = await cancellationPoliciesService.getWhereParkingAndTime(parking.ParkingID, timeToStart);
            if (!policy) {
                await UserBalanceService.refundUser(userId, originalAmount.toNumber());

                // Mark reservation as skipped
                reservation.Status = 'skipped';
                await reservation.save();
                return res.status(200).json({
                    message: 'Reservation successfully skipped. Refund processed.',
                    refundAmount: originalAmount.toString(),
                    feeAmount: 0.00
                });
            }

            const cancelPercent = new Decimal(policy.CancellationFeePercent);

            const fee = originalAmount.mul(cancelPercent.div(100)).toDecimalPlaces(2);
            const refund = originalAmount.minus(fee).toDecimalPlaces(2);

            // Refund to user via UserBalanceService
            await UserBalanceService.refundUser(userId, refund.toNumber());

            // Mark reservation as skipped
            reservation.Status = 'skipped';
            await reservation.save();

            // Add cancellation fee to parking manager's balance
            const parkingManager = await ParkingManager.findOne({
                where: { ParkingParkingID: parking.ParkingID,
                         Role: 'owner'}
            });
            if (parkingManager) {
                const adminUserID = parkingManager.UserUserID;

                const revenueTransaction = await TransactionService.create(
                    fee.toNumber(),
                    transaction.Currency,
                    adminUserID,
                    'revenue',
                    'system',
                    'PAID',
                    `Cancellation fee from reservation ${reservationID}`
                );
            }

            return res.status(200).json({
                message: 'Reservation successfully skipped. Refund processed.',
                refundAmount: refund.toString(),
                feeAmount: fee.toString()
            });

        } catch (error) {
            console.error('Error skipping reservation:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Controller method for getting user's active reservations
    async getUserReservations(req, res) {
        try {
            const userId = req.user.UserID;

            const reservations = await Reservation.findAll({
                where: { Status: 'active' },
                include: [
                    {
                        model: Vehicle,
                        where: { UserUserID: userId },
                        required: true
                    },
                    {
                        model: ParkPlace,
                        include: [ Parking ]
                    }
                ]
            });

            const fullReservations = reservations.map(r => {
                const vehicle = r.Vehicle;
                const parking = r.ParkPlace?.Parking;

                return {
                    ...r.toJSON(),
                    Vehicle: {
                        ...vehicle.toJSON(),
                        StateNumber: decryptData(vehicle.StateNumber),
                        FrontPhotoImage: `${req.protocol}://${req.get('host')}${vehicle.FrontPhotoImage}`
                    },
                    ParkPlace: {
                        ...r.ParkPlace.toJSON(),
                        Parking: {
                            ...parking.toJSON(),
                            PhotoImage: `${req.protocol}://${req.get('host')}${parking.PhotoImage}`
                        }
                    }
                };
            });

            return res.status(200).json({ success: true, reservations: fullReservations });
        } catch (error) {
            console.error('Error in getUserReservations:', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve user reservations.' });
        }
    }


    // Controller method for getting active reservations by ParkingID
    async getParkingReservations(req, res) {
        try {
            const parkingId = req.ParkingID;

            const reservations = await Reservation.findAll({
                where: { Status: 'active' },
                include: [
                    {
                        model: ParkPlace,
                        where: { ParkingParkingID: parkingId },
                        required: true
                    },
                    {
                        model: Vehicle,
                        include: [ User ]
                    }
                ]
            });

            return res.status(200).json({ success: true, reservations });
        } catch (error) {
            console.error('Error in getParkingReservations:', error.message);
            return res.status(500).json({ success: false, error: 'Failed to retrieve parking reservations.' });
        }
    }



}

module.exports = new ReservationController();
