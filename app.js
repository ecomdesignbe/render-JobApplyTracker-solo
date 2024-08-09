const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const { redirectIfLoggedIn , requireAuth, checkUser } = require('./middleware/authMiddleware')
const fileUpload = require('express-fileupload')
const FTPClient = require('ftp')

const authController = require('./controllers/authController');


const app = express()

// middleware
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

// Express middleware to parse file uploads
app.use(fileUpload());

// view engine

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'))

// database connection
const dbURI = 'mongodb+srv://steve:nNhmx00iuu0mBqlA@cluster0.rkjriez.mongodb.net/jobapplytracker?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err))

// routes
app.get('*', checkUser)
app.get('/', (req, res) => res.render('login'))
app.get('/profile', (req, res) => res.render('profile'))
// app.get('/viewjob/:id')
app.get('/editjob/:id')
app.get('/deletejob/:id')
app.get('/dashboard',requireAuth)
app.get('/register', redirectIfLoggedIn, (req, res) => res.render('register'))
app.get('/viewjob/:id', requireAuth, authController.viewJob_get);

app.use(authRoutes)

