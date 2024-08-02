const { Router } = require('express')
const authController = require('../controllers/authController')

const router = Router()

router.get('/register', authController.register_get)
router.post('/register', authController.register_post)

router.get('/login', authController.login_get)
router.post('/login', authController.login_post)

/* FONCTIONNEL MAIS A REFAIRE OU PAS */
router.get('/createJob', authController.createJob_get)
router.post('/createJob', authController.createJob_post)

/* PAS FONCTIONNEL
router.get('/dashboard', authController.dashboard_get)
router.get('/viewJob/:id', authController.viewJob_get)
*/


router.get('/logout', authController.logout_get)

module.exports = router