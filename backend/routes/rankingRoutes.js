const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Evaluation = require('../models/evaluationModel');

// Função para calcular o score de cada profissional com base nas avaliações e certificações
const calculateRankingScore = (professional, evaluations) => {
  let score = 0;

  // Incrementa pontos por certificações
  if (professional.certifications.length) {
    score += professional.certifications.length * 10;  // Cada certificação vale 10 pontos
  }

  // Incrementa pontos pelas avaliações (média)
  if (evaluations.length) {
    // Calcula o score com base nas categorias das avaliações
    const totalScore = evaluations.reduce((acc, eval) => {
      return (
        acc +
        eval.categories.qualityOfWork +
        eval.categories.punctuality +
        eval.categories.communication +
        eval.categories.safety +
        eval.categories.problemSolving
      );
    }, 0);
    
    // Calcula a média considerando 5 categorias
    const averageRating = totalScore / (evaluations.length * 5);
    score += averageRating * 20;  // Multiplica a média por 20 para o score
  }

  return score;
};

// Rota para listar o ranking dos melhores profissionais
router.get('/top', async (req, res) => {
  try {
    // Buscando todos os profissionais
    const professionals = await User.find({ type: 'professional' });

    // Calculando a pontuação de cada profissional com base nas avaliações
    const professionalScores = await Promise.all(professionals.map(async (prof) => {
      // Buscar as avaliações do profissional
      const evaluations = await Evaluation.find({ evaluated: prof._id });
      
      // Calcular o score do profissional
      const score = calculateRankingScore(prof, evaluations);
      
      return {
        name: prof.name,
        score: score
      };
    }));

    // Ordenando os profissionais pela pontuação (maior para menor)
    professionalScores.sort((a, b) => b.score - a.score);

    // Retornando o top 10 profissionais com nome e score
    const topProfessionals = professionalScores.slice(0, 10);

    res.status(200).json(topProfessionals);
  } catch (error) {
    console.error('Error fetching top professionals:', error);
    res.status(500).json({ message: 'Error fetching rankings', error: error.message });
  }
});

module.exports = router;
