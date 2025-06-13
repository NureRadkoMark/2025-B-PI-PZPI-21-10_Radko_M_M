const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const paymentProcessController = require('../controllers/paymentProcessController')

router.post('/paypal/create', authMiddleware, paymentProcessController.payPalPayment)
router.post('/paypal/confirm', authMiddleware, paymentProcessController.payPalConfirmPayment)
router.post('/liqpay/create', authMiddleware, paymentProcessController.liqPayPayment)
router.post('/liqpay/confirm', authMiddleware, paymentProcessController.liqPayConfirmPayment)
router.post('/balance', authMiddleware, paymentProcessController.balancePayment)

module.exports = router