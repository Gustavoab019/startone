const Project = require('../models/projectModel.js');

// Função para buscar projetos do usuário
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user._id; // Certifique-se de usar req.user._id
    const projects = await Project.find({ createdById: userId });

    if (!projects || projects.length === 0) {
      return res.status(404).json({ message: 'No projects found.' });
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects.' });
  }
};

// Função para adicionar um novo projeto
exports.addProject = async (req, res) => {
  try {
    const { projectTitle, description, completionDate } = req.body;

    // Verifique se todos os campos obrigatórios foram fornecidos
    if (!projectTitle || !description || !completionDate) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const userId = req.user._id; // Certifique-se de usar req.user._id
    const userType = req.user.type; // Tipo do usuário (profissional, cliente, empresa)

    const newProject = new Project({
      projectTitle,
      description,
      completionDate,
      createdById: userId,
      createdByType: userType,
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Error adding project.' });
  }
};

// Função para adicionar participantes
exports.addParticipants = async (req, res) => {
  try {
    const { professionals, clients } = req.body;
    const projectId = req.params.projectId;

    if (!professionals && !clients) {
      return res.status(400).json({ message: 'No participants to add.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Adiciona os participantes ao projeto, garantindo que não haja duplicatas
    project.participants = [
      ...new Set([...project.participants, ...professionals, ...clients]),
    ];

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({ message: 'Error adding participants.' });
  }
};
