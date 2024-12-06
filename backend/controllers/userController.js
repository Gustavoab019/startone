const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const ProfessionalProfileModel = require('../models/ProfessionalProfileModel');
const CompanyProfileModel = require('../models/CompanyProfileModel');
const ClientProfileModel = require('../models/ClientProfileModel');
const generateUsername = require('../utils/generateUsername');

// Função para gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Registrar Usuário
exports.registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    type,
    location,
    specialties,
    experienceYears,
    certifications,
    portfolio,
    companyDetails,
  } = req.body;

  // Validação dos dados de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Verifica se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Gera um username único
    const username = generateUsername(name);

    // Cria o usuário
    const user = new User({ name, username, email, password: hashedPassword, type, location });

    // Criação de perfis específicos com base no tipo de usuário
    let profile;
    if (type === 'professional') {
      if (!specialties || !Array.isArray(specialties) || specialties.length === 0) {
        return res.status(400).json({ message: 'Specialties are required for professional profiles.' });
      }
      if (!experienceYears) {
        return res.status(400).json({ message: 'Experience years are required for professional profiles.' });
      }

      profile = new ProfessionalProfileModel({
        userId: user._id,
        specialties,
        experienceYears,
        certifications,
        portfolio,
        location,
      });
    } else if (type === 'company') {
      if (!companyDetails || !companyDetails.companyName || !companyDetails.services) {
        return res.status(400).json({ message: 'Company name and services are required for company profiles.' });
      }

      profile = new CompanyProfileModel({
        userId: user._id,
        companyName: companyDetails.companyName,
        email,
        location: companyDetails.location || location,
        servicesOffered: companyDetails.services,
      });
    } else if (type === 'client') {
      profile = new ClientProfileModel({
        userId: user._id,
        fullName: name,
        email,
        location,
      });
    } else {
      return res.status(400).json({ message: 'Invalid user type.' });
    }

    // Salva o usuário e o perfil associado
    await user.save();
    try {
      await profile.save();
    } catch (error) {
      await User.findByIdAndDelete(user._id); // Remove o usuário se falhar a criação do perfil
      throw error;
    }

    // Gera token JWT
    const token = generateToken(user._id);

    // Retorna os dados do usuário e do perfil criado
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        type: user.type,
        location: user.location,
        token,
      },
      profile,
    });
  } catch (error) {
    console.error('Error during registration:', error.message, error.stack);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or username already in use.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// Login de Usuário
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validação dos dados de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);

      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        type: user.type,
        location: user.location,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Error during login:', error.message, error.stack);
    res.status(500).json({ message: 'Server error.' });
  }
};
