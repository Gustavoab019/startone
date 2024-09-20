const Project = require('../models/projectModel'); // Certifique-se de que esta declaração ocorre apenas uma vez

// Função para criar um projeto
const createProject = async (projectData) => {
    const project = new Project(projectData);
    return await project.save();
  };

// Função para buscar projetos do usuário
const findProjectsByUser = async (userId) => {
  return await Project.find({
    $or: [
      { createdById: userId },      // Usuário criou o projeto
      { professionals: userId },    // Usuário é um dos profissionais no projeto
      { participants: userId }      // Usuário é um dos participantes do projeto
    ],
  });
};

// Outras funções para buscar, atualizar e deletar projetos
module.exports = {
  createProject,
  findProjectsByUser,
};
