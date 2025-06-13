const {Parking, FavouriteParking, User} = require('../models/models')
const path = require("path");
class FavouriteParkingController{
    // Add a parking to the user's favorite list
    async create(req, res) {
        try {
            const { ParkingID } = req.body;
            const UserID = req.user.UserID;

            if (!ParkingID) {
                return res.status(400).json({ message: 'ParkingID is required.' });
            }

            const favourite = await FavouriteParking.create({ UserUserID: UserID, ParkingParkingID: ParkingID });
            return res.status(201).json("Parking added to favorites successfully");
        } catch (error) {
            console.error('Error adding to favourites:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Remove a parking from the user's favorite list
    async delete(req, res) {
        try {
            const { ParkingID } = req.params;
            const UserID = req.user.UserID;

            const favourite = await FavouriteParking.findOne({
                where: { UserUserID: UserID, ParkingParkingID: ParkingID }
            });
            if (!favourite) {
                return res.status(404).json({ message: 'Favourite parking not found.' });
            }

            await favourite.destroy();
            return res.status(200).json({ message: 'Favourite parking removed successfully.' });
        } catch (error) {
            console.error('Error removing from favourites:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }

    // Get all favorite parkings for a user
    async getWhereUser(req, res) {
        try {
            const UserID = req.user.UserID;

            const favouriteParkings = await Parking.findAll({
                attributes: [
                    'ParkingID',
                    'Address',
                    'Name',
                    'Info',
                    'IsActive',
                    'Longitude',
                    'Latitude',
                    'PhotoImage'
                ],
                include: [
                    {
                        model: User,
                        attributes: [], // <--- исключаем данные пользователя из ответа
                        through: {
                            model: FavouriteParking,
                            attributes: [] // <--- исключаем промежуточную таблицу из ответа
                        },
                        where: { UserID: UserID } // фильтрация по пользователю
                    }
                ]
            });

            const formattedFavouriteParkings = favouriteParkings.map(favouriteParking => ({
                ParkingID: favouriteParking.ParkingID,
                Address: favouriteParking.Address,
                Name: favouriteParking.Name,
                Info: favouriteParking.Info,
                IsActive: favouriteParking.IsActive,
                Longitude: favouriteParking.Longitude,
                Latitude: favouriteParking.Latitude,
                DynamicPricing: favouriteParking.DynamicPricing,
                DemandFactor: favouriteParking.DemandFactor,
                PhotoImage: `${process.env.NGROK_DOMAIN}/proxy-image/${path.basename(favouriteParking.PhotoImage)}`,
            }))
            console.log(favouriteParkings)
            return res.status(200).json(formattedFavouriteParkings);
        } catch (error) {
            console.error('Error fetching favourite parkings:', error);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    }
}

module.exports = new FavouriteParkingController()