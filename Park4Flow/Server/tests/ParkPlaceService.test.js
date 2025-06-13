const ParkPlaceService = require('../services/parkPlaceService');
const { ParkPlace, Parking } = require('../models/models');
const { Sequelize } = require('sequelize');

jest.mock('../models/models', () => ({
    ParkPlace: {
        findByPk: jest.fn(),
        count: jest.fn(),
        update: jest.fn()
    },
    Parking: {
        update: jest.fn()
    }
}));

describe('ParkPlaceService', () => {
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };

    describe('setIsTakenTrue', () => {
        it('should return 404 if parkPlace not found', async () => {
            ParkPlace.findByPk.mockResolvedValue(null);

            const req = { params: { ParkPlaceID: 1 } };
            const res = mockRes();

            await ParkPlaceService.setIsTakenTrue(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'ParkPlace not found' });
        });

        it('should update IsTaken to true and recalculate demand factor', async () => {
            const mockParkPlace = {
                ParkingParkingID: 10,
                update: jest.fn()
            };
            ParkPlace.findByPk.mockResolvedValue(mockParkPlace);
            ParkPlace.count.mockResolvedValueOnce(10).mockResolvedValueOnce(5);
            Parking.update.mockResolvedValue();
            ParkPlace.update.mockResolvedValue();

            const req = { params: { ParkPlaceID: 1 } };
            const res = mockRes();

            await ParkPlaceService.setIsTakenTrue(req, res);

            expect(mockParkPlace.update).toHaveBeenCalledWith({ IsTaken: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'IsTaken status updated',
                parkPlace: mockParkPlace
            });
        });

        it('should handle internal errors', async () => {
            ParkPlace.findByPk.mockRejectedValue(new Error('DB Error'));

            const req = { params: { ParkPlaceID: 1 } };
            const res = mockRes();

            await ParkPlaceService.setIsTakenTrue(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Internal Server Error',
                details: 'DB Error'
            });
        });
    });

    describe('setIsTakenFalse', () => {
        it('should update IsTaken to false', async () => {
            const mockParkPlace = {
                ParkingParkingID: 11,
                update: jest.fn()
            };

            ParkPlace.findByPk.mockResolvedValue(mockParkPlace);
            ParkPlace.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
            Parking.update.mockResolvedValue();
            ParkPlace.update.mockResolvedValue();

            const req = { params: { ParkPlaceID: 99 } };
            const res = mockRes();

            await ParkPlaceService.setIsTakenFalse(req, res);

            expect(mockParkPlace.update).toHaveBeenCalledWith({ IsTaken: false });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'IsTaken status updated',
                parkPlace: mockParkPlace
            });
        });
    });

    describe('updateDemandFactor', () => {
        it('should correctly update DemandFactor and CurrentPrice', async () => {
            ParkPlace.count
                .mockResolvedValueOnce(10) // total
                .mockResolvedValueOnce(4); // taken

            await ParkPlaceService.updateDemandFactor(123);

            expect(Parking.update).toHaveBeenCalledWith(
                { DemandFactor: 1.4 },
                { where: { ParkingID: 123 } }
            );

            expect(ParkPlace.update).toHaveBeenCalledWith(
                {
                    CurrentPrice: Sequelize.literal(`"ParkPlaces"."BasePrice" * 1.4`)
                },
                { where: { ParkingParkingID: 123 } }
            );
        });

        it('should handle division by zero gracefully', async () => {
            ParkPlace.count
                .mockResolvedValueOnce(0) // total
                .mockResolvedValueOnce(0); // taken

            await ParkPlaceService.updateDemandFactor(999);

            expect(Parking.update).toHaveBeenCalledWith(
                { DemandFactor: 1.0 },
                { where: { ParkingID: 999 } }
            );
        });
    });
});

