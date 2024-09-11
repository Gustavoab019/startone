const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// Função para calcular a pontuação dos profissionais
const calculateScore = (professional) => {
  let score = 0;

  // Incrementa pontos por certificações
  if (professional.certifications.length) {
    score += professional.certifications.length * 10;
  }

  // Incrementa pontos pelas avaliações (média)
  if (professional.evaluations && professional.evaluations.length) {
    const totalScore = professional.evaluations.reduce((acc, eval) => acc + eval.rating, 0);
    const averageRating = totalScore / professional.evaluations.length;
    score += averageRating * 10; // Cada estrela vale 10 pontos
  }

  return score;
};

// Rota para buscar os melhores profissionais
router.get('/recommend', async (req, res) => {
  try {
    // Buscando todos os profissionais
    const professionals = await User.find({ type: 'professional' });

    // Calculando a pontuação de cada profissional
    const professionalScores = professionals.map(prof => {
      return {
        professional: prof,
        score: calculateScore(prof)
      };
    });

    // Ordenando os profissionais pela pontuação (maior para menor)
    professionalScores.sort((a, b) => b.score - a.score);

    // Retornando os 5 melhores profissionais
    const topProfessionals = professionalScores.slice(0, 5);

    res.status(200).json(topProfessionals.map(item => item.professional));
  } catch (error) {
    console.error('Error fetching recommended professionals:', error);
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
});

module.exports = router;
