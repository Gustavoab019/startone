const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { protect } = require('../middlewares/authMiddleware');

// Rota para registro de usuário
router.post('/register', async (req, res) => {
  const { name, email, password, type, specialties, experienceYears, certifications, portfolio, location, companyDetails } = req.body;

  try {
    // Verifica se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cria um novo usuário com base no tipo (professional, company, client)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      type,
      specialties: type === 'professional' ? specialties : undefined,
      experienceYears: type === 'professional' ? experienceYears : undefined,
      certifications: type === 'professional' ? certifications : undefined,
      portfolio: type === 'professional' ? portfolio : undefined,
      location: type === 'professional' ? location : undefined, // Adicionando location para profissionais
      companyDetails: type === 'company' ? companyDetails : undefined
    });

    // Gera o token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Retorna a resposta com os dados do usuário e o token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      token
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

  // Rota protegida para obter o perfil do usuário autenticado
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        specialties: user.specialties,
        experienceYears: user.experienceYears,
        certifications: user.certifications,
        portfolio: user.portfolio,
        companyDetails: user.companyDetails
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });

  router.put('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
  
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
  
      // Atualiza campos específicos de profissionais
      if (user.type === 'professional') {
        user.specialties = req.body.specialties || user.specialties;
        user.experienceYears = req.body.experienceYears || user.experienceYears;
        user.certifications = req.body.certifications || user.certifications;
        user.portfolio = req.body.portfolio || user.portfolio;
      }
  
      // Atualiza campos específicos de empresas
      if (user.type === 'company') {
        user.companyDetails = req.body.companyDetails || user.companyDetails;
      }
  
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
  
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        type: updatedUser.type,
        specialties: updatedUser.specialties,
        experienceYears: updatedUser.experienceYears,
        certifications: updatedUser.certifications,
        portfolio: updatedUser.portfolio,
        companyDetails: updatedUser.companyDetails
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });

  // Rota para listar profissionais com filtros
  router.get('/professionals', protect, async (req, res) => {
    try {
      const { specialty, location, averageRating } = req.query;
  
      let query = { type: 'professional' }; // Garante que apenas profissionais sejam retornados
  
      // Filtro por especialidade
      if (specialty) {
        query.specialties = { $in: [specialty] };
      }
  
      // Filtro por localização (necessário que o campo location esteja no esquema de User)
      if (location) {
        query.location = location; 
      }
  
      // Filtro por avaliação média
      if (averageRating) {
        query.averageRating = { $gte: averageRating };
      }
  
      const professionals = await User.find(query);
  
      res.json(professionals);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      res.status(500).json({ message: 'Error fetching professionals', error: error.message });
    }
  });
  
  

module.exports = router;
