const { Router } = require('express')
const authController = require('../controllers/authController')

const router = Router()

router.get('/register', authController.register_get)
router.post('/register', authController.register_post)

router.get('/login', authController.login_get)
router.post('/login', authController.login_post)


router.get('/dashboard', authController.dashboard_get)

router.get('/createJob', authController.createJob_get)
router.post('/createJob', authController.createJob_post)

router.get('/viewjob', authController.viewJob_get)
router.get('/viewjob/:id', authController.viewJob_get)

router.get('/editjob/:id', authController.editJob_get)
router.post('/editjob/:id', authController.editJob_post)

router.get('/deletejob/:id', authController.deleteJob_delete)

router.get('/logout', authController.logout_get)

module.exports = router