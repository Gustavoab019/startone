const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Notification = require('../models/notificationModel');

// Rota para listar notificações do usuário logado
router.get('/', protect, async (req, res) => {
    try {
      const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(notifications);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({ message: 'Erro ao buscar notificações' });
    }
  });

// Rota para marcar uma notificação como lida
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to mark this notification' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

module.exports = router;
