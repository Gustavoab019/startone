const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { body, validationResult } = require('express-validator');
const User = require('../models/userModel');
const ProfessionalProfileModel = require('../models/ProfessionalProfileModel');
const router = express.Router();

// Rota para adicionar certificações ao perfil do profissional
router.post('/add', [
  protect,  // Middleware de proteção para garantir que o usuário está autenticado
  body('name').notEmpty().withMessage('Certification name is required'),
  body('institution').notEmpty().withMessage('Institution is required'),
  body('dateObtained').isDate().withMessage('Valid date is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, institution, dateObtained } = req.body;

  try {
    // Verifica se o usuário é um profissional
    const user = await User.findById(req.user._id);
    if (!user || user.type !== 'professional') {
      return res.status(400).json({ message: 'User is not a professional' });
    }

    // Encontra o perfil profissional do usuário
    const professionalProfile = await ProfessionalProfileModel.findOne({ userId: user._id });

    if (!professionalProfile) {
      return res.status(404).json({ message: 'Professional profile not found' });
    }

    // Adiciona a nova certificação ao perfil do profissional
    const newCertification = {
      name,
      institution,
      dateObtained,
    };

    professionalProfile.certifications.push(newCertification);
    await professionalProfile.save();

    res.status(201).json({ 
      message: 'Certification added successfully', 
      certifications: professionalProfile.certifications 
    });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ message: 'Error adding certification', error: error.message });
  }
});

module.exports = router;
