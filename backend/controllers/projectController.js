const Project = require('../models/projectModel.js');

// Função para buscar projetos do usuário
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id; // Supondo que o ID do usuário esteja no token
    const projects = await Project.find({ createdById: userId });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects.' });
  }
};

// Função para adicionar um novo projeto
exports.addProject = async (req, res) => {
  try {
    const { projectTitle, description, completionDate } = req.body;
    const userId = req.user.id; // Supondo que o ID do usuário esteja no token
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
    res.status(500).json({ message: 'Error adding project.' });
  }
};

// Função para adicionar participantes
exports.addParticipants = async (req, res) => {
  try {
    const { professionals, clients } = req.body;
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    project.participants = [
      ...project.participants,
      ...professionals,
      ...clients,
    ];

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error adding participants.' });
  }
};
