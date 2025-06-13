const { Parking, ParkPlace , ParkingBalance} = require('../models/models');
const { Sequelize } = require('sequelize');
const parkPlaceService = require('../services/parkPlaceService')

class ParkPlaceController {
    // Create new ParkPlace and calculate initial CurrentPrice based on DemandFactor
    async create(req, res) {
        try {
            const { VehicleCategory, PlaceCategory, Name, Longitude, Latitude, BasePrice, PriceTimeDuration, ParkingID} = req.body;
            console.log(VehicleCategory, PlaceCategory, Name, Longitude, Latitude, BasePrice, PriceTimeDuration)
            const parking = await Parking.findByPk(ParkingID);
            if (!parking) {
                return res.status(404).json({ error: 'Parking not found' });
            }

            const currentPrice = BasePrice * parking.DemandFactor;

            const parkPlace = await ParkPlace.create({
                ParkingParkingID: ParkingID,
                VehicleCategory,
                PlaceCategory,
                Name,
                Longitude,
                Latitude,
                BasePrice,
                CurrentPrice: currentPrice,
                PriceTimeDuration
            });

            await parkPlaceService.updateDemandFactor(ParkingID);

            return res.status(201).json(parkPlace);
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }

    // Update ParkPlace using ParkPlaceID
    async update(req, res) {
        try {
            const { ParkPlaceID } = req.params;
            const { VehicleCategory, PlaceCategory, Name, Longitude, Latitude, BasePrice, PriceTimeDuration } = req.body;

            const parkPlace = await ParkPlace.findByPk(ParkPlaceID);
            if (!parkPlace) {
                return res.status(404).json({ error: 'ParkPlace not found' });
            }

            await parkPlace.update({ VehicleCategory, PlaceCategory, Name, Longitude, Latitude, BasePrice, PriceTimeDuration });
            return res.status(200).json(parkPlace);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }

    // Delete ParkPlace using ParkPlaceID
    async delete(req, res) {
        try {
            const { ParkPlaceID } = req.params;

            const parkPlace = await ParkPlace.findByPk(ParkPlaceID);
            if (!parkPlace) {
                return res.status(404).json({ error: 'ParkPlace not found' });
            }

            await parkPlace.destroy();
            await parkPlaceService.updateDemandFactor(parkPlace.ParkingParkingID);
            return res.status(200).json({ message: 'ParkPlace deleted successfully' });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }

    // Get all data about a specific ParkPlace
    async getInfo(req, res) {
        try {
            const { ParkPlaceID } = req.params;

            const parkPlace = await ParkPlace.findByPk(ParkPlaceID);
            if (!parkPlace) {
                return res.status(404).json({ error: 'ParkPlace not found' });
            }

            return res.status(200).json(parkPlace);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }

    async getInParking(req, res){
        const {ParkingID} = req.params

        const parkPlaces = await ParkPlace.findAll({
            where: {
                ParkingParkingID: ParkingID
            }
        })
        return res.status(200).json({parkPlaces: parkPlaces})
    }
}

module.exports = new ParkPlaceController();
