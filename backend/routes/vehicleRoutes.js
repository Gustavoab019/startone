// Importando dependências
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Vehicle = require('../models/VehicleModel');
const { protect } = require('../middlewares/authMiddleware'); // Importando corretamente o middleware como função

// Função auxiliar para verificar a proximidade da manutenção
async function checkMaintenanceStatus(vehicleId) {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return;

  const currentDate = new Date();
  const maintenanceDate = new Date(vehicle.nextMaintenanceDate);
  const timeDifference = maintenanceDate - currentDate;
  const daysToMaintenance = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  if (daysToMaintenance <= 7) {
    // Aqui você pode adicionar a lógica para enviar uma notificação ao usuário
    console.log(`Veículo ${vehicle.name} precisa de manutenção em breve!`);
  }
}

// Rota para adicionar um veículo (POST /api/vehicles)
router.post('/', protect, async (req, res) => {
    try {
      const { name, type, capacity, plate, nextMaintenanceDate, availabilityStatus, additionalNotes } = req.body;
  
      // Validação básica
      if (!name || !type || !capacity || !plate || !nextMaintenanceDate || !availabilityStatus) {
        return res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios.' });
      }
  
      // Verificar se a placa já existe no sistema
      const existingVehicle = await Vehicle.findOne({ plate });
      if (existingVehicle) {
        return res.status(400).json({ error: 'Já existe um veículo com essa placa no sistema.' });
      }
  
      // Criar um novo veículo e associar ao usuário autenticado
      const newVehicle = new Vehicle({
        name,
        type,
        capacity,
        plate,
        nextMaintenanceDate,
        availabilityStatus,
        additionalNotes,
        owner: req.user._id, // Associa o veículo ao proprietário (profissional ou empresa autenticado)
      });
  
      // Salvando no banco de dados
      await newVehicle.save();
  
      res.status(201).json({ message: 'Veículo adicionado com sucesso!', vehicle: newVehicle });
    } catch (error) {
      console.error('Erro ao adicionar o veículo:', error);
      res.status(500).json({ error: 'Erro ao adicionar o veículo. Tente novamente mais tarde.' });
    }
  });

  // Rota para listar veículos do usuário autenticado (GET /api/vehicles)
router.get('/', protect, async (req, res) => {
    try {
      const { status, type } = req.query; // Filtros opcionais para status e tipo do veículo
  
      // Criar uma query baseando-se no dono do veículo
      let query = { owner: req.user._id };
  
      // Aplicar filtros se fornecidos
      if (status) {
        query.availabilityStatus = status;
      }
      if (type) {
        query.type = type;
      }
  
      // Buscar veículos no banco de dados com base na query
      const vehicles = await Vehicle.find(query);
  
      res.status(200).json(vehicles);
    } catch (error) {
      console.error('Erro ao listar veículos:', error);
      res.status(500).json({ error: 'Erro ao listar os veículos. Tente novamente mais tarde.' });
    }
  });

  // Rota para atualizar o status de um veículo (PATCH /api/vehicles/:id/status)
router.patch('/:id/status', protect, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      // Validação básica do status
      if (!['Disponível', 'Indisponível', 'Manutenção'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido. Escolha entre "Disponível", "Indisponível" ou "Manutenção".' });
      }
  
      // Encontrar o veículo e verificar se o usuário autenticado é o proprietário
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Veículo não encontrado.' });
      }
  
      if (vehicle.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ error: 'Você não tem permissão para atualizar este veículo.' });
      }
  
      // Atualizar o status do veículo
      vehicle.availabilityStatus = status;
      await vehicle.save();
  
      res.status(200).json({ message: 'Status do veículo atualizado com sucesso!', vehicle });
    } catch (error) {
      console.error('Erro ao atualizar status do veículo:', error);
      res.status(500).json({ error: 'Erro ao atualizar o status do veículo. Tente novamente mais tarde.' });
    }
  });
  
// Rota para agendar ou atualizar a data de manutenção do veículo (PATCH /api/vehicles/:id/maintenance)
router.patch('/:id/maintenance', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { nextMaintenanceDate } = req.body;

    // Validação básica para a data de manutenção
    if (!nextMaintenanceDate) {
      return res.status(400).json({ error: 'Por favor, forneça a data da próxima manutenção.' });
    }

    // Encontrar o veículo e verificar se o usuário autenticado é o proprietário
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Você não tem permissão para atualizar este veículo.' });
    }

    // Verificar se o veículo está disponível para agendar manutenção
    if (vehicle.availabilityStatus !== 'Disponível') {
      return res.status(400).json({ error: 'A manutenção só pode ser agendada quando o veículo está disponível.' });
    }

    // Atualizar a data de manutenção do veículo
    vehicle.nextMaintenanceDate = new Date(nextMaintenanceDate);
    await vehicle.save();

    res.status(200).json({ message: 'Data de manutenção do veículo atualizada com sucesso!', vehicle });
  } catch (error) {
    console.error('Erro ao agendar manutenção do veículo:', error);
    res.status(500).json({ error: 'Erro ao agendar a manutenção do veículo. Tente novamente mais tarde.' });
  }
});

  
// Rota para alocar um veículo a um projeto (PATCH /api/vehicles/:id/assign)
router.patch('/:id/assign', protect, async (req, res) => {
    try {
      const { id } = req.params;
      const { projectId } = req.body;
  
      // Validação básica para o ID do projeto
      if (!projectId) {
        return res.status(400).json({ error: 'Por favor, forneça o ID do projeto ao qual o veículo deve ser associado.' });
      }
  
      // Encontrar o veículo e verificar se o usuário autenticado é o proprietário
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Veículo não encontrado.' });
      }
  
      if (vehicle.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ error: 'Você não tem permissão para alocar este veículo.' });
      }
  
      // Atualizar o veículo para associá-lo ao projeto e definir o status como "Em Uso"
      vehicle.projectAssociated = projectId;
      vehicle.availabilityStatus = "Indisponível";
      await vehicle.save();
  
      res.status(200).json({ message: 'Veículo alocado ao projeto com sucesso!', vehicle });
    } catch (error) {
      console.error('Erro ao alocar veículo ao projeto:', error);
      res.status(500).json({ error: 'Erro ao alocar o veículo ao projeto. Tente novamente mais tarde.' });
    }
  });

  // Rota para desalocar um veículo de um projeto (PATCH /api/vehicles/:id/unassign)
router.patch('/:id/unassign', protect, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Encontrar o veículo e verificar se o usuário autenticado é o proprietário
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Veículo não encontrado.' });
      }
  
      if (vehicle.owner.toString() !== req.user._id.toString()) {
        return res.status(401).json({ error: 'Você não tem permissão para desalocar este veículo.' });
      }
  
      if (!vehicle.projectAssociated) {
        return res.status(400).json({ error: 'O veículo não está alocado a nenhum projeto.' });
      }
  
      // Atualizar o veículo para remover a associação do projeto e definir o status como "Disponível"
      vehicle.projectAssociated = null;
      vehicle.availabilityStatus = "Disponível"; // Atualiza o status para "Disponível"
      await vehicle.save();
  
      res.status(200).json({ message: 'Veículo desalocado do projeto com sucesso!', vehicle });
    } catch (error) {
      console.error('Erro ao desalocar veículo do projeto:', error);
      res.status(500).json({ error: 'Erro ao desalocar o veículo do projeto. Tente novamente mais tarde.' });
    }
  });

  // Rota para listar veículos que precisam de manutenção em breve (GET /api/vehicles/upcoming-maintenance)
router.get('/upcoming-maintenance', protect, async (req, res) => {
    try {
      const userId = req.user._id; // Obtém o ID do usuário autenticado
      const currentDate = new Date();
      const upcomingDate = new Date();
      upcomingDate.setDate(currentDate.getDate() + 7); // Define uma data 7 dias no futuro
  
      // Buscar veículos do proprietário autenticado cuja manutenção está próxima
      const vehicles = await Vehicle.find({
        owner: userId,
        nextMaintenanceDate: {
          $gte: currentDate,
          $lte: upcomingDate,
        },
      });
  
      // Se não houver veículos para manutenção, retorna um array vazio
      if (!vehicles || vehicles.length === 0) {
        return res.status(200).json([]);
      }
  
      // Retorna os veículos encontrados
      res.status(200).json(vehicles);
    } catch (error) {
      console.error('Erro ao buscar veículos para manutenção próxima:', error);
      res.status(500).json({ message: 'Erro ao buscar veículos para manutenção próxima.' });
    }
  });
  

// Rota para gerar relatório de uso dos veículos (GET /api/vehicles/usage-report)
router.get('/usage-report', protect, async (req, res) => {
  try {
    const userId = req.user._id; // Obtém o ID do usuário autenticado

    // Busca todos os veículos do usuário autenticado
    const vehicles = await Vehicle.find({ owner: userId });

    // Formata o relatório de uso para cada veículo
    const usageReport = vehicles.map((vehicle) => {
      return {
        name: vehicle.name,
        type: vehicle.type,
        status: vehicle.availabilityStatus,
        nextMaintenanceDate: vehicle.nextMaintenanceDate,
        totalProjects: vehicle.totalProjects,
        owner: {
          name: req.user.name,
          email: req.user.email,
        },
        maintenanceHistory: vehicle.maintenanceHistory,
        usageLogs: vehicle.usageLogs,
      };
    });

    // Retorna o relatório gerado
    res.status(200).json({ report: usageReport });
  } catch (error) {
    console.error('Erro ao gerar relatório de uso dos veículos:', error);
    res.status(500).json({ message: 'Erro ao gerar o relatório de uso dos veículos.' });
  }
});


// Rota para atualizar os dados de um veículo (PATCH /api/vehicles/:id)
router.patch('/:id', protect, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const userId = req.user._id; // Obtém o ID do usuário autenticado

    // Busca o veículo pelo ID e verifica se pertence ao usuário autenticado
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: 'Veículo não encontrado.' });
    }

    if (vehicle.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Você não tem permissão para atualizar este veículo.' });
    }

    // Atualiza os campos do veículo com os valores fornecidos na requisição
    const {
      name,
      type,
      capacity,
      plate,
      nextMaintenanceDate,
      availabilityStatus,
      additionalNotes,
    } = req.body;

    if (name) vehicle.name = name;
    if (type) vehicle.type = type;
    if (capacity) vehicle.capacity = capacity;
    if (plate) vehicle.plate = plate;
    if (nextMaintenanceDate) vehicle.nextMaintenanceDate = nextMaintenanceDate;
    if (availabilityStatus) vehicle.availabilityStatus = availabilityStatus;
    if (additionalNotes) vehicle.additionalNotes = additionalNotes;

    // Salva o veículo atualizado no banco de dados
    const updatedVehicle = await vehicle.save();

    res.status(200).json({
      message: 'Veículo atualizado com sucesso!',
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({ message: 'Erro ao atualizar veículo. Tente novamente mais tarde.' });
  }
});

module.exports = router;

