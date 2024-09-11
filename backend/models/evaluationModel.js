const mongoose = require('mongoose');

const evaluationSchema = mongoose.Schema({
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'  // Cliente que fez a avaliação
  },
  evaluated: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'  // Profissional ou empresa que foi avaliado
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project'  // Projeto relacionado à avaliação
  },
  categories: {
    qualityOfWork: { type: Number, required: true },  // Qualidade do Trabalho
    punctuality: { type: Number, required: true },    // Pontualidade
    communication: { type: Number, required: true },  // Comunicação
    safety: { type: Number, required: true },         // Segurança e Cuidados
    problemSolving: { type: Number, required: true }  // Solução de Problemas
  },
  feedback: {
    type: String,  // Comentários adicionais do cliente
  }
}, {
  timestamps: true
});



const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;
