const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
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
    professionals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    employees: [
      {
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee',
          required: true,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: false, // Adicionado para consistência em consultas por userId
        },
        role: String,
        status: {
          type: String,
          enum: ['active', 'inactive'],
          default: 'active',
        },
      },
    ],
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['not started', 'in progress', 'completed', 'cancelled'],
      default: 'in progress',
    },
    completionDate: Date,
  },
  { timestamps: true }
);

// Virtual to count active employees
projectSchema.virtual('activeEmployeesCount').get(function () {
  return this.employees.filter((emp) => emp.status === 'active').length;
});

// Virtual to count inactive employees
projectSchema.virtual('inactiveEmployeesCount').get(function () {
  return this.employees.filter((emp) => emp.status === 'inactive').length;
});

// Convert virtuals to JSON
projectSchema.set('toJSON', { virtuals: true });

// Method to add or reactivate an employee in a project
projectSchema.methods.addEmployee = function (employeeId, userId, role) {
  const existing = this.employees.find(
    (emp) => emp.employeeId.toString() === employeeId.toString()
  );

  if (existing) {
    if (existing.status === 'inactive') {
      existing.status = 'active';
      existing.role = role;
      if (userId) {
        existing.userId = userId; // Atualiza userId, se fornecido
      }
    } else {
      throw new Error('Funcionário já está ativo neste projeto.');
    }
  } else {
    this.employees.push({ employeeId, userId, role, status: 'active' });
  }

  return this; // Retorna o objeto atualizado
};


// Indexes for optimized queries
projectSchema.index({ createdById: 1 });
projectSchema.index({ 'employees.employeeId': 1 });
projectSchema.index({ 'employees.userId': 1 }); // Index adicional para userId em employees
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
