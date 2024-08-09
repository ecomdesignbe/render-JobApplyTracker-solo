const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { redirectIfLoggedIn, requireAuth, checkUser } = require('./middleware/authMiddleware');
const fileUpload = require('express-fileupload');
const FTPClient = require('ftp');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// database connection
const dbURI = 'mongodb+srv://steve:nNhmx00iuu0mBqlA@cluster0.rkjriez.mongodb.net/jobapplytracker?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
  .then(() => app.listen(3000))
  .catch(err => console.log(err));

// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('login'));
app.get('/profile', (req, res) => res.render('profile'));
app.get('/viewjob/:id', requireAuth, (req, res) => {
  const jobId = req.params.id;
  // Fetch job details from the database here
  // Example:
  // Job.findById(jobId).then(job => res.render('viewjob', { job }))
  res.render('viewjob', { job: { id: jobId, title: 'Sample Job' } }); // Replace with actual job details
});
app.get('/editjob/:id', requireAuth, (req, res) => {
  // Implement edit job functionality
});
app.get('/delitejob/:id', requireAuth, (req, res) => {
  // Implement delete job functionality
});
app.get('/dashboard', requireAuth, (req, res) => {
  // Implement dashboard functionality
});
app.get('/register', redirectIfLoggedIn, (req, res) => res.render('register'));

app.use(authRoutes);
