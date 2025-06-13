const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const checkSubscriptionMiddleware = require('../middlewares/checkSubscriptionMiddleware')
const salesPoliciesController = require('../controllers/salesPoliciesController')

router.post('/create', authMiddleware, checkSubscriptionMiddleware, salesPoliciesController.create)
router.delete('/delete/general/:SalesPoliciesID', authMiddleware, checkSubscriptionMiddleware, salesPoliciesController.deleteGeneral)
router.delete('/delete/personal/:email', authMiddleware, checkSubscriptionMiddleware, salesPoliciesController.deletePersonal)
router.get('/parking/:ParkingID', authMiddleware, checkSubscriptionMiddleware, salesPoliciesController.getWhereParking)

module.exports = router