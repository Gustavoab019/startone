const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { protect } = require('../middlewares/authMiddleware');
const { registerUser, loginUser } = require('../controllers/userController')
const { getProfile, updateProfile, updateBio } = require('../controllers/profileController');
const {listProfessionals} = require('../controllers/professionalController')
const { followUser, unfollowUser, getFollowers, getFollowing } = require('../controllers/followController');

// Registro de Usuário
router.post('/register', registerUser);

// Login de Usuário
router.post('/login', loginUser);

// Perfil
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/bio', protect, updateBio);

// Rota para listar profissionais
router.get('/professionals', protect, listProfessionals);

// Rotas para seguir e deixar de seguir usuários
router.post('/follow/:id', protect, followUser);
router.delete('/follow/:id', protect, unfollowUser);

// Rota para obter seguidores de um usuário
router.get('/:id/followers', protect, getFollowers);

// Rota para obter usuários que o usuário está seguindo
router.get('/:id/following', protect, getFollowing);

module.exports = router;
