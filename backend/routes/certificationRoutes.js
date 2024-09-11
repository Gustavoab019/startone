const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const User = require('../models/userModel');

// Rota para adicionar certificações ao perfil do profissional
router.post('/add', protect, async (req, res) => {
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

    res.status(201).json({ message: 'Certification added successfully', certifications: user.certifications });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(400).json({ message: 'Error adding certification', error: error.message });
  }
});

module.exports = router;
