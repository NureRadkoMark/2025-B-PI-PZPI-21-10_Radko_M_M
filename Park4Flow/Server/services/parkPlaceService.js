const {ParkPlace, Parking} = require('../models/models')
const { Sequelize } = require('sequelize');
class ParkPlaceService{
    // Update isTaken status and recalculate demand factor
    static async setIsTakenTrue(req, res) {
        try {
            const { ParkPlaceID } = req.params;

            const parkPlace = await ParkPlace.findByPk(ParkPlaceID);
            if (!parkPlace) {
                return res.status(404).json({ error: 'ParkPlace not found' });
            }

            await parkPlace.update({
                IsTaken: true });
            await this.updateDemandFactor(parkPlace.ParkingParkingID);

            return parkPlace;
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }
    static async setIsTakenFalse(req, res){
        try {
            const { ParkPlaceID } = req.params;

            const parkPlace = await ParkPlace.findByPk(ParkPlaceID);
            if (!parkPlace) {
                return res.status(404).json({ error: 'ParkPlace not found' });
            }

            await parkPlace.update({
                IsTaken: false });
            await this.updateDemandFactor(parkPlace.ParkingParkingID);



            return parkPlace;
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    }

    // Update DemandFactor based on occupied places
    static async updateDemandFactor(ParkingID) {
        const totalPlaces = await ParkPlace.count({
            where: { ParkingParkingID: ParkingID } });
        const takenPlaces = await ParkPlace.count({
            where: { ParkingParkingID: ParkingID, IsTaken: true } });

        let newDemandFactor = 1.0;
        if (totalPlaces > 0) {
            newDemandFactor = 1.0 + (takenPlaces / totalPlaces);
        }

        await Parking.update({ DemandFactor: newDemandFactor },
            { where: { ParkingID } });
        await ParkPlace.update(
            { CurrentPrice: Sequelize.literal(`"ParkPlaces"."BasePrice" * ${newDemandFactor}`) },
            { where: { ParkingParkingID: ParkingID } }
        );
    }
}

module.exports = ParkPlaceService

