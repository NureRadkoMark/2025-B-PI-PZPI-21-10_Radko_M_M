const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const favouriteParkingController = require('../controllers/favouriteParkingController')

router.post('/add', authMiddleware, favouriteParkingController.create)
router.delete('/delete/:ParkingID', authMiddleware, favouriteParkingController.delete)
router.get('/user', authMiddleware, favouriteParkingController.getWhereUser)

module.exports = router