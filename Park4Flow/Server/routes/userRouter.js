const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const checkAdminRoleMiddleware = require('../middlewares/checkAdminRoleMiddleware')

router.post('/register', userController.registration)
router.post('/login', userController.login)
router.put('/ban', authMiddleware, checkAdminRoleMiddleware,  userController.ban)
router.put('/unban', authMiddleware, checkAdminRoleMiddleware, userController.unban)
router.put('/update', authMiddleware, userController.updateUserData)
router.get('/details', authMiddleware, userController.getUserDetails)
router.post('/pass/code', userController.passRecovery)
router.post('/pass/reset', userController.resetPassword)
router.get('/check', authMiddleware, userController.check)
router.get('/email/:email', authMiddleware, checkAdminRoleMiddleware, userController.getWhereEmail)
router.delete('/delete', authMiddleware, userController.delete)

module.exports = router