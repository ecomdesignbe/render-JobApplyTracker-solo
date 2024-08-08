const { Router } = require('express')
const authController = require('../controllers/authController')
const { requireAuth, redirectIfLoggedIn } = require('../middleware/authMiddleware')

const router = Router()

router.get('/register',  authController.register_get)
router.post('/register', authController.register_post)

router.get('/login', redirectIfLoggedIn, authController.login_get)
router.post('/login', redirectIfLoggedIn, authController.login_post)


router.get('/dashboard', requireAuth, authController.dashboard_get)

router.get('/createJob', requireAuth, authController.createJob_get)
router.post('/createJob', requireAuth, authController.createJob_post)

router.get('/viewjob/:id', requireAuth, authController.viewJob_get)
router.get('/viewjob', requireAuth, authController.viewJob_get)

router.get('/editjob/:id', requireAuth, authController.editJob_get)
router.post('/editjob/:id', requireAuth, authController.editJob_post)

router.get('/deletejob/:id', requireAuth, authController.deleteJob_delete)

router.get('/logout', authController.logout_get)

module.exports = router