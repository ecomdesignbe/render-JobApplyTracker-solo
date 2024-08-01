const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
    firstname: { 
        type: String,
        required: [true, 'Please enter your firstname']
    },
    lastname: { 
        type: String, 
        required: [true, 'Please enter your lastname']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    github: { 
        type: String, 
        default : 'none' 
    },
    profilePicture: { 
        type: String, 
        default : 'none' 
    },
    cvDocuments: { 
        type: String, 
        default : 'none' 
    },  
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters'],
    }
})


const User = mongoose.model('user', userSchema)

module.exports = User