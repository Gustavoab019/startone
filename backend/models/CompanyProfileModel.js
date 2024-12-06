const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Links to the corresponding user
  },
  companyName: {
    type: String,
    required: true, // Name of the company
  },
  servicesOffered: {
    type: [String],
    required: true, // List of services offered by the company
  },
  logo: {
    type: String, // URL of the company logo
  },
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project', // List of associated projects
    },
  ],
  reviews: [
    {
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 10 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ], // Reviews for the company
}, { timestamps: true });

const CompanyProfileModel = mongoose.model('CompanyProfile', companyProfileSchema);

module.exports = CompanyProfileModel;
