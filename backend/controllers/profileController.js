const User = require('../models/userModel');
const ProfessionalProfileModel = require('../models/ProfessionalProfileModel');
const CompanyProfileModel = require('../models/CompanyProfileModel');
const ClientProfileModel = require('../models/ClientProfileModel');

// Obter Perfil do Usuário
exports.getProfile = async (req, res) => {
  try {
    // Busca o usuário pelo ID do token JWT
    const user = await User.findById(req.user._id).populate('followers following', 'name username email location');

    // Verifica se o usuário existe
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    let profileData;

    // Buscar dados específicos de acordo com o tipo de usuário
    if (user.type === 'professional') {
      profileData = await ProfessionalProfileModel.findOne({ userId: user._id }).lean();
    } else if (user.type === 'company') {
      profileData = await CompanyProfileModel.findOne({ userId: user._id }).lean();
    } else if (user.type === 'client') {
      profileData = await ClientProfileModel.findOne({ userId: user._id }).lean();
    }

    // Verifica se o perfil específico foi encontrado
    if (!profileData) {
      return res.status(404).json({ message: `Perfil de ${user.type} não encontrado.` });
    }

    // Inicializa o objeto mergedProfile com os dados do usuário e do perfil específico
    const mergedProfile = {
      _id: user._id,
      name: user.name || profileData.name, // Fallback para garantir que o nome esteja presente
      email: user.email || profileData.email, // Fallback para garantir que o email esteja presente
      username: user.username || 'Username não definido', // Verifica se o username existe
      type: user.type,
      location: user.location || 'Localização não fornecida',
      averageRating: user.averageRating || profileData.averageRating, // Média de avaliação, se existir
      followersCount: user.followers?.length || 0, // Contagem de seguidores
      followingCount: user.following?.length || 0, // Contagem de seguindo
      followers: user.followers || [], // Lista detalhada de seguidores
      following: user.following || [], // Lista detalhada de usuários seguidos
      ...profileData, // Mescla os dados específicos do perfil
    };

    // Se o profissional tiver um companyId, buscar o companyName
    if (profileData.companyId) {
      const companyProfile = await CompanyProfileModel.findById(profileData.companyId).select('companyName');
      if (companyProfile) {
        mergedProfile.companyLink = {
          companyId: profileData.companyId || 'Sem Vinculo',
          companyName: companyProfile.companyName  || 'Sem Vinculo',
        };
      }
    }

    // Envia o perfil mesclado como resposta
    res.status(200).json(mergedProfile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};


  exports.updateProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Atualiza os dados básicos do usuário
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.location = req.body.location || user.location;
  
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
  
      // Salva o usuário atualizado
      const updatedUser = await user.save();
  
      // Atualiza o perfil específico do tipo de usuário
      if (user.type === 'professional') {
        const profile = await ProfessionalProfileModel.findOne({ userId: user._id });
        if (profile) {
          profile.specialties = req.body.specialties || profile.specialties;
          profile.experienceYears = req.body.experienceYears || profile.experienceYears;
          profile.certifications = req.body.certifications || profile.certifications;
          profile.portfolio = req.body.portfolio || profile.portfolio;
          await profile.save();
        }
      } else if (user.type === 'company') {
        const profile = await CompanyProfileModel.findOne({ userId: user._id });
        if (profile) {
          profile.companyName = req.body.companyName || profile.companyName;
          profile.servicesOffered = req.body.servicesOffered || profile.servicesOffered;
          await profile.save();
        }
      } else if (user.type === 'client') {
        const profile = await ClientProfileModel.findOne({ userId: user._id });
        if (profile) {
          profile.fullName = req.body.fullName || profile.fullName;
          await profile.save();
        }
      }
  
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        location: updatedUser.location,
        type: user.type,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Atualizar Bio do Perfil Profissional
exports.updateBio = async (req, res) => {
    const { bio } = req.body;
  
    try {
      // Validação básica
      if (!bio || bio.length > 500) {
        return res.status(400).json({ message: 'Bio must be between 1 and 500 characters.' });
      }
  
      // Busca o perfil profissional
      const profile = await User.findOne({ _id: req.user._id });
      if (!profile) return res.status(404).json({ message: 'Professional profile not found' });
  
      // Atualiza a bio
      profile.bio = bio;
      await profile.save();
  
      // Retorna a bio atualizada
      res.status(200).json({ message: 'Bio updated successfully', bio: profile.bio });
    } catch (error) {
      console.error('Error updating bio:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
