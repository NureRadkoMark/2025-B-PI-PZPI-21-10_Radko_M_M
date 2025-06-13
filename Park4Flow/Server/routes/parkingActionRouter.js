const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const parkingActionController = require('../controllers/parkingActionController')

router.post('/user/start', authMiddleware, parkingActionController.startParkingAction)
router.post('/IOT/start', parkingActionController.startParkingAction)
router.post('/user/stop', authMiddleware, parkingActionController.stopParkingAction)
router.post('/IOT/stop', parkingActionController.stopParkingAction)

module.exports = router