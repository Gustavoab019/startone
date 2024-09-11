const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { protect } = require('../middlewares/authMiddleware'); // Middleware de autenticação

// Rota para vincular funcionários à empresa
router.post('/add-employee', protect, async (req, res) => {
  const { employeeId } = req.body;

  try {
    // Verificar se o usuário que está tentando adicionar é uma empresa
    const company = await User.findById(req.user._id); // req.user._id agora estará disponível
    if (!company || company.type !== 'company') {
      return res.status(403).json({ message: 'Access denied. Only companies can add employees.' });
    }

    // Verificar se o funcionário existe e se é um profissional
    const employee = await User.findById(employeeId);
    if (!employee || employee.type !== 'professional') {
      return res.status(404).json({ message: 'Employee not found or not a professional.' });
    }

    // Verificar se o funcionário já está vinculado à empresa
    if (company.employees.includes(employeeId)) {
      return res.status(400).json({ message: 'Employee is already linked to this company.' });
    }

    // Vincular o funcionário à empresa
    company.employees.push(employeeId);
    await company.save();

    res.status(200).json({ message: 'Employee successfully added to the company.', employees: company.employees });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Error adding employee', error: error.message });
  }
});

module.exports = router;
