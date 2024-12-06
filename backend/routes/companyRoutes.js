const express = require('express');
const  companyController  = require('../controllers/companyController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Rota para buscar dados da empresa
router.get('/:id', protect, companyController.getCompanyProfile);


module.exports = router;
