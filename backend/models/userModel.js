const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
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
    enum: ['professional', 'company', 'client'],
    required: true
  },
  professionalProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProfessionalProfile',
  },
  location: {
    type: String,
    required: true
  },
  companyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProfile',
  },
  clientProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClientProfile',
  },
  averageRating: {
    type: Number,
    default: 0,
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
});

// Middleware para gerar o username antes de salvar o usuário
userSchema.pre('save', function (next) {
  if (!this.username) {
    this.username = generateRandomUsername(this.name);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
