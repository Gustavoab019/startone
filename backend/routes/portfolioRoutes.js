const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const User = require('../models/userModel');

// Rota para adicionar um projeto ao portfólio do profissional
router.post('/add', protect, async (req, res) => {
  const { projectTitle, description, images, completionDate } = req.body;

  try {
    // Verifica se o usuário é um profissional
    const user = await User.findById(req.user._id);

    if (!user || user.type !== 'professional') {
      return res.status(400).json({ message: 'User is not a professional' });
    }

    // Adiciona o projeto ao portfólio
    const newProject = {
      projectTitle,
      description,
      images, // URL de imagens
      completionDate
    };

    user.portfolio.push(newProject);
    await user.save();

    res.status(201).json({ message: 'Project added to portfolio', portfolio: user.portfolio });
  } catch (error) {
    console.error('Error adding project to portfolio:', error);
    res.status(400).json({ message: 'Error adding project', error: error.message });
  }
});

module.exports = router;
