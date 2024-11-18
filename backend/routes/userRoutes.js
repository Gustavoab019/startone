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

// Função para gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Define a validade do token (30 dias)
  });
};

// Função para gerar username aleatório
function generateRandomUsername(name) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Gera número aleatório
  const baseUsername = name.toLowerCase().replace(/\s+/g, ''); // Remove espaços do nome
  return `${baseUsername}${randomSuffix}`; // Retorna nome base + sufixo aleatório
}

// Middleware de validação para registro
const validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('type', 'User type is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty()
];

// Rota para registro de usuário
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

    // Gera o username aleatório com base no nome do usuário
    const username = generateRandomUsername(name);

    // Cria um novo usuário
    const user = await User.create({
      name,
      username,  // Adiciona o username gerado
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

    // Retorna a resposta com o token e os dados do usuário
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username, // Retorna o username gerado
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
    const { specialty, location, averageRatingMin, averageRatingMax, username } = req.query;

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

    // Filtro por username (caso fornecido)
    let userQuery = {}; // Query para o modelo de usuários

    if (username) {
      userQuery.username = new RegExp(username, 'i'); // Filtro para encontrar usuários pelo username (case-insensitive)
    }

    // Busca no modelo User com a query de username, se houver
    const users = await User.find(userQuery).select('_id'); // Obtém os IDs dos usuários que correspondem ao username

    if (username) {
      query.userId = { $in: users.map((user) => user._id) }; // Adiciona o filtro por userId correspondente ao username
    }

    // Executar a consulta no modelo de perfil de profissional
    const professionals = await ProfessionalProfileModel.find(query)
      .populate('userId', 'name email location averageRating username') // Traz o nome, avaliação e username do modelo User
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

    // Verifica se o usuário existe
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    let profileData;

    // Buscar dados específicos de acordo com o tipo de usuário
    if (user.type === 'professional') {
      profileData = await ProfessionalProfileModel.findOne({ userId: user._id }).lean();
    } else if (user.type === 'company') {
      profileData = await CompanyProfileModel.findOne({ userId: user._id }).lean();
    } else if (user.type === 'client') {
      profileData = await ClientProfileModel.findOne({ userId: user._id }).lean();
    }

    // Verifica se o perfil específico foi encontrado
    if (!profileData) {
      return res.status(404).json({ message: `Perfil de ${user.type} não encontrado.` });
    }

    // Adiciona a contagem de seguidores ao perfil mesclado
    const mergedProfile = {
      _id: user._id,
      name: user.name || profileData.name,
      email: user.email || profileData.email,
      username: user.username || 'Username não definido',
      type: user.type,
      location: user.location || 'Localização não fornecida',
      averageRating: user.averageRating || 'Média não encontrada',
      followersCount: user.followers ? user.followers.length : 0, // Contagem de seguidores
      ...profileData
    };

    // Enviar o perfil mesclado como resposta
    res.json(mergedProfile);

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});


// Rota para seguir um usuário
router.post('/follow/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id; // ID do usuário atual (extraído do token)
    const followId = req.params.id; // ID do perfil a ser seguido

    // Impede o usuário de seguir a si mesmo
    if (userId.toString() === followId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const user = await User.findById(userId);
    const followUser = await User.findById(followId);

    // Verifica se o usuário a ser seguido existe
    if (!followUser) {
      return res.status(404).json({ message: "User to follow not found." });
    }

    // Verifica se o usuário já está seguindo o perfil
    if (user.following.includes(followId)) {
      return res.status(400).json({ message: "You are already following this user." });
    }

    // Adiciona o usuário a ser seguido na lista "following" do usuário atual
    user.following.push(followId);

    // Adiciona o usuário atual na lista "followers" do usuário seguido
    if (!followUser.followers.includes(userId)) {
      followUser.followers.push(userId);
    }

    await user.save();
    await followUser.save();

    return res.status(200).json({
      message: "User followed successfully.",
      following: followUser._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while following the user." });
  }
});

// Rota para deixar de seguir um usuário
router.delete('/follow/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id; // ID do usuário atual (extraído do token)
    const unfollowId = req.params.id; // ID do perfil a ser deixado de seguir

    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowId);

    // Verifica se o usuário a ser deixado de seguir existe
    if (!unfollowUser) {
      return res.status(404).json({ message: "User to unfollow not found." });
    }

    // Remove o ID do perfil do array "following" do usuário atual
    user.following = user.following.filter(id => !id.equals(unfollowId));

    // Remove o ID do usuário atual do array "followers" do usuário seguido
    unfollowUser.followers = unfollowUser.followers.filter(id => !id.equals(userId));

    await user.save();
    await unfollowUser.save();

    return res.status(200).json({
      message: "User unfollowed successfully.",
      unfollowing: unfollowUser._id
    });

  } catch (error) {
    console.error("Erro ao realizar unfollow:", error);
    res.status(500).json({ message: "An error occurred while unfollowing the user." });
  }
});

router.get('/:id/followers', protect, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Busca o usuário sem o populate para verificar o conteúdo de followers
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Exibe o conteúdo de followers sem o populate
    console.log("Followers IDs:", user.followers);

    // Agora aplique o populate para buscar os dados completos
    const populatedUser = await User.findById(userId).populate('followers', 'name username email location');

    res.status(200).json({ followers: populatedUser.followers });

  } catch (error) {
    console.error("Erro ao buscar seguidores:", error);
    res.status(500).json({ message: "An error occurred while fetching followers." });
  }
});

module.exports = router;
