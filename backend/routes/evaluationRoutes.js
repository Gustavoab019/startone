const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Evaluation = require('../models/evaluationModel');
const User = require('../models/userModel'); // Adicionando o modelo de usuário

// Função para atualizar a média das avaliações do profissional
async function updateAverageRating(professionalId) {
  const evaluations = await Evaluation.find({ evaluated: professionalId });

  if (evaluations.length === 0) {
    return 0;
  }

  const totalScore = evaluations.reduce((sum, evaluation) => {
    // Calcular a média das categorias
    const averageCategoryScore = 
      (evaluation.categories.qualityOfWork + 
      evaluation.categories.punctuality + 
      evaluation.categories.communication + 
      evaluation.categories.safety + 
      evaluation.categories.problemSolving) / 5;

    return sum + averageCategoryScore;
  }, 0);

  const averageRating = totalScore / evaluations.length;

  // Atualizar o campo averageRating no profissional
  await User.findByIdAndUpdate(professionalId, { averageRating });
}

// Rota para criar uma nova avaliação
router.post('/', protect, async (req, res) => {
  const { evaluated, project, categories, feedback } = req.body;

  try {
    // Criar nova avaliação
    const evaluation = new Evaluation({
      evaluator: req.user._id,
      evaluated,
      project,
      categories,
      feedback
    });

    const createdEvaluation = await evaluation.save();

    // Atualizar o averageRating do profissional
    await updateAverageRating(evaluated);

    res.status(201).json(createdEvaluation);
  } catch (error) {
    console.error('Error creating evaluation:', error);
    res.status(400).json({ message: 'Error creating evaluation' });
  }
});

// Rota para listar avaliações de um profissional ou empresa
router.get('/:userId', async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ evaluated: req.params.userId })
      .populate('evaluator', 'name')  // Popula o nome do cliente que fez a avaliação
      .populate('project', 'projectTitle');  // Popula o nome do projeto

    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(400).json({ message: 'Error fetching evaluations' });
  }
});

module.exports = router;
