const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const depositProcessController = require('../controllers/depositProcessController')

router.post('/paypal/create', authMiddleware, depositProcessController.payPalDeposit)
router.post('/paypal/confirm', authMiddleware, depositProcessController.payPalConfirmDeposit)
router.post('/liqpay/create', authMiddleware, depositProcessController.liqPayDeposit)
router.post('/liqpay/confirm', authMiddleware, depositProcessController.liqPayConfirmDeposit)

module.exports = router