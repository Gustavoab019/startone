const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Project = require('../models/projectModel');
const Notification = require('../models/notificationModel'); // Importar o modelo de notificação

// Rota para criar um novo projeto
router.post('/', protect, async (req, res) => {
  const { projectTitle, description, professionals, company, client, completionDate } = req.body;

  try {
    // Validação para garantir que os campos obrigatórios estão preenchidos
    if (!projectTitle || !description) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes: projectTitle, description.' });
    }

    console.log('Criando projeto com os seguintes dados:', req.body);

    const project = new Project({
      projectTitle,
      description,
      professionals: professionals || [req.user._id], // Array de IDs de profissionais ou adiciona o criador como padrão
      company,
      client,
      completionDate,
    });

    const createdProject = await project.save();
    console.log('Projeto criado com sucesso:', createdProject);

    // Criar notificações para os profissionais envolvidos
    if (Array.isArray(createdProject.professionals) && createdProject.professionals.length > 0) {
      console.log('Criando notificações para os seguintes profissionais:', createdProject.professionals);

      for (const professional of createdProject.professionals) {
        console.log(`Criando notificação para o profissional com ID: ${professional}`);
        await Notification.create({
          user: professional,
          message: `Você foi adicionado ao projeto "${createdProject.projectTitle}".`,
          link: `/projects/${createdProject._id}`, // Link para o projeto
        });
        console.log(`Notificação criada para o profissional ${professional}`);
      }
    } else {
      console.log('Nenhum profissional encontrado para receber notificações.');
    }

    res.status(201).json(createdProject);
  } catch (error) {
    console.error('Erro ao criar o projeto:', error);  // Mostrar erro no console
    res.status(400).json({ message: 'Erro ao criar o projeto', error: error.message });
  }
});

// Rota para listar projetos
router.get('/', protect, async (req, res) => {
  try {
    const { filterBy, sortBy } = req.query;

    let query = {};
    
    // Se filterBy for fornecido, aplicamos o filtro
    if (filterBy && filterBy === 'projectStatus') {
      query.status = sortBy; // Filtrar por status com o valor recebido em sortBy
    }

    const projects = await Project.find(query)
      .populate('company', 'name')
      .populate('professionals', 'name'); // Popula o array de profissionais

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
      return res.status(404).json({ message: 'Projeto não encontrado' });
    }

    project.status = req.body.status || project.status;
    const updatedProject = await project.save();
    console.log('Projeto atualizado com sucesso:', updatedProject); // Verifica se o projeto foi atualizado

    // Criar notificações para os profissionais envolvidos
    if (Array.isArray(project.professionals)) {
      console.log('Criando notificações para a atualização de status:', project.professionals); // Verifica se os profissionais estão presentes
      for (const professional of project.professionals) {
        await Notification.create({
          user: professional,
          message: `O status do projeto "${project.projectTitle}" foi alterado para "${project.status}".`,
          link: `/projects/${project._id}`,
        });
        console.log(`Notificação criada para o profissional ${professional}`);
      }
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Erro ao atualizar o status do projeto:', error);
    res.status(500).json({ message: 'Erro ao atualizar o status do projeto', error: error.message });
  }
});

module.exports = router;
