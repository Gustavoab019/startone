const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true, // Unique username for each user
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['professional', 'company', 'client'], // User type
    required: true,
  },
  bio: { type: String, required: false }, // Biografia do profissional
  location: {
    type: String, // User's location
    required: true,
  },
  companyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProfile', // Links to the CompanyProfile model
  },
  professionalProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProfessionalProfile', // Links to the ProfessionalProfile model
  },
  clientProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClientProfile', // Links to the ClientProfile model
  },
  averageRating: {
    type: Number,
    default: 0, // Starts at 0 until reviews are added
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ], // List of followers
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ], // List of users this user is following
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
