const {encryptData, decryptData} = require('../security/AEScipher')
const {Vehicle} = require('../models/models')
const fs = require('fs');
const path = require('path');
const axios = require("axios");
const multer = require('multer');
const sharp = require('sharp');

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

class VehicleController{
    // Create a new vehicle associated with the authenticated user
    async create(req, res) {
        try {
            const { VehicleCategory, StateNumber, VehicleBrand, VehicleModel } = req.body;
            const encryptedStateNumber = encryptData(StateNumber);
            const UserUserID = req.user.UserID;

            if (!req.file) {
                return res.status(400).json({ message: 'FrontPhotoImage is required' });
            }
            const FrontPhotoImage = `/uploads/${req.file.filename}`;

            const vehicle = await Vehicle.create({
                VehicleCategory,
                StateNumber: encryptedStateNumber,
                VehicleBrand,
                VehicleModel,
                FrontPhotoImage,
                UserUserID
            });

            return res.status(201).json(vehicle);
        } catch (error) {
            console.error('Error creating vehicle:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Update vehicle data using VehicleID
    async update(req, res) {
        try {
            const { VehicleID } = req.params;
            const { VehicleCategory, StateNumber, VehicleBrand, VehicleModel } = req.body;
            const encryptedStateNumber = encryptData(StateNumber);
            console.log(req.params)
            console.log(req.body)
            const vehicle = await Vehicle.findByPk(VehicleID);
            if (!vehicle) {
                return res.status(404).json({ message: 'Vehicle not found' });
            }

            await vehicle.update({
                VehicleCategory,
                StateNumber: encryptedStateNumber,
                VehicleBrand,
                VehicleModel
            });

            return res.status(200).json(vehicle);
        } catch (error) {
            console.error('Error updating vehicle:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Delete a vehicle using VehicleID
    async delete(req, res) {
        try {
            const { VehicleID } = req.params;
            const vehicle = await Vehicle.findByPk(VehicleID);

            if (!vehicle) {
                return res.status(404).json({ message: 'Vehicle not found' });
            }

            await vehicle.destroy();
            return res.status(200).json({ message: 'Vehicle deleted successfully' });
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get all vehicles of the authenticated user
    async getByUser(req, res) {
        try {
            const UserUserID = req.user.UserID;
            const vehicles = await Vehicle.findAll({ where: { UserUserID } });
            console.log(vehicles)
            const decryptedVehicles = vehicles.map(vehicle => ({
                VehicleID: vehicle.VehicleID,
                VehicleCategory: vehicle.VehicleCategory,
                StateNumber: decryptData(vehicle.StateNumber),
                VehicleBrand: vehicle.VehicleBrand,
                VehicleModel: vehicle.VehicleModel,
                FrontPhotoImage: `${process.env.NGROK_DOMAIN}/proxy-image/${path.basename(vehicle.FrontPhotoImage)}`, // full URL
                UserUserID: vehicle.UserUserID
            }));
            console.log(decryptedVehicles)
            return res.status(200).json(decryptedVehicles);
        } catch (error) {
            console.error('Error fetching user vehicles:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Send vehicle image to OpenAI for analysis and return details
    async getDetailsByPhoto(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Image file is required' });
            }

            const imagePath = path.join(__dirname, '../uploads/', req.file.filename);
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');

            const response = await axios.post('https://api.openai.com/v1/images/analyze', {
                image: base64Image
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return res.status(200).json(response.data);
        } catch (error) {
            console.error('Error processing vehicle image:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new VehicleController();
module.exports.upload = upload;
