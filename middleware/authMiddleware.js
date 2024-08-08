const jwt = require('jsonwebtoken')
const User = require('../models/User')

const requireAuth = (req, res, next) => {
    
    const token = req.cookies.jwt

    //check json web token exists & is verified
    if(token) {
        jwt.verify(token, 'jobApplyTracker secret', (err, decodedToken) => {
            if(err) {
                // console.log(err.message)
                res.redirect('/login')
            } else {
                // console.log(decodedToken)
                next()
            }
        })

    } else {
        res.redirect('/login')
    }
}

// check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt

    if(token) {
        jwt.verify(token, 'jobApplyTracker secret', async (err, decodedToken) => {
            if(err) {
                // console.log(err.message)
                res.locals.user = null
                next()
            } else {
                // console.log(decodedToken)
                let user = await User.findById(decodedToken.id)
                res.locals.user = user
                
                next()
            }
        })

    } else {
        res.locals.user = null
        next()
    }
}

// Middleware to redirect logged-in users away from login/signup pages
const redirectIfLoggedIn = (req, res, next) => {
    if (res.locals.user) {
        // Assuming you want to redirect to the dashboard if logged in
        res.redirect('/dashboard')
    } else {
        next()
    }
}

module.exports = { requireAuth, checkUser, redirectIfLoggedIn }