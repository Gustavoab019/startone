const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ProfessionalProfileModel = require('../models/ProfessionalProfileModel');
const CompanyProfileModel = require('../models/CompanyProfileModel');
const ClientProfileModel = require('../models/ClientProfileModel');
const generateUsername = require('../utils/generateUsername'); // Importa o gerador de username

// Função para gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Registrar Usuário
exports.registerUser = async (req, res) => {
  const { name, email, password, type, location, specialties, experienceYears, certifications, portfolio, companyDetails } = req.body;

  try {
    // Verifica se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Gera um username único
    const username = generateUsername(name);

    // Cria o usuário
    const user = await User.create({ name, username, email, password: hashedPassword, type, location });

    // Cria o perfil específico com base no tipo de usuário
    if (type === 'professional') {
      if (!specialties || !experienceYears) {
        return res.status(400).json({ message: 'Professional profile requires specialties and experience years' });
      }
      await ProfessionalProfileModel.create({ userId: user._id, specialties, experienceYears, certifications, portfolio, location });
    } else if (type === 'company') {
      if (!companyDetails || !companyDetails.companyName || !companyDetails.services) {
        return res.status(400).json({ message: 'Company profile requires company name and services' });
      }
      await CompanyProfileModel.create({ userId: user._id, companyName: companyDetails.companyName, location: companyDetails.location, servicesOffered: companyDetails.services });
    } else if (type === 'client') {
      await ClientProfileModel.create({ userId: user._id, fullName: name, email, location });
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Gera token JWT
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      type: user.type,
      location: user.location,
      token,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login de Usuário
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
