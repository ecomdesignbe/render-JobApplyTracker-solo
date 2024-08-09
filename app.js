const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const { redirectIfLoggedIn , requireAuth, checkUser } = require('./middleware/authMiddleware')
const cloudinary = require('cloudinary').v2;

// Configuration
cloudinary.config({ 
  cloud_name: 'drj6sssth', 
  api_key: '738122518196474', 
  api_secret: 'uceDgaz6XMBSZys8l9Tm0Yblges' // Click 'View Credentials' below to copy your API secret
});

const app = express()

// middleware
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

// view engine
// app.set("views",  path.join(__dirname, "views"))
// app.set('views', __dirname)
// app.set('views', `${__dirname}/views`);
app.set("view engine", "ejs")



// database connection
const dbURI = 'mongodb+srv://steve:nNhmx00iuu0mBqlA@cluster0.rkjriez.mongodb.net/jobapplytracker?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err))

// routes
app.get('*', checkUser)
app.get('/', (req, res) => res.render('login'))
app.get('/profile', (req, res) => res.render('profile'))
app.get('/viewjob')
app.get('/editjob/:id')
app.get('/delitejob/:id')
app.get('/dashboard')
app.get('/register', redirectIfLoggedIn, (req, res) => res.render('register'))


app.use(authRoutes)

