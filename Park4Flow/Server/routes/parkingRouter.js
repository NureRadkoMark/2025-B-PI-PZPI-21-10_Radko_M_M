const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const checkSubscriptionMiddleware = require('../middlewares/checkSubscriptionMiddleware')
const checkSubscriptionCreateParkingMiddleware = require('../middlewares/checkSubscriptionCreateParkingMiddleware')
const parkingController = require('../controllers/parkingController')
const {upload} = require("../controllers/vehicleController");

router.post('/create', authMiddleware, checkSubscriptionCreateParkingMiddleware, upload.single('PhotoImage'), parkingController.create)
router.put('/update/:ParkingID', authMiddleware, checkSubscriptionMiddleware, parkingController.update)
router.post('/delete/confirm', authMiddleware, checkSubscriptionMiddleware, parkingController.deleteConfirm)
router.post('/delete', authMiddleware, checkSubscriptionMiddleware, parkingController.delete)
router.get('/getStatistics/:ParkingID', authMiddleware, checkSubscriptionMiddleware, parkingController.getStatisticInfo)
router.get('/user', authMiddleware, parkingController.getWhereUser)
router.get('/currency', authMiddleware, parkingController.getWhereCurrency)
router.get('/id', authMiddleware, checkSubscriptionMiddleware, parkingController.getParkingID)
router.get('/owner', authMiddleware, checkSubscriptionMiddleware, parkingController.getWhereOwner)
router.get('/info/:ParkingID', authMiddleware, checkSubscriptionMiddleware, parkingController.getInfo)

module.exports = router