const Router = require('express')
const router = new Router()
const vehicleController = require('../controllers/vehicleController');
const { upload } = require('../controllers/vehicleController');
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/create', authMiddleware, upload.single('frontPhotoImage'), vehicleController.create);
router.put('/update/:VehicleID', authMiddleware, vehicleController.update)
router.delete('/delete/:VehicleID', authMiddleware, vehicleController.delete)
router.get('/user', authMiddleware, vehicleController.getByUser)

module.exports = router;