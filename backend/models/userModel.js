const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true, // O nome de usuário deve ser único
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
  professionalProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProfessionalProfile',  // Referência ao modelo de perfil de profissional
  },
  location: {
    type: String, // Localização obrigatória para todos os tipos de usuário
    required: true
  },
  companyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProfile',  // Referência ao modelo de perfil da empresa
  },
  clientProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClientProfile',  // Referência ao modelo de perfil do cliente
  },
  averageRating: {
    type: Number,
    default: 0, // Começa como 0 até o usuário (profissional ou empresa) receber avaliações
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], // Lista de seguidores
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }] // Lista de usuários que este usuário está seguindo
}, {
  timestamps: true
}); // <- Fechamento correto do esquema aqui

// Middleware para gerar o username antes de salvar o usuário
userSchema.pre('save', function (next) {
  if (!this.username) {
    // Gera o nome de usuário apenas se ele ainda não tiver sido definido
    this.username = generateRandomUsername(this.name);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
