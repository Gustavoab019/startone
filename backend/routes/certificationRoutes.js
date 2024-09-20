const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { body, validationResult } = require('express-validator');
const User = require('../models/userModel');
const router = express.Router();

// Rota para adicionar certificações ao perfil do profissional
router.post('/add', [
  protect,  // Ensure user is authenticated
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

    // Adiciona a nova certificação
    const newCertification = {
      name,
      institution,
      dateObtained,
    };

    user.certifications.push(newCertification);
    await user.save();

    res.status(201).json({ 
      message: 'Certification added successfully', 
      certifications: user.certifications 
    });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ message: 'Error adding certification', error: error.message });
  }
});

module.exports = router;
