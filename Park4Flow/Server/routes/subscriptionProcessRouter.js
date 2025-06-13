const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const subscriptionProcessController = require('../controllers/subscriptionProcessController')

router.post('/paypal/create', authMiddleware, subscriptionProcessController.payPalSubscribe)
router.post('/paypal/confirm', authMiddleware, subscriptionProcessController.payPalConfirmPayment)
router.post('/liqpay/create', authMiddleware, subscriptionProcessController.liqPaySubscribe)
router.post('/liqpay/confirm', authMiddleware, subscriptionProcessController.liqPayConfirmPayment)
router.get('/user', authMiddleware, subscriptionProcessController.getWhereUser)

module.exports = router