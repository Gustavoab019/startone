const Project = require('../models/projectModel.js');
const User = require('../models/userModel');

// Função para buscar projetos do usuário
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user._id; // Certifique-se de usar req.user._id
    const projects = await Project.find({ createdById: userId });

    // Se não houver projetos, retorna uma lista vazia em vez de erro 404
    if (!projects || projects.length === 0) {
      return res.status(200).json([]); // Retorna um array vazio ao invés de um erro
    }

    res.status(200).json(projects); // Retorna os projetos encontrados
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects.' });
  }
};


// Função para adicionar um novo projeto
exports.addProject = async (req, res) => {
  try {
    const { projectTitle, description, completionDate, status } = req.body;

    // Verifique se todos os campos obrigatórios foram fornecidos
    if (!projectTitle || !description || !completionDate || !status) {
      return res.status(400).json({ message: 'All fields are required, including status.' });
    }

    // Lista de status válidos
    const validStatuses = ['not started', 'in progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const userId = req.user._id; // Certifique-se de usar req.user._id
    const userType = req.user.type; // Tipo do usuário (profissional, cliente, empresa)

    const newProject = new Project({
      projectTitle,
      description,
      completionDate,
      status, // Incluindo o status no novo projeto
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

// Fetch projects by userId where the user is either the creator or a participant
exports.getProjectsByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Pegue o userId dos parâmetros da rota

    // 1. Busque o usuário no UserModel usando o _id
    const user = await User.findById(userId); // Supondo que o userId seja o ObjectId do usuário

    // Verifica se o usuário existe
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 2. Agora busque os projetos onde esse usuário está envolvido
    const projects = await Project.find({
      $or: [
        { createdById: user._id},           // Projetos criados pelo usuário
        { professionals: user._id },         // Projetos onde o usuário é um profissional
        { participants: user._id }           // Projetos onde o usuário é um participante
      ]
    });

    // Se não houver projetos, retorne um array vazio
    if (!projects || projects.length === 0) {
      return res.status(200).json([]); // Retorna um array vazio
    }

    // Retorne os projetos encontrados
    res.status(200).json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos para o usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar projetos para o usuário.' });
  }
};

// Função para alterar o status do progresso de um projeto
exports.updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params; // ID do projeto a ser atualizado
    const { status } = req.body; // Novo status fornecido no corpo da requisição

    // Valida se o status foi fornecido
    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    // Busca o projeto pelo ID
    const project = await Project.findById(projectId);

    // Verifica se o projeto existe
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Atualiza o status
    project.status = status;

    // Salva as alterações no banco de dados
    const updatedProject = await project.save();

    res.status(200).json(updatedProject); // Retorna o projeto atualizado
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ message: 'Error updating project status.' });
  }
};

