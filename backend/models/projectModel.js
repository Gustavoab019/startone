const mongoose = require('mongoose');

// Definição do schema para projetos
const projectSchema = mongoose.Schema(
  {
    projectTitle: {
      type: String,
      required: true, // Campo obrigatório
    },
    description: {
      type: String,
      required: true, // Campo obrigatório
    },
    professionals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referência para o modelo de usuário (profissionais)
        required: true, // Garantir que pelo menos um profissional seja vinculado
      },
    ],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referência para o modelo de empresa (opcional)
      required: false,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referência para o modelo de cliente (opcional)
      required: false,
    },
    completionDate: {
      type: Date, // Data de conclusão do projeto
      required: false, // Opcional
    },
    status: {
      type: String,
      enum: ['not started', 'in progress', 'completed'], // Status possíveis
      default: 'not started', // Status padrão
    },
  },
  {
    timestamps: true, // Cria automaticamente os campos createdAt e updatedAt
  }
);

// Definição do modelo de Projeto
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
