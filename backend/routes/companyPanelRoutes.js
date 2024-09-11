const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Evaluation = require('../models/evaluationModel');
const { protect } = require('../middlewares/authMiddleware'); // Middleware de autenticação

// Rota para visualizar o painel de controle da empresa com filtros
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Verificar se o usuário é uma empresa
    const company = await User.findById(req.user._id).populate('employees');
    if (!company || company.type !== 'company') {
      return res.status(403).json({ message: 'Access denied. Only companies can access this route.' });
    }

    // Filtros opcionais (passados via query params)
    const { filterBy, sortBy } = req.query;

    // Buscar os funcionários da empresa
    let employees = company.employees;

    // Obter os projetos da empresa
    const projects = await Project.find({ company: company._id });

    // Calcular desempenho dos funcionários
    const employeePerformance = await Promise.all(employees.map(async (employee) => {
      const evaluations = await Evaluation.find({ evaluated: employee._id });
      const projectsInvolved = await Project.find({ professional: employee._id });

      const totalScore = evaluations.reduce((acc, eval) => acc + eval.categories.qualityOfWork, 0);
      const averageRating = evaluations.length ? totalScore / evaluations.length : 0;

      const projectDetails = projectsInvolved.map(project => ({
        title: project.projectTitle,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status
      }));

      return {
        name: employee.name,
        averageRating,
        evaluations,
        projectsInvolved: projectDetails
      };
    }));

    // Filtro por desempenho
    if (filterBy === 'performance') {
      employeePerformance.sort((a, b) => b.averageRating - a.averageRating);
    }

    // Filtro por projeto em andamento/concluído
    if (filterBy === 'projectStatus') {
      employeePerformance = employeePerformance.filter(employee => 
        employee.projectsInvolved.some(project => project.status === sortBy)
      );
    }

    res.status(200).json({
      companyName: company.name,
      employees: employeePerformance,
      projects: projects.map(project => ({
        title: project.projectTitle,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status
      }))
    });
  } catch (error) {
    console.error('Error fetching company dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

module.exports = router;
