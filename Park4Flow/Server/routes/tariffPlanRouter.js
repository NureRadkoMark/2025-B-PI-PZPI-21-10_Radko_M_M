const Router = require('express')
const router = new Router()
const authMiddleware = require('../middlewares/authMiddleware')
const checkAdminRoleMiddleware = require('../middlewares/checkAdminRoleMiddleware')
const tariffPlanController = require('../controllers/tariffPlanController')

router.post('/create', authMiddleware, checkAdminRoleMiddleware, tariffPlanController.create)
router.put('/update/:TariffPlanID', authMiddleware, checkAdminRoleMiddleware, tariffPlanController.update)
router.delete('/delete/:TariffPlanID', authMiddleware, checkAdminRoleMiddleware, tariffPlanController.delete)
router.get('/currency/:currency', authMiddleware, tariffPlanController.getWhereCurrency)
router.get('/all', authMiddleware, checkAdminRoleMiddleware, tariffPlanController.getAll)

module.exports = router