const express = require('express');
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Rotas para sistema de convites
router.post('/invite', protect, employeeController.inviteProfessionalToCompany);
router.post('/invitations/:invitationId/respond', protect, employeeController.respondToInvitation);

// Opcional: Rota para listar convites (para a empresa ou profissional)
router.get('/invitations', protect, employeeController.getInvitations);

// Rota para desvincular profissional da empresa
router.post('/unlink-professional', protect, employeeController.unlinkProfessionalFromCompany);

// Rota para listar funcionários da empresa
router.get('/company', protect, employeeController.getCompanyEmployees);

// Rota para atualizar dados do funcionário
router.put('/:employeeId', protect, employeeController.updateEmployeeData);

// Rota para obter detalhes do projeto atual do funcionário
router.get('/:employeeId/project', protect, employeeController.getCurrentProjectDetails);

module.exports = router;