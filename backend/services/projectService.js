const projectRepository = require('../repositories/projectRepository');
const ProjectLog = require('../models/projectLogModel'); // Para logs de status

// Função para criar um novo projeto
const createProject = async (projectData) => {
  const { projectTitle, description, professionals, company, client, createdBy, completionDate } = projectData;

  if (!projectTitle || !description) {
    throw new Error('Título do projeto e descrição são obrigatórios.');
  }

  const newProject = {
    projectTitle,
    description,
    professionals: professionals || [],
    company: company || null,
    client: client || null,
    createdBy,
    participants: [createdBy],
    completionDate,
  };

  return await projectRepository.createProject(newProject);
};

// Função para buscar projetos do usuário
const getProjectsByUser = async (userId) => {
  return await projectRepository.findProjectsByUser(userId);
};

// Função para buscar um projeto por ID
const getProjectById = async (projectId) => {
  return await projectRepository.findProjectById(projectId);
};

// Função para atualizar o status de um projeto
const updateStatus = async (projectId, newStatus) => {
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw new Error('Projeto não encontrado.');
  }

  const oldStatus = project.status;
  project.status = newStatus;
  await project.save();

  // Log de alteração de status
  await ProjectLog.create({
    projectId: project._id,
    userId: project.createdBy, // ID de quem fez a alteração (pode ser ajustado)
    oldStatus,
    newStatus,
    changedAt: Date.now(),
  });

  return project;
};

// Função para adicionar participantes a um projeto
const addParticipants = async (projectId, professionals = [], clients = []) => {
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    throw new Error('Projeto não encontrado.');
  }

  // Adicionar novos profissionais se fornecidos
  if (professionals.length > 0) {
    project.professionals = [...new Set([...project.professionals, ...professionals])]; // Garantir que não haja duplicatas
  }

  // Adicionar novos clientes se fornecidos
  if (clients.length > 0) {
    project.participants = [...new Set([...project.participants, ...clients])]; // Garantir que não haja duplicatas
  }

  return await project.save();
};

// Função para buscar os logs de status de um projeto
const getStatusLogs = async (projectId) => {
  return await ProjectLog.find({ projectId });
};

module.exports = {
  createProject,
  getProjectsByUser,
  getProjectById,
  updateStatus,
  addParticipants,
  getStatusLogs,
};
