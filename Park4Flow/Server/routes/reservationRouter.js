const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const checkSubscriptionMiddleware = require('../middlewares/checkSubscriptionMiddleware')
const reservationController = require('../controllers/reservationController')

router.post('/create', authMiddleware, reservationController.createReservation)
router.put('/skip/:reservationID', reservationController.skipReservation)
router.get('/user', authMiddleware, reservationController.getUserReservations)
router.get('/parking', authMiddleware, checkSubscriptionMiddleware,  reservationController.getParkingReservations)

module.exports = router