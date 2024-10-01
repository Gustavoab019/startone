const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { protect } = require('../middlewares/authMiddleware');
const { check, validationResult } = require('express-validator');
const ProfessionalProfileModel = require('../models/ProfessionalProfileModel');
const CompanyProfileModel = require('../models/CompanyProfileModel');
const ClientProfileModel = require('../models/ClientProfileModel');

// Middleware de validação para registro
const validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('type', 'User type is required').not().isEmpty()
];

// Rota para registro de usuário com validação
router.post('/register', validateRegister, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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

    // Cria um novo usuário
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      type,
      location  // Localização obrigatória para todos os tipos de usuário
    });

    // Verifica o tipo de usuário e cria o perfil correspondente
    if (type === 'professional') {
      await ProfessionalProfileModel.create({
        userId: user._id,  // Relaciona com o ID do usuário
        specialties,
        experienceYears,
        certifications,
        portfolio,
        location
      });
    } else if (type === 'company') {
      await CompanyProfileModel.create({
        userId: user._id,  // Relaciona com o ID do usuário
        companyName: companyDetails.companyName,
        location: companyDetails.location,
        servicesOffered: companyDetails.services
      });
    } else if (type === 'client') {
      await ClientProfileModel.create({
        userId: user._id,  // Relaciona com o ID do usuário
        fullName: name,
        email: email,
        location
      });
    }

    // Gera o token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      location: user.location,
      token
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Middleware de validação para login
const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Rota para login do usuário com validação
router.post('/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
 

// Middleware de validação para atualizar o perfil
const validateUpdateProfile = [
  check('email', 'Please include a valid email').optional().isEmail(),
  check('name', 'Name cannot be empty').optional().not().isEmpty(),
  check('specialties', 'Specialties cannot be empty').optional().not().isEmpty(),
  check('experienceYears', 'Experience must be a number').optional().isNumeric(),
  check('location', 'Location cannot be empty').optional().not().isEmpty()
];

// Rota protegida para atualizar o perfil do usuário
router.put('/profile', protect, validateUpdateProfile, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.location = req.body.location || user.location;  // Atualiza a localização

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
        location: updatedUser.location  // Retorna a localização do usuário
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Rota para listar profissionais com filtros
router.get('/professionals', protect, async (req, res) => {
  try {
    const { specialty, location, averageRatingMin, averageRatingMax } = req.query;

    // Criar a query com filtros opcionais
    let query = {};

    // Filtro por especialidade
    if (specialty) {
      query.specialties = { $in: [specialty] }; // Verifica se a especialidade existe no array de specialties
    }

    // Filtro por localização
    if (location) {
      query.location = location; // Filtra pela localização do profissional
    }

    // Filtro por intervalo de avaliação média
    if (averageRatingMin && averageRatingMax) {
      query.averageRating = { $gte: averageRatingMin, $lte: averageRatingMax };
    } else if (averageRatingMin) {
      query.averageRating = { $gte: averageRatingMin };
    } else if (averageRatingMax) {
      query.averageRating = { $lte: averageRatingMax };
    }

    // Executar a consulta no modelo de perfil de profissional
    const professionals = await ProfessionalProfileModel.find(query)
      .populate('userId', 'name averageRating') // Traz o nome e avaliação média do modelo User
      .exec();

    res.json(professionals);
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    res.status(500).json({ message: 'Erro ao buscar profissionais', error: error.message });
  }
});



router.get('/profile', protect, async (req, res) => {
  try {
    // Busca o usuário pelo ID do token JWT
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileData;

    // Buscar dados específicos de acordo com o tipo de usuário
    if (user.type === 'professional') {
      profileData = await ProfessionalProfileModel.findOne({ userId: user._id });
    } else if (user.type === 'company') {
      profileData = await CompanyProfileModel.findOne({ userId: user._id });
    } else if (user.type === 'client') {
      profileData = await ClientProfileModel.findOne({ userId: user._id });
    }

    if (!profileData) {
      return res.status(404).json({ message: `${user.type} profile not found` });
    }

    // Montar a resposta mesclando os dados do UserModel com o perfil específico
    const mergedProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      location: user.location,  // Adicionar a localização que está no UserModel
      ...profileData.toObject() // Mesclar os dados do perfil específico (transformado em objeto)
    };

    res.json(mergedProfile);

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





module.exports = router;
