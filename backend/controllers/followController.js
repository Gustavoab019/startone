const User = require('../models/userModel');

// Seguir Usuário
exports.followUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const followId = req.params.id;

    if (userId.toString() === followId) return res.status(400).json({ message: "You cannot follow yourself." });

    const user = await User.findById(userId);
    const followUser = await User.findById(followId);

    if (!followUser) return res.status(404).json({ message: "User to follow not found." });
    if (user.following.includes(followId)) return res.status(400).json({ message: "You are already following this user." });

    user.following.push(followId);
    if (!followUser.followers.includes(userId)) followUser.followers.push(userId);

    await user.save();
    await followUser.save();

    return res.status(200).json({ message: "User followed successfully.", following: followUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while following the user." });
  }
};

// Deixar de Seguir Usuário
exports.unfollowUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const unfollowId = req.params.id;

    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowId);

    if (!unfollowUser) return res.status(404).json({ message: "User to unfollow not found." });

    user.following = user.following.filter(id => !id.equals(unfollowId));
    unfollowUser.followers = unfollowUser.followers.filter(id => !id.equals(userId));

    await user.save();
    await unfollowUser.save();

    return res.status(200).json({ message: "User unfollowed successfully.", unfollowing: unfollowUser._id });
  } catch (error) {
    console.error("Erro ao realizar unfollow:", error);
    res.status(500).json({ message: "An error occurred while unfollowing the user." });
  }
};

// Obter Lista de Seguidores
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const populatedUser = await User.findById(userId).populate('followers', 'name username email location');
    res.status(200).json({ followers: populatedUser.followers });
  } catch (error) {
    console.error("Erro ao buscar seguidores:", error);
    res.status(500).json({ message: "An error occurred while fetching followers." });
  }
};

// Obter Usuários que o Usuário está Seguindo
exports.getFollowing = async (req, res) => {
    try {
      const userId = req.params.id; // ID do usuário cujos "seguindo" queremos buscar
  
      // Busca o usuário pelo ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      // Popula os dados de usuários que estão sendo seguidos
      const populatedUser = await User.findById(userId).populate(
        "following",
        "name username email location"
      );
  
      res.status(200).json({ following: populatedUser.following });
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "An error occurred while fetching following." });
    }
  };
  