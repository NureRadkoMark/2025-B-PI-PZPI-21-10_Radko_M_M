const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const cancellationPoliciesController = require('../controllers/cancellationPoliciesController')
const checkSubscriptionMiddleware = require('../middlewares/checkSubscriptionMiddleware')

router.post('/create', authMiddleware, checkSubscriptionMiddleware,  cancellationPoliciesController.create)
router.put('/update/:CancellationPoliciesID', authMiddleware, checkSubscriptionMiddleware, cancellationPoliciesController.update)
router.delete('/delete/:CancellationPoliciesID', authMiddleware, checkSubscriptionMiddleware, cancellationPoliciesController.delete)
router.get('/parking/:ParkingID', authMiddleware, checkSubscriptionMiddleware, cancellationPoliciesController.getWhereParking)

module.exports = router
