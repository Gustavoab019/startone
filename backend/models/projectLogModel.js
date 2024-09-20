const mongoose = require('mongoose');

const projectLogSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  oldStatus: {
    type: String,
    required: true,
  },
  newStatus: {
    type: String,
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
});

const ProjectLog = mongoose.model('ProjectLog', projectLogSchema);

module.exports = ProjectLog;
