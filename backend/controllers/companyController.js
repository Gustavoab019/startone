const CompanyProfileModel = require('../models/CompanyProfileModel');
const ProfessionalProfileModel = require('../models/ProfessionalProfileModel')
const User = require('../models/userModel');

const mongoose = require('mongoose'); // Import para validação de ObjectId

// Buscar perfil da empresa
exports.getCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Validação do ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    // Busca o perfil da empresa associado ao userId
    const companyProfile = await CompanyProfileModel.findOne({ userId: id });

    if (!companyProfile) {
      return res.status(404).json({ message: 'Company profile not found.' });
    }

    // Busca os dados básicos do usuário, incluindo followers e following
    const user = await User.findById(id).select(
      'name username email type location followers following'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Calcula os contadores de seguidores e seguindo
    const followersCount = user.followers ? user.followers.length : 0;
    const followingCount = user.following ? user.following.length : 0;

    // Retorna os dados estruturados
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        type: user.type,
        location: user.location,
        followersCount,
        followingCount,
      },
      profile: {
        _id: companyProfile._id,
        userId: companyProfile.userId,
        companyName: companyProfile.companyName,
        servicesOffered: companyProfile.servicesOffered || [],
        employeeList: companyProfile.employeeList || [],
        projects: companyProfile.projects || [],
        companyRating: companyProfile.companyRating || 0,
        reviews: companyProfile.reviews || [],
        createdAt: companyProfile.createdAt,
        updatedAt: companyProfile.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching company profile:', error.message, error.stack);
    res.status(500).json({ message: 'Server error.' });
  }
};


