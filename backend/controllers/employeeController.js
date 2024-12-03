const CompanyProfile = require('../models/CompanyProfileModel');
const Employee = require('../models/EmployeeModel');
const ProfessionalProfile = require('../models/ProfessionalProfileModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');


// Função auxiliar para validar IDs do MongoDB
const validateMongoIds = (...ids) => {
  return ids.every(id => mongoose.Types.ObjectId.isValid(id));
};

// Controller para vincular profissional à empresa
const linkProfessionalToCompany = async (req, res) => {
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

    const user = await User.findById(professionalId).session(session);
    const professionalProfile = await ProfessionalProfile.findOne({ userId: professionalId }).session(session);

    if (!user || !professionalProfile) {
      throw new Error('Dados do profissional não encontrados');
    }

    let employee = await Employee.findOne({ userId: professionalId }).session(session);

    if (!employee) {
      employee = new Employee({
        userId: professionalId,
        position: professionalProfile.specialties[0] || 'Não especificado',
        status: 'Disponível',
        companyId: companyId,
      });
    } else {
      if (employee.companyId?.toString() === companyId.toString()) {
        throw new Error('Profissional já vinculado a esta empresa.');
      }
      employee.companyId = companyId;
    }

    professionalProfile.companyId = companyId;

    await employee.save({ session });
    await professionalProfile.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: 'Profissional vinculado à empresa com sucesso.',
      employee: {
        ...employee.toObject(),
        userName: user.name,
        userEmail: user.email,
        specialties: professionalProfile.specialties
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Erro ao vincular profissional:', error);
    res.status(error.message.includes('não') ? 404 : 500).json({ 
      error: error.message || 'Erro ao vincular profissional. Tente novamente mais tarde.' 
    });
  } finally {
    session.endSession();
  }
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
  session.startTransaction();

  try {
    const { employeeId } = req.params;
    const updateData = req.body;

    // Buscar o perfil da empresa usando o userId do usuário autenticado
    const companyProfile = await CompanyProfile.findOne({ userId: req.user._id }).session(session);
    if (!companyProfile) {
      throw new Error('Perfil da empresa não encontrado.');
    }
    
    const companyId = companyProfile._id;

    if (!validateMongoIds(companyId, employeeId)) {
      return res.status(400).json({ error: 'IDs inválidos.' });
    }

    // Verificar se o funcionário existe e pertence à empresa
    const employee = await Employee.findOne({ 
      _id: employeeId,
      companyId: companyId
    }).session(session);

    if (!employee) {
      throw new Error('Funcionário não encontrado ou não pertence a esta empresa.');
    }

    // Campos permitidos para atualização
    const allowedUpdates = {
      position: updateData.position,
      status: updateData.status
    };

    // Filtrar apenas os campos que foram fornecidos
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    // Validar status se foi fornecido
    if (allowedUpdates.status && !['Disponível', 'Indisponível', 'Férias', 'Licença'].includes(allowedUpdates.status)) {
      throw new Error('Status inválido.');
    }

    // Atualizar dados do funcionário
    Object.assign(employee, allowedUpdates);
    await employee.save({ session });

    // Buscar dados completos atualizados do funcionário
    const updatedEmployee = await Employee.aggregate([
      {
        $match: { _id: employee._id }
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

    res.status(200).json({
      message: 'Dados do funcionário atualizados com sucesso.',
      employee: updatedEmployee[0]
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Erro ao atualizar dados do funcionário:', error);
    res.status(error.message.includes('não') ? 404 : 500).json({ 
      error: error.message || 'Erro ao atualizar dados do funcionário. Tente novamente mais tarde.' 
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  linkProfessionalToCompany,
  unlinkProfessionalFromCompany,
  getCompanyEmployees,
  updateEmployeeData
};