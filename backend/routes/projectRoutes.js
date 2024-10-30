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

router.post('/participants', async (req, res) => {
    try {
      const { ids } = req.body; // Array de IDs de projetos
  
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ message: 'Invalid project IDs' });
      }
  
      // Busca os projetos e popula os dados dos participantes
      const projects = await Project.find({ _id: { $in: ids } }).populate('participants', 'name');
  
      res.json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch project participants' });
    }
  });


module.exports = router;
