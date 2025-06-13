const Router = require('express')
const router = new Router()
const backupController = require('../services/Backup');
const authMiddleware = require('../middlewares/authMiddleware');
const checkAdminRoleMiddleware = require('../middlewares/checkAdminRoleMiddleware');

router.post(
    '/create',
    authMiddleware,
    checkAdminRoleMiddleware,
    (req, res) => {
        backupController.performBackup(req, res);
    }
);

router.get(
    '/download',
    (req, res) => {
        backupController.downloadBackup(req, res);
    }
);

module.exports = router;