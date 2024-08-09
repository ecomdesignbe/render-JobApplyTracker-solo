const User = require("../models/User")
const Job = require("../models/Job")
const jwt = require("jsonwebtoken")
const FTPClient = require('ftp');
const fileUpload = require('express-fileupload');

// FTP client configuration
const ftpClient = new FTPClient();

const ftpConfig = {
    host: 'ftp.cluster010.hosting.ovh.net',  // replace with your FTP host
    user: 'ecomdesi', // replace with your FTP username
    password: 'SQLadmin303' // replace with your FTP password
};

// Connect to the FTP server
function connectFTP() {
  return new Promise((resolve, reject) => {
      ftpClient.on('ready', resolve);
      ftpClient.on('error', reject);
      ftpClient.connect(ftpConfig);
  });
}


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
    password
} = req.body;

try {
    // Validate uploaded files
    if (!req.files || !req.files.profilePicture || !req.files.cvDocuments) {
        return res.status(400).json({ errors: { message: 'Files are missing' } });
    }

    const profilePicture = req.files.profilePicture;
    const cvDocuments = req.files.cvDocuments;

    // Connect to the FTP server
    await connectFTP();

    // Upload files to FTP
    ftpClient.put(profilePicture.data, `dev/uploads/${profilePicture.name}`, err => {
        if (err) throw err;
        console.log(`Profile picture uploaded: ${profilePicture.name}`);
    });

    ftpClient.put(cvDocuments.data, `dev/uploads/${cvDocuments.name}`, err => {
        if (err) throw err;
        console.log(`CV uploaded: ${cvDocuments.name}`);
    });

    // Disconnect from FTP
    ftpClient.end();

    // Create a new user
    const user = await User.create({
        firstname,
        lastname,
        email,
        github,
        profilePicture: profilePicture.name, // Store file name in the database
        cvDocuments: cvDocuments.name, // Store file name in the database
        password
    });

    // Create JWT token
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });

    res.status(201).json({ user: user._id });

} catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
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
    // Extract filter and sort parameters from query
    const { filterBy, order } = req.query;

    // Build the filter and sort objects
    let filter = {};
    let sort = {};

    // Apply filtering
    if (filterBy) {
        if (filterBy === 'status') {
            filter = { 'status': { $exists: true } }; // Adjust filter logic if needed
        } else if (filterBy === 'date') {
            filter = {}; // Add more specific filtering logic if needed
        }
    }

    // Apply sorting
    if (order) {
        sort = { createdAt: order === 'asc' ? 1 : -1 }; // Sort by creation date
    }

    // Fetch jobs from the database with filtering and sorting
    const jobs = await Job.find(filter).sort(sort);

    // Render the jobs on your page
    res.render('dashboard', { data: jobs });
} catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
}
}

/* SIMPLE REQUEST
module.exports.dashboard_get = async (req, res) => {
  try {
    const data = await Job.find({})
    res.render('dashboard', { data }) 
  } catch (error) {
    console.log(error)
    res.status(500).send("An error occurred") 
  }
}
*/

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
// debugger 4 render
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
};
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
}
*/

/************************************************************** */

// GET / 
// Edit job 
module.exports.editJob_get  = async (req, res) => {
  try {
      const data = await Job.findOne( { _id: req.params.id } )

      res.render('editjob', { data })
      
  } catch (error) {
      console.log(error)   
  }
}

// POST / 
// Edit job  
module.exports.editJob_post = async (req, res) => {
  try {
      await Job.findByIdAndUpdate(req.params.id, { 
          jobtitle: req.body.jobtitle, 
          jobcompany: req.body.jobcompany, 
          website: req.body.website, 
          employersName: req.body.employersName, 
          employersEmail: req.body.employersEmail, 
          employersPhone: req.body.employersPhone, 
          employersAddress: req.body.employersAddress, 
          origin: req.body.origin, 
          status: req.body.status, 
          comments: req.body.comments
      });
      res.json({ success: true })
  } catch (error) {
      console.log(error)
      res.status(500).json({ errors: { general: 'An error occurred' } })
  }
}
/************************************************************** */

// DELETE / 
// Delete Job   
module.exports.deleteJob_delete = async (req, res) => {
  try {
    await Job.deleteOne( { _id: req.params.id } )
    res.redirect('/dashboard')
  } catch (error) {
      console.log(error)
  }
}


/************************************************************** */

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge : 1 })
  res.redirect('/')
}