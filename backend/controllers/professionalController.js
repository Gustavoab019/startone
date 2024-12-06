const ProfessionalProfileModel = require('../models/ProfessionalProfileModel');
const User = require('../models/userModel');

// Listar Profissionais com Filtros
exports.listProfessionals = async (req, res) => {
  try {
    const { specialty, location, averageRatingMin, averageRatingMax, username } = req.query;

    let query = {};

    if (specialty) query.specialties = { $in: [specialty] };
    if (location) query.location = location;
    if (averageRatingMin && averageRatingMax) query.averageRating = { $gte: averageRatingMin, $lte: averageRatingMax };
    else if (averageRatingMin) query.averageRating = { $gte: averageRatingMin };
    else if (averageRatingMax) query.averageRating = { $lte: averageRatingMax };

    let userQuery = {};
    if (username) userQuery.username = new RegExp(username, 'i');

    const users = await User.find(userQuery).select('_id');
    if (username) query.userId = { $in: users.map((user) => user._id) };

    const professionals = await ProfessionalProfileModel.find(query)
      .populate('userId', 'name email location averageRating username');

    res.json(professionals);
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    res.status(500).json({ message: 'Erro ao buscar profissionais', error: error.message });
  }
};
