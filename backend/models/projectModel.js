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
    type: String,
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
  employees: [{
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    role: String,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['not started', 'in progress', 'completed', 'cancelled'],
    default: 'in progress',
  },
  completionDate: Date,
}, { timestamps: true });

projectSchema.virtual('activeEmployeesCount').get(function() {
  return this.employees.filter(emp => emp.status === 'active').length;
});

projectSchema.set('toJSON', { virtuals: true });

projectSchema.methods.addEmployee = function (employeeId, role) {
  const existing = this.employees.find(
    (emp) => emp.employeeId.toString() === employeeId.toString()
  );
  if (existing) {
    if (existing.status === 'inactive') {
      existing.status = 'active';
      existing.role = role;
    } else {
      throw new Error('Funcionário já está ativo neste projeto.');
    }
  } else {
    this.employees.push({ employeeId, role, status: 'active' });
  }
};

module.exports = mongoose.model('Project', projectSchema);