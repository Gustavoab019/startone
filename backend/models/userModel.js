const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['professional', 'company', 'client'], // Define o tipo de usuário
    required: true
  },
  specialties: {
    type: [String], // Exemplo: ['carpenter', 'electrician']
  },
  experienceYears: {
    type: Number // Anos de experiência
  },
  certifications: [
    {
      name: { type: String, required: true },           // Nome da Certificação
      institution: { type: String, required: true },    // Instituição emissora
      dateObtained: { type: Date, required: true },     // Data de obtenção
    }
  ],
  portfolio: [
    {
      projectTitle: { type: String, required: true },
      description: { type: String, required: true },
      images: [String], // Array de URLs de imagens
      completionDate: { type: Date, required: true }
    }
  ],
  location: {
    type: String,
    required: function () {
      return this.type === 'professional';
    },
  },
  companyDetails: {
    companyName: { type: String },
    location: { type: String }, 
    services: [String]
  },
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'  // Referência aos profissionais
    }
  ],
  averageRating: {
    type: Number,
    default: 0, // Começa como 0 até o profissional receber avaliações
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
