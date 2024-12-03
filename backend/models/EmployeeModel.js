// Employee Model (Funcionário)
// Este modelo será responsável por armazenar dados específicos dos funcionários, como cargos e status.

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Modelo atualizado para Employee (Funcionário)
const EmployeeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    default: null // O funcionário pode não estar vinculado inicialmente a uma empresa
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
  assignedProjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar o campo updatedAt automaticamente
EmployeeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Employee', EmployeeSchema);
