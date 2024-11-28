const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Caminhão', 'Van', 'Carro'],
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  plate: {
    type: String,
    required: true,
    unique: true,
  },
  nextMaintenanceDate: {
    type: Date,
    required: true,
  },
  availabilityStatus: {
    type: String,
    enum: ['Disponível', 'Indisponível', 'Manutenção'],
    required: true,
  },
  projectAssociated: {
    type: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // ID do projeto associado
      name: { type: String }, // Nome do projeto associado
    },
    default: null, // Valor padrão caso nenhum projeto esteja associado
  },
  additionalNotes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
