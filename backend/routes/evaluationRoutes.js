const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Evaluation = require('../models/evaluationModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

// Função para atualizar a média das avaliações do profissional
async function updateAverageRating(professionalId) {
  const evaluations = await Evaluation.find({ evaluated: professionalId });

  if (evaluations.length === 0) {
    return 0;
  }

  const totalScore = evaluations.reduce((sum, evaluation) => {
    const qualityOfWork = evaluation.categories.qualityOfWork || 0;
    const punctuality = evaluation.categories.punctuality || 0;
    const communication = evaluation.categories.communication || 0;
    const safety = evaluation.categories.safety || 0;
    const problemSolving = evaluation.categories.problemSolving || 0;

    console.log('Valores de avaliação:', { qualityOfWork, punctuality, communication, safety, problemSolving });

    const averageCategoryScore = 
      (qualityOfWork + punctuality + communication + safety + problemSolving) / 5;

    console.log('Média da avaliação:', averageCategoryScore);

    return sum + averageCategoryScore;
  }, 0);

  const averageRating = totalScore / evaluations.length;

  console.log('Média geral calculada:', averageRating);

  await User.findByIdAndUpdate(professionalId, { averageRating });

  return averageRating;
}


// Função para calcular as médias das avaliações por categoria
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
      sum.qualityOfWork += evaluation.categories.qualityOfWork;
      sum.punctuality += evaluation.categories.punctuality;
      sum.communication += evaluation.categories.communication;
      sum.safety += evaluation.categories.safety;
      sum.problemSolving += evaluation.categories.problemSolving;
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

  const categoryAverages = {
    qualityOfWork: totals.qualityOfWork / evaluations.length,
    punctuality: totals.punctuality / evaluations.length,
    communication: totals.communication / evaluations.length,
    safety: totals.safety / evaluations.length,
    problemSolving: totals.problemSolving / evaluations.length,
  };

  return categoryAverages;
}

// Rota para criar uma nova avaliação
router.post('/', protect, async (req, res) => {
  const { evaluated, project, categories, feedback } = req.body;

  try {
    // Criar nova avaliação
    const evaluation = new Evaluation({
      evaluator: req.user._id, // O usuário que está avaliando
      evaluated, // O ID do profissional/empresa avaliado
      project, // O projeto associado
      categories, // As categorias da avaliação
      feedback, // O feedback adicional
    });

    const createdEvaluation = await evaluation.save(); // Salvar a avaliação

    // Atualizar o averageRating do profissional avaliado
    await updateAverageRating(evaluated);

    // Criar uma notificação para o profissional avaliado
    await Notification.create({
      user: evaluated, // ID do profissional avaliado
      message: `Você recebeu uma nova avaliação no projeto "${createdEvaluation.project}".`,
      link: `/projects/${createdEvaluation.project}`, // Link para o projeto associado à avaliação
    });

    res.status(201).json(createdEvaluation); // Retornar a avaliação criada
  } catch (error) {
    console.error('Erro ao criar a avaliação:', error);
    res.status(400).json({ message: 'Erro ao criar a avaliação', error: error.message });
  }
});

// Rota para listar avaliações de um profissional ou empresa
router.get('/:userId', async (req, res) => {
  const { category } = req.query; // Filtro opcional

  try {
    let query = { evaluated: req.params.userId };

    // Aplicar filtro de categoria, se fornecido
    if (category) {
      query[`categories.${category}`] = { $exists: true };
    }

    const evaluations = await Evaluation.find(query)
      .populate('evaluator', 'name')  // Popula o nome do cliente que fez a avaliação
      .populate('project', 'projectTitle');  // Popula o nome do projeto

    res.json(evaluations);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(400).json({ message: 'Erro ao buscar avaliações' });
  }
});

// Rota para listar médias das categorias de avaliações
router.get('/:userId/averages', async (req, res) => {
  try {
    const categoryAverages = await calculateCategoryAverages(req.params.userId);

    res.json({
      averages: categoryAverages,
    });
  } catch (error) {
    console.error('Erro ao buscar médias das categorias:', error);
    res.status(400).json({ message: 'Erro ao buscar médias das categorias' });
  }
});

module.exports = router;
