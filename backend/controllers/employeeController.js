const CompanyProfile = require('../models/CompanyProfileModel');
const Employee = require('../models/EmployeeModel');
const ProfessionalProfile = require('../models/ProfessionalProfileModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const EmployeeInvitation = require('../models/EmployeeInvitationModel');
const Notification = require('../models/notificationModel');


// Função auxiliar para validar IDs do MongoDB
const validateMongoIds = (...ids) => {
  return ids.every(id => mongoose.Types.ObjectId.isValid(id));
};

// Controller para desvincular profissional da empresa
const unlinkProfessionalFromCompany = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { professionalId } = req.body;

    // Buscar o perfil da empresa usando o userId do usuário autenticado
    const companyProfile = await CompanyProfile.findOne({ userId: req.user._id }).session(session);
    if (!companyProfile) {
      throw new Error('Perfil da empresa não encontrado.');
    }
    
    const companyId = companyProfile._id;

    if (!validateMongoIds(companyId, professionalId)) {
      return res.status(400).json({ error: 'IDs inválidos.' });
    }

    const employee = await Employee.findOne({ userId: professionalId }).session(session);
    const professionalProfile = await ProfessionalProfile.findOne({ userId: professionalId }).session(session);

    if (!employee) {
      throw new Error('Profissional não encontrado.');
    }

    if (!employee.companyId || employee.companyId.toString() !== companyId.toString()) {
      throw new Error('Profissional não está vinculado a esta empresa.');
    }

    employee.companyId = null;
    if (professionalProfile) {
      professionalProfile.companyId = null;
    }

    await employee.save({ session });
    if (professionalProfile) {
      await professionalProfile.save({ session });
    }

    await session.commitTransaction();

    res.status(200).json({ 
      message: 'Profissional desvinculado da empresa com sucesso.',
      employee
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Erro ao desvincular profissional:', error);
    res.status(error.message.includes('não') ? 404 : 500).json({ 
      error: error.message || 'Erro ao desvincular profissional. Tente novamente mais tarde.' 
    });
  } finally {
    session.endSession();
  }
};

// Controller para buscar funcionários da empresa
const getCompanyEmployees = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, position } = req.query;

    // Buscar o perfil da empresa usando o userId do usuário autenticado
    const companyProfile = await CompanyProfile.findOne({ userId: req.user._id }).session(session);
    if (!companyProfile) {
      throw new Error('Perfil da empresa não encontrado.');
    }
    
    const companyId = companyProfile._id;

    // Validar o ID da empresa
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ error: 'ID da empresa inválido.' });
    }

    // Construir query base com o ID da empresa
    let matchQuery = { companyId: new mongoose.Types.ObjectId(companyId) };

    // Aplicar filtros se fornecidos
    if (status) {
      matchQuery.status = status;
    }
    if (position) {
      matchQuery.position = position;
    }

    // Buscar funcionários com dados relacionados usando aggregate
    const employees = await Employee.aggregate([
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $lookup: {
          from: 'professionalprofiles',
          localField: 'userId',
          foreignField: 'userId',
          as: 'professionalData'
        }
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$professionalData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          position: 1,
          status: 1,
          companyId: 1,
          createdAt: 1,
          updatedAt: 1,
          userName: '$userData.name',
          userEmail: '$userData.email',
          specialties: '$professionalData.specialties',
          experienceYears: '$professionalData.experienceYears',
          certifications: '$professionalData.certifications',
          availability: '$professionalData.availability'
        }
      }
    ]).session(session);

    await session.commitTransaction();

    // Se não houver funcionários, retorna array vazio
    if (!employees.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(employees);

  } catch (error) {
    await session.abortTransaction();
    console.error('Erro ao listar funcionários:', error);
    res.status(error.message.includes('não') ? 404 : 500).json({ 
      error: error.message || 'Erro ao listar os funcionários. Tente novamente mais tarde.' 
    });
  } finally {
    session.endSession();
  }
};

const updateEmployeeData = async (req, res) => {
  const session = await mongoose.startSession();
  await session.startTransaction();

  try {
    const { employeeId } = req.params;
    const { status, position } = req.body;

    const employee = await Employee.findById(employeeId).session(session);
    if (!employee) throw new Error('Funcionário não encontrado');

    if (status && employee.currentProjectId) {
      throw new Error('Não é possível alterar status de funcionário em projeto');
    }

    if (position) employee.position = position;
    if (status && !employee.currentProjectId) {
      employee.status = status;
    }

    const updatedEmployee = await employee.save({ session });
    await session.commitTransaction();
    
    res.status(200).json({ employee: updatedEmployee });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const getCurrentProjectDetails = async (req, res) => {
  const session = await mongoose.startSession();
  await session.startTransaction();

  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId)
      .populate('projectHistory.projectId')
      .session(session);

    if (!employee?.status === 'Em Projeto') {
      return res.status(404).json({ message: 'Funcionário não está em projeto.' });
    }

    const currentProject = employee.projectHistory
      .find(ph => !ph.endDate)?.projectId;

    await session.commitTransaction();
    res.status(200).json({ project: currentProject });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Função para enviar convite ao profissional
const inviteProfessionalToCompany = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
 
  try {
    const { professionalEmail, position } = req.body;
 
    // Validar posição conforme enum do EmployeeModel
    if (!position) {
      throw new Error('A posição é obrigatória.');
    }
 
    // Buscar o perfil da empresa
    const companyProfile = await CompanyProfile.findOne({ userId: req.user._id }).session(session);
    if (!companyProfile) {
      throw new Error('Perfil da empresa não encontrado.');
    }
 
    // Buscar usuário profissional pelo email
    const professionalUser = await User.findOne({ email: professionalEmail }).session(session);
    if (!professionalUser) {
      throw new Error('Profissional não encontrado com o email fornecido.');
    }
 
    // Verificar se o profissional já está vinculado a alguma empresa
    const existingEmployee = await Employee.findOne({ 
      userId: professionalUser._id,
      companyId: { $ne: null }
    }).session(session);
 
    if (existingEmployee) {
      throw new Error('Profissional já está vinculado a uma empresa.');
    }
 
    // Verificar se já existe um convite pendente
    const existingInvitation = await EmployeeInvitation.findOne({
      professionalId: professionalUser._id,
      companyId: companyProfile._id,
      status: 'pending'
    }).session(session);
 
    if (existingInvitation) {
      throw new Error('Já existe um convite pendente para este profissional.');
    }
 
    // Criar novo convite
    const invitation = new EmployeeInvitation({
      professionalId: professionalUser._id,
      companyId: companyProfile._id,
      position: position,
      status: 'pending',
      invitedAt: new Date()
    });
 
    await invitation.save({ session });
 
    // Criar notificação para o profissional
    const notification = await Notification.create([{
      userId: professionalUser._id,
      type: 'invitation',
      invitationStatus: 'pending',
      message: `A empresa ${companyProfile.companyName} convidou você para fazer parte de sua equipe como ${position}.`,
      relatedEntity: {
        entityId: invitation._id,
        entityType: 'invitation'
      },
      isRead: false
    }], { session });
 
    // Atualizar o convite com o ID da notificação
    invitation.notificationId = notification[0]._id;
    await invitation.save({ session });
 
    await session.commitTransaction();
 
    res.status(201).json({
      message: 'Convite enviado com sucesso.',
      data: {
        invitation,
        notification: notification[0]
      }
    });
 
  } catch (error) {
    await session.abortTransaction();
    console.error('Erro ao enviar convite:', error);
    res.status(error.message.includes('não') ? 404 : 500).json({
      error: error.message || 'Erro ao enviar convite. Tente novamente mais tarde.'
    });
  } finally {
    session.endSession();
  }
 };

// Função para aceitar/rejeitar convite
const respondToInvitation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invitationId } = req.params;
    const { response } = req.body; // 'accept' ou 'reject'

    const invitation = await EmployeeInvitation.findById(invitationId)
      .session(session);

    if (!invitation || invitation.status !== 'pending') {
      throw new Error('Convite não encontrado ou já respondido.');
    }

    // Verificar se o profissional que está respondendo é o mesmo que recebeu o convite
    if (invitation.professionalId.toString() !== req.user._id.toString()) {
      throw new Error('Você não tem permissão para responder este convite.');
    }

    invitation.status = response === 'accept' ? 'accepted' : 'rejected';
    invitation.respondedAt = new Date();

    if (response === 'accept') {
      // Verificar novamente se o profissional já não está vinculado a outra empresa
      const existingEmployee = await Employee.findOne({ 
        userId: req.user._id,
        companyId: { $ne: null }
      }).session(session);

      if (existingEmployee) {
        throw new Error('Você já está vinculado a uma empresa.');
      }

      // Criar ou atualizar employee usando o modelo existente
      let employee = await Employee.findOne({ userId: req.user._id }).session(session);
      const professionalProfile = await ProfessionalProfile.findOne({ userId: req.user._id }).session(session);

      if (!employee) {
        employee = new Employee({
          userId: req.user._id,
          companyId: invitation.companyId,
          position: invitation.position,
          status: 'Disponível', // Usando o enum definido no modelo
          projectHistory: [] // Inicializando o histórico vazio
        });
      } else {
        employee.position = invitation.position;
        employee.companyId = invitation.companyId;
        employee.status = 'Disponível';
      }

      if (professionalProfile) {
        professionalProfile.companyId = invitation.companyId;
        await professionalProfile.save({ session });
      }

      await employee.save({ session });

      // Notificar empresa sobre aceitação
      const company = await CompanyProfile.findById(invitation.companyId).session(session);
      await Notification.create([{
        userId: company.userId,
        type: 'important',
        message: `O profissional aceitou seu convite e agora faz parte da sua equipe como ${invitation.position}.`,
        relatedEntity: {
          entityId: employee._id,
          entityType: 'employee'
        }
      }], { session });
    }

    await invitation.save({ session });
    await session.commitTransaction();

    res.status(200).json({
      message: response === 'accept' ? 'Convite aceito com sucesso.' : 'Convite rejeitado com sucesso.',
      invitation
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Erro ao responder convite:', error);
    res.status(error.message.includes('não') ? 404 : 500).json({
      error: error.message || 'Erro ao responder convite. Tente novamente mais tarde.'
    });
  } finally {
    session.endSession();
  }
};

const getInvitations = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.query;
    const userType = req.user.type;
    let query = {};

    // Filtrar com base no tipo de usuário
    if (userType === 'professional') {
      query.professionalId = req.user._id;
    } else if (userType === 'company') {
      const companyProfile = await CompanyProfile.findOne({ userId: req.user._id }).session(session);
      if (!companyProfile) {
        throw new Error('Perfil da empresa não encontrado.');
      }
      query.companyId = companyProfile._id;
    }

    // Filtrar por status se fornecido
    if (status) {
      query.status = status;
    }

    const invitations = await EmployeeInvitation.find(query)
      .populate('professionalId', 'name email')
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 })
      .session(session);

    await session.commitTransaction();

    res.status(200).json(invitations);

  } catch (error) {
    await session.abortTransaction();
    console.error('Erro ao buscar convites:', error);
    res.status(error.message.includes('não') ? 404 : 500).json({
      error: error.message || 'Erro ao buscar convites. Tente novamente mais tarde.'
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  unlinkProfessionalFromCompany,
  getCompanyEmployees,
  updateEmployeeData,
  getCurrentProjectDetails,
  inviteProfessionalToCompany,
  respondToInvitation,
  getInvitations
};