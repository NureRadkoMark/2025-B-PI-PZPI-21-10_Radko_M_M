const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const checkAdminRoleMiddleware = require('../middlewares/checkAdminRoleMiddleware')
const bonusesCostController = require('../controllers/bonusesCostController')

router.post('/create', authMiddleware, checkAdminRoleMiddleware, bonusesCostController.create)
router.put('/update/:BonusesCostID', authMiddleware, checkAdminRoleMiddleware, bonusesCostController.update)
router.delete('/delete/:BonusesCostID', authMiddleware, checkAdminRoleMiddleware, bonusesCostController.delete)
router.get('/currency/:currency', bonusesCostController.getWhereCurrency)

module.exports = router