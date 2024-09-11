const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
  {
    projectTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // opcional, conforme discutido anteriormente
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // opcional
    },
    completionDate: {
      type: Date,
      required: false, // opcional
    },
    status: {
      type: String,
      enum: ['not started', 'in progress', 'completed'], // define os status possíveis
      default: 'not started', // padrão ao criar um projeto
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
