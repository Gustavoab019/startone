const express = require('express');
const  employeeController  = require('../controllers/employeeController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();


// Rota para vincular profissional à empresa
router.post('/link-professional', protect, employeeController.linkProfessionalToCompany);

// Rota para desvincular profissional da empresa
router.post('/unlink-professional', protect, employeeController.unlinkProfessionalFromCompany);

router.get('/company', protect, employeeController.getCompanyEmployees);

router.put('/:employeeId', protect, employeeController.updateEmployeeData);

router.get('/:employeeId/project', protect, employeeController.getCurrentProjectDetails);


module.exports = router;
