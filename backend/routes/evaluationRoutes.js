const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Evaluation = require('../models/evaluationModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

// Função para atualizar a média geral das avaliações de um profissional
async function updateAverageRating(professionalId) {
  const evaluations = await Evaluation.find({ evaluated: professionalId });

  if (evaluations.length === 0) {
    return 0;
  }

  const totalScore = evaluations.reduce((sum, evaluation) => {
    const { qualityOfWork = 0, punctuality = 0, communication = 0, safety = 0, problemSolving = 0 } = evaluation.categories;

    const fieldsCount = [qualityOfWork, punctuality, communication, safety, problemSolving].filter(field => field > 0).length;
    
    const averageCategoryScore = fieldsCount > 0 
      ? (qualityOfWork + punctuality + communication + safety + problemSolving) / fieldsCount 
      : 0;

    return sum + averageCategoryScore;
  }, 0);

  const averageRating = totalScore / evaluations.length;

  await User.findByIdAndUpdate(professionalId, { averageRating });

  return averageRating;
}

// Função para calcular as médias das categorias de avaliação
async function calculateCategoryAverages(professionalId) {
  const evaluations = await Evaluation.find({ evaluated: professionalId });

  if (evaluations.length === 0) {
    return {
      qualityOfWork: 0,
      punctuality: 0,
      communication: 0,
      safety: 0,
      problemSolving: 0,
    };
  }

  const totals = evaluations.reduce(
    (sum, evaluation) => {
      const { qualityOfWork = 0, punctuality = 0, communication = 0, safety = 0, problemSolving = 0 } = evaluation.categories;
      
      sum.qualityOfWork += qualityOfWork;
      sum.punctuality += punctuality;
      sum.communication += communication;
      sum.safety += safety;
      sum.problemSolving += problemSolving;
      return sum;
    },
    {
      qualityOfWork: 0,
      punctuality: 0,
      communication: 0,
      safety: 0,
      problemSolving: 0,
    }
  );

  return {
    qualityOfWork: totals.qualityOfWork / evaluations.length,
    punctuality: totals.punctuality / evaluations.length,
    communication: totals.communication / evaluations.length,
    safety: totals.safety / evaluations.length,
    problemSolving: totals.problemSolving / evaluations.length,
  };
}

// Rota para criar uma nova avaliação com validação e proteção
router.post(
  '/', 
  [
    protect, // Middleware de autenticação
    body('categories.qualityOfWork').isInt({ min: 1, max: 10 }).withMessage('Quality of Work must be between 1 and 10'),
    body('categories.punctuality').isInt({ min: 1, max: 10 }).withMessage('Punctuality must be between 1 and 10'),
    body('categories.communication').isInt({ min: 1, max: 10 }).withMessage('Communication must be between 1 and 10'),
    body('categories.safety').isInt({ min: 1, max: 10 }).withMessage('Safety must be between 1 and 10'),
    body('categories.problemSolving').isInt({ min: 1, max: 10 }).withMessage('Problem Solving must be between 1 and 10'),
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { evaluated, project, categories, feedback } = req.body;

    try {
      const evaluation = new Evaluation({
        evaluator: req.user._id, // Pega o avaliador autenticado
        evaluated,
        project,
        categories,
        feedback,
      });

      const createdEvaluation = await evaluation.save();
      
      await updateAverageRating(evaluated);

      const projectData = await Project.findById(project).select('projectTitle'); // Busca o título do projeto para exibir na notificação

      await Notification.create({
        user: evaluated,
        message: `Você recebeu uma nova avaliação no projeto "${projectData.projectTitle}".`,
        link: `/projects/${createdEvaluation.project}`,
      });

      res.status(201).json(createdEvaluation);
    } catch (error) {
      console.error('Erro ao criar a avaliação:', error);
      res.status(400).json({ message: 'Erro ao criar a avaliação', error: error.message });
    }
  }
);

// Rota protegida para listar avaliações do usuário autenticado com nomes dos participantes do projeto
router.get('/', protect, async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ evaluated: req.user._id }) // Usando o ID do usuário autenticado a partir do token
      .populate('evaluator', 'name')
      .populate({
        path: 'project',
        select: 'projectTitle participants',
        populate: {
          path: 'participants',
          select: 'name', // Inclui apenas o nome dos participantes
        },
      });
      
    res.json(evaluations);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(400).json({ message: 'Erro ao buscar avaliações' });
  }
});

// Rota protegida para listar médias das categorias do usuário autenticado
router.get('/averages', protect, async (req, res) => {
  try {
    const categoryAverages = await calculateCategoryAverages(req.user._id); // Usando o ID do usuário autenticado a partir do token
    res.json({ averages: categoryAverages });
  } catch (error) {
    console.error('Erro ao buscar médias das categorias:', error);
    res.status(400).json({ message: 'Erro ao buscar médias das categorias' });
  }
});

module.exports = router;
