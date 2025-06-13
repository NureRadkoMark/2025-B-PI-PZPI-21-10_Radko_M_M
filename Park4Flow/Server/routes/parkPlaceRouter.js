const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const checkSubscriptionMiddleware = require('../middlewares/checkSubscriptionMiddleware')
const parkPlaceController = require('../controllers/parkPlaceController')

router.post('/create', authMiddleware, checkSubscriptionMiddleware, parkPlaceController.create)
router.put('/update/:ParkPlaceID', authMiddleware, checkSubscriptionMiddleware, parkPlaceController.update)
router.delete('/delete/:ParkPlaceID', authMiddleware, checkSubscriptionMiddleware, parkPlaceController.delete)
router.get('/getInfo/:ParkPlaceID', authMiddleware, parkPlaceController.getInfo)
router.get('/parking/:ParkingID', authMiddleware, parkPlaceController.getInParking)

module.exports = router