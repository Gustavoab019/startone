const mongoose = require('mongoose');
const { Schema } = mongoose;

const EmployeeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    default: null
  },
  position: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Disponível', 'Em Projeto', 'Férias', 'Indisponível'],
    default: 'Disponível'
  },
  currentProjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  currentProjectRole: String,
  projectHistory: [{
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    role: String,
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

EmployeeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Employee', EmployeeSchema);