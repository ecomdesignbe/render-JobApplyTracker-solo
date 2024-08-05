const mongoose = require('mongoose')
const { isEmail } = require('validator')

const jobSchema = new mongoose.Schema({
    jobtitle: { 
        type: String,
        required: [true, 'Please enter a jobtitle']
    },
    jobcompany: { 
        type: String,
        required: [true, 'Please enter a company']
    },
    website: { 
        type: String,        
        required: [true, 'Please enter a website']
    },
    employersName: { 
        type: String,
        required: [true, 'Please enter an employers name']
    },
    employersEmail: {
        type: String,
        required: [true, 'Please enter an employers email'],        
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    employersPhone: {
        type: String
    },
    employersAddress: {
        type: String
    },
    origin: {
        type: [String],
        enum: ['Candidature spontanée', 'Job offer.'],
        required : [true, 'Please choose an origin']
    },
    status: {
        type: [String],
        enum: ['Interested', 'CV sent', 'Negative', 'Interview'],
        required : [true, 'Please choose an status'] 
    },
    comments: {
        type: String
    }
})

const Job = mongoose.model('job', jobSchema)

module.exports = Job