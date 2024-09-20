const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectTitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdByType: {
    type: String, // professional, company, client
    required: true,
  },
  professionals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    default: 'in progress', // Status inicial do projeto
  },
  completionDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
