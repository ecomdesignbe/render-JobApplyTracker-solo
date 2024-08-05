const User = require("../models/User")
const Job = require("../models/Job")
const jwt = require("jsonwebtoken")

/********** GESTION ERREUR ****************  */
// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code)
  let errors = {
    firstname : '',
    lastname : '',
    email : '', 
    password : ''    
  }

  // incorrect email 
  if (err.message === 'incorrect email') {
    errors.email = 'that email is not registered'
  }

  // incorrect password 
  if (err.message === 'incorrect password') {
    errors.password = 'that password is incorrect'
  }

  // duplicate error code
  if(err.code === 11000) {
    errors.email = 'that email is already registered'
    return errors
  }

  // validation errors
  if(err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message
    })
  }
  return errors
}

const maxAge = 3 * 24  * 60 * 60 // 3 dayz

const createToken = (id) => {
  return jwt.sign({ id } , 'jobApplyTracker secret', {
    expiresIn : maxAge
  })
}


const jobHandleErrors = (err) => {
  console.log(err.message, err.code)
  let errors = { 
    jobtitle: '', 
    jobcompany: '', 
    website: '', 
    employersName: '', 
    employersEmail: '', 
    employersPhone: '', 
    employersAdress: '', 
    origin: '', 
    status: '', 
    comments: '' 
  }

  // Check for validation errors
  if (err.message.includes('job validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message
    })
  }

  return errors
}


/*********************************************  */


module.exports.register_get = (req, res) => {
  res.render('register')
}

module.exports.register_post = async (req, res) => {
  const { 
    firstname,
    lastname,
    email, 
    github, 
    profilePicture, 
    cvDocuments, 
    password 
  } = req.body
  
  try {
    const user = await User.create({ 
      firstname,
      lastname,
      email, 
      github, 
      profilePicture, 
      cvDocuments, 
      password })

      const token = createToken(user._id)
      res.cookie('jwt', token, { httpOnly : true, maxAge: maxAge * 1000 })

      res.status(201).json({ user : user._id })
    
  } catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
    
  }
}

module.exports.login_get = (req, res) => {
  res.render('login')
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.login(email, password)
    const token = createToken(user._id)
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
    res.status(200).json({ user: user._id })
    
  } catch (err) {
    const errors = handleErrors(err)    
    res.status(400).json({ errors })
  }  
}

/************************************************************** */

module.exports.dashboard_get = async (req, res) => {
  try {
    const data = await Job.find({})
    res.render('dashboard', { data }) 
  } catch (error) {
    console.log(error)
    res.status(500).send("An error occurred") 
  }
}

/************************************************************** */

module.exports.createJob_get = (req, res) => {
  res.render('createJob')
}

module.exports.createJob_post = async (req, res) => {
  const { 
    jobtitle,
    jobcompany,
    website,
    employersName, 
    employersEmail, 
    employersPhone, 
    employersAddress, 
    origin,           
    status,
    comments
  } = req.body
  
  try {
    const job = await Job.create({ 
      jobtitle,
      jobcompany,
      website,
      employersName, 
      employersEmail, 
      employersPhone, 
      employersAddress, 
      origin,          
      status,
      comments 
    })

    res.status(201).json({ job: job._id })
    
  } catch (err) {
    console.log(err)

    const errors = jobHandleErrors(err)
    res.status(400).json({ errors })
  }
}

/************************************************************** */
// debugger
module.exports.viewJob_get = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Received ID:', id);
    const data = await Job.findById(id);
    console.log('Fetched Data:', data);
    if (!data) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.render('viewjob', { data });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ message: error.message });
  }
}

/*
module.exports.viewJob_get = async (req, res) => {
  try {
    const { id } = req.params
    const data = await Job.findById(id)
    if (!data) {
      return res.status(404).json({ message: "Job not found" })
    }
    res.render('viewjob', { data }) 
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
};
*/

/************************************************************** */

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge : 1 })
  res.redirect('/')
}