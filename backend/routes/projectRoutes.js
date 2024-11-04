const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');

// Rota para buscar os projetos do usuário
router.get('/my-projects', protect, projectController.getMyProjects);

// Rota para adicionar um novo projeto
router.post('/', protect, projectController.addProject);

// Rota para adicionar participantes a um projeto
router.put('/:projectId/add-participants', protect, projectController.addParticipants);

// Rota para buscar projetos de um usuário específico
router.get('/user/:userId', protect, projectController.getProjectsByUserId);


module.exports = router;
