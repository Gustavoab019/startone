const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Project = require('../models/projectModel');

// Rota para criar um novo projeto
router.post('/', protect, async (req, res) => {
    const { projectTitle, description, company, client, completionDate } = req.body;
  
    try {
      console.log(req.body); // Adicione isso para verificar se os dados estão sendo recebidos corretamente
  
      const project = new Project({
        projectTitle,
        description,
        professional: req.user._id,  // O profissional que cria o projeto
        company: company || undefined,  // Opcional
        client: client || undefined,    // Opcional
        completionDate: completionDate || undefined  // Opcional
      });
  
      const createdProject = await project.save();
      res.status(201).json(createdProject);
    } catch (error) {
      console.error('Error creating project:', error);  // Mostra o erro no console
      res.status(400).json({ message: 'Error creating project', error: error.message });
    }
  });
// Rota para listar projetos
router.get('/', protect, async (req, res) => {
  try {
    const { filterBy, sortBy } = req.query;

    let query = {};
    
    // Se filterBy for fornecido, aplicamos o filtro
    if (filterBy && filterBy === 'projectStatus') {
      query.status = sortBy; // filtra por status com o valor recebido em sortBy
    }

    const projects = await Project.find(query)
      .populate('company', 'name')
      .populate('professional', 'name');

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Atualizar status de um projeto
router.put('/:id/status', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Atualiza o status do projeto com o valor recebido no corpo da requisição
    project.status = req.body.status || project.status;

    const updatedProject = await project.save();

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ message: 'Error updating project status', error: error.message });
  }
});


module.exports = router;
