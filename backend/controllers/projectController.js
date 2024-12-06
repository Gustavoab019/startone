const Project = require('../models/projectModel.js');
const User = require('../models/userModel');
const Vehicle = require('../models/VehicleModel');
const Employee = require('../models/EmployeeModel');
const mongoose = require('mongoose');
const { withTransaction } = require('../utils/mongooseUtils');

// Função para buscar projetos do usuário (mantida igual)
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({ createdById: userId });

    if (!projects || projects.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects.' });
  }
};

// Função para adicionar um novo projeto (atualizada para incluir lógica específica por tipo)
exports.addProject = async (req, res) => {
  try {
    const { projectTitle, description, completionDate, status } = req.body;

    if (!projectTitle || !description || !completionDate || !status) {
      return res.status(400).json({ message: 'All fields are required, including status.' });
    }

    const validStatuses = ['not started', 'in progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const userId = req.user._id;
    const userType = req.user.type;

    // Cria o projeto base
    const newProject = new Project({
      projectTitle,
      description,
      completionDate,
      status,
      createdById: userId,
      createdByType: userType,
    });

    // Adiciona campos específicos baseado no tipo de usuário
    switch (userType) {
      case 'company':
        newProject.company = userId;
        break;
      case 'professional':
        newProject.professionals = [userId];
        break;
      case 'client':
        newProject.client = userId;
        break;
    }

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ message: 'Error adding project.' });
  }
};

// Função para adicionar participantes (atualizada para lidar com diferentes tipos)
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

    if (professionals) {
      project.professionals = [...new Set([...project.professionals, ...professionals])];
    }

    if (clients) {
      project.participants = [...new Set([...project.participants, ...clients])];
    }

    const updatedProject = await project.save();
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({ message: 'Error adding participants.' });
  }
};

// manageEmployees function
exports.manageEmployees = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { employeeId, role } = req.body;

    const result = await withTransaction(async (session) => {
      const [project, employee] = await Promise.all([
        Project.findById(projectId).session(session),
        Employee.findById(employeeId).session(session)
      ]);

      if (!project) throw new Error('Projeto não encontrado');
      if (!employee) throw new Error('Funcionário não encontrado');

      const existingEmployee = project.employees.find(
        (emp) => emp.employeeId.toString() === employeeId
      );

      if (existingEmployee) {
        if (existingEmployee.status === 'inactive') {
          existingEmployee.status = 'active';
          existingEmployee.role = role;
        } else {
          throw new Error('Funcionário já está ativo neste projeto.');
        }
      } else {
        project.employees.push({ employeeId, role, status: 'active' });
      }

      employee.status = 'Em Projeto';
      employee.currentProjectId = project._id;
      employee.projectHistory.push({
        projectId: project._id,
        role,
        startDate: new Date()
      });

      await Promise.all([
        project.save({ session }),
        employee.save({ session })
      ]);

      return { project, employee };
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Erro ao gerenciar funcionários:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};


// Demais funções mantidas iguais
exports.getProjectsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const projects = await Project.find({
      $or: [
        { createdById: user._id },
        { professionals: user._id },
        { participants: user._id },
        { 'employees.employeeId': user._id }
      ]
    });

    res.status(200).json(projects || []);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar projetos.' });
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

// Atualiza os dados do projeto
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { projectTitle, description, completionDate, status } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (projectTitle) project.projectTitle = projectTitle;
    if (description) project.description = description;
    if (completionDate) project.completionDate = completionDate;
    if (status) project.status = status;

    const updatedProject = await project.save();

    res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error updating project.' });
  }
};

// Função para listar veículos associados a um projeto
exports.getProjectVehicles = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Busca veículos que estão associados ao projeto
    const vehicles = await Vehicle.find({ projectAssociated: projectId });

    // Se não houver veículos associados, retorna um array vazio
    if (!vehicles || vehicles.length === 0) {
      return res.status(200).json([]);
    }

    // Retorna os veículos encontrados
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Erro ao buscar veículos para o projeto:', error);
    res.status(500).json({ message: 'Erro ao buscar veículos para o projeto.' });
  }
};

// Remove employee of project
exports.removeEmployeeFromProject = async (req, res) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    await session.startTransaction();

    const { projectId, employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'IDs inválidos.' });
    }

    const project = await Project.findById(projectId).session(session);
    const employee = await Employee.findById(employeeId).session(session);

    if (!project) throw new Error('Projeto não encontrado');
    if (!employee) throw new Error('Funcionário não encontrado');

    const employeeInProject = project.employees.find(
      (emp) => emp.employeeId.toString() === employeeId
    );
    if (!employeeInProject) {
      throw new Error('Funcionário não está associado a este projeto.');
    }

    employeeInProject.status = 'inactive';

    employee.status = 'Disponível';
    employee.currentProjectId = null;
    employee.currentProjectRole = null;

    const history = employee.projectHistory.find(
      (h) => h.projectId.toString() === projectId && !h.endDate
    );
    if (history) history.endDate = new Date();

    await project.save({ session });
    await employee.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Funcionário removido do projeto com sucesso.', project, employee });

  } catch (error) {
    console.error('Erro ao remover funcionário:', error);
    if (session?.inTransaction()) await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    if (session) await session.endSession();
  }
};



